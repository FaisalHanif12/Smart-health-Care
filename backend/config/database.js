const mongoose = require('mongoose');

let retryCount = 0;
const MAX_RETRIES = 5;

const connectDB = async () => {
  try {
    // Get and validate MongoDB URI
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not set in environment variables');
    }
    
    // Trim whitespace and check format
    const trimmedURI = mongoURI.trim();
    
    // Extract cluster name for better error messages
    let clusterName = 'unknown';
    try {
      if (trimmedURI.includes('mongodb+srv://')) {
        const match = trimmedURI.match(/mongodb\+srv:\/\/[^@]+@([^/]+)/);
        if (match) clusterName = match[1];
      } else if (trimmedURI.includes('mongodb://')) {
        const match = trimmedURI.match(/mongodb:\/\/[^@]+@([^:/]+)/);
        if (match) clusterName = match[1];
      }
    } catch (e) {
      // Ignore extraction errors
    }
    
    // Debug: Show first 30 characters to verify format (without exposing credentials)
    const uriPreview = trimmedURI.substring(0, 30) + '...';
    console.log('🔍 MongoDB URI Preview:', uriPreview);
    console.log('🔍 Cluster Name:', clusterName);
    
    // Validate URI format
    if (!trimmedURI.startsWith('mongodb://') && !trimmedURI.startsWith('mongodb+srv://')) {
      console.error('❌ Invalid MongoDB URI format. Expected to start with "mongodb://" or "mongodb+srv://"');
      console.error('❌ Actual URI starts with:', trimmedURI.substring(0, 20));
      throw new Error('Invalid scheme, expected connection string to start with "mongodb://" or "mongodb+srv://"');
    }
    
    // Enhanced connection options to handle DNS and network issues
    const connectionOptions = {
      serverSelectionTimeoutMS: 15000, // 15 seconds for server selection
      socketTimeoutMS: 45000, // Socket timeout
      connectTimeoutMS: 15000, // Connection timeout
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 2, // Maintain at least 2 connections
      retryWrites: true,
      retryReads: true,
      w: 'majority',
      // Better connection handling
      heartbeatFrequencyMS: 10000,
      // Disable mongoose buffering to fail fast when disconnected
      bufferCommands: false, // This replaces the deprecated bufferMaxEntries option
    };

    const conn = await mongoose.connect(trimmedURI, connectionOptions);

    console.log(`
🗄️  MongoDB Connected Successfully!
📍 Host: ${conn.connection.host}
🏷️  Database: ${conn.connection.name}
🌐 Connection State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}
    `);
    
    retryCount = 0; // Reset retry count on success

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
      // Auto-reconnect on error if not already reconnecting
      if (mongoose.connection.readyState === 0 && retryCount < MAX_RETRIES) {
        retryCount++;
        console.log(`🔄 Auto-reconnecting... (Attempt ${retryCount}/${MAX_RETRIES})`);
        setTimeout(() => {
          connectDB();
        }, 5000);
      }
    });

    mongoose.connection.on('disconnected', () => {
      console.log('📤 MongoDB disconnected');
      // Auto-reconnect on disconnect
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        console.log(`🔄 Auto-reconnecting after disconnect... (Attempt ${retryCount}/${MAX_RETRIES})`);
        setTimeout(() => {
          connectDB();
        }, 5000);
      }
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected successfully');
      retryCount = 0; // Reset retry count on successful reconnection
    });

    mongoose.connection.on('connecting', () => {
      console.log('🔄 Connecting to MongoDB...');
    });

    // If the Node process ends, close the Mongoose connection
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('📴 MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    retryCount++;
    const errorMessage = error.message || 'Unknown error';
    console.error(`❌ MongoDB connection failed (Attempt ${retryCount}/${MAX_RETRIES}):`, errorMessage);
    
    // Extract cluster name for error messages
    let clusterName = 'unknown';
    try {
      const mongoURI = process.env.MONGODB_URI || '';
      if (mongoURI.includes('mongodb+srv://')) {
        const match = mongoURI.match(/mongodb\+srv:\/\/[^@]+@([^/]+)/);
        if (match) clusterName = match[1];
      }
    } catch (e) {
      // Ignore extraction errors
    }
    
    // Provide specific error guidance
    if (errorMessage.includes('ETIMEOUT') || errorMessage.includes('queryTxt') || errorMessage.includes('ENOTFOUND') || errorMessage.includes('_mongodb._tcp')) {
      console.log('🔍 DNS Resolution Issue Detected');
      console.log(`🔍 Attempting to connect to cluster: ${clusterName}`);
      console.log('💡 Possible solutions:');
      console.log('   1. Check your internet connection');
      console.log('   2. Verify MongoDB Atlas cluster is running (not paused)');
      console.log('   3. Check MongoDB Atlas IP whitelist - add your current IP or 0.0.0.0/0');
      console.log('   4. Try using a different DNS server (e.g., 8.8.8.8 or 1.1.1.1)');
      console.log('   5. Check firewall/VPN settings');
      console.log('   6. Verify the cluster name in your .env file matches MongoDB Atlas');
      console.log('   7. Try flushing DNS cache: sudo dscacheutil -flushcache (macOS)');
    } else if (errorMessage.includes('authentication')) {
      console.log('🔍 Authentication Issue Detected');
      console.log('💡 Check your MongoDB username and password in .env file');
      console.log('💡 Verify the database user exists in MongoDB Atlas');
    } else if (errorMessage.includes('ENOTFOUND')) {
      console.log('🔍 Host Not Found');
      console.log(`🔍 Cluster name: ${clusterName}`);
      console.log('💡 Verify the MongoDB URI in .env file is correct');
      console.log('💡 Check if the cluster exists in MongoDB Atlas');
    }
    
    if (retryCount < MAX_RETRIES) {
      const retryDelay = Math.min(5000 * retryCount, 30000); // Exponential backoff, max 30s
      console.log(`🔄 Retrying MongoDB connection in ${retryDelay / 1000} seconds...`);
      setTimeout(() => {
        connectDB();
      }, retryDelay);
    } else {
      console.log('');
      console.log('⚠️  Max retries reached. Server will continue running without MongoDB.');
      console.log('⚠️  Some features may not work until MongoDB connection is established.');
      console.log('');
      console.log('🔧 Additional Troubleshooting steps:');
      console.log('1. Check your internet connection');
      console.log('2. Verify MongoDB Atlas cluster is running (not paused)');
      console.log('3. Check MongoDB Atlas IP whitelist - add your current IP or 0.0.0.0/0');
      console.log('4. Verify MongoDB username and password are correct');
      console.log('5. Check if your network/firewall is blocking MongoDB connections');
      console.log('6. Try flushing DNS cache: sudo dscacheutil -flushcache (macOS)');
      console.log('7. Consider using a VPN or different network if DNS issues persist');
    }
  }
};

// Helper function to check if MongoDB is connected
const isConnected = () => {
  return mongoose.connection.readyState === 1; // 1 = connected
};

// Helper function to get connection state as string
const getConnectionState = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  return states[mongoose.connection.readyState] || 'unknown';
};

module.exports = connectDB;
module.exports.isConnected = isConnected;
module.exports.getConnectionState = getConnectionState; 