const jwt = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config();

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.token; // Get the token from cookies
    console.log("token---------------",token);
    
    if (!token) {
      throw new Error("Token is missing.");
    }

    const decoded = jwt.verify(token, process.env.SECRET);
    // console.log("decoded", decoded);
    const user = await User.findOne({
      _id: decoded._id,
    });
    // console.log("user", user);
    if (!user) {
      throw new Error("User not found.");
    }

    req.user = user;
    next();
  } catch (e) {
    console.log("e", e);
    res.status(401).send({ error: "Please authenticate." });
  }
};

module.exports = auth;
