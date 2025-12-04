# Complete API Endpoints Guide with Sample Data

## Table of Contents
1. [Getting Tokens for Partner and Styler](#getting-tokens)
2. [Clothes CRUD Operations](#clothes-crud)
3. [Occasion CRUD Operations](#occasion-crud)
4. [Payment CRUD Operations](#payment-crud)
5. [Styler CRUD Operations](#styler-crud)
6. [Partner CRUD Operations](#partner-crud)
7. [User CRUD Operations](#user-crud)
8. [Admin Operations](#admin-operations)

---

## Getting Tokens for Partner and Styler

### Step 1: Register as Partner or Styler

**URL:** `POST http://localhost:5000/api/auth/register`

**Request Body (Partner):**
```json
{
  "email": "partner@example.com",
  "password": "partner123",
  "role": "partner"
}
```

**Request Body (Styler):**
```json
{
  "email": "styler@example.com",
  "password": "styler123",
  "role": "styler"
}
```

**Response (Styler - Auto-approved):**
```json
{
  "message": "Styler registered successfully. You can now log in.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65f1234567890abcdef12345",
    "email": "styler@example.com",
    "role": "styler",
    "isApproved": true
  }
}
```

**Response (Partner - Needs Approval):**
```json
{
  "message": "User registered successfully. Waiting for admin approval.",
  "user": {
    "id": "65f1234567890abcdef12346",
    "email": "partner@example.com",
    "role": "partner",
    "isApproved": false
  }
}
```

### Step 2: Approve Partner (Admin Only)

**URL:** `PUT http://localhost:5000/api/admin/approve/:userId`

**Headers:**
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
    "isApproved": true
  }
}
```

### Step 3: Login to Get Token

**URL:** `POST http://localhost:5000/api/auth/login`

**Request Body:**
```json
{
  "email": "partner@example.com",
  "password": "partner123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65f1234567890abcdef12346",
    "email": "partner@example.com",
    "role": "partner",
    "isApproved": true
  }
}
```

**Save this token for authenticated requests!**

---

## Clothes CRUD Operations

### Base URL: `http://localhost:5000/api/clothes`

### CREATE - Add New Clothes
**URL:** `POST http://localhost:5000/api/clothes`

**Headers:**
```
Authorization: Bearer <styler_token_or_partner_token>
Content-Type: application/json
```

**Sample Request Body:**
```json
{
  "partner": "65f1234567890abcdef12346",
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "itemName": "Summer Dress",
  "category": "dress",
  "brand": "Zara",
  "color": ["blue", "white"],
  "material": "Cotton",
  "size": "M",
  "season": ["summer", "spring"],
  "occasionTags": ["casual", "beach"],
  "purchasedAt": "2024-01-15T10:00:00.000Z",
  "usageCount": 0,
  "wearable": true,
  "isArchived": false
}
```

**Response:**
```json
{
  "message": "Clothes created",
  "clothes": {
    "_id": "65f1234567890abcdef12350",
    "partner": "65f1234567890abcdef12346",
    "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
    "itemName": "Summer Dress",
    "category": "dress",
    "brand": "Zara",
    "color": ["blue", "white"],
    "material": "Cotton",
    "size": "M",
    "season": ["summer", "spring"],
    "occasionTags": ["casual", "beach"],
    "purchasedAt": "2024-01-15T10:00:00.000Z",
    "usageCount": 0,
    "wearable": true,
    "isArchived": false,
    "createdAt": "2024-01-15T12:00:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

**Note:** Replace `"partner"` with your actual user ID (from login response).

### READ - Get All Clothes
**URL:** `GET http://localhost:5000/api/clothes`

**Headers:** None (Public endpoint)

**Response:**
```json
[
  {
    "_id": "65f1234567890abcdef12350",
    "partner": "65f1234567890abcdef12346",
    "images": ["https://example.com/image1.jpg"],
    "itemName": "Summer Dress",
    "category": "dress",
    "brand": "Zara",
    "color": ["blue", "white"],
    "material": "Cotton",
    "size": "M",
    "season": ["summer", "spring"],
    "occasionTags": ["casual", "beach"],
    "usageCount": 0,
    "wearable": true,
    "isArchived": false,
    "createdAt": "2024-01-15T12:00:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
]
```

### READ - Get Clothes by ID
**URL:** `GET http://localhost:5000/api/clothes/:id`

**Example:** `GET http://localhost:5000/api/clothes/65f1234567890abcdef12350`

**Headers:** None (Public endpoint)

**Response:**
```json
{
  "_id": "65f1234567890abcdef12350",
  "partner": "65f1234567890abcdef12346",
  "images": ["https://example.com/image1.jpg"],
  "itemName": "Summer Dress",
  "category": "dress",
  "brand": "Zara",
  "color": ["blue", "white"],
  "material": "Cotton",
  "size": "M",
  "season": ["summer", "spring"],
  "occasionTags": ["casual", "beach"],
  "usageCount": 0,
  "wearable": true,
  "isArchived": false,
  "createdAt": "2024-01-15T12:00:00.000Z",
  "updatedAt": "2024-01-15T12:00:00.000Z"
}
```

### UPDATE - Update Clothes
**URL:** `PUT http://localhost:5000/api/clothes/:id`

**Example:** `PUT http://localhost:5000/api/clothes/65f1234567890abcdef12350`

**Headers:**
```
Authorization: Bearer <styler_token_or_partner_token>
Content-Type: application/json
```

**Sample Request Body:**
```json
{
  "itemName": "Updated Summer Dress",
  "usageCount": 5,
  "wearable": true
}
```

**Response:**
```json
{
  "message": "Clothes updated",
  "clothes": {
    "_id": "65f1234567890abcdef12350",
    "itemName": "Updated Summer Dress",
    "usageCount": 5,
    "wearable": true,
    "updatedAt": "2024-01-15T13:00:00.000Z"
  }
}
```

### DELETE - Delete Clothes
**URL:** `DELETE http://localhost:5000/api/clothes/:id`

**Example:** `DELETE http://localhost:5000/api/clothes/65f1234567890abcdef12350`

**Headers:**
```
Authorization: Bearer <styler_token_or_partner_token_or_admin_token>
```

**Response:**
```json
{
  "message": "Clothes deleted",
  "clothes": {
    "_id": "65f1234567890abcdef12350",
    "itemName": "Summer Dress"
  }
}
```

**Category Options:** `"top"`, `"bottom"`, `"dress"`, `"outerwear"`, `"shoes"`, `"accessory"`, `"other"`

**Season Options:** `"spring"`, `"summer"`, `"autumn"`, `"winter"`, `"all"`

---

## Occasion CRUD Operations

### Base URL: `http://localhost:5000/api/occasion`

### CREATE - Add New Occasion
**URL:** `POST http://localhost:5000/api/occasion`

**Headers:**
```
Authorization: Bearer <styler_token>
Content-Type: application/json
```

**Sample Request Body:**
```json
{
  "userId": "65f1234567890abcdef12345",
  "title": "Summer Wedding",
  "type": "wedding",
  "date": "2024-06-15T18:00:00.000Z",
  "location": "Grand Hotel, New York",
  "dressCode": "formal",
  "notes": "Evening wedding, need formal attire",
  "clothesList": ["65f1234567890abcdef12350", "65f1234567890abcdef12351"]
}
```

**Response:**
```json
{
  "message": "Occasion created",
  "occasion": {
    "_id": "65f1234567890abcdef12360",
    "userId": {
      "_id": "65f1234567890abcdef12345",
      "email": "styler@example.com",
      "role": "styler"
    },
    "title": "Summer Wedding",
    "type": "wedding",
    "date": "2024-06-15T18:00:00.000Z",
    "location": "Grand Hotel, New York",
    "dressCode": "formal",
    "notes": "Evening wedding, need formal attire",
    "clothesList": [
      {
        "_id": "65f1234567890abcdef12350",
        "itemName": "Summer Dress"
      }
    ],
    "createdAt": "2024-01-15T12:00:00.000Z"
  }
}
```

**Note:** Replace `"userId"` with your actual user ID. `clothesList` should contain Clothes IDs.

### READ - Get All Occasions
**URL:** `GET http://localhost:5000/api/occasion`

**Query Parameters (Optional):**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 50)
- `user`: Filter by user ID
- `type`: Filter by occasion type

**Example:** `GET http://localhost:5000/api/occasion?page=1&limit=10&type=wedding`

**Headers:** None (Public endpoint)

**Response:**
```json
{
  "total": 10,
  "page": 1,
  "limit": 10,
  "totalPages": 1,
  "data": [
    {
      "_id": "65f1234567890abcdef12360",
      "userId": {
        "_id": "65f1234567890abcdef12345",
        "email": "styler@example.com"
      },
      "title": "Summer Wedding",
      "type": "wedding",
      "date": "2024-06-15T18:00:00.000Z",
      "location": "Grand Hotel, New York",
      "dressCode": "formal",
      "notes": "Evening wedding, need formal attire",
      "clothesList": [],
      "createdAt": "2024-01-15T12:00:00.000Z"
    }
  ]
}
```

### READ - Get Occasion by ID
**URL:** `GET http://localhost:5000/api/occasion/:id`

**Example:** `GET http://localhost:5000/api/occasion/65f1234567890abcdef12360`

**Headers:** None (Public endpoint)

**Response:**
```json
{
  "_id": "65f1234567890abcdef12360",
  "userId": {
    "_id": "65f1234567890abcdef12345",
    "email": "styler@example.com",
    "role": "styler"
  },
  "title": "Summer Wedding",
  "type": "wedding",
  "date": "2024-06-15T18:00:00.000Z",
  "location": "Grand Hotel, New York",
  "dressCode": "formal",
  "notes": "Evening wedding, need formal attire",
  "clothesList": [],
  "createdAt": "2024-01-15T12:00:00.000Z"
}
```

### UPDATE - Update Occasion
**URL:** `PUT http://localhost:5000/api/occasion/:id`

**Example:** `PUT http://localhost:5000/api/occasion/65f1234567890abcdef12360`

**Headers:**
```
Authorization: Bearer <styler_token_or_admin_token>
Content-Type: application/json
```

**Sample Request Body:**
```json
{
  "title": "Updated Summer Wedding",
  "location": "Updated Location",
  "notes": "Updated notes"
}
```

**Response:**
```json
{
  "message": "Occasion updated",
  "occasion": {
    "_id": "65f1234567890abcdef12360",
    "title": "Updated Summer Wedding",
    "location": "Updated Location",
    "notes": "Updated notes",
    "updatedAt": "2024-01-15T13:00:00.000Z"
  }
}
```

### DELETE - Delete Occasion
**URL:** `DELETE http://localhost:5000/api/occasion/:id`

**Example:** `DELETE http://localhost:5000/api/occasion/65f1234567890abcdef12360`

**Headers:**
```
Authorization: Bearer <styler_token_or_admin_token>
```

**Response:**
```json
{
  "message": "Occasion deleted",
  "occasion": {
    "_id": "65f1234567890abcdef12360",
    "title": "Summer Wedding"
  }
}
```

---

## Payment CRUD Operations

### Base URL: `http://localhost:5000/api/payment`

### CREATE - Add New Payment
**URL:** `POST http://localhost:5000/api/payment`

**Headers:**
```
Authorization: Bearer <styler_token_or_partner_token>
Content-Type: application/json
```

**Sample Request Body:**
```json
{
  "amount": 150.00,
  "currency": "USD",
  "method": "card",
  "status": "pending",
  "description": "Payment for styling services"
}
```

**Response:**
```json
{
  "message": "Payment created",
  "payment": {
    "_id": "65f1234567890abcdef12370",
    "amount": 150.00,
    "currency": "USD",
    "method": "card",
    "status": "pending",
    "description": "Payment for styling services",
    "createdAt": "2024-01-15T12:00:00.000Z"
  }
}
```

**Method Options:** `"card"`, `"paypal"`, `"stripe"`, `"bank_transfer"`, `"inapp"`

**Status Options:** `"pending"`, `"completed"`, `"failed"`, `"refunded"`

### READ - Get All Payments
**URL:** `GET http://localhost:5000/api/payment`

**Query Parameters (Optional):**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 50)
- `user`: Filter by user ID
- `status`: Filter by payment status

**Example:** `GET http://localhost:5000/api/payment?page=1&limit=10&status=completed`

**Headers:**
```
Authorization: Bearer <styler_token_or_partner_token_or_admin_token>
```

**Response:**
```json
{
  "total": 5,
  "page": 1,
  "limit": 10,
  "totalPages": 1,
  "data": [
    {
      "_id": "65f1234567890abcdef12370",
      "amount": 150.00,
      "currency": "USD",
      "method": "card",
      "status": "completed",
      "description": "Payment for styling services",
      "createdAt": "2024-01-15T12:00:00.000Z"
    }
  ]
}
```

### READ - Get Payment by ID
**URL:** `GET http://localhost:5000/api/payment/:id`

**Example:** `GET http://localhost:5000/api/payment/65f1234567890abcdef12370`

**Headers:**
```
Authorization: Bearer <styler_token_or_partner_token_or_admin_token>
```

**Response:**
```json
{
  "_id": "65f1234567890abcdef12370",
  "amount": 150.00,
  "currency": "USD",
  "method": "card",
  "status": "completed",
  "description": "Payment for styling services",
  "createdAt": "2024-01-15T12:00:00.000Z"
}
```

### UPDATE - Update Payment
**URL:** `PUT http://localhost:5000/api/payment/:id`

**Example:** `PUT http://localhost:5000/api/payment/65f1234567890abcdef12370`

**Headers:**
```
Authorization: Bearer <styler_token_or_partner_token_or_admin_token>
Content-Type: application/json
```

**Sample Request Body:**
```json
{
  "status": "completed",
  "description": "Payment completed successfully"
}
```

**Response:**
```json
{
  "message": "Payment updated",
  "payment": {
    "_id": "65f1234567890abcdef12370",
    "status": "completed",
    "description": "Payment completed successfully",
    "updatedAt": "2024-01-15T13:00:00.000Z"
  }
}
```

### DELETE - Delete Payment
**URL:** `DELETE http://localhost:5000/api/payment/:id`

**Example:** `DELETE http://localhost:5000/api/payment/65f1234567890abcdef12370`

**Headers:**
```
Authorization: Bearer <styler_token_or_partner_token_or_admin_token>
```

**Response:**
```json
{
  "message": "Payment deleted",
  "payment": {
    "_id": "65f1234567890abcdef12370",
    "amount": 150.00
  }
}
```

---

## Styler CRUD Operations

### Base URL: `http://localhost:5000/api/styler`

### CREATE - Add New Styler
**URL:** `POST http://localhost:5000/api/styler`

**Headers:** None (Public endpoint)

**Sample Request Body:**
```json
{
  "name": "John Styler",
  "bio": "Professional fashion stylist with 10 years of experience",
  "gender": "male",
  "age": 32,
  "country": "USA",
  "skinTone": "medium",
  "mood": "professional",
  "ratingAvg": 4.5
}
```

**Response:**
```json
{
  "message": "Styler created",
  "styler": {
    "_id": "65f1234567890abcdef12380",
    "name": "John Styler",
    "bio": "Professional fashion stylist with 10 years of experience",
    "gender": "male",
    "age": 32,
    "country": "USA",
    "skinTone": "medium",
    "mood": "professional",
    "ratingAvg": 4.5,
    "createdAt": "2024-01-15T12:00:00.000Z"
  }
}
```

**Gender Options:** `"male"`, `"female"`, `"other"`

### READ - Get All Stylers
**URL:** `GET http://localhost:5000/api/styler`

**Query Parameters (Optional):**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 50)
- `name`: Search by name
- `country`: Filter by country
- `gender`: Filter by gender

**Example:** `GET http://localhost:5000/api/styler?page=1&limit=10&country=USA`

**Headers:** None (Public endpoint)

**Response:**
```json
{
  "total": 5,
  "page": 1,
  "limit": 10,
  "totalPages": 1,
  "data": [
    {
      "_id": "65f1234567890abcdef12380",
      "name": "John Styler",
      "bio": "Professional fashion stylist",
      "gender": "male",
      "age": 32,
      "country": "USA",
      "skinTone": "medium",
      "mood": "professional",
      "ratingAvg": 4.5,
      "createdAt": "2024-01-15T12:00:00.000Z"
    }
  ]
}
```

### READ - Get Styler by ID
**URL:** `GET http://localhost:5000/api/styler/:id`

**Example:** `GET http://localhost:5000/api/styler/65f1234567890abcdef12380`

**Headers:** None (Public endpoint)

**Response:**
```json
{
  "_id": "65f1234567890abcdef12380",
  "name": "John Styler",
  "bio": "Professional fashion stylist with 10 years of experience",
  "gender": "male",
  "age": 32,
  "country": "USA",
  "skinTone": "medium",
  "mood": "professional",
  "ratingAvg": 4.5,
  "createdAt": "2024-01-15T12:00:00.000Z"
}
```

### UPDATE - Update Styler
**URL:** `PUT http://localhost:5000/api/styler/:id`

**Example:** `PUT http://localhost:5000/api/styler/65f1234567890abcdef12380`

**Headers:** None (Public endpoint)

**Sample Request Body:**
```json
{
  "bio": "Updated bio with more experience",
  "ratingAvg": 4.8
}
```

**Response:**
```json
{
  "message": "Styler updated",
  "styler": {
    "_id": "65f1234567890abcdef12380",
    "bio": "Updated bio with more experience",
    "ratingAvg": 4.8,
    "updatedAt": "2024-01-15T13:00:00.000Z"
  }
}
```

### DELETE - Delete Styler
**URL:** `DELETE http://localhost:5000/api/styler/:id`

**Example:** `DELETE http://localhost:5000/api/styler/65f1234567890abcdef12380`

**Headers:** None (Public endpoint)

**Response:**
```json
{
  "message": "Styler deleted",
  "styler": {
    "_id": "65f1234567890abcdef12380",
    "name": "John Styler"
  }
}
```

---

## Partner CRUD Operations

### Base URL: `http://localhost:5000/api/partner`

### CREATE - Add New Partner
**URL:** `POST http://localhost:5000/api/partner`

**Headers:** None (Public endpoint)

**Sample Request Body:**
```json
{
  "name": "Fashion Store Inc",
  "email": "contact@fashionstore.com",
  "phone": "+1-555-0123",
  "location": "New York, USA",
  "partnershipFee": 500.00
}
```

**Response:**
```json
{
  "message": "Partner created",
  "partner": {
    "_id": "65f1234567890abcdef12390",
    "name": "Fashion Store Inc",
    "email": "contact@fashionstore.com",
    "phone": "+1-555-0123",
    "location": "New York, USA",
    "partnershipFee": 500.00,
    "createdAt": "2024-01-15T12:00:00.000Z"
  }
}
```

### READ - Get All Partners
**URL:** `GET http://localhost:5000/api/partner`

**Query Parameters (Optional):**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 50)
- `name`: Search by name

**Example:** `GET http://localhost:5000/api/partner?page=1&limit=10&name=Fashion`

**Headers:** None (Public endpoint)

**Response:**
```json
{
  "total": 3,
  "page": 1,
  "limit": 10,
  "totalPages": 1,
  "data": [
    {
      "_id": "65f1234567890abcdef12390",
      "name": "Fashion Store Inc",
      "email": "contact@fashionstore.com",
      "phone": "+1-555-0123",
      "location": "New York, USA",
      "partnershipFee": 500.00,
      "createdAt": "2024-01-15T12:00:00.000Z"
    }
  ]
}
```

### READ - Get Partner by ID
**URL:** `GET http://localhost:5000/api/partner/:id`

**Example:** `GET http://localhost:5000/api/partner/65f1234567890abcdef12390`

**Headers:** None (Public endpoint)

**Response:**
```json
{
  "_id": "65f1234567890abcdef12390",
  "name": "Fashion Store Inc",
  "email": "contact@fashionstore.com",
  "phone": "+1-555-0123",
  "location": "New York, USA",
  "partnershipFee": 500.00,
  "createdAt": "2024-01-15T12:00:00.000Z"
}
```

### UPDATE - Update Partner
**URL:** `PUT http://localhost:5000/api/partner/:id`

**Example:** `PUT http://localhost:5000/api/partner/65f1234567890abcdef12390`

**Headers:** None (Public endpoint)

**Sample Request Body:**
```json
{
  "phone": "+1-555-9999",
  "partnershipFee": 750.00
}
```

**Response:**
```json
{
  "message": "Partner updated",
  "partner": {
    "_id": "65f1234567890abcdef12390",
    "phone": "+1-555-9999",
    "partnershipFee": 750.00,
    "updatedAt": "2024-01-15T13:00:00.000Z"
  }
}
```

### DELETE - Delete Partner
**URL:** `DELETE http://localhost:5000/api/partner/:id`

**Example:** `DELETE http://localhost:5000/api/partner/65f1234567890abcdef12390`

**Headers:** None (Public endpoint)

**Response:**
```json
{
  "message": "Partner deleted",
  "partner": {
    "_id": "65f1234567890abcdef12390",
    "name": "Fashion Store Inc"
  }
}
```

---

## User CRUD Operations

### Base URL: `http://localhost:5000/api/users`

**All user routes require admin authentication.**

### CREATE - Create User
**URL:** `POST http://localhost:5000/api/users`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Sample Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "role": "styler",
  "isApproved": true
}
```

**Response:**
```json
{
  "message": "User created",
  "user": {
    "_id": "65f1234567890abcdef12400",
    "email": "newuser@example.com",
    "role": "styler",
    "isApproved": true,
    "createdAt": "2024-01-15T12:00:00.000Z"
  }
}
```

### READ - Get All Users
**URL:** `GET http://localhost:5000/api/users`

**Query Parameters (Optional):**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 50)
- `email`: Search by email
- `role`: Filter by role

