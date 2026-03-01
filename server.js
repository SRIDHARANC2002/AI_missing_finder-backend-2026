import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

// Route Imports
import authRoutes from "./routes/authRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import faceRoutes from "./routes/faceRecognitionRoutes.js";

// Load Environment Variables
dotenv.config();

// Connect MongoDB
connectDB();

// Initialize Express App
const app = express();

// ============================
// CORS CONFIGURATION
// ============================

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://ai-missing-finder-frontend-2026-gfv.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

app.use(cors(corsOptions));

// ✅ Fix: Express 5 / path-to-regexp no longer accepts bare "*"
// Use a middleware-level preflight handler instead
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    return res.sendStatus(204);
  }
  next();
});

// ============================
// MIDDLEWARE
// ============================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================
// ROUTES
// ============================

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/face", faceRoutes);

// ============================
// ROOT ROUTE
// ============================

app.get("/", (req, res) => {
  res.send("AI Missing Person Finder Backend Running...");
});

// ============================
// 404 HANDLER
// ============================

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ============================
// GLOBAL ERROR HANDLER
// ============================

app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ============================
// SERVER START
// ============================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("✅ All routes and middleware loaded successfully.");
});