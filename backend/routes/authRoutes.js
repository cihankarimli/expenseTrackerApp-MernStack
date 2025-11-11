const auth = require("../middleware/auth");

// Qorunan route - istifadəçi profili
const getProfile = async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server xətası" });
  }
};

// Route əlavə edin
router.get("/profile", auth, getProfile);
