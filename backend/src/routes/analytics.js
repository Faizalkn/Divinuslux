const express = require("express");
const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
const requireAuth = require("../middleware/auth");
const { asyncHandler } = require("../utils/http");
const { transactionFilters } = require("../utils/transactions");

const router = express.Router();
router.use(requireAuth);

router.get("/", asyncHandler(async (req, res) => {
  const match = transactionFilters(req.query, req.user.id);
  const scope = { ...match };
  delete scope.type;
  delete scope.category;
  const [byType, byCategory, monthly] = await Promise.all([
    Transaction.aggregate([
      { $match: scope },
      { $group: { _id: "$type", total: { $sum: "$amount" } } },
      { $sort: { _id: 1 } }
    ]),
    Transaction.aggregate([
      { $match: { ...scope, type: "Expense" } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } }
    ]),
    Transaction.aggregate([
      { $match: { ...scope, type: "Expense" } },
      { $group: {
        _id: { year: { $year: "$date" }, month: { $month: "$date" } },
        total: { $sum: "$amount" }
      } },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ])
  ]);
  res.json({ byType, byCategory, monthly });
}));

module.exports = router;
