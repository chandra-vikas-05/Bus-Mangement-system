# Bus Management API Testing Guide

## Server Status
✅ Backend Server: Running on http://localhost:5000
✅ MongoDB Connection: Connected to localhost
✅ Admin Routes: Protected with JWT authentication

## API Endpoints

### Bus Management (Admin Only)

#### 1. Get All Buses
**Endpoint:** `GET /api/admin/buses`
**Authentication:** Required (Bearer Token)
**Response:** Array of all buses

**cURL Example:**
```bash
curl -X GET http://localhost:5000/api/admin/buses \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

#### 2. Create New Bus
**Endpoint:** `POST /api/admin/buses`
**Authentication:** Required (Bearer Token)
**Content-Type:** application/json

**Request Body:**
```json
{
  "busNumber": "BUS-001",
  "busName": "Express Deluxe",
  "totalSeats": 45,
  "busType": "AC",
  "pricePerSeat": 800,
  "route": "route_id_from_your_database",
  "departureTime": "08:00",
  "arrivalTime": "14:00",
  "departureDate": "2024-12-05",
  "amenities": ["WiFi", "Charging", "Blankets"]
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/admin/buses \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "busNumber": "BUS-001",
    "busName": "Express Deluxe",
    "totalSeats": 45,
    "busType": "AC",
    "pricePerSeat": 800,
    "route": "route_id",
    "departureTime": "08:00",
    "arrivalTime": "14:00",
    "departureDate": "2024-12-05",
    "amenities": ["WiFi"]
  }'
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "Bus created successfully",
  "bus": {
    "_id": "507f1f77bcf86cd799439011",
    "busNumber": "BUS-001",
    "busName": "Express Deluxe",
    "totalSeats": 45,
    "seatsAvailable": 45,
    "busType": "AC",
    "pricePerSeat": 800,
    "route": {
      "_id": "507f1f77bcf86cd799439010",
      "source": "Delhi",
      "destination": "Jaipur",
      "distance": 240,
      "duration": 300
    },
    "departureTime": "08:00",
    "arrivalTime": "14:00",
    "departureDate": "2024-12-05T00:00:00.000Z",
    "amenities": ["WiFi"],
    "isActive": true,
    "createdAt": "2024-12-02T10:00:00.000Z",
    "updatedAt": "2024-12-02T10:00:00.000Z"
  }
}
```

#### 3. Update Bus
**Endpoint:** `PUT /api/admin/buses/:id`
**Authentication:** Required (Bearer Token)
**Content-Type:** application/json

**Request Body (all fields optional):**
```json
{
  "busName": "Express Deluxe Plus",
  "totalSeats": 50,
  "busType": "Non-AC",
  "pricePerSeat": 650,
  "departureTime": "09:00",
  "arrivalTime": "15:00",
  "amenities": ["WiFi", "Charging", "Snacks"],
  "isActive": true
}
```

**cURL Example:**
```bash
curl -X PUT http://localhost:5000/api/admin/buses/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "busName": "Express Deluxe Plus",
    "pricePerSeat": 750
  }'
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Bus updated successfully",
  "bus": {
    "_id": "507f1f77bcf86cd799439011",
    "busNumber": "BUS-001",
    "busName": "Express Deluxe Plus",
    "totalSeats": 45,
    "seatsAvailable": 45,
    "busType": "AC",
    "pricePerSeat": 750,
    "route": { "...route details..." },
    "departureTime": "08:00",
    "arrivalTime": "14:00",
    "departureDate": "2024-12-05T00:00:00.000Z",
    "amenities": ["WiFi"],
    "isActive": true,
    "createdAt": "2024-12-02T10:00:00.000Z",
    "updatedAt": "2024-12-02T10:00:10.000Z"
  }
}
```

#### 4. Delete Bus
**Endpoint:** `DELETE /api/admin/buses/:id`
**Authentication:** Required (Bearer Token)

**cURL Example:**
```bash
curl -X DELETE http://localhost:5000/api/admin/buses/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Bus deleted successfully"
}
```

## Error Responses

### 400 Bad Request - Missing Fields
```json
{
  "success": false,
  "message": "Missing required fields: busNumber, totalSeats, busType, pricePerSeat, route"
}
```

### 400 Bad Request - Duplicate Bus Number
```json
{
  "success": false,
  "message": "Bus with this number already exists"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Bus not found"
}
```

### 401 Unauthorized
```json
{
  "message": "No token provided"
}
```

### 403 Forbidden
```json
{
  "message": "Unauthorized"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Error details"
}
```

## Getting Your Admin Token

1. **Register Admin Account**
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Admin User",
       "email": "admin@example.com",
       "password": "password123",
       "phone": "9999999999",
       "role": "admin"
     }'
   ```

