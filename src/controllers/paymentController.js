// filepath: d:\kushang\WealthMax---MERN\be\routes\payment.js
const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../models/user");
const Transaction = require("../models/transaction");
const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

const createPayment = async (req, res) => {
  const { amount } = req.body;

  try {
    const order = await razorpay.orders.create({
      amount: amount, // Amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    res.json({ success: true, id: order.id, amount: order.amount });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ success: false, error: "Failed to create order" });
  }
};

const verifyPayment = async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, amount } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    try {
      console.log("req.user",req.user);
      
      // Update user's account balance
      const user = await User.findById(req.user._id); // Replace with your user model
      if (!user) {
        return res.status(404).json({ success: false, error: "User not found" });
      }

      user.demat_balance += amount; // Add the amount to the user's balance
      await user.save();

      // Save the transaction details
      const transaction = new Transaction({
        userId: req.user._id,
        razorpay_payment_id,
        razorpay_order_id,
        amount,
        status: "success",
        type: "deposit",
      });
      await transaction.save();

      res.json({ success: true, message: "Payment verified and balance updated" });
    } catch (error) {
      console.error("Error updating user balance:", error);
      res.status(500).json({ success: false, error: "Failed to update balance" });
    }
  } else {
    res.status(400).json({ success: false, error: "Invalid signature" });
  }
};

const withdrawAmount = async (req, res) => {
  const { amount } = req.body;

  try {
    // Validate the user
    console.log("req.user",req.user);
    
    const user = await User.findById(req.user._id); // Replace with your user model
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Check if the user has sufficient balance
    if (user.demat_balance < amount) {
      return res.status(400).json({ success: false, error: "Insufficient balance" });
    }

    // Deduct the amount from the user's balance
    user.demat_balance -= amount;
    await user.save();

    // Save the transaction details
    const transaction = new Transaction({
      userId: req.user._id,
      amount,
      type: "withdrawal",
    });
    await transaction.save();

    res.json({ success: true, message: "Withdrawal successful" });
  } catch (error) {
    console.error("Error processing withdrawal:", error);
    res.status(500).json({ success: false, error: "Failed to process withdrawal" });
  }
};

module.exports = { createPayment, verifyPayment,withdrawAmount };
