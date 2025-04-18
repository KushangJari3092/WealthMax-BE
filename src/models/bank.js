const mongoose = require("mongoose");

require("dotenv").config();

// const bankSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//     trim: true,
//   },

//   symbol: {
//     type: String,
//     required: true,
//     trim: true,
//     unique: true,
//   },
//   logo: {
//     type: Buffer,
//     required: true,
//   },
// });

const branchSchema = new mongoose.Schema({
  ifsc: {
    type: String,
    required: true,
    unique: true, // Assuming IFSC is unique
  },
  branchName: {
    type: String,
    required: true,
  },
  centre: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
});

// Define the Bank schema
const bankSchema = new mongoose.Schema({
  bankName: {
    type: String,
    required: true,
  },

  logo: {
    type: Buffer,
    required: true,
  },
  branches: [branchSchema], // Array of branches for each bank
});

// Create the User model
const Bank = mongoose.model("Bank", bankSchema);

module.exports = Bank;
