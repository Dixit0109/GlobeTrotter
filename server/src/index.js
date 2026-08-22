const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");
const connectDB = require("./config/db");
require("./models");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[GlobeTrotter Server] Running on http://localhost:${PORT}`);
    console.log(`[Health Check] http://localhost:${PORT}/api/v1/health`);
  });
};

startServer();
