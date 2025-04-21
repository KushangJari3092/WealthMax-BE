const express = require("express");

const auth = require("../middleware/auth");
const { getAllTransactions, getAllOrders } = require("../controllers/reportsController");
const { sendEmail } = require("../controllers/emailController");

const router = new express.Router();


router.get("/getAllTransactions", auth, getAllTransactions);
router.get("/getAllOrders", auth, getAllOrders);
router.post("/send-email", auth, sendEmail);

module.exports = router;