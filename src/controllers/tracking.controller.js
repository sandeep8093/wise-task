const Tracking = require("../models/Tracking");
const Instructor = require("../models/Instructor");
const Activity = require("../models/Activity");

exports.checkIn = async (req, res) => {
  try {
    const { checkIn } = req.body;
    const instructorId = req.user.id;

    const instructor = await Instructor.findOne({ _id: instructorId });
    if (!instructor) {
      return res.status(404).send("Instructor not found");
    }

    const tracking = await Tracking.findOne({ instructorId: instructor._id }).populate('activities');
    if (!tracking) {
      const newTracking = new Tracking({
        instructorId: instructor._id,
        activities: [new Activity({ checkIn: new Date(checkIn) })],
      });
      await newTracking.save();
      res.status(200).send("Check-in recorded successfully");
    } else {
      // Check for overlapping slots
      const overlappingActivity = tracking.activities.find((activity) => {
        const existingCheckIn = activity.checkIn;
        const existingCheckOut = activity.checkOut || new Date();
        const newCheckIn = new Date(checkIn);
        
        // Allowing for the same check-in time in multiple slots
        const overlapCondition = newCheckIn >= existingCheckIn && newCheckIn < existingCheckOut;

        // Checking if there is an existing check-in without a checkout on the same day
        const existingCheckInSameDay = existingCheckIn && existingCheckIn.toISOString().split("T")[0] === newCheckIn.toISOString().split("T")[0] && !activity.checkOut;

        return overlapCondition || existingCheckInSameDay;
      });

      if (overlappingActivity) {
        return res
          .status(400)
          .json({ error: "Overlap with existing slot or existing check-in without checkout on the same day" });
      }

      // Adding a new check-in activity to the existing tracking record
      const newActivity = new Activity({ checkIn: new Date(checkIn) });
      tracking.activities.push(newActivity);

      await Promise.all([tracking.save(), newActivity.save()]);
      return res.status(200).send("Check-in recorded successfully");
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};


// API controller to add check-out time
exports.checkOut = async (req, res) => {
  try {
    const { checkOut } = req.body;
    const instructorId = req.user.id;

    const instructor = await Instructor.findOne({ _id: instructorId });

    if (!instructor) {
      return res.status(404).send("Instructor not found");
    }

    const tracking = await Tracking.findOne({ instructorId: instructor._id });

    if (!tracking) {
      return res
        .status(400)
        .send("No matching check-in found for this instructor");
    }

    // Get the latest check-in activity
    const latestActivity = tracking.activities[tracking.activities.length - 1];
    

    // Update check-out time in the latest Activity
    const latestAct = await Activity.findById(latestActivity._id);
    if (latestAct) {
      if (latestAct.checkOut) {
        return res.status(400).send("Check-out already recorded for this activity");
      }
  
      const newCheckOut = new Date(checkOut);
      const checkInTime = latestAct.checkIn;
      
      // Check if check-out time is greater than check-in time
      if (newCheckOut <= checkInTime) {
        return res.status(400).send("Check-out time must be greater than check-in time");
      }
      latestAct.checkOut = newCheckOut;
      await Promise.all([latestAct.save(), tracking.save()]);
      res.status(200).send("Check-out recorded successfully");
    } else {
      return res.status(500).json({ error: "Error updating check-out time" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};


// API controller for aggregated monthly report
exports.monthlyReport = async (req, res) => {
  try {
    const { year, month } = req.query;
    const instructorId = req.query.id || req.user.id;
    
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const tracking = await Tracking.findOne({
      instructorId: instructorId,
    }).populate({
      path: "activities",
      match: {
        checkIn: { $gte: startOfMonth, $lte: endOfMonth },
      },
    });

    if (!tracking) {
      return res
        .status(404)
        .json({ message: "No tracking data found for this month" });
    }

    const totalCheckInTimeInMilliseconds = tracking.activities.reduce(
      (total, activity) => {
        const checkIn = new Date(activity.checkIn);
        const checkOut = activity.checkOut
          ? new Date(activity.checkOut)
          : new Date();
        const activityTime = checkOut - checkIn;
        return total + activityTime;
      },
      0
    );

    const totalCheckInTimeInHours = totalCheckInTimeInMilliseconds / 3600000;

    const totalActivities = tracking.activities.length;

    const averageTimePerActivity =
      tracking.activities.length > 0
        ? totalCheckInTimeInHours / tracking.activities.length + "hrs"
        : 0;

    const activities = tracking.activities.map((activity) => ({
      checkIn: activity.checkIn,
      checkOut: activity.checkOut,
      activityTime: activity.checkOut
        ? (new Date(activity.checkOut) - new Date(activity.checkIn)) / 3600000 +
          "hrs"
        : "Not checked out yet",
    }));

    const reportData = {
      totalCheckInTime: totalCheckInTimeInHours + "hrs",
      totalActivities: totalActivities,
      averageTimePerActivity: averageTimePerActivity,
      activities: activities,
    };

    return res.status(200).json({ data: reportData });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
