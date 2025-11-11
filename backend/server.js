require("dotenv").config(); // ✅ Bu sətr ən üstdə olmalıdır

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Debug: Environment variables yoxla
console.log("🔧 Environment variables check:");
console.log(
  "MONGODB_URI:",
  process.env.MONGODB_URI ? "✅ Mövcud" : "❌ Yoxdur"
);
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✅ Mövcud" : "❌ Yoxdur");
console.log("PORT:", process.env.PORT || "Default: 5000");

// CORS konfiqurasiyası - daha detallı
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parser middleware (moved up so logger can access req.body)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger əlavə edin
app.use((req, res, next) => {
  console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log("📦 Request body:", req.body);
  }
  next();
});

// MongoDB bağlantısı - error handling yaxşılaşdırın
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/dynamex_db", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB-yə bağlantı uğurlu!");
    console.log("📊 Database:", mongoose.connection.name);
  })
  .catch((error) => {
    console.error("❌ MongoDB bağlantı xətası:", error.message);
    console.log("⚠️ MongoDB olmadan davam edirik (auth işləməyəcək)");
    // process.exit(1); - Bu sətri comment edin ki server işləməyə davam etsin
  });

// Routes
const authRoutes = require("./routes/user");
const amountRoutes = require("./routes/amountRoutes");
const profitRoutes = require("./routes/profitRoutes");
app.use("/profits", profitRoutes);

app.use("/auth", authRoutes);
app.use("/amounts", amountRoutes);
// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Expense Tracker API",
    version: "1.0.0",
    environment: {
      mongodb:
        mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
      jwt_secret: process.env.JWT_SECRET ? "Configured" : "Missing",
    },
    endpoints: {
      auth: "/auth",
      amounts: "/amounts",
      profits: "/profits",
    },
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint tapılmadı",
    path: req.originalUrl,
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error("Server xətası:", error);
  res.status(500).json({
    success: false,
    error: "Server xətası",
    message:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Daxili server xətası",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT} portunda işləyir`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
});

module.exports = app;
