const mongoose = require("mongoose");
const Trip = require("../models/Trip");
const City = require("../models/City");
const Activity = require("../models/Activity");
const asyncHandler = require("../utils/asyncHandler");

// Helper function to check if authenticated user owns the trip
const checkTripOwner = (trip, userId) => {
  return trip.owner.toString() === userId.toString();
};

// ==========================================
// STOPS CONTROLLERS
// ==========================================

// @desc    Add a stop to a trip
// @route   POST /api/v1/trips/:tripId/stops
// @access  Private
const addStop = asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const { city, arrivalDate, departureDate, notes } = req.body;

  if (!mongoose.Types.ObjectId.isValid(tripId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid trip ID format" });
  }

  const trip = await Trip.findById(tripId);
  if (!trip) {
    return res.status(404).json({ success: false, message: "Trip not found" });
  }

  if (!checkTripOwner(trip, req.user._id)) {
    return res
      .status(403)
      .json({ success: false, message: "Not authorized to modify this trip" });
  }

  if (!city || !mongoose.Types.ObjectId.isValid(city)) {
    return res
      .status(400)
      .json({ success: false, message: "Valid city ID is required" });
  }

  const cityExists = await City.findById(city);
  if (!cityExists) {
    return res.status(404).json({ success: false, message: "City not found" });
  }

  let arrival = arrivalDate ? new Date(arrivalDate) : undefined;
  let departure = departureDate ? new Date(departureDate) : undefined;

  if (arrival && isNaN(arrival.getTime())) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid arrival date format" });
  }
  if (departure && isNaN(departure.getTime())) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid departure date format" });
  }

  if (arrival && departure && arrival > departure) {
    return res.status(400).json({
      success: false,
      message: "Arrival date cannot be after departure date",
    });
  }

  if (arrival && trip.startDate && arrival < trip.startDate) {
    return res.status(400).json({
      success: false,
      message: "Arrival date cannot be before trip start date",
    });
  }
  if (departure && trip.endDate && departure > trip.endDate) {
    return res.status(400).json({
      success: false,
      message: "Departure date cannot be after trip end date",
    });
  }

  const nextOrder = trip.stops.length;

  trip.stops.push({
    city,
    arrivalDate: arrival,
    departureDate: departure,
    order: nextOrder,
    notes: notes ? notes.trim() : "",
    selectedActivities: [],
  });

  await trip.save();

  await trip.populate(
    "stops.city",
    "name country countryCode image coordinates costIndex popularity"
  );
  await trip.populate(
    "stops.selectedActivities.activity",
    "name description type duration estimatedCost image"
  );

  const newStop = trip.stops[trip.stops.length - 1];

  res.status(201).json({
    success: true,
    data: newStop,
    stops: trip.stops,
  });
});

// @desc    Get all stops for a trip
// @route   GET /api/v1/trips/:tripId/stops
// @access  Private
const getStops = asyncHandler(async (req, res) => {
  const { tripId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(tripId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid trip ID format" });
  }

  const trip = await Trip.findById(tripId)
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

  if (!checkTripOwner(trip, req.user._id) && trip.visibility === "private") {
    return res.status(403).json({
      success: false,
      message: "Not authorized to access this itinerary",
    });
  }

  const sortedStops = trip.stops.sort((a, b) => a.order - b.order);

  res.status(200).json({
    success: true,
    count: sortedStops.length,
    data: sortedStops,
  });
});

// @desc    Reorder stops in a trip
// @route   PUT /api/v1/trips/:tripId/stops/reorder
// @access  Private
const reorderStops = asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const { stopIds } = req.body;

  if (!mongoose.Types.ObjectId.isValid(tripId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid trip ID format" });
  }

  if (!Array.isArray(stopIds) || stopIds.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "stopIds array is required" });
  }

  const trip = await Trip.findById(tripId);
  if (!trip) {
    return res.status(404).json({ success: false, message: "Trip not found" });
  }

  if (!checkTripOwner(trip, req.user._id)) {
    return res
      .status(403)
      .json({ success: false, message: "Not authorized to modify this trip" });
  }

  const uniqueIds = new Set(stopIds);
  if (uniqueIds.size !== stopIds.length) {
    return res
      .status(400)
      .json({ success: false, message: "stopIds array contains duplicate IDs" });
  }

  if (stopIds.length !== trip.stops.length) {
    return res.status(400).json({
      success: false,
      message: "stopIds list must include all trip stops",
    });
  }

  const existingStopIds = trip.stops.map((s) => s._id.toString());
  const allExist = stopIds.every((id) => existingStopIds.includes(id));

  if (!allExist) {
    return res.status(400).json({
      success: false,
      message: "One or more stop IDs are invalid for this trip",
    });
  }

  stopIds.forEach((id, index) => {
    const stop = trip.stops.id(id);
    if (stop) {
      stop.order = index;
    }
  });

  trip.stops.sort((a, b) => a.order - b.order);

  await trip.save();

  await trip.populate(
    "stops.city",
    "name country countryCode image coordinates costIndex popularity"
  );
  await trip.populate(
    "stops.selectedActivities.activity",
    "name description type duration estimatedCost image"
  );

  res.status(200).json({
    success: true,
    data: trip.stops,
  });
});

