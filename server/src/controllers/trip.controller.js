const mongoose = require("mongoose");
const Trip = require("../models/Trip");
const Expense = require("../models/Expense");
const City = require("../models/City");
const Activity = require("../models/Activity");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Create a new trip
// @route   POST /api/v1/trips
// @access  Private
const createTrip = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    startDate,
    endDate,
    coverPhoto,
    budgetLimit,
    visibility,
  } = req.body;

  if (!name || name.trim() === "") {
    return res
      .status(400)
      .json({ success: false, message: "Trip name is required" });
  }

  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: "Start date and end date are required",
    });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return res.status(400).json({
      success: false,
      message: "Invalid start date or end date format",
    });
  }

  if (end < start) {
    return res.status(400).json({
      success: false,
      message: "End date cannot be before start date",
    });
  }

  if (budgetLimit !== undefined && budgetLimit < 0) {
    return res
      .status(400)
      .json({ success: false, message: "Budget limit cannot be negative" });
  }

  const validVisibilities = ["private", "public", "shared"];
  if (visibility && !validVisibilities.includes(visibility)) {
    return res.status(400).json({
      success: false,
      message: "Visibility must be private, public, or shared",
    });
  }

  const trip = await Trip.create({
    owner: req.user._id,
    name: name.trim(),
    description: description ? description.trim() : "",
    startDate: start,
    endDate: end,
    coverPhoto: coverPhoto || "",
    budgetLimit: budgetLimit || 0,
    visibility: visibility || "private",
    stops: [],
  });

  res.status(201).json({
    success: true,
    data: trip,
  });
});

// @desc    Get all trips belonging to current user
// @route   GET /api/v1/trips
// @access  Private
const getMyTrips = asyncHandler(async (req, res) => {
  const trips = await Trip.find({ owner: req.user._id })
    .sort({ createdAt: -1 })
    .populate("stops.city", "name country countryCode image");

  res.status(200).json({
    success: true,
    count: trips.length,
    data: trips,
  });
});

// @desc    Get single trip by ID
// @route   GET /api/v1/trips/:id
// @access  Private
const getTripById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid trip ID format" });
  }

  const trip = await Trip.findById(id)
    .populate(
      "stops.city",
      "name country countryCode image coordinates costIndex popularity"
    )
    .populate(
      "stops.selectedActivities.activity",
      "name description type duration estimatedCost image"
    );

  if (!trip) {
    return res.status(404).json({ success: false, message: "Trip not found" });
  }

  // Authorization Check: Must be trip owner or a non-private trip
  if (
    trip.owner.toString() !== req.user._id.toString() &&
    trip.visibility === "private"
  ) {
    return res
      .status(403)
      .json({ success: false, message: "Not authorized to access this trip" });
  }

  res.status(200).json({
    success: true,
    data: trip,
  });
});

// @desc    Update trip
// @route   PUT /api/v1/trips/:id
// @access  Private
const updateTrip = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid trip ID format" });
  }

  let trip = await Trip.findById(id);

  if (!trip) {
    return res.status(404).json({ success: false, message: "Trip not found" });
  }

  // Ownership Check
  if (trip.owner.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ success: false, message: "Not authorized to update this trip" });
  }

  const {
    name,
    description,
    startDate,
    endDate,
    coverPhoto,
    budgetLimit,
    visibility,
  } = req.body;

  if (name !== undefined) {
    if (name.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Trip name cannot be empty" });
    }
    trip.name = name.trim();
  }

  if (description !== undefined) {
    trip.description = description.trim();
  }

  const newStart = startDate ? new Date(startDate) : trip.startDate;
  const newEnd = endDate ? new Date(endDate) : trip.endDate;

  if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime())) {
    return res.status(400).json({
      success: false,
      message: "Invalid start date or end date format",
    });
  }

  if (newEnd < newStart) {
    return res.status(400).json({
      success: false,
      message: "End date cannot be before start date",
    });
  }

  trip.startDate = newStart;
  trip.endDate = newEnd;

  if (coverPhoto !== undefined) {
    trip.coverPhoto = coverPhoto;
  }

  if (budgetLimit !== undefined) {
    if (budgetLimit < 0) {
      return res
        .status(400)
        .json({ success: false, message: "Budget limit cannot be negative" });
    }
    trip.budgetLimit = budgetLimit;
  }

  if (visibility !== undefined) {
    const validVisibilities = ["private", "public", "shared"];
    if (!validVisibilities.includes(visibility)) {
      return res.status(400).json({
        success: false,
        message: "Visibility must be private, public, or shared",
      });
    }
    trip.visibility = visibility;
  }

  await trip.save();

  res.status(200).json({
    success: true,
    data: trip,
  });
});

// @desc    Delete trip & associated expenses
// @route   DELETE /api/v1/trips/:id
// @access  Private
const deleteTrip = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid trip ID format" });
  }

  const trip = await Trip.findById(id);

  if (!trip) {
    return res.status(404).json({ success: false, message: "Trip not found" });
  }

  // Ownership Check
  if (trip.owner.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ success: false, message: "Not authorized to delete this trip" });
  }

  // Delete associated Expense documents
  await Expense.deleteMany({ trip: id });

  // Delete Trip
  await trip.deleteOne();

  res.status(200).json({
    success: true,
    message: "Trip and related expenses deleted successfully",
    data: { _id: id },
  });
});

module.exports = {
  createTrip,
  getMyTrips,
  getTripById,
  updateTrip,
  deleteTrip,
};
