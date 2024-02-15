const mongoose = require('mongoose');

const activitySchema = mongoose.Schema({
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
    }
},{timestamps:true});

module.exports = Activity = mongoose.model('Activity',activitySchema);