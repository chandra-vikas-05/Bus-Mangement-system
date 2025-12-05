const User = require('../models/User');
const Bus = require('../models/Bus');
const Booking = require('../models/Booking');
const Route = require('../models/Route');

// --- DASHBOARD STATS ---
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalBuses = await Bus.countDocuments();
    const totalRoutes = await Route.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalRevenue = await Booking.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalAdmins,
        totalBuses,
        totalRoutes,
        totalBookings,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- USER MANAGEMENT ---
// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user (admin can update any user)
exports.updateUser = async (req, res) => {
  try {
    const { name, email, phone, address, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, address, role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- BUS MANAGEMENT ---
// Get all buses (admin view)
exports.getAllBusesAdmin = async (req, res) => {
  try {
    const buses = await Bus.find().populate('route');
    res.status(200).json({
      success: true,
      count: buses.length,
      buses
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Create bus (Admin)
exports.createBus = async (req, res) => {
  try {
    // Accept both standard and legacy field names
    const {
      route,
      busNumber,
      busName,
      capacity,
      totalSeats,
      busType,
      pricePerSeat,
      price,
      departureTime,
      arrivalTime,
      departureDate,
      amenities
    } = req.body;

    // Normalize and validate
    const finalBusNumber = busNumber || busName;
    const finalBusName = busName || busNumber || 'Bus';
    const finalTotalSeats = totalSeats || capacity;
    const finalPrice = pricePerSeat || price;

    if (!finalBusNumber || !finalTotalSeats || !busType || !finalPrice || !route) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields: busNumber, totalSeats, busType, pricePerSeat, route' 
      });
    }

    // Check for duplicate bus number
    const existingBus = await Bus.findOne({ busNumber: finalBusNumber });
    if (existingBus) {
      return res.status(400).json({ 
        success: false,
        message: 'Bus with this number already exists' 
      });
    }

    const bus = new Bus({
      busNumber: finalBusNumber,
      busName: finalBusName,
      totalSeats: finalTotalSeats,
      seatsAvailable: finalTotalSeats,
      busType,
      pricePerSeat: finalPrice,
      route,
      departureTime: departureTime || '08:00',
      arrivalTime: arrivalTime || '14:00',
      departureDate: departureDate || new Date(),
      amenities: amenities || [],
      isActive: true
    });

    await bus.save();
    await bus.populate('route');

    res.status(201).json({
      success: true,
      message: 'Bus created successfully',
      bus
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Update bus (Admin)
exports.updateBus = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    
    if (!bus) {
      return res.status(404).json({ 
        success: false,
        message: 'Bus not found' 
      });
    }

    // Normalize incoming fields
    const {
      busName,
      capacity,
      totalSeats,
      busType,
      pricePerSeat,
      price,
      departureTime,
      arrivalTime,
      amenities,
      isActive
    } = req.body;

    if (busName) bus.busName = busName;
    if (typeof totalSeats !== 'undefined') {
      bus.totalSeats = totalSeats;
      bus.seatsAvailable = totalSeats; // Reset available seats when total changes
    } else if (typeof capacity !== 'undefined') {
      bus.totalSeats = capacity;
      bus.seatsAvailable = capacity;
    }
    if (busType) bus.busType = busType;
    if (pricePerSeat) bus.pricePerSeat = pricePerSeat;
    else if (price) bus.pricePerSeat = price;
    if (departureTime) bus.departureTime = departureTime;
    if (arrivalTime) bus.arrivalTime = arrivalTime;
    if (amenities) bus.amenities = amenities;
    if (typeof isActive !== 'undefined') bus.isActive = isActive;

    await bus.save();
    await bus.populate('route');

    res.status(200).json({
      success: true,
      message: 'Bus updated successfully',
      bus
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Delete bus (Admin)
exports.deleteBus = async (req, res) => {
  try {
    const bus = await Bus.findByIdAndDelete(req.params.id);
    
    if (!bus) {
      return res.status(404).json({ 
        success: false,
        message: 'Bus not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bus deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// --- ROUTE MANAGEMENT ---
// Get all routes
exports.getAllRoutes = async (req, res) => {
  try {
    const routes = await Route.find();
    res.status(200).json({
      success: true,
      count: routes.length,
      routes
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create route
exports.createRoute = async (req, res) => {
  try {
    // Accept both new (`routeName`, `duration`) and legacy (`estimatedTime`) fields.
    const {
      routeName,
      source,
      destination,
      distance,
      duration,
      estimatedTime,
      description
    } = req.body;

    // Normalize/derive values
    const finalRouteName = routeName || (source && destination ? `${source} - ${destination}` : undefined);
    const finalDuration = typeof duration !== 'undefined' ? duration : estimatedTime;

    const route = new Route({
      routeName: finalRouteName,
      source,
      destination,
      distance,
      duration: finalDuration,
      description
    });

    await route.save();

    res.status(201).json({
      success: true,
      message: 'Route created successfully',
      route
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update route
exports.updateRoute = async (req, res) => {
  try {
    const route = await Route.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Route updated successfully',
      route
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete route
exports.deleteRoute = async (req, res) => {
  try {
    const route = await Route.findByIdAndDelete(req.params.id);
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Route deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- BOOKING MANAGEMENT ---
// Get all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('user').populate('bus');
    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('user').populate('bus');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('user').populate('bus');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      booking
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    ).populate('user').populate('bus');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- REPORTS ---
// Get revenue report
exports.getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let filter = { status: 'completed' };

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const report = await Booking.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalBookings: { $sum: 1 },
          averageAmount: { $avg: '$amount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      report: report[0] || { totalRevenue: 0, totalBookings: 0, averageAmount: 0 }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user statistics
exports.getUserStatistics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const newUsersThisMonth = await User.countDocuments({
      role: 'user',
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    });

    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        newUsersThisMonth,
        byRole: usersByRole
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get bus statistics
exports.getBusStatistics = async (req, res) => {
  try {
    const totalBuses = await Bus.countDocuments();
    const activeBuses = await Bus.countDocuments({ isActive: true });
    const inactiveBuses = await Bus.countDocuments({ isActive: false });

    const busesByType = await Bus.aggregate([
      { $group: { _id: '$busType', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalBuses,
        activeBuses,
        inactiveBuses,
        byType: busesByType
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
