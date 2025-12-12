# API Examples - Resource Management System

## Base URL
```
http://localhost:3001/api/v1
```

## Authentication Endpoints

### 1. Register User
**Endpoint:** `POST /auth/register`
**Authentication:** None
**Status Code:** 201 Created

```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  }'
```

**Response:**
```json
{
  "success": true,
  "statusCode": 201,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890",
      "avatar": null,
      "isEmailVerified": false,
      "isActive": true,
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-01-15T10:30:00Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

---

### 2. Login User
**Endpoint:** `POST /auth/login`
**Authentication:** None
**Status Code:** 200 OK

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890",
      "isActive": true,
      "createdAt": "2025-01-15T10:30:00Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

---

### 3. Get Current User
**Endpoint:** `GET /auth/me`
**Authentication:** Bearer Token
**Status Code:** 200 OK

```bash
curl -X GET http://localhost:3001/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "uuid-here",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "isActive": true,
    "createdAt": "2025-01-15T10:30:00Z"
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

---

## Profile Management

### 4. Get Profile
**Endpoint:** `GET /auth/profile`
**Authentication:** Bearer Token
**Status Code:** 200 OK

```bash
curl -X GET http://localhost:3001/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 5. Update Profile
**Endpoint:** `PUT /auth/profile`
**Authentication:** Bearer Token
**Status Code:** 200 OK

```bash
curl -X PUT http://localhost:3001/api/v1/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "phone": "+0987654321"
  }'
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "message": "Profile updated successfully",
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "phone": "+0987654321",
      "updatedAt": "2025-01-15T11:00:00Z"
    }
  },
  "timestamp": "2025-01-15T11:00:00Z"
}
```

---

### 6. Delete Profile (Account Deletion)
**Endpoint:** `DELETE /auth/profile`
**Authentication:** Bearer Token
**Status Code:** 200 OK

```bash
curl -X DELETE http://localhost:3001/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "message": "Account deleted successfully"
  },
  "timestamp": "2025-01-15T11:00:00Z"
}
```

---

## Password Management

### 7. Change Password
**Endpoint:** `POST /auth/change-password`
**Authentication:** Bearer Token
**Status Code:** 200 OK

```bash
curl -X POST http://localhost:3001/api/v1/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "currentPassword": "SecurePass123!",
    "newPassword": "NewPass456!"
  }'
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "message": "Password changed successfully",
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "updatedAt": "2025-01-15T11:00:00Z"
    }
  },
  "timestamp": "2025-01-15T11:00:00Z"
}
```

---

### 8. Forgot Password
**Endpoint:** `POST /auth/forgot-password`
**Authentication:** None
**Status Code:** 200 OK

```bash
curl -X POST http://localhost:3001/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "message": "If this email exists, a password reset link has been sent",
    "resetToken": "token-for-testing"
  },
  "timestamp": "2025-01-15T11:00:00Z"
}
```

---

### 9. Reset Password
**Endpoint:** `POST /auth/reset-password`
**Authentication:** None
**Status Code:** 200 OK

```bash
curl -X POST http://localhost:3001/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "reset-token-from-email",
    "password": "NewPass789!"
  }'
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "message": "Password reset successfully"
  },
  "timestamp": "2025-01-15T11:00:00Z"
}
```

---

## Error Examples

### Invalid Email
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "SecurePass123!",
    "firstName": "John"
  }'
```

**Response (400 Bad Request):**
```json
{
  "statusCode": 400,
  "timestamp": "2025-01-15T11:00:00Z",
  "path": "/api/v1/auth/register",
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "messages": ["email must be an email"]
    }
  ]
}
```

---

### Weak Password
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "weak",
    "firstName": "John"
  }'
```

**Response (400 Bad Request):**
```json
{
  "statusCode": 400,
  "timestamp": "2025-01-15T11:00:00Z",
  "path": "/api/v1/auth/register",
  "message": "Validation failed",
  "errors": [
    {
      "field": "password",
      "messages": ["Password must contain at least one uppercase letter..."]
    }
  ]
}
```

---

### Unauthorized Access
```bash
curl -X GET http://localhost:3001/api/v1/auth/profile
```

**Response (401 Unauthorized):**
```json
{
  "statusCode": 401,
  "timestamp": "2025-01-15T11:00:00Z",
  "path": "/api/v1/auth/profile",
  "message": "Invalid or expired token"
}
```

---

### Email Already Exists
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "existing@example.com",
    "password": "SecurePass123!",
    "firstName": "John"
  }'
```

**Response (409 Conflict):**
```json
{
  "statusCode": 409,
  "timestamp": "2025-01-15T11:00:00Z",
  "path": "/api/v1/auth/register",
  "message": "Email already registered"
}
```

---

## File Uploads

### Upload File
**Endpoint:** `POST /files/upload`
**Authentication:** Determined by upstream guards  
**Status Code:** 201 Created

```bash
curl -X POST http://localhost:3001/api/v1/files/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/absolute/path/to/invoice.pdf"
```

**Response:**
```json
{
  "filename": "1731591030000-123456789.pdf",
  "originalName": "invoice.pdf",
  "mimeType": "application/pdf",
  "size": 12048,
  "path": "uploads/1731591030000-123456789.pdf",
  "url": "/uploads/1731591030000-123456789.pdf"
}
```

### Download File
**Endpoint:** `GET /files/:filename` (API) or `/uploads/:filename` (static)  
**Authentication:** None (public static asset)  
**Status Code:** 200 OK

```bash
curl -O http://localhost:3001/api/v1/files/1731591030000-123456789.pdf
```

---

## Testing with Postman

1. **Create Environment Variables:**
   - `base_url`: http://localhost:3001/api/v1
   - `token`: (automatically set after login)

2. **Register Request:**
   - Method: POST
   - URL: {{base_url}}/auth/register
   - Body: JSON with email, password, firstName, lastName, phone

3. **Login & Save Token:**
   - Method: POST
   - URL: {{base_url}}/auth/login
   - Body: JSON with email and password
   - In Tests tab, add: `pm.environment.set("token", pm.response.json().data.accessToken)`

4. **Use Token in Protected Routes:**
   - Add header: `Authorization: Bearer {{token}}`

---

## Notes

- All passwords must be at least 8 characters
- Passwords must contain: uppercase, lowercase, number, and special character
- JWT tokens expire in 7 days by default
- Email addresses are case-insensitive and unique
- Password reset tokens expire in 30 minutes
- Sensitive fields (password, reset tokens) are excluded from responses
