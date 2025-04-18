const express = require("express");

const auth = require("../middleware/auth");
const { buyStock, sellStock } = require("../controllers/tradeController");

const router = new express.Router();


router.post("/buy", auth, buyStock);
router.post("/sell", auth, sellStock);

module.exports = router;