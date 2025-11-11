const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  register,
  login,
  getCurrentUser,
} = require("../controllers/authController");

// Validation middleware
const registerValidation = [
  body("username")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters"),
  body("email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please enter a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

const loginValidation = [
  body("email").trim().isEmail().normalizeEmail(),
  body("password").notEmpty(),
];

// Routes
router.get("/", (_, res) => {
  res.json({
    message: "Auth routes working",
    endpoints: {
      register: "POST /auth/register",
      login: "POST /auth/login",
      me: "GET /auth/me",
    },
  });
});

router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.get("/me", getCurrentUser);

module.exports = router;
