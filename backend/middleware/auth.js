const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    // Token-i header-dən al
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ message: "Token tapılmadı, giriş rədd edildi" });
    }

    // Token-i yoxla
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // İstifadəçini tap
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "İstifadəçi tapılmadı" });
    }

    // req obyektinə user məlumatını əlavə et
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware xətası:", error.message);
    res.status(401).json({ message: "Token etibarsızdır" });
  }
};

module.exports = auth;
module.exports.protect = auth;
