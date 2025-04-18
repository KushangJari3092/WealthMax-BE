const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Define the User schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  pan: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  bankName: {
    type: String,
    required: true,
    trim: true,
  },
  accountNum: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  ifsc: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    // required: true,
    // minlength: 6,
  },
  pin: {
    type: Number,
    // required: true,
    minlength: 4,
    maxlength: 4,
  },
  role: {
    type: String,
    enum: ["admin", "user"], // Allowed values are 'admin' or 'user'
    default: "user", // Default role is 'user'
    required: true,
  },
  demat_balance: {
    type: Number,
    default: 0,
  },
  stocks: [
    {
      symbol: String,
      quantity: Number,
      price: Number,
    },
  ],
  watchlist: [
    {
      type: String, // Symbol of the stock, e.g., "BTCUSDT"
      trim: true,
    },
  ],
  banks: [
    {
      bankName: { type: String, trim: true, required: true },
      ifsc: { type: String, trim: true, required: true },
      accountNum: { type: String, trim: true, required: true },
    },
  ],
});

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.pin;
  delete userObject.AccountNum;
  delete userObject.ifsc;
  // delete userObject.bankName;

  return userObject;
};

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.SECRET);

  return token;
};

// middleware => hash the pswd
userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  console.log("user.password ", user.password);
  next();
});

// Create the User model
const User = mongoose.model("User", userSchema);

module.exports = User;
