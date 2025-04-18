const express = require("express");
const User = require("../models/user");
const Order = require("../models/orders");
const router = express.Router();

const buyStock = async (req, res) => {
  const { symbol, quantity, price, totalCost } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (user.demat_balance < totalCost) {
      return res.status(400).json({ success: false, error: "Insufficient balance for this quantity" });
    }

    user.demat_balance -= totalCost;

    const stock = user.stocks.find((s) => s.symbol === symbol);
    if (stock) {
      const totalQuantity = stock.quantity + quantity;
      const totalValue = stock.quantity * stock.price + quantity * price;
      stock.price = totalValue / totalQuantity;
      stock.quantity = totalQuantity;
    } else {
      user.stocks.push({ symbol, quantity, price });
    }

    await user.save();

    // Save the order in the database
    const order = new Order({
      userId: req.user._id,
      symbol,
      quantity,
      price,
      totalCost,
      type: "buy",
    });
    await order.save();

    res.json({ success: true, message: "Stock bought successfully" });
  } catch (error) {
    console.error("Error buying stock:", error);
    res.status(500).json({ success: false, error: "Failed to buy stock" });
  }
};

const sellStock = async (req, res) => {
  const { symbol, quantity, price, totalCost } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const stock = user.stocks.find((s) => s.symbol === symbol);

    if (!stock || stock.quantity < quantity) {
      return res.status(400).json({ success: false, error: "Insufficient stock quantity" });
    }

    stock.quantity -= quantity;
    user.demat_balance += totalCost;

    if (stock.quantity === 0) {
      user.stocks = user.stocks.filter((s) => s.symbol !== symbol);
    }

    await user.save();

    // Save the order in the database
    const order = new Order({
      userId: req.user._id,
      symbol,
      quantity,
      price,
      totalCost,
      type: "sell",
    });
    await order.save();

    res.json({ success: true, message: "Stock sold successfully" });
  } catch (error) {
    console.error("Error selling stock:", error);
    res.status(500).json({ success: false, error: "Failed to sell stock" });
  }
};

module.exports = { buyStock, sellStock };