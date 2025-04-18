const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const signupUser = async (req, res) => {
  try {
    const uemail = await User.findOne({ email: req.body.email });
    const upan = await User.findOne({ pan: req.body.pan });
    const accountNum = await User.findOne({ accountNum: req.body.accountNum });

    if (uemail) {
      res.status(400).send({
        success: false,
        exists: true,
        message: `email ${req.body.email} Already Registered`,
      });
    } else if (upan) {
      res.status(400).send({
        success: false,
        exists: true,
        message: `Pan number ${req.body.pan} Already Registered`,
      });
    } else if (accountNum) {
      res.status(400).send({
        success: false,
        exists: true,
        message: `Account number ${req.body.accountNum} is already linked, Please use another one`,
      });
    } else {
      const user = new User(req.body);

      user.banks.push({
        bankName: req.body.bankName,
        ifsc: req.body.ifsc,
        accountNum: req.body.accountNum,
      });
      await user.save();

      res
        .status(200)
        .send({ success: true, user, message: "Registration Successful" });
    }
  } catch (err) {
    console.log("err", err);
    res.status(400).send({ success: false, error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(400).send({ message: "User does not exist!" });
    }

    if (user && !req.body.password) {
      return res.status(200).send({ exists: true, message: "User exists" });
    }

    if (user && req.body.password) {
      const isMatch = await bcrypt.compare(req.body.password, user.password);
      if (!isMatch) {
        return res.status(400).send({ user, message: "Invalid credentials!" });
      } else {
        const token = await user.generateAuthToken();

        res.cookie("token", token, {
          maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expires in 7 days
          secure: true,
          sameSite: "None",
        });
        res.cookie("user", JSON.stringify(user), {
          maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expires in 7 days
          secure: true,
          sameSite: "None",
        });

        return res.status(200).send({
          user,
          message: "Login successful",
          loggedin: true,
          // token,
        });
      }
    }
  } catch (err) {
    res.status(500).send({ message: "Internal server error" });
  }
};
const getUser = async (req, res) => {
  try {
    return res.status(200).send({ message: "user fetched", user: req.user });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Internal server error" });
  }
};

const updateUserBanks = async (req, res) => {
  try {
    const { bankName, ifsc, accountNum, action } = req.body; // Extract bank details

    if (action === "add") {
      // Create new bank object
      const newBank = {
        bankName,
        ifsc,
        accountNum,
      };

      // Update the user's banks array by pushing the new bank object
      await User.findOneAndUpdate(
        { _id: req.user._id }, // Find user by ID
        { $push: { banks: newBank } }, // Push new bank into banks array
        { new: true, runValidators: true } // Return updated user & validate schema
      );
    }
    if (action === "delete") {
      await User.findOneAndUpdate(
        { _id: req.user._id }, // Find user by ID
        { $pull: { banks: { bankName: bankName } } }, // Push new bank into banks array
        { new: true, runValidators: true } // Return updated user & validate schema
      );
    }
    if (action === "change_primary") {
      await User.findOneAndUpdate(
        { _id: req.user._id }, // Find user by ID
        { $set: { bankName: bankName, ifsc: ifsc, accountNum: accountNum } },
        { new: true, runValidators: true } // Return updated user & validate schema
      );
    }

    return res.status(200).send({
      message: "Bank details added successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Internal server error" });
  }
};

const getBankDetails = async (req, res) => {
  // console.log("req.user", req.user);
  try {
    const user = await User.findOne({ _id: req.user.id });

    const bankDetails = {
      bankName: user.bankName,
      ifsc: user.ifsc,
      accountNum: user.accountNum,
      allBanks: user.banks,
    };

    return res.status(200).send({ message: "user fetched", bankDetails });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Internal server error" });
  }
};
module.exports = {
  signupUser,
  login,
  getUser,
  getBankDetails,
  updateUserBanks,
};
