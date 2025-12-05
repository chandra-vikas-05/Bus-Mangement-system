const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  // Dashboard
  getDashboardStats,
  // User Management
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  // Bus Management
  getAllBusesAdmin,
  createBus,
  updateBus,
  deleteBus,
  // Route Management
  getAllRoutes,
  createRoute,
  updateRoute,
  deleteRoute,
  // Booking Management
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  // Reports
  getRevenueReport,
  getUserStatistics,
  getBusStatistics
} = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(authenticate, authorize('admin'));

// --- DASHBOARD ---
router.get('/dashboard/stats', getDashboardStats);

// --- USER MANAGEMENT ---
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// --- BUS MANAGEMENT ---
router.get('/buses', getAllBusesAdmin);
router.post('/buses', createBus);
router.put('/buses/:id', updateBus);
router.delete('/buses/:id', deleteBus);

// --- ROUTE MANAGEMENT ---
router.get('/routes', getAllRoutes);
router.post('/routes', createRoute);
router.put('/routes/:id', updateRoute);
router.delete('/routes/:id', deleteRoute);

// --- BOOKING MANAGEMENT ---
router.get('/bookings', getAllBookings);
router.get('/bookings/:id', getBookingById);
router.put('/bookings/:id/status', updateBookingStatus);
router.put('/bookings/:id/cancel', cancelBooking);

// --- REPORTS ---
router.get('/reports/revenue', getRevenueReport);
router.get('/reports/users', getUserStatistics);
router.get('/reports/buses', getBusStatistics);

module.exports = router;
