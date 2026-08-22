const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Activity name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    type: {
      type: String,
      enum: [
        "sightseeing",
        "food",
        "adventure",
        "culture",
        "nature",
        "shopping",
        "relaxation",
        "other",
      ],
      default: "sightseeing",
    },
    duration: {
      type: Number, // Estimated duration in minutes
      default: 60,
      min: [0, "Duration cannot be negative"],
    },
    estimatedCost: {
      type: Number,
      default: 0,
      min: [0, "Estimated cost cannot be negative"],
    },
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
      required: [true, "City reference is required"],
    },
    image: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Index activities by city for fast filtering
activitySchema.index({ city: 1 });
activitySchema.index({ type: 1 });

const Activity = mongoose.model("Activity", activitySchema);

module.exports = Activity;
