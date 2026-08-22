const express = require("express");
const {
  createTrip,
  getMyTrips,
  getTripById,
  updateTrip,
  deleteTrip,
} = require("../controllers/trip.controller");
const itineraryRoutes = require("./itinerary.routes");
const expenseRoutes = require("./expense.routes");
const { getTripBudget } = require("../controllers/expense.controller");
const { protect } = require("../middleware/auth");

const router = express.Router();

// All trip routes require authentication
router.use(protect);

// Mount nested itinerary stop routes
router.use("/:tripId/stops", itineraryRoutes);

// Mount nested expense and budget routes
router.use("/:tripId/expenses", expenseRoutes);
router.get("/:tripId/budget", getTripBudget);

router.route("/")
  .post(createTrip)
  .get(getMyTrips);

router.route("/:id")
  .get(getTripById)
  .put(updateTrip)
  .delete(deleteTrip);

module.exports = router;