2. **Login to Get Token**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@example.com",
       "password": "password123"
     }'
   ```

3. **Response with Token**
   ```json
   {
     "success": true,
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": {
       "_id": "...",
       "name": "Admin User",
       "email": "admin@example.com",
       "role": "admin"
     }
   }
   ```

## Testing Steps

### Step 1: Get Routes First
You need a route to create a bus. If no routes exist:

```bash
curl -X POST http://localhost:5000/api/admin/routes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "routeName": "Delhi-Jaipur",
    "source": "Delhi",
    "destination": "Jaipur",
    "distance": 240,
    "duration": 300
  }'
```

### Step 2: Create a Bus
Use the route ID from the response above:

```bash
curl -X POST http://localhost:5000/api/admin/buses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "busNumber": "DLJ-001",
    "busName": "Rajasthan Express",
    "totalSeats": 42,
    "busType": "AC",
    "pricePerSeat": 750,
    "route": "PASTE_ROUTE_ID_HERE",
    "departureTime": "08:00",
    "arrivalTime": "14:00",
    "departureDate": "2024-12-05"
  }'
```

### Step 3: List All Buses
```bash
curl -X GET http://localhost:5000/api/admin/buses \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 4: Update a Bus
```bash
curl -X PUT http://localhost:5000/api/admin/buses/PASTE_BUS_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pricePerSeat": 800,
    "amenities": ["WiFi", "Charging"]
  }'
```

### Step 5: Delete a Bus
```bash
curl -X DELETE http://localhost:5000/api/admin/buses/PASTE_BUS_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Using the Admin Panel UI

1. **Open Admin Page**
   - Go to: http://localhost:3000/admin.html (or your frontend URL)

2. **Login as Admin**
   - Email: admin@example.com
   - Password: password123

3. **Navigate to Buses Tab**
   - Click on the "Manage Buses" tab

4. **Create a Bus**
   - Fill in: Bus Name, Total Seats, Bus Type, Fare
   - Click "Add Bus"

5. **Edit a Bus**
   - Click "Edit" button on any bus
   - Modify details in the modal
   - Click "Save Changes"

6. **Delete a Bus**
   - Click "Delete" button
   - Confirm deletion

## Common Issues & Solutions

### Issue: "Bus with this number already exists"
**Solution:** Use a unique bus number (e.g., BUS-001, BUS-002, etc.)

### Issue: "Missing required fields"
**Solution:** Ensure all required fields are provided:
- busNumber, busName, totalSeats, busType, pricePerSeat, route

### Issue: "No token provided" (401)
**Solution:** Make sure to include the Authorization header with your token

### Issue: "Unauthorized" (403)
**Solution:** Verify you're logged in as an admin user

### Issue: "Bus not found" (404)
**Solution:** Check that the bus ID exists and is correctly formatted

## Database Verification

To verify buses in MongoDB:

```javascript
// Connect to MongoDB
use bus_booking_db

// View all buses
db.buses.find()

// View specific bus
db.buses.findOne({ busNumber: "BUS-001" })

// Count buses
db.buses.countDocuments()

// Delete test data
db.buses.deleteMany({ busNumber: "TEST-001" })
```

## Performance Tips

- Always use unique bus numbers for easy tracking
- Keep bus names descriptive (e.g., "Delhi Express - Morning Service")
- Update prices in bulk using the update endpoint
- Archive old buses by setting isActive to false instead of deleting
- Monitor seat availability updates after bookings

---

**Server Status:** ✅ Running on port 5000
**Database:** ✅ Connected to MongoDB
**Admin Routes:** ✅ Fully functional
**Frontend:** ✅ Ready for testing
