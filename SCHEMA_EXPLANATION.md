# Schema Field: `isApproved` - Complete Explanation

## What is `isApproved`?

`isApproved` is a **Boolean field** (true/false) in the User schema that controls whether a user can log in and access the system.

## Schema Definition

```javascript
isApproved: {
  type: Boolean,       // Can only be true or false
  default: false,      // When a new user is created, this starts as false
}
```

## Field Details

| Property | Value | Explanation |
|----------|-------|-------------|
| **Type** | Boolean | Can only be `true` or `false` |
| **Default** | `false` | New users start as not approved |
| **Purpose** | Controls user access | Determines if user can log in |

## How It Works

### Value: `false` (Not Approved)
- User cannot log in
- User receives error: "Account pending approval"
- User must wait for admin to approve them
- User appears in pending users list (if partner/admin)

### Value: `true` (Approved)
- User can log in successfully
- User receives authentication token
- User can access protected routes
- User has full access to their role's features

## Approval Rules by Role

| Role | Auto-Approved? | `isApproved` on Registration | Needs Admin Approval? |
|------|----------------|------------------------------|----------------------|
| **Styler** | ✅ Yes | `true` | ❌ No |
| **First Admin** | ✅ Yes | `true` | ❌ No |
| **Partner** | ❌ No | `false` | ✅ Yes |
| **Subsequent Admin** | ❌ No | `false` | ✅ Yes |

## Sample Data Examples

### Example 1: Styler (Auto-Approved)
```json
{
  "email": "styler@example.com",
  "role": "styler",
  "isApproved": true,  // ✅ Auto-approved
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```
**Behavior:** User can log in immediately after registration.

### Example 2: Partner (Needs Approval)
```json
{
  "email": "partner@example.com",
  "role": "partner",
  "isApproved": false,  // ❌ Not approved
  "createdAt": "2024-01-15T11:00:00.000Z"
}
```
**Behavior:** User cannot log in until admin approves them.

### Example 3: After Approval
```json
{
  "email": "partner@example.com",
  "role": "partner",
  "isApproved": true,  // ✅ Now approved
  "createdAt": "2024-01-15T11:00:00.000Z",
  "updatedAt": "2024-01-15T13:00:00.000Z"  // Updated when approved
}
```
**Behavior:** User can now log in successfully.

## Database Operations

### Checking if User is Approved
```javascript
const user = await User.findById(userId);
if (user.isApproved) {
  // User is approved, allow access
} else {
  // User is not approved, deny access
}
```

### Approving a User
```javascript
const user = await User.findById(userId);
user.isApproved = true;  // Change from false to true
await user.save();        // Save to database
```

### Finding Pending Users
```javascript
const pendingUsers = await User.find({ 
  isApproved: false,  // Only users who are not approved
  role: { $in: ["partner", "admin"] }  // Only partners and admins
});
```

## API Responses

### Registration Response (Styler - Auto-Approved)
```json
{
  "message": "Styler registered successfully. You can now log in.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "email": "styler@example.com",
    "role": "styler",
    "isApproved": true  // ✅ Approved
  }
}
```

### Registration Response (Partner - Needs Approval)
```json
{
  "message": "User registered successfully. Waiting for admin approval.",
  "user": {
    "email": "partner@example.com",
    "role": "partner",
    "isApproved": false  // ❌ Not approved
  }
}
```

### Login Response (Approved User)
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "email": "user@example.com",
    "role": "styler",
    "isApproved": true  // ✅ Approved
  }
}
```

### Login Error (Not Approved)
```json
{
  "error": "Account pending approval. Please wait for admin approval."
}
```

### Approval Response
```json
{
  "message": "User approved successfully",
  "user": {
    "email": "partner@example.com",
    "role": "partner",
    "isApproved": true  // ✅ Changed from false to true
  }
}
```

## Flow Diagram

```
Registration
    │
    ├─ Styler → isApproved: true → Can Login ✅
    │
    ├─ Partner → isApproved: false → Cannot Login ❌
    │              │
    │              └─ Admin Approves → isApproved: true → Can Login ✅
    │
    └─ Admin (First) → isApproved: true → Can Login ✅
    │
    └─ Admin (Subsequent) → isApproved: false → Cannot Login ❌
                            │
                            └─ Admin Approves → isApproved: true → Can Login ✅
```

## Summary

- **`isApproved`** is a boolean field (true/false)
- **Default value:** `false` (not approved)
- **Purpose:** Controls if user can log in
- **Stylers:** Auto-approved (`true`)
- **Partners:** Need approval (`false` → `true`)
- **First Admin:** Auto-approved (`true`)
- **Subsequent Admins:** Need approval (`false` → `true`)

---

**Key Takeaway:** Only users with `isApproved: true` can successfully log in and receive an authentication token.





