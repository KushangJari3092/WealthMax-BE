const express = require("express");
const {
  login,
  signupUser,
  getUser,
  getBankDetails,
  updateUserBanks,
} = require("../controllers/userController");
const auth = require("../middleware/auth");
// const {auth}
const router = new express.Router();

router.post("/signup", signupUser);
router.post("/login", login);
router.patch("/update", auth, updateUserBanks);
router.get("/bank-details", auth, getBankDetails);
router.get("/", auth, getUser);

module.exports = router;
