import Complaint from "../models/Complaint.js";
import { generateEmbedding } from "../ai-model/faceEmbedding.js";
import { findBestMatch } from "../ai-model/compareFaces.js";

/* ==========================================
   VERIFY UNKNOWN PERSON
========================================== */
export const verifyUnknownPerson = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        message: "Image required",
      });
    }

    /* ======================================================
       🔒 ALLOW VERIFICATION ONLY IF STATION ASSIGNED
    ====================================================== */

    const complaints = await Complaint.find({
      status: { $in: ["Approved", "Match Found", "Completed"] },                            // Only approved cases
      station: { $exists: true, $ne: null },   // Station must be assigned
      faceEmbedding: { $exists: true, $ne: [] },       // Must have embedding
    });

    if (!complaints.length) {
      return res.status(403).json({
        match: false,
        message: "Verification not allowed without station assignment.",
      });
    }

    /* ======================================================
       1️⃣ Generate Face Embedding
    ====================================================== */

    const unknownEmbedding = await generateEmbedding(req.file.buffer);

    if (!unknownEmbedding || unknownEmbedding.length !== 512) {
      return res.status(422).json({
        message: "Invalid embedding generated",
      });
    }

    /* ======================================================
       2️⃣ Find Best Match
    ====================================================== */

    const { bestMatch, similarity, accuracy } =
      findBestMatch(unknownEmbedding, complaints);

    const MATCH_THRESHOLD = 0.65;

    if (!bestMatch) {
      return res.json({
        match: false,
        accuracy: "0.00",
        similarity: 0,
        message: "No match found",
      });
    }

    if (similarity < MATCH_THRESHOLD) {
      return res.json({
        match: false,
        accuracy,
        similarity,
        message: "Match found but below confidence threshold",
      });
    }

    /* ======================================================
       3️⃣ Confidence Level Calculation
    ====================================================== */

    let confidenceLevel = "Low";

    if (similarity >= 0.85) {
      confidenceLevel = "Very High";
    } else if (similarity >= 0.75) {
      confidenceLevel = "High";
    } else if (similarity >= 0.65) {
      confidenceLevel = "Medium";
    }

    /* ======================================================
       4️⃣ Update Complaint
    ====================================================== */

    if (bestMatch.status !== "Completed") {
  bestMatch.status = "Match Found";
}

    bestMatch.matchDetails = {
      similarity,
      accuracy,
      confidenceLevel,
      verifiedBy: req.user?.policeId || "AI System",
      verifiedAt: new Date(),
      foundLocation: "Verification Portal",
    };

    await bestMatch.save();

    /* ======================================================
       5️⃣ Return Match Response
    ====================================================== */

    return res.json({
      match: true,
      accuracy,
      similarity,
      confidenceLevel,
      complaint: {
        _id: bestMatch._id,
        name: bestMatch.name,
        gender: bestMatch.gender,
        dob: bestMatch.dob,
        address: bestMatch.address,
        contactNumber: bestMatch.contactNumber,
        imageUrl: bestMatch.imageUrl,
        station: bestMatch.station,
        matchDetails: bestMatch.matchDetails,
      },
      message: "Match verified successfully",
    });

  } catch (error) {
    console.error("Verification Error:", error);

    return res.status(500).json({
      match: false,
      message: "Verification failed",
      error: error.message,
    });
  }
};