const mongoose = require('mongoose');

const GuestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true
  },
  table: {
    type: Number,
    required: true
  },
  attended: {
    type: Boolean,
    default: false
  },
  checkInTime: {
    type: Date
  }
});

module.exports = mongoose.model('Guest', GuestSchema);