const mongoose = require('mongoose');

const trackingSchema = mongoose.Schema(
    {
        instructorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref:'Instructor'
        },
        activities: [
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Activity',
            },
          ],
    },
    {timestamps:true}
);
  
 module.exports = Tracking = mongoose.model('Tracking', trackingSchema);