const Route = require('../models/Route');

// Get all routes
exports.getAllRoutes = async (req, res) => {
  try {
    const { source, destination } = req.query;
    let filter = {};

    if (source) {
      filter.source = { $regex: source, $options: 'i' };
    }
    if (destination) {
      filter.destination = { $regex: destination, $options: 'i' };
    }

    const routes = await Route.find(filter);
    res.status(200).json({
      success: true,
      count: routes.length,
      routes
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single route
exports.getRouteById = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }
    res.status(200).json({
      success: true,
      route
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create route (Admin only)
exports.createRoute = async (req, res) => {
  try {
    const { routeName, source, destination, distance, duration } = req.body;

    if (!routeName || !source || !destination || !distance || !duration) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    let route = new Route({
      routeName,
      source,
      destination,
      distance,
      duration
    });

    await route.save();

    res.status(201).json({
      message: 'Route created successfully',
      route
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update route (Admin only)
exports.updateRoute = async (req, res) => {
  try {
    let route = await Route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }

    const { routeName, distance, duration } = req.body;

    if (routeName) route.routeName = routeName;
    if (distance) route.distance = distance;
    if (duration) route.duration = duration;

    await route.save();

    res.status(200).json({
      message: 'Route updated successfully',
      route
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete route (Admin only)
exports.deleteRoute = async (req, res) => {
  try {
    const route = await Route.findByIdAndDelete(req.params.id);
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }

    res.status(200).json({
      message: 'Route deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