**Example:** `GET http://localhost:5000/api/users?page=1&limit=10&role=styler`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "total": 10,
  "page": 1,
  "limit": 10,
  "totalPages": 1,
  "data": [
    {
      "_id": "65f1234567890abcdef12400",
      "email": "newuser@example.com",
      "role": "styler",
      "isApproved": true,
      "createdAt": "2024-01-15T12:00:00.000Z"
    }
  ]
}
```

### READ - Get User by ID
**URL:** `GET http://localhost:5000/api/users/:id`

**Example:** `GET http://localhost:5000/api/users/65f1234567890abcdef12400`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "_id": "65f1234567890abcdef12400",
  "email": "newuser@example.com",
  "role": "styler",
  "isApproved": true,
  "createdAt": "2024-01-15T12:00:00.000Z",
  "updatedAt": "2024-01-15T12:00:00.000Z"
}
```

### UPDATE - Update User
**URL:** `PUT http://localhost:5000/api/users/:id`

**Example:** `PUT http://localhost:5000/api/users/65f1234567890abcdef12400`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Sample Request Body:**
```json
{
  "isApproved": true,
  "role": "admin"
}
```

**Response:**
```json
{
  "message": "User updated",
  "user": {
    "_id": "65f1234567890abcdef12400",
    "isApproved": true,
    "role": "admin",
    "updatedAt": "2024-01-15T13:00:00.000Z"
  }
}
```

