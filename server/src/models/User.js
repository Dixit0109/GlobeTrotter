const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    profilePhoto: {
      type: String,
      default: "",
    },
    languagePreference: {
      type: String,
      default: "en",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    savedDestinations: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Method to check entered password against stored password hash
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Static helper to hash passwords
userSchema.statics.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
