# Quick Start Guide - Resource Management System

## Prerequisites
- Node.js v18+ installed
- Docker Desktop running
- npm or yarn package manager

## 5-Minute Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Start PostgreSQL with Docker
```bash
docker-compose up -d
```

### 3. Setup Database
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init
```

### 4. Start Development Server
```bash
npm run start:dev
```

✅ **API is now running at:** http://localhost:3001/api/v1

---

## Quick API Test

### Register a User
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "firstName": "Test"
  }'
```

**Save the `accessToken` from response!**

### Login
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

### Get Your Profile
```bash
curl -X GET http://localhost:3001/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Common Commands

```bash
# Development
npm run start:dev          # Start with hot reload
npm run start:debug        # Debug mode

# Production
npm run build              # Build for production
npm run start:prod         # Start production server

# Code Quality
npm run lint               # Check code
npm run format             # Format code
npm run test               # Run tests

# Database
npx prisma studio         # Open database GUI
npx prisma migrate dev     # Create new migration
npx prisma db push         # Sync schema to database
```

---

## Project Structure

```
src/
├── auth/                    # Authentication module
│   ├── auth.controller.ts   # API endpoints
│   ├── auth.service.ts      # Business logic
│   ├── auth.module.ts       # Module definition
│   ├── dto/                 # Data validation
│   ├── entities/            # Entity classes
│   ├── guards/              # JWT/Local auth guards
│   ├── strategies/          # Passport strategies
│   └── decorators/          # Custom decorators
├── common/                  # Shared utilities
│   ├── filters/             # Exception handling
│   ├── interceptors/        # Request/Response formatting
│   └── pipes/               # Validation
├── prisma/                  # Database service
├── config/                  # Configuration
└── main.ts                  # Application entry point
```

---

## Environment Variables

Create `.env` file in root:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/resource_management_db?schema=public"
JWT_SECRET="your-secret-key"
JWT_EXPIRATION="7d"
AUTH_SERVICE_PORT=8001
NODE_ENV=development
CORS_ORIGIN="*"
```

---

## API Endpoints

### Public Routes (No Auth Required)
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token

### Protected Routes (Require JWT)
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update profile
- `DELETE /auth/profile` - Delete account
- `POST /auth/change-password` - Change password
- `GET /auth/me` - Get current user

---

## Docker Commands

```bash
# Start database
docker-compose up -d

# Stop database
docker-compose down

# View logs
docker-compose logs -f postgres

# Restart database
docker-compose restart postgres

# Remove everything
docker-compose down -v
```

---

## Troubleshooting

### Port Already in Use
```bash
# Change port in .env
AUTH_SERVICE_PORT=3002

# Or kill process on port 3001
# On Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# On Mac/Linux
lsof -i :3001
kill -9 <PID>
```

### Database Connection Error
```bash
# Check if PostgreSQL is running
docker ps

# View database logs
docker logs postgres-container

# Rebuild database
docker-compose down -v
docker-compose up -d
npx prisma migrate dev --name init
```

### Migration Issues
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset --force

# Create new migration
npx prisma migrate dev --name <migration_name>
```

---

## Next Steps

1. ✅ Follow the Quick Test section above
2. 📖 Read full API documentation: [API_EXAMPLES.md](./API_EXAMPLES.md)
3. 🔐 Secure your JWT_SECRET in production
4. 📧 Implement email verification and password reset emails
5. 📊 Add monitoring and logging
6. 🧪 Write unit and E2E tests

---

## Support

For issues or questions:
- Check [API_EXAMPLES.md](./API_EXAMPLES.md) for API usage
- Review error messages - they provide clear guidance
- Ensure Docker and PostgreSQL are running
- Check database connection in `.env`

**Happy coding! 🚀**
