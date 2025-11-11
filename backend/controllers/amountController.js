const { request } = require("http");
const Amount = require("../models/Amount");
const mongoose = require("mongoose");

// Yeni xərc əlavə et
// Yeni xərc əlavə et
exports.createAmount = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (req.user._id.toString() !== userId)
      return res.status(403).json({ message: "Access denied" });

    const { category, amount, note, date, type } = req.body;
    if (!category || amount == null)
      return res
        .status(400)
        .json({ message: "Category and amount are required" });

    const newAmount = await Amount.create({
      user: userId,
      category,
      amount,
      note,
      date,
      type,
    });

    res.status(201).json(newAmount);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// İstifadəçinin bütün xərclərini gətir
exports.getUserAmounts = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (req.user._id.toString() !== userId)
      return res.status(403).json({ message: "Access denied" });

    const amounts = await Amount.find({ user: userId }).sort({ createdAt: -1 });
    res.json(amounts);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Statistik məlumat (ümumi xərc)
exports.getTotalSpent = async (req, res) => {
  try {
    const userId = req.params.id;
    if (req.user.id !== userId)
      return res.status(403).json({ message: "Access denied" });

    const result = await Amount.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    res.json({ total: result[0]?.total || 0 });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Kateqoriyalara görə statistik
exports.getTotalsByCategory = async (req, res) => {
  try {
    const userId = req.params.id;
    if (req.user.id !== userId)
      return res.status(403).json({ message: "Access denied" });

    const result = await Amount.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
    ]);

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
//silmek
// ...existing code...
exports.deleteAmount = async (req, res) => {
  try {
    const amountId = req.params.id || req.params.amountId;
    const userId =
      req.params.userId ||
      (req.user && req.user._id ? req.user._id.toString() : null);

    if (!amountId)
      return res.status(400).json({ message: "Amount id is required" });

    const amount = await Amount.findById(amountId);
    if (!amount) return res.status(404).json({ message: "Amount not found" });

    // Ensure the authenticated user owns the amount
    if (userId && amount.user.toString() !== userId)
      return res.status(403).json({ message: "Access denied" });

    await Amount.findByIdAndDelete(amountId);

    res.json({ message: "Amount deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
// ...existing code...
// Replace incorrect self-require export with proper export of the module.exports object

// Get daily statistics
exports.getDailyStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    const match = {
      user: new mongoose.Types.ObjectId(userId),
      date: {},
    };

    if (startDate) match.date.$gte = new Date(startDate);
    if (endDate) match.date.$lte = new Date(endDate);

    const stats = await Amount.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get monthly statistics
exports.getMonthlyStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const { year } = req.query;

    const match = {
      user: new mongoose.Types.ObjectId(userId),
    };

    if (year) {
      match.date = {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31`),
      };
    }

    const stats = await Amount.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          total: 1,
          count: 1,
        },
      },
      { $sort: { year: 1, month: 1 } },
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get category statistics with date range
exports.getCategoryStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    const match = {
      user: new mongoose.Types.ObjectId(userId),
    };

    if (startDate || endDate) {
      match.date = {};
      if (startDate) match.date.$gte = new Date(startDate);
      if (endDate) match.date.$lte = new Date(endDate);
    }

    const stats = await Amount.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
          avg: { $avg: "$amount" },
        },
      },
      {
        $project: {
          category: "$_id",
          total: 1,
          count: 1,
          avg: { $round: ["$avg", 2] },
          percentage: 1,
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Calculate percentages
    const totalAmount = stats.reduce((sum, stat) => sum + stat.total, 0);
    stats.forEach((stat) => {
      stat.percentage = Math.round((stat.total / totalAmount) * 100);
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
module.exports = {
  createAmount,
  getUserAmounts,
  getTotalSpent,
  getTotalsByCategory,
  getDailyStats,
  getMonthlyStats,
  getCategoryStats,
  deleteAmount,
} = require("../controllers/amountController");
