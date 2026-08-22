const mongoose = require("mongoose");
const Trip = require("../models/Trip");
const Expense = require("../models/Expense");
const asyncHandler = require("../utils/asyncHandler");

// Helper function to check if authenticated user owns the trip
const checkTripOwner = (trip, userId) => {
  return trip.owner.toString() === userId.toString();
};

// @desc    Add an expense to a trip
// @route   POST /api/v1/trips/:tripId/expenses
// @access  Private
const addExpense = asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const { category, amount, currency = "USD", date, description } = req.body;

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

  const catStr = category ? category.trim() : "";
  if (!catStr || catStr.length < 2 || catStr.length > 50) {
    return res.status(400).json({
      success: false,
      message: "Expense category must be between 2 and 50 characters",
    });
  }

  if (amount === undefined || isNaN(Number(amount)) || Number(amount) < 0) {
    return res.status(400).json({
      success: false,
      message: "Amount must be a non-negative number",
    });
  }

  const currStr = currency ? currency.trim().toUpperCase() : "USD";
  if (currStr.length !== 3) {
    return res.status(400).json({
      success: false,
      message: "Currency must be a valid 3-letter currency code",
    });
  }

  let expDate = date ? new Date(date) : new Date();
  if (isNaN(expDate.getTime())) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid expense date format" });
  }

  if (date && trip.startDate && expDate < trip.startDate) {
    return res.status(400).json({
      success: false,
      message: "Expense date cannot be before trip start date",
    });
  }
  if (date && trip.endDate && expDate > trip.endDate) {
    return res.status(400).json({
      success: false,
      message: "Expense date cannot be after trip end date",
    });
  }

  const expense = await Expense.create({
    trip: tripId,
    category: catStr,
    amount: Number(amount),
    currency: currStr,
    date: expDate,
    description: description ? description.trim() : "",
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    data: expense,
  });
});

// @desc    Get all expenses for a trip
// @route   GET /api/v1/trips/:tripId/expenses
// @access  Private
const getExpenses = asyncHandler(async (req, res) => {
  const { tripId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(tripId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid trip ID format" });
  }

  const trip = await Trip.findById(tripId);
  if (!trip) {
    return res.status(404).json({ success: false, message: "Trip not found" });
  }

  if (!checkTripOwner(trip, req.user._id) && trip.visibility === "private") {
    return res.status(403).json({
      success: false,
      message: "Not authorized to view expenses for this trip",
    });
  }

  const expenses = await Expense.find({ trip: tripId }).sort({
    date: -1,
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    count: expenses.length,
    data: expenses,
  });
});

// @desc    Update an expense
// @route   PUT /api/v1/trips/:tripId/expenses/:expenseId
// @access  Private
const updateExpense = asyncHandler(async (req, res) => {
  const { tripId, expenseId } = req.params;
  const { category, amount, currency, date, description } = req.body;

  if (
    !mongoose.Types.ObjectId.isValid(tripId) ||
    !mongoose.Types.ObjectId.isValid(expenseId)
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid trip or expense ID format" });
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

  const expense = await Expense.findById(expenseId);
  if (!expense) {
    return res
      .status(404)
      .json({ success: false, message: "Expense not found" });
  }

  if (expense.trip.toString() !== tripId) {
    return res
      .status(400)
      .json({ success: false, message: "Expense does not belong to this trip" });
  }

  if (category !== undefined) {
    const catStr = category ? category.trim() : "";
    if (!catStr || catStr.length < 2 || catStr.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Expense category must be between 2 and 50 characters",
      });
    }
    expense.category = catStr;
  }

  if (amount !== undefined) {
    if (isNaN(Number(amount)) || Number(amount) < 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a non-negative number",
      });
    }
    expense.amount = Number(amount);
  }

  if (currency !== undefined) {
    const currStr = currency.trim().toUpperCase();
    if (currStr.length !== 3) {
      return res.status(400).json({
        success: false,
        message: "Currency must be a valid 3-letter currency code",
      });
    }
    expense.currency = currStr;
  }

  if (date !== undefined) {
    const expDate = new Date(date);
    if (isNaN(expDate.getTime())) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid expense date format" });
    }
    if (trip.startDate && expDate < trip.startDate) {
      return res.status(400).json({
        success: false,
        message: "Expense date cannot be before trip start date",
      });
    }
    if (trip.endDate && expDate > trip.endDate) {
      return res.status(400).json({
        success: false,
        message: "Expense date cannot be after trip end date",
      });
    }
    expense.date = expDate;
  }

  if (description !== undefined) {
    expense.description = description.trim();
  }

  await expense.save();

  res.status(200).json({
    success: true,
    data: expense,
  });
});

