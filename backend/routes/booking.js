const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getUserBookings,
  getBookingById,
  createBooking,
  cancelBooking,
  confirmBooking,
  getAllBookings
} = require('../controllers/bookingController');

// User routes (protected)
router.get('/my-bookings', authenticate, getUserBookings);
router.post('/', authenticate, createBooking);
router.put('/:id/cancel', authenticate, cancelBooking);
router.get('/:id', authenticate, getBookingById);

// Admin routes
router.get('/', authenticate, authorize('admin'), getAllBookings);
router.put('/:id/confirm', authenticate, authorize('admin'), confirmBooking);

module.exports = router;
