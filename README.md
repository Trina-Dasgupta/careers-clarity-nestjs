# Resource Management System - Authentication Microservice

## 📋 Project Overview

This is a **production-ready authentication microservice** built with modern Node.js technologies. It provides a complete authentication system with user management, password security, and JWT-based authentication.

### Key Features Implemented ✅

1. **User Registration** - Email validation, password strength requirements
2. **User Login** - JWT token-based authentication
3. **Password Management**
   - Forgot Password (with secure tokens)
   - Reset Password
   - Change Password (for authenticated users)
4. **Profile Management**
   - Get Profile
   - Update Profile
   - Delete Profile (account deletion)
5. **Security Features**
   - Password hashing with bcrypt
   - JWT token authentication
   - Global exception handling
   - Request/Response logging
   - Input validation
   - Protected routes
6. **File Uploads**
   - Multer-powered file upload pipeline
   - Disk storage with validation and sanitization
   - Static serving for uploaded assets

## 🏗️ Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | NestJS | Modern Node.js framework with TypeScript |
| **Database** | PostgreSQL | Relational database |
| **ORM** | Prisma | Type-safe database client |
| **Authentication** | JWT + Passport | Token-based auth strategy |
| **Validation** | class-validator | DTO validation |
| **Security** | bcrypt | Password hashing |
| **Container** | Docker | PostgreSQL containerization |

### Project Structure

```
resource-management-system/
├── src/
│   ├── auth/                          # Authentication Module
│   │   ├── decorators/                # Custom decorators
│   │   │   ├── public.decorator.ts    # Mark routes as public
│   │   │   └── get-user.decorator.ts  # Extract user from request
│   │   ├── dto/                       # Data Transfer Objects
│   │   │   ├── register.dto.ts        # Registration validation
│   │   │   ├── login.dto.ts           # Login validation
│   │   │   ├── reset-password.dto.ts  # Password reset DTOs
│   │   │   ├── change-password.dto.ts # Change password DTO
│   │   │   └── update-profile.dto.ts  # Profile update DTO
│   │   ├── entities/                  # Entity classes
│   │   │   └── user.entity.ts         # User entity with @Exclude
│   │   ├── guards/                    # Authentication guards
│   │   │   ├── jwt-auth.guard.ts      # JWT authentication guard
│   │   │   └── local-auth.guard.ts    # Local strategy guard
│   │   ├── strategies/                # Passport strategies
│   │   │   ├── jwt.strategy.ts        # JWT validation strategy
│   │   │   └── local.strategy.ts      # Local login strategy
│   │   ├── auth.controller.ts         # Authentication endpoints
│   │   ├── auth.service.ts            # Business logic
│   │   └── auth.module.ts             # Module definition
│   │
│   ├── common/                        # Shared utilities
│   │   ├── filters/                   # Exception filters
│   │   │   └── http-exception.filter.ts # Global error handling
│   │   ├── interceptors/              # Request/Response interceptors
│   │   │   ├── logging.interceptor.ts  # Request logging
│   │   │   └── transform.interceptor.ts # Response formatting
│   │   └── pipes/                     # Validation pipes
│   │       └── validation.pipe.ts      # Global validation config
│   │
│   ├── config/                        # Configuration
│   │   └── app.config.ts              # App configuration
│   │
│   ├── prisma/                        # Database service
│   │   ├── prisma.service.ts          # Prisma client wrapper
│   │   └── prisma.module.ts           # Global Prisma module
│   │
│   ├── app.module.ts                  # Root application module
│   └── main.ts                        # Application bootstrap
│
├── prisma/
│   └── schema.prisma                  # Database schema definition
│
├── docker-compose.yml                 # PostgreSQL container setup
├── .env                               # Environment variables
├── .env.example                       # Environment template
├── setup.sh                           # Automated setup script
├── package.json                       # Dependencies and scripts
├── tsconfig.json                      # TypeScript configuration
├── README.md                          # Comprehensive documentation
├── QUICKSTART.md                      # Quick start guide
└── API_EXAMPLES.md                    # API usage examples

```

## 🔐 Security Implementation

### Password Security
- **Minimum Requirements**: 8 characters, uppercase, lowercase, number/special char
- **Hashing**: bcrypt with 10 salt rounds
- **Storage**: Never stored in plain text

### JWT Authentication
- **Token Type**: Bearer token
- **Expiration**: 7 days (configurable)
- **Storage**: In Authorization header
- **Validation**: Automatic on protected routes

### Data Protection
- **Sensitive Fields**: Excluded from API responses using @Exclude decorator
- **Input Validation**: All inputs validated with class-validator
- **SQL Injection**: Protected by Prisma's prepared statements
- **XSS Protection**: Input sanitization via validation pipes

## 🗄️ Database Schema

```prisma
model User {
  id                     String    @id @default(uuid())
  email                  String    @unique
  password               String    // Hashed with bcrypt
  firstName              String?
  lastName               String?
  phone                  String?
  avatar                 String?
  isEmailVerified        Boolean   @default(false)
  isActive               Boolean   @default(true)
  resetPasswordToken     String?   // For password reset
  resetPasswordExpires   DateTime? // Token expiry
  emailVerificationToken String?   // For email verification
  createdAt              DateTime  @default(now())
  updatedAt              DateTime  @updatedAt
  
  @@map("users")
}
```

