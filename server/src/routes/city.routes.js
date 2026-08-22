const express = require("express");
const {
  getCities,
  getCityById,
  searchCities,
  selectExternalCity,
  createCustomCity,
} = require("../controllers/city.controller");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/search", searchCities);
router.post("/select-external", selectExternalCity);
router.post("/custom", protect, createCustomCity);

router.get("/", getCities);
router.get("/:id", getCityById);

module.exports = router;