### DELETE - Delete User
**URL:** `DELETE http://localhost:5000/api/users/:id`

**Example:** `DELETE http://localhost:5000/api/users/65f1234567890abcdef12400`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "message": "User deleted",
  "user": {
    "_id": "65f1234567890abcdef12400",
    "email": "newuser@example.com"
  }
}
```

---

## Admin Operations

### Base URL: `http://localhost:5000/api/admin`

**All admin routes require admin authentication.**

### Get Pending Users
**URL:** `GET http://localhost:5000/api/admin/pending`

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
      "_id": "65f1234567890abcdef12346",
      "email": "partner@example.com",
      "role": "partner",
      "isApproved": false,
      "createdAt": "2024-01-15T11:00:00.000Z"
    }
  ]
}
```

### Approve User
**URL:** `PUT http://localhost:5000/api/admin/approve/:userId`

**Example:** `PUT http://localhost:5000/api/admin/approve/65f1234567890abcdef12346`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "message": "User approved successfully",
  "user": {
    "_id": "65f1234567890abcdef12346",
    "email": "partner@example.com",
    "role": "partner",
    "isApproved": true,
    "updatedAt": "2024-01-15T13:00:00.000Z"
  }
}
```

---

## Authentication Endpoints

### Register
**URL:** `POST http://localhost:5000/api/auth/register`

