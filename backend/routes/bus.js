const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getAllBuses,
  getBusById,
  createBus,
  updateBus,
  deleteBus
} = require('../controllers/busController');

// Public routes
router.get('/', getAllBuses);
router.get('/:id', getBusById);

// Admin routes
router.post('/', authenticate, authorize('admin'), createBus);
router.put('/:id', authenticate, authorize('admin'), updateBus);
router.delete('/:id', authenticate, authorize('admin'), deleteBus);

module.exports = router;