## 📡 API Endpoints

### Public Endpoints (No Authentication Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login user |
| POST | `/api/v1/auth/forgot-password` | Request password reset |
| POST | `/api/v1/auth/reset-password` | Reset password with token |

### Protected Endpoints (Require JWT Token)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/auth/profile` | Get user profile |
| PUT | `/api/v1/auth/profile` | Update user profile |
| DELETE | `/api/v1/auth/profile` | Delete user account |
| POST | `/api/v1/auth/change-password` | Change password |
| GET | `/api/v1/auth/me` | Get current user info |

## 🔄 Request/Response Flow

### Registration Flow
```
Client → POST /auth/register
   ↓
Validation (DTO)
   ↓
Check if email exists
   ↓
Hash password
   ↓
Create user in database
   ↓
Generate JWT token
   ↓
Return user + token
```

### Protected Route Flow
```
Client → GET /auth/profile (with JWT in header)
   ↓
JwtAuthGuard
   ↓
Extract JWT token
   ↓
Validate token
   ↓
Load user from database
   ↓
Attach user to request
   ↓
Execute route handler
   ↓
Return response
```

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Docker Desktop
- npm

### Installation Steps

1. **Install dependencies**
```bash
npm install
```

2. **Start PostgreSQL**
```bash
docker-compose up -d
```

3. **Run migrations**
```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. **Start development server**
```bash
npm run start:dev
```

API will be available at: `http://localhost:3001/api/v1`

### Or use the automated setup script:
```bash
chmod +x setup.sh
./setup.sh
npm run start:dev
```

## 🧪 Testing the API

## File Upload API

The upload service exposes `POST /api/v1/files/upload` for handling `multipart/form-data` payloads. Provide a `file` field and the server will store the asset inside the configured `UPLOAD_DEST`, enforcing MIME type and size restrictions. Files can be downloaded through `GET /api/v1/files/:filename` (streamed) or directly from the static `/uploads/<filename>` mount.

```bash
curl -X POST http://localhost:3001/api/v1/files/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/absolute/path/to/logo.png"

curl -O http://localhost:3001/api/v1/files/<stored-filename>
```

### Quick Test with cURL

```bash
# 1. Register
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","firstName":"Test"}'

# 2. Login (copy the accessToken from response)
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# 3. Get Profile (replace TOKEN)
curl -X GET http://localhost:3001/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

See `API_EXAMPLES.md` for complete API documentation.

## 📦 Available Scripts

```bash
# Development
npm run start:dev          # Start with hot reload
npm run start:debug        # Start in debug mode

# Production
npm run build              # Build for production
npm run start:prod         # Start production server

# Database
npm run prisma:generate    # Generate Prisma Client
npm run prisma:migrate     # Run migrations
npm run prisma:studio      # Open database GUI

# Code Quality
npm run lint               # Lint code
npm run format             # Format code
npm run test               # Run tests
```

## 🔧 Configuration

Key environment variables in `.env`:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/resource_management_db?schema=public"

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=7d

# Application
AUTH_SERVICE_PORT=3001
NODE_ENV=development

# File uploads
UPLOAD_DEST=uploads
UPLOAD_MAX_FILE_SIZE=5242880
UPLOAD_ALLOWED_MIME_TYPES="image/jpeg,image/png,application/pdf"
```

## 🎯 Design Patterns & Best Practices

### 1. **Modular Architecture**
- Separation of concerns
- Feature-based modules
- Dependency injection

### 2. **Error Handling**
- Global exception filter
- Consistent error responses
- Proper HTTP status codes

### 3. **Validation**
- DTO validation with decorators
- Type safety with TypeScript
- Custom validation rules

### 4. **Logging**
- Request/response logging
- Sensitive data masking
- Structured log format

### 5. **Security**
- Password hashing
- JWT authentication
- CORS configuration
- Input sanitization

## 🚧 Future Enhancements

- [ ] Email verification system
- [ ] Email service integration (NodeMailer)
- [ ] Refresh token implementation
- [ ] Two-factor authentication (2FA)
- [ ] OAuth integration (Google, GitHub)
- [ ] Rate limiting
- [ ] Swagger/OpenAPI documentation
- [ ] Unit and E2E tests
- [ ] Redis for session management
- [ ] Microservice communication (RabbitMQ/Redis)
- [ ] Health check endpoints
- [ ] Metrics and monitoring

## 📚 Resources

- **Quick Start**: See `QUICKSTART.md`
- **API Examples**: See `API_EXAMPLES.md`
- **Full Documentation**: See `README.md`

## 🤝 Contributing

This is an enterprise-grade template. Feel free to customize based on your requirements.

## 📄 License

MIT

---

**Built with ❤️ using NestJS, Prisma, and PostgreSQL**

wsl --install

wsl ./setup.sh


setup judge0.conf
password---gcusQPjqt4t3BE7CGBWDVG2VBUrhT9VS


JUDGE0 setup--https://github.com/judge0/judge0/blob/master/CHANGELOG.md

#   c a r e e r s - c l a r i t y - n e s t j s  
 