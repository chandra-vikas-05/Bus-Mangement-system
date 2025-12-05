const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  busNumber: {
    type: String,
    required: [true, 'Please provide bus number'],
    unique: true,
    trim: true
  },
  busName: {
    type: String,
    required: [true, 'Please provide bus name'],
    trim: true
  },
  totalSeats: {
    type: Number,
    required: [true, 'Please provide total seats'],
    min: 1,
    max: 100
  },
  seatsAvailable: {
    type: Number,
    required: true
  },
  busType: {
    type: String,
    enum: ['AC', 'Non-AC', 'Sleeper', 'Semi-Sleeper', 'Luxury'],
    required: [true, 'Please provide bus type']
  },
  pricePerSeat: {
    type: Number,
    required: [true, 'Please provide price per seat'],
    min: 0
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: [true, 'Please provide route']
  },
  departureTime: {
    type: String,
    required: [true, 'Please provide departure time']
  },
  arrivalTime: {
    type: String,
    required: [true, 'Please provide arrival time']
  },
  departureDate: {
    type: Date,
    required: [true, 'Please provide departure date']
  },
  amenities: {
    type: [String],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
busSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Bus', busSchema);
