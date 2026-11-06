require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/auth");
const transactionRoutes = require("./src/routes/transactions");
const budgetRoutes = require("./src/routes/budgets");
const dashboardRoutes = require("./src/routes/dashboard");
const analyticsRoutes = require("./src/routes/analytics");

const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "10kb" }));
app.use((req, res, next) => {
  if (["POST", "PUT", "PATCH"].includes(req.method) &&
      (!req.is("application/json") || !req.body || typeof req.body !== "object" || Array.isArray(req.body))) {
    return res.status(400).json({ message: "A JSON object request body is required." });
  }
  return next();
});
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }));

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use((req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` }));
app.use((error, _req, res, _next) => {
  const status = error.status || 500;
  if (status >= 500) console.error(error);
  res.status(status).json({ message: status >= 500 ? "An unexpected server error occurred." : error.message });
});

connectDB()
  .then(() => app.listen(port, () => console.log(`API listening on port ${port}`)))
  .catch((error) => {
    console.error("Could not start API:", error.message);
    process.exit(1);
  });
