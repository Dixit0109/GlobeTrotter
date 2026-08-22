const mongoose = require("mongoose");

const tripActivitySchema = new mongoose.Schema(
  {
    activity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Activity",
      required: [true, "Activity reference is required"],
    },
    scheduledDate: {
      type: Date,
    },
    scheduledTime: {
      type: String,
      trim: true,
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

const tripStopSchema = new mongoose.Schema(
  {
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
      required: [true, "City reference is required for a trip stop"],
    },
    arrivalDate: {
      type: Date,
    },
    departureDate: {
      type: Date,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    selectedActivities: [tripActivitySchema],
  },
  { _id: true }
);

const tripSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Trip owner is required"],
    },
    name: {
      type: String,
      required: [true, "Trip name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    coverPhoto: {
      type: String,
      default: "",
    },
    budgetLimit: {
      type: Number,
      default: 0,
      min: [0, "Budget limit cannot be negative"],
    },
    visibility: {
      type: String,
      enum: ["private", "public", "shared"],
      default: "private",
    },
    stops: [tripStopSchema],
  },
  {
    timestamps: true,
  }
);

// Validation to ensure endDate is after or equal to startDate
tripSchema.pre("validate", function () {
  if (this.startDate && this.endDate && this.endDate < this.startDate) {
    this.invalidate("endDate", "End date must be after or equal to start date");
  }
});

// Indexes for fast lookup by owner, visibility, and date ranges
tripSchema.index({ owner: 1 });
tripSchema.index({ visibility: 1 });
tripSchema.index({ owner: 1, startDate: -1 });

const Trip = mongoose.model("Trip", tripSchema);

module.exports = Trip;