// @desc    Update a stop
// @route   PUT /api/v1/trips/:tripId/stops/:stopId
// @access  Private
const updateStop = asyncHandler(async (req, res) => {
  const { tripId, stopId } = req.params;
  const { city, arrivalDate, departureDate, notes } = req.body;

  if (
    !mongoose.Types.ObjectId.isValid(tripId) ||
    !mongoose.Types.ObjectId.isValid(stopId)
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid trip or stop ID format" });
  }

  const trip = await Trip.findById(tripId);
  if (!trip) {
    return res.status(404).json({ success: false, message: "Trip not found" });
  }

  if (!checkTripOwner(trip, req.user._id)) {
    return res
      .status(403)
      .json({ success: false, message: "Not authorized to modify this trip" });
  }

  const stop = trip.stops.id(stopId);
  if (!stop) {
    return res.status(404).json({ success: false, message: "Stop not found" });
  }

  if (city && city.toString() !== stop.city.toString()) {
    if (!mongoose.Types.ObjectId.isValid(city)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid city ID format" });
    }
    const cityExists = await City.findById(city);
    if (!cityExists) {
      return res
        .status(404)
        .json({ success: false, message: "City not found" });
    }
    stop.city = city;
    stop.selectedActivities = [];
  }

  let arrival =
    arrivalDate !== undefined
      ? arrivalDate
        ? new Date(arrivalDate)
        : undefined
      : stop.arrivalDate;
  let departure =
    departureDate !== undefined
      ? departureDate
        ? new Date(departureDate)
        : undefined
      : stop.departureDate;

  if (arrival && isNaN(arrival.getTime())) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid arrival date format" });
  }
  if (departure && isNaN(departure.getTime())) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid departure date format" });
  }

  if (arrival && departure && arrival > departure) {
    return res.status(400).json({
      success: false,
      message: "Arrival date cannot be after departure date",
    });
  }

  if (arrival && trip.startDate && arrival < trip.startDate) {
    return res.status(400).json({
      success: false,
      message: "Arrival date cannot be before trip start date",
    });
  }
  if (departure && trip.endDate && departure > trip.endDate) {
    return res.status(400).json({
      success: false,
      message: "Departure date cannot be after trip end date",
    });
  }

  stop.arrivalDate = arrival;
  stop.departureDate = departure;
  if (notes !== undefined) {
    stop.notes = notes.trim();
  }

  await trip.save();

  await trip.populate(
    "stops.city",
    "name country countryCode image coordinates costIndex popularity"
  );
  await trip.populate(
    "stops.selectedActivities.activity",
    "name description type duration estimatedCost image"
  );

  res.status(200).json({
    success: true,
    data: stop,
    stops: trip.stops,
  });
});

// @desc    Delete a stop and normalize order
// @route   DELETE /api/v1/trips/:tripId/stops/:stopId
// @access  Private
const deleteStop = asyncHandler(async (req, res) => {
  const { tripId, stopId } = req.params;

  if (
    !mongoose.Types.ObjectId.isValid(tripId) ||
    !mongoose.Types.ObjectId.isValid(stopId)
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid trip or stop ID format" });
  }

  const trip = await Trip.findById(tripId);
  if (!trip) {
    return res.status(404).json({ success: false, message: "Trip not found" });
  }

  if (!checkTripOwner(trip, req.user._id)) {
    return res
      .status(403)
      .json({ success: false, message: "Not authorized to modify this trip" });
  }

  const stop = trip.stops.id(stopId);
  if (!stop) {
    return res.status(404).json({ success: false, message: "Stop not found" });
  }

  trip.stops.pull(stopId);

  trip.stops.sort((a, b) => a.order - b.order);
  trip.stops.forEach((s, index) => {
    s.order = index;
  });

  await trip.save();

  await trip.populate(
    "stops.city",
    "name country countryCode image coordinates costIndex popularity"
  );
  await trip.populate(
    "stops.selectedActivities.activity",
    "name description type duration estimatedCost image"
  );

  res.status(200).json({
    success: true,
    message: "Stop deleted successfully",
    data: trip.stops,
  });
});

