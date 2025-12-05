const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  routeName: {
    type: String,
    required: [true, 'Please provide route name'],
    trim: true
  },
  source: {
    type: String,
    required: [true, 'Please provide source city'],
    trim: true
  },
  destination: {
    type: String,
    required: [true, 'Please provide destination city'],
    trim: true
  },
  distance: {
    type: Number,
    required: [true, 'Please provide distance in km']
  },
  duration: {
    type: Number,
    required: [true, 'Please provide duration in minutes']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Route', routeSchema);
