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
// ✅ CORS CONFIGURATION
// ============================

const allowedOrigins = [
  "http://localhost:5173",
  "https://ai-missing-finder-frontend-2026-gfv.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
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