// ==========================================
// STOP ACTIVITIES CONTROLLERS
// ==========================================

// @desc    Add an activity to a stop
// @route   POST /api/v1/trips/:tripId/stops/:stopId/activities
// @access  Private
const addActivityToStop = asyncHandler(async (req, res) => {
  const { tripId, stopId } = req.params;
  const { activity, scheduledDate, scheduledTime, notes } = req.body;

  if (
    !mongoose.Types.ObjectId.isValid(tripId) ||
    !mongoose.Types.ObjectId.isValid(stopId)
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid trip or stop ID format" });
  }

  if (!activity || !mongoose.Types.ObjectId.isValid(activity)) {
    return res
      .status(400)
      .json({ success: false, message: "Valid activity ID is required" });
  }

  const trip = await Trip.findById(tripId);
  if (!trip) {
    return res.status(404).json({ success: false, message: "Trip not found" });
  }

  if (!checkTripOwner(trip, req.user._id)) {
    return res
      .status(403)
      .json({ success: false, message: "Not authorized to modify this trip" });
  }

  const stop = trip.stops.id(stopId);
  if (!stop) {
    return res.status(404).json({ success: false, message: "Stop not found" });
  }

  const activityDoc = await Activity.findById(activity);
  if (!activityDoc) {
    return res
      .status(404)
      .json({ success: false, message: "Activity not found" });
  }

  if (activityDoc.city.toString() !== stop.city.toString()) {
    return res.status(400).json({
      success: false,
      message: "Activity does not belong to the city of this stop",
    });
  }

  let schedDate = scheduledDate ? new Date(scheduledDate) : undefined;
  if (schedDate && isNaN(schedDate.getTime())) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid scheduled date format" });
  }

  if (schedDate && stop.arrivalDate && schedDate < stop.arrivalDate) {
    return res.status(400).json({
      success: false,
      message: "Scheduled date cannot be before stop arrival date",
    });
  }
  if (schedDate && stop.departureDate && schedDate > stop.departureDate) {
    return res.status(400).json({
      success: false,
      message: "Scheduled date cannot be after stop departure date",
    });
  }

  const nextActivityOrder = stop.selectedActivities.length;

  stop.selectedActivities.push({
    activity,
    scheduledDate: schedDate,
    scheduledTime: scheduledTime ? scheduledTime.trim() : "",
    notes: notes ? notes.trim() : "",
    order: nextActivityOrder,
  });

  await trip.save();

  await trip.populate(
    "stops.city",
    "name country countryCode image coordinates costIndex popularity"
  );
  await trip.populate(
    "stops.selectedActivities.activity",
    "name description type duration estimatedCost image"
  );

  const updatedStop = trip.stops.id(stopId);

  res.status(201).json({
    success: true,
    data: updatedStop.selectedActivities[
      updatedStop.selectedActivities.length - 1
    ],
    activities: updatedStop.selectedActivities,
  });
});

// @desc    Get activities for a stop
// @route   GET /api/v1/trips/:tripId/stops/:stopId/activities
// @access  Private
const getStopActivities = asyncHandler(async (req, res) => {
  const { tripId, stopId } = req.params;

  if (
    !mongoose.Types.ObjectId.isValid(tripId) ||
    !mongoose.Types.ObjectId.isValid(stopId)
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid trip or stop ID format" });
  }

  const trip = await Trip.findById(tripId).populate(
    "stops.selectedActivities.activity",
    "name description type duration estimatedCost image"
  );

  if (!trip) {
    return res.status(404).json({ success: false, message: "Trip not found" });
  }

  if (!checkTripOwner(trip, req.user._id) && trip.visibility === "private") {
    return res
      .status(403)
      .json({ success: false, message: "Not authorized to access this trip" });
  }

  const stop = trip.stops.id(stopId);
  if (!stop) {
    return res.status(404).json({ success: false, message: "Stop not found" });
  }

  const sortedActivities = stop.selectedActivities.sort(
    (a, b) => a.order - b.order
  );

  res.status(200).json({
    success: true,
    count: sortedActivities.length,
    data: sortedActivities,
  });
});

