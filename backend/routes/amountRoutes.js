// ...existing code...
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");

const {
  createAmount,
  getUserAmounts,
  getDailyStats,
  getMonthlyStats,
  getCategoryStats,
  deleteAmount,
} = require("../controllers/amountController");

// If routes are mounted at app.use("/amounts", amountRoutes)
// use relative paths here so final DELETE is /amounts/:id
router.post("/users/:userId/amounts", authMiddleware, createAmount);
router.get("/users/:userId/amounts", authMiddleware, getUserAmounts);
// changed from "/amounts/:id" to "/:id"
router.delete("/:id", authMiddleware, deleteAmount);
router.get("/users/:userId/stats/monthly", authMiddleware, getMonthlyStats);
router.get("/users/:userId/stats/category", authMiddleware, getCategoryStats);
router.get("/users/:userId/stats/daily", authMiddleware, getDailyStats);
module.exports = router;
