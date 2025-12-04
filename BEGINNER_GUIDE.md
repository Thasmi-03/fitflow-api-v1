# Beginner's Guide to Authentication System

##  Table of Contents
1. [Understanding the Schema](#understanding-the-schema)
2. [The `isApproved` Field Explained](#the-isapproved-field-explained)
3. [Sample Data Examples](#sample-data-examples)
4. [API Endpoints with Examples](#api-endpoints-with-examples)
5. [Complete Flow Examples](#complete-flow-examples)

---

## Understanding the Schema

### User Schema Overview

The User schema stores information about users in our system. Here's what each field means:

```javascript
{
  email: String,        // User's email address (must be unique)
  password: String,     // User's password (automatically encrypted)
  role: String,         // User's role: "styler", "partner", or "admin"
  isApproved: Boolean,  // Whether admin has approved this user (true/false)
  createdAt: Date,      // When the user was created (automatic)
  updatedAt: Date       // When the user was last updated (automatic)
}
```

---

## The `isApproved` Field Explained

### What is `isApproved`?

The `isApproved` field is a **Boolean** (true/false) that tells us whether a user has been approved by an admin to use the system.

### How It Works

```javascript
isApproved: {
  type: Boolean,      // Can only be true or false
  default: false      // When a new user is created, this starts as false
}
```

### Values

- **`true`**: User is approved and can log in
- **`false`**: User is waiting for admin approval (cannot log in)

### Who Gets Auto-Approved?

| Role | Auto-Approved? | Explanation |
|------|----------------|-------------|
| **Styler** | Yes | Stylers are automatically approved when they register |
| **First Admin** |  Yes | The very first admin is auto-approved |
| **Partner** |  No | Partners must wait for admin approval |
| **Subsequent Admins** |  No | Additional admins need approval from existing admin |

---

## Sample Data Examples

### Example 1: Styler (Auto-Approved)

```json
{
  "_id": "65f1234567890abcdef12345",
  "email": "john.styler@example.com",
  "password": "$2a$10$hashedpassword123...",  // Automatically hashed
  "role": "styler",
  "isApproved": true,  //  Auto-approved
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**What happens:**
- User registers as styler
- System automatically sets `isApproved: true`
- User receives token immediately
- User can log in right away

### Example 2: Partner (Needs Approval)

```json
{
  "_id": "65f1234567890abcdef12346",
  "email": "partner@example.com",
  "password": "$2a$10$hashedpassword456...",
  "role": "partner",
  "isApproved": false,  //  Waiting for approval
  "createdAt": "2024-01-15T11:00:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

**What happens:**
- User registers as partner
- System sets `isApproved: false`
- User cannot log in yet
- Admin must approve user
- After approval: `isApproved: true`

### Example 3: Admin (First Admin - Auto-Approved)

```json
{
  "_id": "65f1234567890abcdef12347",
  "email": "admin@example.com",
  "password": "$2a$10$hashedpassword789...",
  "role": "admin",
  "isApproved": true,  //  First admin is auto-approved
  "createdAt": "2024-01-15T09:00:00.000Z",
  "updatedAt": "2024-01-15T09:00:00.000Z"
}
```

### Example 4: Admin (Subsequent - Needs Approval)

```json
{
  "_id": "65f1234567890abcdef12348",
  "email": "admin2@example.com",
  "password": "$2a$10$hashedpasswordabc...",
  "role": "admin",
  "isApproved": false,  //  Needs approval from first admin
  "createdAt": "2024-01-15T12:00:00.000Z",
  "updatedAt": "2024-01-15T12:00:00.000Z"
}
```

---

## API Endpoints with Examples

### 1. Register User

**Endpoint:** `POST /api/auth/register`

**What it does:** Creates a new user account

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "styler"
}
```

**Response for Styler (Auto-Approved):**
```json
{
  "message": "Styler registered successfully. You can now log in.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65f1234567890abcdef12345",
    "email": "user@example.com",
    "role": "styler",
    "isApproved": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response for Partner (Needs Approval):**
```json
{
  "message": "User registered successfully. Waiting for admin approval.",
  "user": {
    "id": "65f1234567890abcdef12346",
    "email": "partner@example.com",
    "role": "partner",
    "isApproved": false,
    "createdAt": "2024-01-15T11:00:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "styler@example.com",
    "password": "styler123",
    "role": "styler"
  }'
```

---

### 2. Login User

**Endpoint:** `POST /api/auth/login`

**What it does:** Allows approved users to log in and get a token

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
    "id": "65f1234567890abcdef12345",
    "email": "user@example.com",
    "role": "styler",
    "isApproved": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response (Not Approved):**
```json
{
  "error": "Account pending approval. Please wait for admin approval."
}
```

**Error Response (Wrong Password):**
```json
{
  "error": "Invalid email or password"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "styler@example.com",
    "password": "styler123"
  }'
```

---

### 3. Get User Profile

**Endpoint:** `GET /api/auth/profile`

**What it does:** Gets the currently logged-in user's information

**Headers Required:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "user": {
    "id": "65f1234567890abcdef12345",
    "email": "user@example.com",
    "role": "styler",
    "isApproved": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 4. Get Pending Users (Admin Only)

**Endpoint:** `GET /api/admin/pending`

**What it does:** Gets list of users waiting for approval (partners and admins only)

**Headers Required:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "count": 2,
  "users": [
    {
      "id": "65f1234567890abcdef12346",
      "email": "partner@example.com",
      "role": "partner",
      "isApproved": false,
      "createdAt": "2024-01-15T11:00:00.000Z",
      "updatedAt": "2024-01-15T11:00:00.000Z"
    },
    {
      "id": "65f1234567890abcdef12348",
      "email": "admin2@example.com",
      "role": "admin",
      "isApproved": false,
      "createdAt": "2024-01-15T12:00:00.000Z",
      "updatedAt": "2024-01-15T12:00:00.000Z"
    }
  ]
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:5000/api/admin/pending \
  -H "Authorization: Bearer <admin_token>"
```

---

### 5. Approve User (Admin Only)

**Endpoint:** `PUT /api/admin/approve/:userId`

**What it does:** Approves a user (changes `isApproved` from `false` to `true`)

**URL Parameters:**
- `userId`: The ID of the user to approve

**Headers Required:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "message": "User approved successfully",
  "user": {
    "id": "65f1234567890abcdef12346",
    "email": "partner@example.com",
    "role": "partner",
    "isApproved": true,  // Changed to true
    "createdAt": "2024-01-15T11:00:00.000Z",
    "updatedAt": "2024-01-15T13:00:00.000Z"  // Updated timestamp
  }
}
```

**cURL Example:**
```bash
curl -X PUT http://localhost:5000/api/admin/approve/65f1234567890abcdef12346 \
  -H "Authorization: Bearer <admin_token>"
```

---

## Complete Flow Examples

### Flow 1: Styler Registration and Login

**Step 1: Register Styler**
```bash
POST /api/auth/register
{
  "email": "styler@example.com",
  "password": "styler123",
  "role": "styler"
}
```

**Response:**
- `isApproved: true` 
- Token returned immediately
- User can log in right away

**Step 2: Login (Optional - already have token)**
```bash
POST /api/auth/login
{
  "email": "styler@example.com",
  "password": "styler123"
}
```

**Response:**
- `message: "Login successful"`
- Token returned
- User can now access protected routes

---

### Flow 2: Partner Registration and Approval

**Step 1: Register Partner**
```bash
POST /api/auth/register
{
  "email": "partner@example.com",
  "password": "partner123",
  "role": "partner"
}
```

**Response:**
- `isApproved: false` 
- No token returned
- User cannot log in yet

**Step 2: Partner Tries to Login (Will Fail)**
```bash
POST /api/auth/login
{
  "email": "partner@example.com",
  "password": "partner123"
}
```

**Response:**
```json
{
  "error": "Account pending approval. Please wait for admin approval."
}
```

**Step 3: Admin Gets Pending Users**
```bash
GET /api/admin/pending
Headers: Authorization: Bearer <admin_token>
```

**Response:**
- Shows partner in pending list
- `isApproved: false`

**Step 4: Admin Approves Partner**
```bash
PUT /api/admin/approve/65f1234567890abcdef12346
Headers: Authorization: Bearer <admin_token>
```

**Response:**
- `isApproved: true` 
- Partner can now log in

**Step 5: Partner Logs In (Now Works)**
```bash
POST /api/auth/login
{
  "email": "partner@example.com",
  "password": "partner123"
}
```

**Response:**
- `message: "Login successful"` 
- Token returned
- Partner can access protected routes

---

## Understanding the Code

### Schema Definition (models/user.js)

```javascript
// This is the User schema - it defines what data we store for each user
const UserSchema = new Schema({
  email: {
    type: String,        // Email must be text
    required: true,      // Email is required (cannot be empty)
    unique: true,        // Each email can only be used once
    lowercase: true,     // Convert to lowercase (John@Example.com → john@example.com)
    trim: true,          // Remove extra spaces
  },
  password: {
    type: String,        // Password must be text
    required: true,      // Password is required
  },
  role: {
    type: String,        // Role must be text
    enum: ["styler", "partner", "admin"],  // Can only be one of these three values
    required: true,      // Role is required
  },
  isApproved: {
    type: Boolean,       // Can only be true or false
    default: false,      // When creating a new user, start with false
  },
}, { timestamps: true }); // Automatically add createdAt and updatedAt fields
```

### Registration Logic (controllers/authController.js)

```javascript
// When a user registers, we decide if they should be approved
if (role === "styler") {
  // Stylers are always approved immediately
  isApproved = true;
  shouldReturnToken = true;
} else if (role === "partner") {
  // Partners need to wait for admin approval
  isApproved = false;
  shouldReturnToken = false;
} else if (role === "admin") {
  // Check if this is the first admin
  const approvedAdmins = await User.countDocuments({ 
    role: "admin", 
    isApproved: true 
  });
  
  if (approvedAdmins === 0) {
    // First admin gets auto-approved
    isApproved = true;
    shouldReturnToken = true;
  } else {
    // Additional admins need approval
    isApproved = false;
    shouldReturnToken = false;
  }
}
```

### Login Logic (controllers/authController.js)

```javascript
// When a user tries to log in, we check if they're approved
const user = await User.findOne({ email });

// Check if user is approved
if (!user.isApproved) {
  // User is not approved - reject login
  return res.status(403).json({
    error: "Account pending approval. Please wait for admin approval.",
  });
}

// User is approved - allow login and return token
const token = generateToken(user._id);
return res.status(200).json({
  message: "Login successful",
  token,
  user: userResponse,
});
```

### Approval Logic (controllers/authController.js)

```javascript
// Admin approves a user
const user = await User.findById(userId);

// Change isApproved from false to true
user.isApproved = true;
await user.save();  // Save the change to database

// Now user can log in!
```

---

## Testing with Thunder Client

### Step-by-Step Testing

1. **Register a Styler**
   - Method: POST
   - URL: `http://localhost:5000/api/auth/register`
   - Body: `{ "email": "styler@test.com", "password": "test123", "role": "styler" }`
   - Expected: Token returned, `isApproved: true`

2. **Register a Partner**
   - Method: POST
   - URL: `http://localhost:5000/api/auth/register`
   - Body: `{ "email": "partner@test.com", "password": "test123", "role": "partner" }`
   - Expected: No token, `isApproved: false`

3. **Login as Styler**
   - Method: POST
   - URL: `http://localhost:5000/api/auth/login`
   - Body: `{ "email": "styler@test.com", "password": "test123" }`
   - Expected: `"Login successful"`, token returned

4. **Try to Login as Partner (Will Fail)**
   - Method: POST
   - URL: `http://localhost:5000/api/auth/login`
   - Body: `{ "email": "partner@test.com", "password": "test123" }`
   - Expected: Error message about pending approval

5. **Admin Gets Pending Users**
   - Method: GET
   - URL: `http://localhost:5000/api/admin/pending`
   - Headers: `Authorization: Bearer <admin_token>`
   - Expected: List of pending users (partners and admins)

6. **Admin Approves Partner**
   - Method: PUT
   - URL: `http://localhost:5000/api/admin/approve/<partner_user_id>`
   - Headers: `Authorization: Bearer <admin_token>`
   - Expected: `isApproved: true`

7. **Partner Logs In (Now Works)**
   - Method: POST
   - URL: `http://localhost:5000/api/auth/login`
   - Body: `{ "email": "partner@test.com", "password": "test123" }`
   - Expected: `"Login successful"`, token returned

---

## Common Questions

### Q: What happens if I try to approve a styler?
**A:** The system will return an error saying stylers are automatically approved and don't need manual approval.

### Q: Can I change `isApproved` directly in the database?
**A:** Yes, but it's better to use the API endpoint so the system can validate and log the action.

### Q: What if a user's `isApproved` is `true` but they still can't log in?
**A:** Check:
1. Is the password correct?
2. Is the email correct?
3. Is the user actually approved in the database?

### Q: How do I check if a user is approved?
**A:** Look at the `isApproved` field in the user object. It will be `true` or `false`.

### Q: Can I set `isApproved: true` when registering?
**A:** The system automatically sets this based on the user's role. You don't need to set it manually.

---

## Summary

- **`isApproved`** is a boolean field (true/false) that controls if a user can log in
- **Stylers** are auto-approved (`isApproved: true`)
- **Partners** need admin approval (`isApproved: false` → `true`)
- **First Admin** is auto-approved
- **Subsequent Admins** need approval
- Only users with `isApproved: true` can log in and get tokens

---

**Happy Coding! **





