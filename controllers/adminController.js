import Complaint from "../models/Complaint.js";
import { sendNotification } from "./notificationController.js";
import { generateEmbeddingFromUrl } from "../ai-model/faceEmbedding.js";

/* =============================
   GET ALL COMPLAINTS (ADMIN)
============================= */
export const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("user", "fullName email phone")
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    console.error("Fetch Complaints Error:", error);
    res.status(500).json({ message: "Failed to fetch complaints" });
  }
};

/* =============================
   APPROVE COMPLAINT
============================= */
export const approveComplaint = async (req, res) => {
  try {
    const { stationName, stationAddress, stationContact } = req.body;

    if (!stationName || !stationAddress) {
      return res.status(400).json({
        message: "Station name and address are required",
      });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (complaint.status !== "Pending") {
      return res.status(400).json({
        message: "Complaint already processed",
      });
    }

    if (!complaint.imageUrl) {
      return res.status(400).json({
        message: "Complaint image missing. Cannot generate embedding.",
      });
    }

    console.log("🔄 Generating embedding for:", complaint.name);

    /* 🔥 Generate embedding */
    const embedding = await generateEmbeddingFromUrl(complaint.imageUrl);

    /* 🔥 VALIDATION */
    if (
      !embedding ||
      !Array.isArray(embedding) ||
      embedding.length !== 512
    ) {
      console.error("Invalid embedding generated:", embedding?.length);
      return res.status(500).json({
        message: "Embedding generation failed or invalid format",
      });
    }

    /* 🔥 Ensure numbers only (convert if string) */
    const cleanedEmbedding = embedding.map((val) => Number(val));

    console.log("✅ Embedding length:", cleanedEmbedding.length);

    /* 🔥 Update complaint safely */
    complaint.status = "Approved";
    complaint.faceEmbedding = cleanedEmbedding;
    complaint.station = {
      name: stationName,
      address: stationAddress,
      contact: stationContact,
    };

    complaint.approvedBy = req.user?.policeId || "Unknown";
    complaint.approvedAt = new Date();

    await complaint.save();

    /* 🔔 Notify User */
    if (complaint.user) {
      await sendNotification(
        complaint.user,
        "Your complaint has been approved by the police station."
      );
    }

    res.json({
      message: "Complaint approved successfully",
      complaint,
    });

  } catch (error) {
    console.error("❌ Approval Error:", error);
    res.status(500).json({ message: "Complaint approval failed" });
  }
};

/* =============================
   MARK AS COMPLETED
============================= */
export const markCompleted = async (req, res) => {
  try {
    const { foundLocation, officerNotes } = req.body;

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (!["Approved", "Match Found"].includes(complaint.status)) {
      return res.status(400).json({
        message: "Complaint must be approved before completing",
      });
    }

    if (!foundLocation) {
      return res.status(400).json({
        message: "Found location is required",
      });
    }

    // ✅ Update status
    complaint.status = "Completed";

    // ✅ Update match details
    complaint.matchDetails = {
  ...(complaint.matchDetails || {}),
  foundLocation: foundLocation,   // ALWAYS overwrite
  verifiedBy: req.user?.policeId || "Unknown",
  verifiedAt: new Date(),
};

// Save officer notes separately in station
complaint.station = {
  ...complaint.station,
  officerNotes: officerNotes
};
    // ✅ Store officer notes separately
    complaint.officerNotes = officerNotes || "";

    // ✅ Save completion time
    complaint.completedAt = new Date();

    await complaint.save();

    // ✅ Notify user
    if (complaint.user) {
      await sendNotification(
        complaint.user,
        "Your missing person case has been marked as completed."
      );
    }

    res.json({
      message: "Case moved to completed",
      complaint,
    });

  } catch (error) {
    console.error("❌ Mark Completed Error:", error);
    res.status(500).json({ message: "Failed to complete case" });
  }
};

/* =============================
   GET COMPLETED CASES
============================= */
export const getCompletedCases = async (req, res) => {
  try {
    const completed = await Complaint.find({ status: "Completed" })
      .populate("user", "fullName email phone")
      .sort({ completedAt: -1 });

    res.json(completed);
  } catch (error) {
    console.error("❌ Fetch Completed Error:", error);
    res.status(500).json({ message: "Failed to fetch completed cases" });
  }
};