const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const requireAuth = require("../middleware/auth");
const { asyncHandler, fail } = require("../utils/http");

const router = express.Router();

function issueToken(user) {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not configured.");
  return jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

router.post("/register", asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 80) {
    throw fail(400, "Name must be between 2 and 80 characters.");
  }
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    throw fail(400, "Enter a valid email address.");
  }
  if (typeof password !== "string" || password.length < 8 || password.length > 128) {
    throw fail(400, "Password must be between 8 and 128 characters.");
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (await User.exists({ email: normalizedEmail })) throw fail(409, "An account with this email already exists.");
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: await bcrypt.hash(password, 12)
  });
  res.status(201).json({ token: issueToken(user), user: { id: user.id, name: user.name, email: user.email } });
}));

router.post("/login", asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (typeof email !== "string" || typeof password !== "string") throw fail(400, "Email and password are required.");
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password))) throw fail(401, "Email or password is incorrect.");
  res.json({ token: issueToken(user), user: { id: user.id, name: user.name, email: user.email } });
}));

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: { id: req.user.id, name: req.user.name, email: req.user.email } });
});

module.exports = router;
