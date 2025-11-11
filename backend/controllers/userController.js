const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { validationResult } = require("express-validator");

// JWT token yaratmaq üçün helper function
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Register (Qeydiyyat)
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    // İstifadəçinin mövcud olub-olmadığını yoxla
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Bu email və ya username artıq mövcuddur",
      });
    }

    // Parolu hash et
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Yeni istifadəçi yarat
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // Token yarat
    const token = generateToken(newUser._id);

    res.status(201).json({
      message: "Qeydiyyat uğurla tamamlandı",
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server xətası baş verdi" });
  }
};

// Login (Giriş)
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // İstifadəçini tap
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email və ya parol yanlışdır" });
    }

    // Parolu yoxla
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Email və ya parol yanlışdır" });
    }

    // Token yarat
    const token = generateToken(user._id);

    res.json({
      message: "Giriş uğurlu oldu",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server xətası baş verdi" });
  }
};

module.exports = { register, login };
