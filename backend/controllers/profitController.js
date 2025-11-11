const Profit = require("../models/Profit");

// Yeni gəlir (profit) əlavə et
const addProfit = async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;

    const profit = new Profit({
      user: req.user.id,
      title,
      amount,
      category,
      date,
    });

    await profit.save();
    res.status(201).json(profit);
  } catch (error) {
    console.error("Error in addProfit:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// İstifadəçinin bütün gəlirlərini gətir
const getUserProfits = async (req, res) => {
  try {
    const profits = await Profit.find({ user: req.user.id }).sort({ date: -1 });
    res.status(200).json(profits);
  } catch (error) {
    console.error("Error in getUserProfits:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Tarixə görə gəlirləri gətir (məsələn calendar üçün)
const getProfitsByDate = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const profits = await Profit.find({
      user: req.user.id,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    });
    res.status(200).json(profits);
  } catch (error) {
    console.error("Error in getProfitsByDate:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Gəliri sil
const deleteProfit = async (req, res) => {
  try {
    const profit = await Profit.findById(req.params.id);
    if (!profit) {
      return res.status(404).json({ message: "Profit not found" });
    }

    if (profit.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await profit.deleteOne();
    res.json({ message: "Profit deleted successfully" });
  } catch (error) {
    console.error("Error in deleteProfit:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Export et
module.exports = {
  addProfit,
  getUserProfits,
  getProfitsByDate,
  deleteProfit,
};
