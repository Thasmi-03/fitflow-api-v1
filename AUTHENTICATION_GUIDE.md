# Authentication & User Approval System Guide

This guide explains how to use the authentication system with role-based access control and admin approval workflow.

## Table of Contents

- [Overview](#overview)
- [Setup](#setup)
- [Authentication Flow](#authentication-flow)
- [API Endpoints](#api-endpoints)
- [Testing with Thunder Client](#testing-with-thunder-client)
- [Role-Based Access Control](#role-based-access-control)
- [Troubleshooting](#troubleshooting)

## Overview

The authentication system uses:
- **JWT (JSON Web Tokens)** for authentication
- **Role-based access control** with three roles: `admin`, `styler`, `partner`
- **Admin approval system** - users must be approved by an admin before they can log in
- **Automatic first admin approval** - the first admin is auto-approved and receives a token immediately

## Setup

### 1. Environment Variables

Create a `.env` file in the root directory:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your-secret-key-here-make-it-strong
PORT=5000
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Initial Admin User

Run the seed script to create the first admin user:

```bash
node scripts/seedAdmin.js
```

This creates an admin user with:
- **Email**: `admin@gmail.com`
- **Password**: `admin@123`
- **Role**: `admin`
- **Status**: `isApproved: true`

### 4. Start the Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

## Authentication Flow

### Flow Diagram

```
┌─────────────┐
│   Register  │
└──────┬──────┘
       │
       ├─ Admin (First) → Auto-approved → Token returned 
       │
       └─ Other Users → Waiting for approval 
                        │
                        └─ Admin approves → User can login 
```

### Step-by-Step Flow

#### 1. User Registration

**First Admin Registration:**
- Register with role `admin`
- If no approved admins exist, user is automatically approved
- Token is returned immediately in the response

**Other Users (Styler/Partner/Subsequent Admins):**
- Register with their role
- User is created with `isApproved: false`
- Must wait for admin approval

#### 2. Admin Approval (Admin Only)

- Admin logs in and gets a token
- Admin views pending users
- Admin approves users
- Approved users can now log in

#### 3. User Login

- User provides email and password
- System checks if user is approved
- If approved, token is returned
- User can now access protected routes

## API Endpoints

### Public Endpoints

#### 1. Register User

**POST** `/api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "styler"
}
```

**Response (First Admin):**
```json
{
  "message": "Admin registered and approved successfully. You can now log in.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65f...",
    "email": "admin@example.com",
    "role": "admin",
    "isApproved": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response (Other Users):**
```json
{
  "message": "User registered successfully. Waiting for admin approval.",
  "user": {
    "id": "65f...",
    "email": "user@example.com",
    "role": "styler",
    "isApproved": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 2. Login User

**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65f...",
    "email": "user@example.com",
    "role": "styler",
    "isApproved": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `401` - Invalid email or password
- `403` - Account pending approval

#### 3. Logout User

**POST** `/api/auth/logout` (Protected)
- Headers: `Authorization: Bearer <token>`
- Response:
```json
{ "message": "Logged out successfully" }
```

### Protected Endpoints (Require Authentication)

#### 3. Get User Profile

**GET** `/api/auth/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": "65f...",
    "email": "user@example.com",
    "role": "styler",
    "isApproved": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Admin Only Endpoints

#### 4. Get Pending Users

**GET** `/api/auth/pending`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "count": 2,
  "users": [
    {
      "id": "65f...",
      "email": "user1@example.com",
      "role": "styler",
      "isApproved": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "65f...",
      "email": "user2@example.com",
      "role": "partner",
      "isApproved": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### 5. Approve User

**PUT** `/api/auth/approve/:userId`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "message": "User approved successfully",
  "user": {
    "id": "65f...",
    "email": "user@example.com",
    "role": "styler",
    "isApproved": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Role-based protection summary

- Users routes (`/api/users/*`): admin only (verifyToken + verifyRole("admin"))
- Admin routes (`/api/admin/*`): admin only
- Clothes: POST/PUT allowed for `styler` and `partner`; DELETE also for `admin`
- Payments: accessible by `styler` and `partner` (admin can read/manage)
- Occasions: POST only by `styler`, update/delete by `styler` or `admin`

## Testing with Thunder Client

### Setup Thunder Client

1. Open Thunder Client in VS Code
2. Create a new collection named "Authentication API"
3. Set base URL: `http://localhost:5000`

### Test Scenario 1: First Admin Registration

#### Step 1: Register First Admin

**Request:**
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/auth/register`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "email": "admin@gmail.com",
  "password": "admin@123",
  "role": "admin"
}
```

**Expected Response:**
- Status: `201 Created`
- Body includes `token` and `user.isApproved: true`
- Message: "Admin registered and approved successfully. You can now log in."

#### Step 2: Verify Token (Optional)

**Request:**
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/auth/profile`
- **Headers**: 
  - `Authorization: Bearer <token_from_step_1>`
  - `Content-Type: application/json`

**Expected Response:**
- Status: `200 OK`
- Body contains user profile

### Test Scenario 2: Register Regular User

#### Step 1: Register Styler

**Request:**
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/auth/register`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "email": "styler@example.com",
  "password": "styler123",
  "role": "styler"
}
```

**Expected Response:**
- Status: `201 Created`
- Body does NOT include `token`
- `user.isApproved: false`
- Message: "User registered successfully. Waiting for admin approval."

#### Step 2: Try to Login (Should Fail)

**Request:**
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/auth/login`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "email": "styler@example.com",
  "password": "styler123"
}
```

**Expected Response:**
- Status: `403 Forbidden`
- Error: "Account pending approval. Please wait for admin approval."

### Test Scenario 3: Admin Approval Workflow

#### Step 1: Admin Login

**Request:**
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/auth/login`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "email": "admin@gmail.com",
  "password": "admin@123"
}
```

**Expected Response:**
- Status: `200 OK`
- **Message**: "Login successful" 
- Body includes `token` and user data

#### Step 2: Get Pending Users

**Request:**
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/auth/pending`
- **Headers**: 
  - `Authorization: Bearer <admin_token_from_step_1>`
  - `Content-Type: application/json`

**Expected Response:**
- Status: `200 OK`
- Body contains list of pending users

#### Step 3: Approve User

**Request:**
- **Method**: `PUT`
- **URL**: `http://localhost:5000/api/auth/approve/<user_id>`
- **Headers**: 
  - `Authorization: Bearer <admin_token>`
  - `Content-Type: application/json`

**Expected Response:**
- Status: `200 OK`
- Message: "User approved successfully"
- `user.isApproved: true`

#### Step 4: User Login (Should Succeed Now)

**Request:**
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/auth/login`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "email": "styler@example.com",
  "password": "styler123"
}
```

**Expected Response:**
- Status: `200 OK`
- **Message**: "Login successful" 
- Body includes `token` and user data
- `user.isApproved: true`

## Role-Based Access Control

### Available Roles

1. **admin** - Full system access
   - Can approve users
   - Can access all user management endpoints
   - Can view pending users

2. **styler** - Styler-specific access
   - Can access styler-related endpoints
   - Requires approval before login

3. **partner** - Partner-specific access
   - Can access partner-related endpoints
   - Requires approval before login

### Middleware Functions

- `authenticate` - Verifies JWT token and checks if user is approved
- `requireAdmin` - Ensures user has admin role
- `requireStyler` - Ensures user has styler role
- `requirePartner` - Ensures user has partner role
- `requireRole([roles])` - Ensures user has one of the specified roles

### Protected Routes

All `/api/users/*` routes require:
- Authentication (`authenticate` middleware)
- Admin role (`requireAdmin` middleware)

## Expected Outputs

### Success Messages

#### Registration (First Admin)
```json
{
  "message": "Admin registered and approved successfully. You can now log in.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

#### Registration (Other Users)
```json
{
  "message": "User registered successfully. Waiting for admin approval.",
  "user": { ... }
}
```

#### Login Successful
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "user@example.com",
    "role": "styler",
    "isApproved": true,
    ...
  }
}
```

#### User Approved
```json
{
  "message": "User approved successfully",
  "user": { ... }
}
```

### Error Messages

#### Invalid Credentials
```json
{
  "error": "Invalid email or password"
}
```

#### Pending Approval
```json
{
  "error": "Account pending approval. Please wait for admin approval."
}
```

#### Access Denied
```json
{
  "error": "Access denied. Admin permission required."
}
```

#### Missing Token
```json
{
  "error": "No authorization token provided"
}
```

#### Invalid Token
```json
{
  "error": "Invalid token"
}
```

#### Token Expired
```json
{
  "error": "Token expired"
}
```

## Troubleshooting

### Issue: "Invalid email or password" when credentials are correct

**Solutions:**
1. Check if user exists in database
2. Verify password hasn't been changed
3. Check if user is approved (`isApproved: true`)
4. Verify password is being hashed correctly

### Issue: "Account pending approval" when trying to login

**Solutions:**
1. User needs to be approved by an admin
2. Admin should use `PUT /api/auth/approve/:userId` endpoint
3. Check user's `isApproved` status in database

### Issue: "Access denied. Admin permission required"

**Solutions:**
1. Verify user has `role: "admin"` in database
2. Check if token contains correct user information
3. Verify token is being sent in `Authorization` header as `Bearer <token>`

### Issue: "No authorization token provided"

**Solutions:**
1. Ensure token is included in request headers
2. Format: `Authorization: Bearer <token>`
3. Check if token was received from login/register response

### Issue: Token not returned on first admin registration

**Solutions:**
1. Check if another approved admin already exists
2. Only the FIRST admin gets auto-approved
3. Subsequent admins need approval from existing admin

### Issue: Cannot approve users

**Solutions:**
1. Verify you're logged in as an admin
2. Check if token is valid and not expired
3. Ensure `Authorization` header is included
4. Verify user ID in URL is correct

## Quick Reference

### Registration Flow
```
POST /api/auth/register
Body: { email, password, role }
→ First admin: Returns token 
→ Others: Waiting for approval 
```

### Login Flow
```
POST /api/auth/login
Body: { email, password }
→ Approved users: Returns token 
→ Pending users: Error 403 
```

### Approval Flow
```
1. Admin login → Get token
2. GET /api/auth/pending → See pending users
3. PUT /api/auth/approve/:userId → Approve user
4. User can now login 
```

### Using Token
```
Add to headers:
Authorization: Bearer <token>
```

## Security Notes

1. **JWT Secret**: Use a strong, random secret in production
2. **Password Hashing**: Passwords are automatically hashed with bcrypt
3. **Token Expiration**: Tokens expire after 7 days
4. **Approval Required**: All users (except first admin) require approval
5. **Role Validation**: Roles are validated against enum values
6. **Password Exclusion**: Passwords are never returned in API responses

## Additional Resources

- **Seed Script**: `scripts/seedAdmin.js` - Create initial admin
- **Index Cleanup**: `scripts/dropAccountIdIndex.js` - Remove old indexes
- **Models**: `models/user.js` - User schema definition
- **Middleware**: `middleware/auth.js` - Authentication middleware
- **Controllers**: `controllers/authController.js` - Auth logic

---

**Last Updated**: 2024
**Version**: 1.0.0

