const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : null;
  if (!token) return res.status(401).json({ message: "Authentication required." });

  try {
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not configured.");
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select("_id name email");
    if (!user) return res.status(401).json({ message: "Your session is no longer valid." });
    req.user = user;
    return next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Invalid or expired session. Please sign in again." });
    }
    return next(error);
  }
}

module.exports = requireAuth;
