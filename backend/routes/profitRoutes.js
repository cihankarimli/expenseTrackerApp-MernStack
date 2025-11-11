const express = require("express");
const {
  addProfit,
  getUserProfits,
  getProfitsByDate,
  deleteProfit,
} = require("../controllers/profitController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, addProfit);
router.get("/", protect, getUserProfits);
router.get("/by-date", protect, getProfitsByDate);
router.delete("/:id", protect, deleteProfit);

module.exports = router;
