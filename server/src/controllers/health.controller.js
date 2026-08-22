const mongoose = require("mongoose");

const getHealthStatus = (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  res.status(200).json({
    success: true,
    service: "GlobeTrotter API",
    status: "operational",
    version: "v1",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    database: {
      status: dbStatusMap[dbState] || "unknown",
      connected: dbState === 1,
    },
  });
};

module.exports = {
  getHealthStatus,
};
