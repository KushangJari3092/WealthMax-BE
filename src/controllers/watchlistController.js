const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const getWatchlist = async (req, res) => {
  console.log("req.user", req.user);
};

const addToWatchlist = async (req, res) => {
  const { symbol } = req.body;
  // console.log("req", req);
  try {
    const user = await User.findOne({ _id: req.user._id });
    if (!user.watchlist.includes(symbol)) {
      user.watchlist.push(symbol);
      await user.save();
    }

    res.status(200).json({ message: `${symbol} saved to your watchlist` });
  } catch (err) {
    console.log("err", err);
  }
};

const removeFromWatchlist = async (req, res) => {
  // console.log("req.body", req.body);
  const { symbol } = req.body;
  try {
    const user = await User.findOne({ _id: req.user._id });
    user.watchlist = user.watchlist.filter((item) => item !== symbol);
    await user.save();
    res.status(200).json({ message: `${symbol} removed from watchlist` });
  } catch (err) {
    console.log("err", err);
  }
};

module.exports = { getWatchlist, addToWatchlist, removeFromWatchlist };
