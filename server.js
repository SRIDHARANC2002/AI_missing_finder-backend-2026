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

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "https://ai-missing-finder-frontend-2026.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/face", faceRoutes);

// Root Test Route
app.get("/", (req, res) => {
  res.send("AI Missing Person Finder Backend Running...");
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Server Listen
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("All routes and middleware loaded successfully.");
});