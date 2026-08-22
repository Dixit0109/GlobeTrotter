const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { sendTokenResponse } = require("../utils/jwt");
const {
  validateRegisterInput,
  validateLoginInput,
} = require("../utils/validation");

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, profilePhoto, languagePreference } = req.body;

  const validation = validateRegisterInput({ name, email, password });
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      error: validation.errors.join(", "),
    });
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      error: "User with this email already exists",
    });
  }

  const passwordHash = await User.hashPassword(password);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    profilePhoto: profilePhoto || "",
    languagePreference: languagePreference || "en",
  });

  sendTokenResponse(user, 201, res, "User registered successfully");
});

// @desc    Authenticate user & get token
// @route   POST /api/v1/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const validation = validateLoginInput({ email, password });
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      error: validation.errors.join(", "),
    });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+passwordHash"
  );

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({
      success: false,
      error: "Invalid email or password",
    });
  }

  sendTokenResponse(user, 200, res, "Logged in successfully");
});

// @desc    Log out current user & clear cookie
// @route   POST /api/v1/auth/logout
// @access  Public / Protected
const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

// @desc    Get current user details
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

module.exports = {
  register,
  login,
  logout,
  getMe,
};
