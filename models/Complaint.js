import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    imageUrl: {
      type: String,
      required: true,
    },

    // 🔥 VERY IMPORTANT
    faceEmbedding: {
      type: [Number],
      required: true,
    },

    name: { type: String, required: true },
    gender: { type: String, required: true },
    dob: { type: Date, required: true },
    education: String,
    missingDate: Date,
    missingTime: { type: String, required: true },
    address: { type: String, required: true },
    contactNumber: { type: String, required: true },

   status: {
  type: String,
  enum: ["Pending", "Approved", "Match Found", "Completed", "Rejected"],
  default: "Pending",
},

// ✅ STATION SHOULD BE OUTSIDE STATUS
station: {
  name: { type: String, default: null },
  address: { type: String, default: null },
  contact: { type: String, default: null },
},

    // matchDetails: {
    //   similarity: Number,
    //   verifiedBy: String,
    //   verifiedAt: Date,
    //   foundLocation: String,
    //   officerNotes: String,
    // },
    // ✅ Full match details
    matchDetails: {
      similarity: Number,
      accuracy: Number,
      confidenceLevel: String,
      verifiedBy: String,
      verifiedAt: Date,
      foundLocation: String,
      officerNotes: String,
    },
 // 🔥 ADD THIS
   officerNotes: {
      type: String,
      default: "",
   },

   approvedBy: String,
   approvedAt: Date,
}, { timestamps: true });

export default mongoose.model("Complaint", complaintSchema);