// @desc    Update activity in a stop
// @route   PUT /api/v1/trips/:tripId/stops/:stopId/activities/:activityId
// @access  Private
const updateStopActivity = asyncHandler(async (req, res) => {
  const { tripId, stopId, activityId } = req.params;
  const { scheduledDate, scheduledTime, notes, order } = req.body;

  if (
    !mongoose.Types.ObjectId.isValid(tripId) ||
    !mongoose.Types.ObjectId.isValid(stopId) ||
    !mongoose.Types.ObjectId.isValid(activityId)
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid ID format" });
  }

  const trip = await Trip.findById(tripId);
  if (!trip) {
    return res.status(404).json({ success: false, message: "Trip not found" });
  }

  if (!checkTripOwner(trip, req.user._id)) {
    return res
      .status(403)
      .json({ success: false, message: "Not authorized to modify this trip" });
  }

  const stop = trip.stops.id(stopId);
  if (!stop) {
    return res.status(404).json({ success: false, message: "Stop not found" });
  }

  const item = stop.selectedActivities.id(activityId);
  if (!item) {
    return res.status(404).json({
      success: false,
      message: "Selected activity not found in this stop",
    });
  }

  let schedDate =
    scheduledDate !== undefined
      ? scheduledDate
        ? new Date(scheduledDate)
        : undefined
      : item.scheduledDate;
  if (schedDate && isNaN(schedDate.getTime())) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid scheduled date format" });
  }

  if (schedDate && stop.arrivalDate && schedDate < stop.arrivalDate) {
    return res.status(400).json({
      success: false,
      message: "Scheduled date cannot be before stop arrival date",
    });
  }
  if (schedDate && stop.departureDate && schedDate > stop.departureDate) {
    return res.status(400).json({
      success: false,
      message: "Scheduled date cannot be after stop departure date",
    });
  }

  item.scheduledDate = schedDate;
  if (scheduledTime !== undefined) item.scheduledTime = scheduledTime.trim();
  if (notes !== undefined) item.notes = notes.trim();
  if (order !== undefined && typeof order === "number") item.order = order;

  await trip.save();

  await trip.populate(
    "stops.city",
    "name country countryCode image coordinates costIndex popularity"
  );
  await trip.populate(
    "stops.selectedActivities.activity",
    "name description type duration estimatedCost image"
  );

  res.status(200).json({
    success: true,
    data: item,
  });
});

// @desc    Delete activity from a stop & normalize order
// @route   DELETE /api/v1/trips/:tripId/stops/:stopId/activities/:activityId
// @access  Private
const deleteStopActivity = asyncHandler(async (req, res) => {
  const { tripId, stopId, activityId } = req.params;

  if (
    !mongoose.Types.ObjectId.isValid(tripId) ||
    !mongoose.Types.ObjectId.isValid(stopId) ||
    !mongoose.Types.ObjectId.isValid(activityId)
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid ID format" });
  }

  const trip = await Trip.findById(tripId);
  if (!trip) {
    return res.status(404).json({ success: false, message: "Trip not found" });
  }

  if (!checkTripOwner(trip, req.user._id)) {
    return res
      .status(403)
      .json({ success: false, message: "Not authorized to modify this trip" });
  }

  const stop = trip.stops.id(stopId);
  if (!stop) {
    return res.status(404).json({ success: false, message: "Stop not found" });
  }

  const item = stop.selectedActivities.id(activityId);
  if (!item) {
    return res.status(404).json({
      success: false,
      message: "Selected activity not found in this stop",
    });
  }

  stop.selectedActivities.pull(activityId);

  stop.selectedActivities.sort((a, b) => a.order - b.order);
  stop.selectedActivities.forEach((act, index) => {
    act.order = index;
  });

  await trip.save();

  res.status(200).json({
    success: true,
    message: "Activity removed from stop successfully",
    data: stop.selectedActivities,
  });
});

module.exports = {
  addStop,
  getStops,
  reorderStops,
  updateStop,
  deleteStop,
  addActivityToStop,
  getStopActivities,
  updateStopActivity,
  deleteStopActivity,
};
