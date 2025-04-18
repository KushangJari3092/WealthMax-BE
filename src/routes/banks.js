const express = require("express");
const multer = require("multer");
const {
  addBank,
  getBanks,
  getBranchDetails,
  getBankbyId,
} = require("../controllers/bankController");
const auth = require("../middleware/auth");

// const storage = multer.memoryStorage();
const upload = multer();

const router = new express.Router();

router.patch("/add-bank", auth, upload.single("logo"), addBank);
router.get("/get-banks", getBanks);
router.get("/get-bank", auth, getBankbyId);
router.get("/get-branch-details", getBranchDetails);

module.exports = router;
