const express = require("express");
const mongoose = require("mongoose");
const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");
const requireAuth = require("../middleware/auth");
const { asyncHandler, fail } = require("../utils/http");

const router = express.Router();
router.use(requireAuth);

function period(query) {
  const now = new Date();
  const month = query.month === undefined ? now.getMonth() + 1 : Number(query.month);
  const year = query.year === undefined ? now.getFullYear() : Number(query.year);
  if (!Number.isInteger(month) || month < 1 || month > 12 || !Number.isInteger(year) || year < 2000 || year > 2100) {
    throw fail(400, "Month or year is invalid.");
  }
  return { month, year };
}

router.get("/", asyncHandler(async (req, res) => {
  const { month, year } = period(req.query);
  const budgets = await Budget.find({ user: req.user.id, month, year }).sort({ category: 1 });
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  const spending = await Transaction.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(req.user.id), type: "Expense", date: { $gte: start, $lt: end } } },
    { $group: { _id: "$category", spent: { $sum: "$amount" } } }
  ]);
  const spentByCategory = Object.fromEntries(spending.map((item) => [item._id, item.spent]));
  res.json({
    budgets: budgets.map((budget) => ({
      ...budget.toObject(),
      spent: budget.category === "Overall"
        ? Object.values(spentByCategory).reduce((sum, amount) => sum + amount, 0)
        : spentByCategory[budget.category] || 0
    }))
  });
}));

router.put("/", asyncHandler(async (req, res) => {
  const { category, amount } = req.body;
  const { month, year } = period(req.body);
  const numericAmount = Number(amount);
  if (!["Overall", "Food", "Travel", "Utilities", "Entertainment"].includes(category)) throw fail(400, "Choose a valid budget category.");
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) throw fail(400, "Budget amount must be a positive number.");
  const budget = await Budget.findOneAndUpdate(
    { user: req.user.id, category, month, year },
    { $set: { amount: numericAmount } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
  res.json({ budget });
}));

router.delete("/:id", asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw fail(400, "Budget ID is invalid.");
  const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!budget) throw fail(404, "Budget not found.");
  res.json({ message: "Budget deleted." });
}));

module.exports = router;
