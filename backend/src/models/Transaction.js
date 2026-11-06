const mongoose = require("mongoose");

const categories = ["Food", "Travel", "Utilities", "Entertainment"];
const paymentMethods = ["Cash", "UPI", "Credit Card", "Debit Card", "Bank Transfer"];

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    amount: { type: Number, required: true, min: 0.01 },
    date: { type: Date, required: true },
    category: { type: String, required: true, enum: categories },
    type: { type: String, required: true, enum: ["Income", "Expense"] },
    paymentMethod: { type: String, required: true, enum: paymentMethods }
  },
  { timestamps: true }
);

transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, type: 1, category: 1, date: -1 });

module.exports = mongoose.model("Transaction", transactionSchema);
