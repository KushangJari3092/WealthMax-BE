const express = require("express");
const auth = require("../middleware/auth");
const { getOrderHistory } = require("../controllers/ordersController");
const router = express.Router();

router.get("/history", auth, getOrderHistory);

module.exports = router;