### Login
**URL:** `POST http://localhost:5000/api/auth/login`

### Get Profile
**URL:** `GET http://localhost:5000/api/auth/profile`

**Headers:**
```
Authorization: Bearer <token>
```

### Logout
**URL:** `POST http://localhost:5000/api/auth/logout`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

---

## Quick Reference: Role-Based Access

| Endpoint | Styler | Partner | Admin | Public |
|----------|--------|---------|-------|--------|
| POST /api/clothes | Yes | Yes | No | No |
| PUT /api/clothes/:id | Yes | Yes | No | No |
| DELETE /api/clothes/:id | Yes | Yes | Yes | No |
| POST /api/occasion | Yes | No | No | No |
| PUT /api/occasion/:id | Yes | No | Yes | No |
| DELETE /api/occasion/:id | Yes | No | Yes | No |
| POST /api/payment | Yes | Yes | No | No |
| GET /api/payment | Yes | Yes | Yes | No |
| PUT /api/payment/:id | Yes | Yes | Yes | No |
| DELETE /api/payment/:id | Yes | Yes | Yes | No |
| GET /api/users | No | No | Yes | No |
| POST /api/users | No | No | Yes | No |
| GET /api/admin/pending | No | No | Yes | No |
| PUT /api/admin/approve/:id | No | No | Yes | No |

---

## Notes

1. **User IDs**: When creating Clothes or Occasions, use your user ID from the login response (`user.id` or `user._id`).

2. **Token Expiration**: Tokens expire after 7 days. Use the logout endpoint to invalidate tokens immediately.

3. **Partner Approval**: Partners must be approved by an admin before they can log in. Stylers are auto-approved.

4. **Clothes Partner Field**: The `partner` field in Clothes should be the User ID (not Partner entity ID).

5. **Occasion UserId Field**: The `userId` field in Occasions should be the User ID of the styler creating it.

6. **Payment Model**: Currently doesn't have a userId field. You may need to add it to the model if you want to track which user made the payment.

---

**Base URL:** `http://localhost:5000`

**All dates should be in ISO 8601 format:** `2024-01-15T12:00:00.000Z`

