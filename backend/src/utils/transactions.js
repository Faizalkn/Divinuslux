const mongoose = require("mongoose");

const categories = ["Food", "Travel", "Utilities", "Entertainment"];
const paymentMethods = ["Cash", "UPI", "Credit Card", "Debit Card", "Bank Transfer"];

function transactionInput(body) {
  const { title, amount, date, category, type, paymentMethod } = body;
  if (typeof title !== "string" || !title.trim() || title.trim().length > 100) {
    throw Object.assign(new Error("Title is required and must be 100 characters or fewer."), { status: 400 });
  }
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw Object.assign(new Error("Amount must be a positive number."), { status: 400 });
  }
  const parsedDate = new Date(date);
  if (!date || Number.isNaN(parsedDate.getTime())) {
    throw Object.assign(new Error("A valid transaction date is required."), { status: 400 });
  }
  if (!categories.includes(category)) throw Object.assign(new Error("Choose a valid category."), { status: 400 });
  if (!["Income", "Expense"].includes(type)) throw Object.assign(new Error("Choose Income or Expense."), { status: 400 });
  if (!paymentMethods.includes(paymentMethod)) throw Object.assign(new Error("Choose a valid payment method."), { status: 400 });
  return { title: title.trim(), amount: numericAmount, date: parsedDate, category, type, paymentMethod };
}

function transactionFilters(query, userId) {
  const match = { user: new mongoose.Types.ObjectId(userId) };
  if (query.category) {
    if (!categories.includes(query.category)) throw Object.assign(new Error("Choose a valid category."), { status: 400 });
    match.category = query.category;
  }
  if (query.type) {
    if (!["Income", "Expense"].includes(query.type)) throw Object.assign(new Error("Choose a valid transaction type."), { status: 400 });
    match.type = query.type;
  }
  if (query.startDate || query.endDate) {
    match.date = {};
    if (query.startDate) {
      const start = new Date(query.startDate);
      if (Number.isNaN(start.getTime())) throw Object.assign(new Error("Start date is invalid."), { status: 400 });
      start.setHours(0, 0, 0, 0);
      match.date.$gte = start;
    }
    if (query.endDate) {
      const end = new Date(query.endDate);
      if (Number.isNaN(end.getTime())) throw Object.assign(new Error("End date is invalid."), { status: 400 });
      end.setHours(23, 59, 59, 999);
      match.date.$lte = end;
    }
    if (match.date.$gte && match.date.$lte && match.date.$gte > match.date.$lte) {
      throw Object.assign(new Error("Start date must be on or before end date."), { status: 400 });
    }
  }
  return match;
}

module.exports = { transactionInput, transactionFilters };
