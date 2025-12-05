const Booking = require('../models/Booking');
const Bus = require('../models/Bus');

// Get all bookings for user
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('bus')
      .populate('route')
      .sort({ bookingDate: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single booking
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user')
      .populate('bus')
      .populate('route');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns this booking or is admin
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create booking
exports.createBooking = async (req, res) => {
  try {
    const { busId, passengers, seatNumbers } = req.body;

    if (!busId || !passengers || !seatNumbers) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Find bus
    const bus = await Bus.findById(busId).populate('route');
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    // Check seats availability
    if (seatNumbers.length !== passengers || passengers > bus.seatsAvailable) {
      return res.status(400).json({ message: 'Selected seats are not available' });
    }

    // Calculate total price
    const totalPrice = passengers * bus.pricePerSeat;

    // Create booking
    const booking = new Booking({
      user: req.user.id,
      bus: busId,
      route: bus.route._id,
      passengers,
      seatNumbers,
      totalPrice,
      travelDate: bus.departureDate
    });

    await booking.save();

    // Update bus seats
    bus.seatsAvailable -= passengers;
    await bus.save();

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    let booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check ownership
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    // Update booking status
    booking.status = 'Cancelled';
    booking.paymentStatus = 'Refunded';
    await booking.save();

    // Release seats back to bus
    const bus = await Bus.findById(booking.bus);
    bus.seatsAvailable += booking.passengers;
    await bus.save();

    res.status(200).json({
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Confirm booking (Admin only)
exports.confirmBooking = async (req, res) => {
  try {
    let booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = 'Confirmed';
    await booking.save();

    res.status(200).json({
      message: 'Booking confirmed successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all bookings (Admin only)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user')
      .populate('bus')
      .populate('route')
      .sort({ bookingDate: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
