const express = require("express");

const auth = require("../middleware/auth");
const { createPayment, verifyPayment,withdrawAmount } = require("../controllers/paymentController");
// const {auth}
const router = new express.Router();

router.post("/create-order",auth, createPayment);
router.post("/verify",auth, verifyPayment);
router.post("/withdraw",auth, withdrawAmount);


module.exports = router;
