const mongoose = require("mongoose");

const citySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "City name is required"],
      trim: true,
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
    },
    countryCode: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },
    region: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    coordinates: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    costIndex: {
      type: Number,
      min: [1, "Cost index must be between 1 and 5"],
      max: [5, "Cost index must be between 1 and 5"],
      default: 3,
    },
    popularity: {
      type: Number,
      min: [0, "Popularity score cannot be negative"],
      max: [100, "Popularity score cannot exceed 100"],
      default: 0,
    },
    source: {
      type: String,
      enum: ["seed", "geonames", "custom"],
      default: "seed",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    externalId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for query performance
citySchema.index({ name: 1, country: 1 });
citySchema.index({ country: 1 });
citySchema.index({ region: 1 });
citySchema.index({ popularity: -1 });
citySchema.index({ externalId: 1 });
citySchema.index({ source: 1 });

const City = mongoose.model("City", citySchema);

module.exports = City;
