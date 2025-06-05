# Smart Health Care Backend API

A comprehensive Node.js/Express backend API for the Smart Health Care application with JWT authentication, user management, and health tracking features.

## 🚀 Features

- **Authentication & Authorization**
  - User registration and login
  - JWT token-based authentication
  - Password reset functionality
  - Account lockout after failed attempts
  - Role-based access control

- **User Management**
  - User profiles with health data
  - BMI calculation
  - Fitness goal tracking
  - Health condition management

- **Security**
  - Password hashing with bcrypt
  - Rate limiting
  - CORS protection
  - Helmet security headers
  - Input validation

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   └── authController.js    # Authentication logic
├── middleware/
│   ├── auth.js              # JWT authentication
│   ├── errorHandler.js      # Error handling
│   └── validation.js        # Input validation
├── models/
│   └── User.js              # User schema
├── routes/
│   └── authRoutes.js        # Authentication routes
├── utils/
│   ├── asyncHandler.js      # Async error handling
│   ├── errorResponse.js     # Custom error responses
│   └── sendTokenResponse.js # JWT token response
├── .env                     # Environment variables
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies
└── server.js               # Main server file
```

## 🔧 Installation & Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Update the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRE=7d
   JWT_COOKIE_EXPIRE=7
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the server**
   ```bash
   # Development mode with auto-restart
   npm run dev

   # Production mode
   npm start
   ```

## 📊 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | User login | Public |
| GET | `/logout` | User logout | Private |
| POST | `/forgotpassword` | Request password reset | Public |
| PUT | `/resetpassword/:token` | Reset password | Public |

### User Management Routes (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/me` | Get current user | Private |
| PUT | `/updatedetails` | Update user details | Private |
| PUT | `/updateprofile` | Update user profile | Private |
| PUT | `/updatepassword` | Change password | Private |
| GET | `/stats` | Get user statistics | Admin |

### Health Check

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/health` | Server health check | Public |
| GET | `/` | API welcome message | Public |

## 📝 Request/Response Examples

### Register User
```javascript
POST /api/auth/register
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "Password123"
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "data": {
    "_id": "user_id",
    "username": "john_doe",
    "email": "john@example.com",
    // ... user data
  }
}
```

### Login User
```javascript
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "Password123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "data": {
    // ... user data
  }
}
```

### Update Profile
```javascript
PUT /api/auth/updateprofile
Authorization: Bearer jwt_token_here
{
  "age": 25,
  "gender": "male",
  "height": 175,
  "weight": 70,
  "healthConditions": ["None"],
  "fitnessGoal": "Muscle Building"
}
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer your_jwt_token_here
```

Tokens are also set as HTTP-only cookies for additional security.

## 🛡️ Security Features

- **Password Hashing**: Bcrypt with salt rounds
- **Account Lockout**: 5 failed attempts = 2-hour lockout
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Express-validator for all inputs
- **CORS**: Configured for frontend domain
- **Helmet**: Security headers protection

## 🗄️ Database Schema

### User Model
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  profile: {
    age: Number,
    gender: String,
    height: Number,
    weight: Number,
    healthConditions: [String],
    fitnessGoal: String,
    profileImage: String
  },
  isEmailVerified: Boolean,
  isActive: Boolean,
  role: String,
  lastLogin: Date,
  // ... additional fields
}
```

## 🚦 Error Handling

The API returns consistent error responses:

```javascript
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `423` - Locked (account lockout)
- `500` - Server Error

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRE` | JWT expiration time | 7d |
| `JWT_COOKIE_EXPIRE` | Cookie expiration (days) | 7 |
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment mode | development |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 |

## 📦 Dependencies

### Production
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT implementation
- `express-validator` - Input validation
- `cors` - Cross-origin resource sharing
- `helmet` - Security headers
- `express-rate-limit` - Rate limiting
- `dotenv` - Environment variables
- `nodemailer` - Email sending

### Development
- `nodemon` - Auto-restart server

## 🚀 Deployment

1. Set `NODE_ENV=production`
2. Configure production MongoDB URI
3. Set strong JWT secret
4. Configure email service for password reset
5. Set up SSL/HTTPS
6. Configure reverse proxy (nginx)

## 📈 Future Enhancements

- [ ] Email verification
- [ ] Two-factor authentication
- [ ] OAuth integration (Google, Facebook)
- [ ] File upload for profile images
- [ ] Workout and diet tracking endpoints
- [ ] Health metrics analytics
- [ ] Push notifications
- [ ] API documentation with Swagger

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

This project is licensed under the MIT License.

---

**Smart Health Care Backend API** - Built with ❤️ for better health management 