const express = require("express");
const healthRoutes = require("./health.routes");
const authRoutes = require("./auth.routes");
const tripRoutes = require("./trip.routes");
const cityRoutes = require("./city.routes");
const activityRoutes = require("./activity.routes");

const router = express.Router();

// Mount API v1 sub-routes
router.use("/", healthRoutes);
router.use("/auth", authRoutes);
router.use("/trips", tripRoutes);
router.use("/cities", cityRoutes);
router.use("/activities", activityRoutes);

module.exports = router;



