const express = require("express");

const auth = require("../middleware/auth");
const { getAllTransactions, getAllOrders } = require("../controllers/reportsController");

const router = new express.Router();


router.get("/getAllTransactions", auth, getAllTransactions);
router.get("/getAllOrders", auth, getAllOrders);

module.exports = router;