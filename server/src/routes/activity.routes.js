const express = require("express");
const {
  getActivities,
  getActivityById,
} = require("../controllers/activity.controller");

const router = express.Router();

router.get("/", getActivities);
router.get("/:id", getActivityById);

module.exports = router;
