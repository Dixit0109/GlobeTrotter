const mongoose = require("mongoose");
const Activity = require("../models/Activity");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Get all activities with search, filter, sort and pagination
// @route   GET /api/v1/activities
// @access  Public
const getActivities = asyncHandler(async (req, res) => {
  const {
    search,
    city,
    type,
    minCost,
    maxCost,
    minDuration,
    maxDuration,
    sort,
    page = 1,
    limit = 12,
  } = req.query;

  const query = {};

  // Text search on name or description
  if (search && search.trim() !== "") {
    const searchRegex = new RegExp(search.trim(), "i");
    query.$or = [{ name: searchRegex }, { description: searchRegex }];
  }

  // City filter
  if (city) {
    if (!mongoose.Types.ObjectId.isValid(city)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid city ID format" });
    }
    query.city = city;
  }

  // Type / Category filter
  if (type && type.trim() !== "") {
    query.type = type.trim().toLowerCase();
  }

  // Cost filter
  if (minCost !== undefined || maxCost !== undefined) {
    query.estimatedCost = {};
    if (minCost !== undefined && !isNaN(Number(minCost))) {
      query.estimatedCost.$gte = Number(minCost);
    }
    if (maxCost !== undefined && !isNaN(Number(maxCost))) {
      query.estimatedCost.$lte = Number(maxCost);
    }
  }

  // Duration filter
  if (minDuration !== undefined || maxDuration !== undefined) {
    query.duration = {};
    if (minDuration !== undefined && !isNaN(Number(minDuration))) {
      query.duration.$gte = Number(minDuration);
    }
    if (maxDuration !== undefined && !isNaN(Number(maxDuration))) {
      query.duration.$lte = Number(maxDuration);
    }
  }

  // Sorting
  let sortObj = { name: 1 };
  if (sort) {
    switch (sort) {
      case "costAsc":
      case "cost":
        sortObj = { estimatedCost: 1 };
        break;
      case "costDesc":
      case "-cost":
        sortObj = { estimatedCost: -1 };
        break;
      case "duration":
      case "durationAsc":
        sortObj = { duration: 1 };
        break;
      case "-duration":
        sortObj = { duration: -1 };
        break;
      case "name":
        sortObj = { name: 1 };
        break;
      default:
        sortObj = { name: 1 };
    }
  }

  // Pagination
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
  const skip = (pageNum - 1) * limitNum;

  const total = await Activity.countDocuments(query);
  const totalPages = Math.ceil(total / limitNum) || 1;

  const activities = await Activity.find(query)
    .populate("city", "name country countryCode image")
    .sort(sortObj)
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    count: activities.length,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
    },
    data: activities,
  });
});

// @desc    Get single activity by ID
// @route   GET /api/v1/activities/:id
// @access  Public
const getActivityById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid activity ID format" });
  }

  const activity = await Activity.findById(id).populate(
    "city",
    "name country countryCode image coordinates costIndex popularity"
  );

  if (!activity) {
    return res
      .status(404)
      .json({ success: false, message: "Activity not found" });
  }

  res.status(200).json({
    success: true,
    data: activity,
  });
});

module.exports = {
  getActivities,
  getActivityById,
};
