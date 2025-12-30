const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`
🗄️  MongoDB Connected Successfully!
📍 Host: ${conn.connection.host}
🏷️  Database: ${conn.connection.name}
🌐 Connection State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}
    `);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('📤 MongoDB disconnected');
    });

    // If the Node process ends, close the Mongoose connection
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('📴 MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB; 