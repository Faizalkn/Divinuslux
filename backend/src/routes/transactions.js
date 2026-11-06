const express = require("express");
const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
const requireAuth = require("../middleware/auth");
const { asyncHandler, fail } = require("../utils/http");
const { transactionInput, transactionFilters } = require("../utils/transactions");

const router = express.Router();
router.use(requireAuth);

router.get("/", asyncHandler(async (req, res) => {
  const match = transactionFilters(req.query, req.user.id);
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 50, 1), 100);
  const [transactions, total] = await Promise.all([
    Transaction.find(match).sort({ date: -1, createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Transaction.countDocuments(match)
  ]);
  res.json({ transactions, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}));

router.post("/", asyncHandler(async (req, res) => {
  const transaction = await Transaction.create({ ...transactionInput(req.body), user: req.user.id });
  res.status(201).json({ transaction });
}));

router.put("/:id", asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw fail(400, "Transaction ID is invalid.");
  const transaction = await Transaction.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    transactionInput(req.body),
    { new: true, runValidators: true }
  );
  if (!transaction) throw fail(404, "Transaction not found.");
  res.json({ transaction });
}));

router.delete("/:id", asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw fail(400, "Transaction ID is invalid.");
  const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!transaction) throw fail(404, "Transaction not found.");
  res.json({ message: "Transaction deleted." });
}));

module.exports = router;
