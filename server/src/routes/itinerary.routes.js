const express = require("express");
const {
  addStop,
  getStops,
  reorderStops,
  updateStop,
  deleteStop,
  addActivityToStop,
  getStopActivities,
  updateStopActivity,
  deleteStopActivity,
} = require("../controllers/itinerary.controller");
const { protect } = require("../middleware/auth");

const router = express.Router({ mergeParams: true });

router.use(protect);

// Stop Routes
router.route("/")
  .post(addStop)
  .get(getStops);

// Reorder MUST be defined before /:stopId route
router.put("/reorder", reorderStops);

router.route("/:stopId")
  .put(updateStop)
  .delete(deleteStop);

// Stop Activity Routes
router.route("/:stopId/activities")
  .post(addActivityToStop)
  .get(getStopActivities);

router.route("/:stopId/activities/:activityId")
  .put(updateStopActivity)
  .delete(deleteStopActivity);

module.exports = router;
