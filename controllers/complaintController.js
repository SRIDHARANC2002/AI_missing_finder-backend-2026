import Complaint from "../models/Complaint.js";
import { uploadToCloudinary } from "../services/cloudinaryService.js";
import { generateEmbedding } from "../ai-model/faceEmbedding.js";
import { cosineSimilarity } from "../ai-model/compareFaces.js";

/* =====================================================
   CREATE COMPLAINT (USER)
===================================================== */
export const createComplaint = async (req, res) => {
  try {
    const {
      name,
      gender,
      dob,
      education,
      missingTime,
      address,
      contactNumber,
    } = req.body;

    if (!req.user) {
      return res.status(401).json({
        message: "User not authorized",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Image is required",
      });
    }

    console.log("📤 Uploading image to Cloudinary...");

    // 1️⃣ Upload image
    const uploadedImage = await uploadToCloudinary(req.file.buffer);

    console.log("🤖 Generating embedding...");

    // 2️⃣ Generate 512 embedding
    let faceEmbedding = [];

    try {
      faceEmbedding = await generateEmbedding(req.file.buffer);

      if (!faceEmbedding || faceEmbedding.length !== 512) {
        throw new Error("Invalid embedding length");
      }

      console.log("✅ Embedding generated");

    } catch (embError) {
      const status = embError.response?.status || 500;
      const message =
        embError.response?.data?.detail ||
        embError.message ||
        "AI service failed";

      console.error("❌ Embedding Error:", message);

      return res.status(status).json({
        message,
      });
    }

    // 3️⃣ Save complaint
    const complaint = await Complaint.create({
      user: req.user._id,
      imageUrl: uploadedImage.secure_url,
      faceEmbedding,
      name,
      gender,
      dob,
      education,
      missingTime,
      address,
      contactNumber,
      status: "Pending",
    });

    return res.status(201).json({
      message: "Complaint created successfully",
      complaint,
    });

  } catch (error) {
    console.error("❌ Complaint Creation Error:", error);
    return res.status(500).json({
      message: error.message,
    });
  }
};


/* =====================================================
   GET USER COMPLAINTS
===================================================== */
export const getUserComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    return res.json(complaints);

  } catch (error) {
    console.error("❌ Fetch Error:", error);
    return res.status(500).json({
      message: error.message,
    });
  }
};


/* =====================================================
   VERIFY COMPLAINT IMAGE
===================================================== */
export const verifyComplaintImage = async (req, res) => {
  try {
    const { complaintId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        message: "Verification image required",
      });
    }

    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    if (!complaint.faceEmbedding || complaint.faceEmbedding.length !== 512) {
      return res.status(400).json({
        message: "Stored embedding not available",
      });
    }

    console.log("🤖 Generating embedding for verification image...");

    let unknownEmbedding;

    try {
      unknownEmbedding = await generateEmbedding(req.file.buffer);

      if (!unknownEmbedding || unknownEmbedding.length !== 512) {
        throw new Error("Invalid embedding generated");
      }

    } catch (embError) {
      const status = embError.response?.status || 500;
      const message =
        embError.response?.data?.detail ||
        embError.message ||
        "AI verification failed";

      console.error("❌ Verification Embedding Error:", message);

      return res.status(status).json({
        message,
      });
    }

    const similarity = cosineSimilarity(
      unknownEmbedding,
      complaint.faceEmbedding
    );

    const MATCH_THRESHOLD = 0.65;

    const match = similarity >= MATCH_THRESHOLD;

    let confidenceLevel = "Low";

    if (similarity >= 0.85) confidenceLevel = "Very High";
    else if (similarity >= 0.75) confidenceLevel = "High";
    else if (similarity >= 0.65) confidenceLevel = "Medium";

    return res.json({
      match,
      similarity: parseFloat((similarity * 100).toFixed(2)),
      confidenceLevel,
    });

  } catch (error) {
    console.error("❌ Verification Error:", error);
    return res.status(500).json({
      message: error.message,
    });
  }
};