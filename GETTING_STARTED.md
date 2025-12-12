# Getting Started - Authentication Microservice

## ⚡ Quick Setup (Choose One)

### Option 1: Fully Automated (Recommended) - 2 minutes
```bash
# Run setup script
chmod +x setup.sh
./setup.sh

# Start development server
npm run start:dev

# ✅ Done! API running at http://localhost:3001/api/v1
```

### Option 2: Manual Setup - 5 minutes
```bash
# Step 1: Install dependencies
npm install

# Step 2: Start PostgreSQL
docker-compose up -d

# Step 3: Setup database
npx prisma generate
npx prisma migrate dev --name init

# Step 4: Start development server
npm run start:dev

# ✅ Done! API running at http://localhost:3001/api/v1
```

---

## 🧪 Test the API (Copy & Paste)

### Test 1: Register a User
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "DemoPass123!",
    "firstName": "Demo",
    "lastName": "User"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "statusCode": 201,
  "data": {
    "user": {
      "id": "...",
      "email": "demo@example.com",
      "firstName": "Demo",
      "lastName": "User",
      "isActive": true,
      "createdAt": "..."
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "..."
}
```

**⚠️ Save the accessToken! You'll need it for the next test.**

---

### Test 2: Login
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "DemoPass123!"
  }'
```

**Expected Response:** Same format as register, with new accessToken

---

### Test 3: Get Profile (Using Token)
```bash
# Replace YOUR_TOKEN_HERE with the accessToken from above
curl -X GET http://localhost:3001/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "...",
    "email": "demo@example.com",
    "firstName": "Demo",
    "lastName": "User",
    "isActive": true,
    "createdAt": "..."
  },
  "timestamp": "..."
}
```

---

### Test 4: Update Profile
```bash
curl -X PUT http://localhost:3001/api/v1/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "firstName": "Updated",
    "phone": "+1234567890"
  }'
```

---

### Test 5: Change Password
```bash
curl -X POST http://localhost:3001/api/v1/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "currentPassword": "DemoPass123!",
    "newPassword": "NewPass456!"
  }'
```

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **README.md** | Full architecture & features |
| **QUICKSTART.md** | 5-minute setup guide |
| **API_EXAMPLES.md** | All endpoints with examples |
| **IMPLEMENTATION_SUMMARY.md** | Detailed file-by-file breakdown |
| **PROJECT_STATUS.txt** | Completion report |

---

## 🐛 Troubleshooting

### Port 3001 Already in Use
```bash
# Find process on port 3001 and kill it
lsof -i :3001
kill -9 <PID>

# Or change port in .env
# AUTH_SERVICE_PORT=3002
```

### PostgreSQL Not Running
```bash
# Check if container is running
docker ps

# Start if stopped
docker-compose up -d

# View logs
docker logs postgres-container
```

### Database Connection Error
```bash
# Ensure DATABASE_URL is correct in .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/resource_management_db?schema=public"

# Reset database
npx prisma migrate reset --force
npx prisma migrate dev --name init
```

---

## 📦 What's Included

✅ Authentication microservice (9 endpoints)
✅ JWT-based security
✅ Password hashing (bcryptjs)
✅ User profile management
✅ Password reset functionality
✅ Global error handling
✅ Request logging
✅ Input validation
✅ Docker support
✅ Complete documentation
✅ API examples with cURL
✅ TypeScript throughout

---

## 🚀 Available Commands

```bash
# Development
npm run start:dev          # Hot reload development
npm run start:debug        # Debug mode
npm run build              # Build for production
npm run start:prod         # Production server

# Quality
npm run lint               # ESLint check
npm run format             # Prettier format
npm run test               # Jest tests
npm run test:cov           # Test coverage

# Database
npm run prisma:generate    # Generate Prisma
npm run prisma:migrate     # Run migrations
npm run prisma:studio      # Prisma Studio GUI

# Docker
docker-compose up -d       # Start database
docker-compose down        # Stop database
docker-compose logs -f     # View logs
```

---

## 🔐 Default Environment

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/resource_management_db?schema=public
JWT_SECRET=super-secret-key-change-in-production
JWT_EXPIRATION=7d
AUTH_SERVICE_PORT=3001
NODE_ENV=development
CORS_ORIGIN=*
```

---

## ✨ Key Features

✅ User Registration with email validation
✅ User Login with JWT tokens
✅ Profile management (get/update/delete)
✅ Password management (change/reset/forgot)
✅ Password strength validation
✅ Account activation/deactivation
✅ Protected routes with JWT
✅ Global error handling
✅ Request logging with masking
✅ Input validation
✅ Type-safe with TypeScript

---

## 🎯 What's Next?

1. ✅ Setup and test the API
2. 📖 Read the full documentation
3. 🔐 Change JWT_SECRET for production
4. 📧 Add email service integration
5. ⏱️ Add rate limiting
6. 📊 Add API monitoring
7. 🧪 Add unit tests
8. 🚀 Deploy to production

---

## 💡 Tips

- The API is RESTful with standard HTTP status codes
- All endpoints return JSON
- Authentication uses Bearer token in Authorization header
- Passwords are validated on registration and change
- Sensitive fields are excluded from responses
- Errors provide helpful messages

---

## 🎉 You're All Set!

The authentication microservice is now running and ready to use.

**API Endpoint:** http://localhost:3001/api/v1
**Documentation:** See README.md, QUICKSTART.md, API_EXAMPLES.md

Happy coding! 🚀
