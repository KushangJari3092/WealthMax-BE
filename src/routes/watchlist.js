const express = require("express");
const router = express.Router();
const {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} = require("../controllers/watchlistController");
const auth = require("../middleware/auth");

// Route for getting market details of a specific symbol
router.get("/", auth, getWatchlist);
router.post("/add", auth, addToWatchlist);
router.delete("/remove", auth, removeFromWatchlist);

module.exports = router;
