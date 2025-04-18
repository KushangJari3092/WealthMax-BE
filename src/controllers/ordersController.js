const Order = require("../models/orders");

const getOrderHistory = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching order history:", error);
    res.status(500).json({ success: false, error: "Failed to fetch order history" });
  }
};

module.exports = { getOrderHistory };