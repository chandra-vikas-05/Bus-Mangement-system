# Bus Booking System - Full Stack Application

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Port 3000)                      │
│  - HTML5 Pages (Login, Home, Routes, Booking, Profile)      │
│  - JavaScript (Auth, Booking, Main Logic)                   │
│  - CSS Styling                                              │
└────────────────────────────┬────────────────────────────────┘
                             │
                    HTTP/REST API Calls
                             │
┌────────────────────────────▼────────────────────────────────┐
│               Backend Express Server (Port 5001)             │
│  - Authentication Routes (/api/auth)                        │
│  - Bus Routes (/api/buses)                                  │
│  - Booking Routes (/api/bookings)                           │
│  - Route Management (/api/routes)                           │
└────────────────────────────┬────────────────────────────────┘
                             │
                        Mongoose ODM
                             │
┌────────────────────────────▼────────────────────────────────┐
│              MongoDB Database (Port 27017)                   │
│  - Users Collection                                          │
│  - Buses Collection                                          │
│  - Bookings Collection                                       │
│  - Routes Collection                                         │
└─────────────────────────────────────────────────────────────┘
```

## Running the Application

### Prerequisites
- Node.js installed
- MongoDB running locally on port 27017

### Step 1: Start Backend Server
```bash
cd backend
npm install
npm run dev
```
Backend will run on `http://localhost:5001`

### Step 2: Start Frontend Server
```bash
cd ..
node server.js
```
Frontend will run on `http://localhost:3000`

### Step 3: Access the Application
Open your browser and navigate to: `http://localhost:3000`

## Features

### Authentication
- User Registration with email validation
- Secure login with JWT tokens
- Profile management
- Token-based authentication for all protected routes

### Bus Management
- Search buses by source, destination, and date
- View bus details (type, seats, amenities, pricing)
- Real-time seat availability

### Booking System
- Book bus tickets with seat selection
- Generate unique booking IDs
- View booking history
- Cancel bookings with automatic refunds
- Track payment status

### User Profile
- View personal information
- See all bookings
- Manage bookings (view, cancel)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)
- `PUT /api/auth/profile` - Update profile (Protected)

### Buses
- `GET /api/buses` - List all buses with filters
- `GET /api/buses/:id` - Get bus details
- `POST /api/buses` - Create bus (Admin only)
- `PUT /api/buses/:id` - Update bus (Admin only)
- `DELETE /api/buses/:id` - Delete bus (Admin only)

### Bookings
- `POST /api/bookings` - Create booking (Protected)
- `GET /api/bookings/my-bookings` - Get user bookings (Protected)
- `GET /api/bookings/:id` - Get booking details (Protected)
- `PUT /api/bookings/:id/cancel` - Cancel booking (Protected)
- `GET /api/bookings` - Get all bookings (Admin only)
- `PUT /api/bookings/:id/confirm` - Confirm booking (Admin only)

### Routes
- `GET /api/routes` - List all routes
- `GET /api/routes/:id` - Get route details
- `POST /api/routes` - Create route (Admin only)
- `PUT /api/routes/:id` - Update route (Admin only)
- `DELETE /api/routes/:id` - Delete route (Admin only)

## File Structure

```
bus-booking/
├── backend/                 # Express backend
│   ├── config/             # Database config
│   ├── controllers/        # Business logic
│   ├── middleware/         # Auth middleware
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── server.js           # Main server file
│   ├── package.json        # Dependencies
│   └── .env                # Environment variables
├── js/                     # Frontend JavaScript
│   ├── api.js             # API utility functions
│   ├── auth.js            # Authentication logic
│   ├── booking.js         # Booking logic
│   └── main.js            # Main frontend logic
├── css/                    # Stylesheets
├── images/                 # Images directory
├── login.html             # Login page
├── index.html             # Home page
├── routes.html            # Bus routes page
├── booking.html           # Booking page
├── profile.html           # User profile page
├── contact.html           # Contact page
└── server.js              # Frontend server
```

## Testing the Application

### Test Flow
1. Go to `http://127.0.0.1:5500/`
2. Click "Register here" to create account
3. Fill in details and register
4. Login with your credentials
5. Search for buses (source, destination, date)
6. View available buses
7. Click "Book Now" to book a bus
8. Enter number of passengers and seat numbers
9. Confirm payment
10. View your booking in profile

## Troubleshooting

### Port Already in Use
If port 3000 or 5001 is in use:
```bash
# Find and kill the process
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### MongoDB Connection Error
Ensure MongoDB is running:
```bash
# Check if MongoDB is running
mongosh
```

### CORS Errors
The backend already has CORS enabled. If you still get CORS errors:
- Check that both frontend and backend servers are running
- Verify the API_BASE_URL in `js/api.js` is correct

### 404 Errors
- Ensure all files exist in the correct directories
- Check the frontend server console for file paths
- Verify file names are case-sensitive

## Development Notes

- JWT tokens expire after 7 days
- Default admin credentials need to be created via database
- All passwords are hashed with bcryptjs (salt rounds: 10)
- MongoDB URI: `mongodb://localhost:27017/bus-booking`

## Future Enhancements

- Payment gateway integration (Stripe, PayPal)
- Email notifications
- SMS notifications
- Admin dashboard
- Real-time seat selection UI
- Multi-language support
- Mobile app