// @desc    Delete an expense
// @route   DELETE /api/v1/trips/:tripId/expenses/:expenseId
// @access  Private
const deleteExpense = asyncHandler(async (req, res) => {
  const { tripId, expenseId } = req.params;

  if (
    !mongoose.Types.ObjectId.isValid(tripId) ||
    !mongoose.Types.ObjectId.isValid(expenseId)
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid trip or expense ID format" });
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

  const expense = await Expense.findById(expenseId);
  if (!expense) {
    return res
      .status(404)
      .json({ success: false, message: "Expense not found" });
  }

  if (expense.trip.toString() !== tripId) {
    return res
      .status(400)
      .json({ success: false, message: "Expense does not belong to this trip" });
  }

  await expense.deleteOne();

  res.status(200).json({
    success: true,
    message: "Expense deleted successfully",
    data: { _id: expenseId },
  });
});

// @desc    Get trip budget financial summary
// @route   GET /api/v1/trips/:tripId/budget
// @access  Private
const getTripBudget = asyncHandler(async (req, res) => {
  const { tripId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(tripId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid trip ID format" });
  }

  const trip = await Trip.findById(tripId);
  if (!trip) {
    return res.status(404).json({ success: false, message: "Trip not found" });
  }

  if (!checkTripOwner(trip, req.user._id) && trip.visibility === "private") {
    return res.status(403).json({
      success: false,
      message: "Not authorized to access budget for this trip",
    });
  }

  const expenses = await Expense.find({ trip: tripId }).sort({ date: 1 });

  let totalCost = 0;
  const categoryBreakdown = {
    transport: 0,
    stay: 0,
    activities: 0,
    meals: 0,
    other: 0,
  };

  const dailyMap = {};
  const currenciesSet = new Set();

  expenses.forEach((exp) => {
    totalCost += exp.amount;

    const catKey = exp.category ? exp.category.trim() : "other";
    if (categoryBreakdown[catKey] !== undefined) {
      categoryBreakdown[catKey] += exp.amount;
    } else {
      categoryBreakdown[catKey] = exp.amount;
    }

    if (exp.currency) {
      currenciesSet.add(exp.currency.toUpperCase());
    }

    const dateKey = exp.date.toISOString().split("T")[0];
    dailyMap[dateKey] = (dailyMap[dateKey] || 0) + exp.amount;
  });

  const dailyBreakdown = Object.keys(dailyMap)
    .sort()
    .map((date) => ({
      date,
      total: dailyMap[date],
    }));

  let numberOfTripDays = 1;
  if (trip.startDate && trip.endDate) {
    const diffTime = Math.abs(
      new Date(trip.endDate) - new Date(trip.startDate)
    );
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    numberOfTripDays = Math.max(1, diffDays);
  }

  const averageDailyCost = Number((totalCost / numberOfTripDays).toFixed(2));

  const budgetLimit = trip.budgetLimit > 0 ? trip.budgetLimit : null;
  const remainingBudget =
    budgetLimit !== null ? budgetLimit - totalCost : null;
  const isOverBudget = budgetLimit !== null ? totalCost > budgetLimit : false;

  const currencyList = Array.from(currenciesSet);
  const primaryCurrency = currencyList[0] || "USD";
  const hasMultipleCurrencies = currencyList.length > 1;

  res.status(200).json({
    success: true,
    data: {
      totalCost,
      budgetLimit,
      remainingBudget,
      averageDailyCost,
      numberOfTripDays,
      currency: primaryCurrency,
      hasMultipleCurrencies,
      ...(hasMultipleCurrencies && {
        currencyWarning:
          "Multiple currencies detected across expenses for this trip",
      }),
      categoryBreakdown,
      dailyBreakdown,
      isOverBudget,
    },
  });
});

module.exports = {
  addExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  getTripBudget,
};
