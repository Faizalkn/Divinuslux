const express = require("express");
const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");
const requireAuth = require("../middleware/auth");
const { asyncHandler } = require("../utils/http");

const router = express.Router();
router.use(requireAuth);

router.get("/", asyncHandler(async (req, res) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const user = new mongoose.Types.ObjectId(req.user.id);
  const [totals, monthly, overallBudget, recentTransactions, categorySpend] = await Promise.all([
    Transaction.aggregate([
      { $match: { user } },
      { $group: { _id: "$type", total: { $sum: "$amount" } } }
    ]),
    Transaction.aggregate([
      { $match: { user, type: "Expense", date: { $gte: monthStart, $lt: nextMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]),
    Budget.findOne({ user: req.user.id, category: "Overall", month: now.getMonth() + 1, year: now.getFullYear() }),
    Transaction.find({ user: req.user.id }).sort({ date: -1, createdAt: -1 }).limit(6),
    Transaction.aggregate([
      { $match: { user, type: "Expense", date: { $gte: monthStart, $lt: nextMonth } } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } }
    ])
  ]);
  const income = totals.find((item) => item._id === "Income")?.total || 0;
  const expenses = totals.find((item) => item._id === "Expense")?.total || 0;
  const currentMonthSpending = monthly[0]?.total || 0;
  const budgetAmount = overallBudget?.amount || 0;
  res.json({
    totals: { income, expenses, currentMonthSpending, monthlyBudget: budgetAmount, remainingBudget: budgetAmount - currentMonthSpending },
    recentTransactions,
    categorySpend
  });
}));

module.exports = router;
