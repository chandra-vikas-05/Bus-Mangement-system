# 🔐 Bus Booking System - Admin Credentials

**Created:** December 2, 2025
**Status:** ✅ Active & Verified

---

## 📋 Admin User Details

| Property | Value |
|----------|-------|
| **Name** | Admin User |
| **Email** | `admin@busbooking.com` |
| **Password** | `admin123456` |
| **User ID** | `692e9e469f93d53834db11ad` |
| **Role** | `admin` |
| **Status** | ✅ Active |
| **Created** | 2025-12-02T08:07:34.330Z |

---

## 🔑 Regular User Details (Test Account)

| Property | Value |
|----------|-------|
| **Name** | testuser |
| **Email** | `test@example.com` |
| **Password** | `password123` |
| **User ID** | `692e9de99f93d53834db11a6` |
| **Role** | `user` |
| **Status** | ✅ Active |

---

## 🚀 How to Login

### Admin Login
1. Go to: `http://localhost:3000/login.html`
2. Click **"Login"** (if showing register form)
3. Enter credentials:
   - **Email:** `admin@busbooking.com`
   - **Password:** `admin123456`
4. Click **Login** button
5. ✅ You will be redirected to home page as admin

### Regular User Login
1. Go to: `http://localhost:3000/login.html`
2. Enter credentials:
   - **Email:** `test@example.com`
   - **Password:** `password123`
3. Click **Login** button
4. ✅ You will be redirected to home page as regular user

---

## 👨‍💼 Admin Capabilities

### Admin-Only Features
- ✅ Create buses
- ✅ Update bus information
- ✅ Delete buses
- ✅ Create routes
- ✅ Update routes
- ✅ Delete routes
- ✅ View all bookings
- ✅ Confirm bookings
- ✅ Manage system

### Admin API Endpoints

#### Buses Management
```
POST   /api/buses                 - Create new bus (Admin only)
PUT    /api/buses/:id             - Update bus (Admin only)
DELETE /api/buses/:id             - Delete bus (Admin only)
```

#### Routes Management
```
POST   /api/routes                - Create new route (Admin only)
PUT    /api/routes/:id            - Update route (Admin only)
DELETE /api/routes/:id            - Delete route (Admin only)
```

#### Booking Management
```
GET    /api/bookings              - View all bookings (Admin only)
PUT    /api/bookings/:id/confirm  - Confirm booking (Admin only)
```

---

## 👤 Regular User Capabilities

### User Features
- ✅ Register account
- ✅ Login/Logout
- ✅ Update profile
- ✅ Search buses
- ✅ View bus details
- ✅ Book tickets
- ✅ View my bookings
- ✅ Cancel bookings

### User API Endpoints

#### Authentication
```
GET    /api/auth/me               - Get current user
PUT    /api/auth/profile          - Update profile
```

#### Buses
```
GET    /api/buses                 - List all buses
GET    /api/buses/:id             - Get bus details
```

#### Bookings
```
POST   /api/bookings              - Create booking
GET    /api/bookings/my-bookings  - Get my bookings
GET    /api/bookings/:id          - Get booking details
PUT    /api/bookings/:id/cancel   - Cancel booking
```

---

## 🔑 API Testing with Admin Token

### 1. Login and Get Token
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@busbooking.com",
    "password": "admin123456"
  }'
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "692e9e469f93d53834db11ad",
    "name": "Admin User",
    "email": "admin@busbooking.com",
    "role": "admin"
  }
}
```

### 2. Create a Bus (Admin Only)
```bash
curl -X POST http://localhost:5000/api/buses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "busNumber": "BUS001",
    "busName": "Green Express",
    "totalSeats": 50,
    "busType": "AC",
    "pricePerSeat": 500,
    "route": "ROUTE_ID",
    "departureTime": "08:00 AM",
    "arrivalTime": "02:00 PM",
    "departureDate": "2025-12-20",
    "amenities": ["WiFi", "Food", "AC"]
  }'
```

### 3. View All Bookings (Admin Only)
```bash
curl -X GET http://localhost:5000/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📊 Database Information

### MongoDB Details
- **Host:** localhost
- **Port:** 27017
- **Database:** bus-booking
- **Connection:** ✅ Connected

### Collections
- `users` - User accounts
- `buses` - Bus information
- `routes` - Bus routes
- `bookings` - Booking records

---

## 🧪 Testing Checklist

### Admin Functions to Test
- [ ] Login with admin credentials
- [ ] Create a new bus
- [ ] Update bus information
- [ ] Create a new route
- [ ] View all bookings
- [ ] Confirm bookings
- [ ] Delete a bus
- [ ] Delete a route

### User Functions to Test
- [ ] Login with user credentials
- [ ] Search buses
- [ ] Book a ticket
- [ ] View my bookings
- [ ] Cancel a booking
- [ ] Update profile

---

## 🔒 Security Notes

1. **Passwords are hashed** using bcryptjs (10 salt rounds)
2. **JWT tokens expire** after 7 days
3. **Admin role is required** for admin-only endpoints
4. **All API calls** require proper authorization headers
5. **Emails are unique** - no duplicates allowed

---

## 🛠️ Server Information

| Component | Details |
|-----------|---------|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:5000/api |
| **MongoDB** | mongodb://localhost:27017 |
| **Database** | bus-booking |

---

## 📝 Session Management

### Login Session
```
Token Type: JWT
Expiration: 7 days
Storage: localStorage (browser)
Key: "token"
```

### User Data Storage
```
Current User: localStorage
Key: "currentUser"
Contains: { id, name, email, role }
```

---

## ❌ Error Responses

### Common Errors

| Error | Status | Cause | Solution |
|-------|--------|-------|----------|
| Invalid credentials | 400 | Wrong email/password | Check credentials |
| User already exists | 400 | Email already registered | Use different email |
| Not authorized | 403 | Insufficient permissions | Use admin account |
| Token expired | 401 | JWT token expired | Login again |
| Bus not found | 404 | Invalid bus ID | Check bus ID |

---

## 🔗 Quick Links

- Frontend: http://localhost:3000
- Login Page: http://localhost:3000/login.html
- Home: http://localhost:3000/index.html
- Buses: http://localhost:3000/routes.html
- Profile: http://localhost:3000/profile.html
- API Docs: See backend/README.md

---

## 📞 Support

If you encounter issues:

1. Check browser console (F12)
2. Check backend logs
3. Verify MongoDB connection
4. Restart servers
5. Clear browser cache

---

**✅ All Credentials Verified & Working**
**Ready for Production Testing!**
