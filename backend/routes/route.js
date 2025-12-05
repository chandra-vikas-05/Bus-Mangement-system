const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute
} = require('../controllers/routeController');

// Public routes
router.get('/', getAllRoutes);
router.get('/:id', getRouteById);

// Admin routes
router.post('/', authenticate, authorize('admin'), createRoute);
router.put('/:id', authenticate, authorize('admin'), updateRoute);
router.delete('/:id', authenticate, authorize('admin'), deleteRoute);

module.exports = router;
