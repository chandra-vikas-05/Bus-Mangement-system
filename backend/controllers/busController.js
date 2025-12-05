const Bus = require('../models/Bus');

// Get all buses with filters
exports.getAllBuses = async (req, res) => {
  try {
    const { source, destination, date, busType } = req.query;
    let filter = { isActive: true };

    if (source || destination) {
      const Route = require('../models/Route');
      const routeFilter = {};
      if (source) routeFilter.source = { $regex: source, $options: 'i' };
      if (destination) routeFilter.destination = { $regex: destination, $options: 'i' };
      
      const routes = await Route.find(routeFilter);
      const routeIds = routes.map(r => r._id);
      filter.route = { $in: routeIds };
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.departureDate = { $gte: startDate, $lt: endDate };
    }

    if (busType) {
      filter.busType = busType;
    }

    const buses = await Bus.find(filter).populate('route');
    res.status(200).json({
      success: true,
      count: buses.length,
      buses
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single bus by ID
exports.getBusById = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id).populate('route');
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }
    res.status(200).json({
      success: true,
      bus
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create bus (Admin only)
exports.createBus = async (req, res) => {
  try {
    const { 
      busNumber, 
      busName, 
      totalSeats, 
      busType, 
      pricePerSeat, 
      route, 
      departureTime, 
      arrivalTime, 
      departureDate, 
      amenities 
    } = req.body;

    // Validate required input
    if (!busNumber || !busName || !totalSeats || !busType || !pricePerSeat || !route) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide all required fields: busNumber, busName, totalSeats, busType, pricePerSeat, route' 
      });
    }

    // Check if bus already exists
    let existingBus = await Bus.findOne({ busNumber });
    if (existingBus) {
      return res.status(400).json({ 
        success: false,
        message: 'Bus with this number already exists' 
      });
    }

    const bus = new Bus({
      busNumber,
      busName,
      totalSeats,
      seatsAvailable: totalSeats,
      busType,
      pricePerSeat,
      route,
      departureTime,
      arrivalTime,
      departureDate,
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

// Update bus (Admin only)
exports.updateBus = async (req, res) => {
  try {
    const busId = req.params.id;
    let bus = await Bus.findById(busId);
    
    if (!bus) {
      return res.status(404).json({ 
        success: false,
        message: 'Bus not found' 
      });
    }

    const { 
      busName, 
      totalSeats, 
      seatsAvailable,
      pricePerSeat, 
      departureTime, 
      arrivalTime, 
      amenities, 
      isActive 
    } = req.body;

    // Update fields if provided
    if (busName) bus.busName = busName;
    if (typeof totalSeats !== 'undefined') {
      bus.totalSeats = totalSeats;
      // If seatsAvailable not provided, update it too
      if (typeof seatsAvailable === 'undefined') {
        bus.seatsAvailable = totalSeats;
      }
    }
    if (typeof seatsAvailable !== 'undefined') bus.seatsAvailable = seatsAvailable;
    if (pricePerSeat) bus.pricePerSeat = pricePerSeat;
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

// Delete bus (Admin only)
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
