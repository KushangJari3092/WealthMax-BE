const Transaction = require("../models/transaction");
const Order = require("../models/orders");

const getAllTransactions = async (req, res) => {
  const { transactionType, fromDate, toDate } = req.query;
  try {
    const filters = {userId: req.user._id};
    if (transactionType && transactionType !== 'all') {
      filters.type = transactionType;
    }
    if (fromDate) {
      filters.createdAt = { $gte: new Date(fromDate) };
    }
    if (toDate) {
      filters.createdAt = { ...filters.createdAt, $lte: new Date(toDate) };
    }

    const transactions = await Transaction.find(filters).sort({ createdAt: -1 });
    res.json({ success: true, transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ success: false, error: "Failed to fetch transactions" });
  }
};

const getAllOrders = async (req, res) => {
  const { orderType, fromDate, toDate } = req.query;
  try {
    const filters = {userId: req.user._id};
    if (orderType && orderType !== 'all') {
      filters.type = orderType;
    }
    if (fromDate) {
      filters.createdAt = { $gte: new Date(fromDate) };
    }
    if (toDate) {
      filters.createdAt = { ...filters.createdAt, $lte: new Date(toDate) };
    }

    const orders = await Order.find(filters).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, error: "Failed to fetch orders" });
  }
};

module.exports = { getAllTransactions, getAllOrders };