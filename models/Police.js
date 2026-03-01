import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const policeSchema = new mongoose.Schema(
  {
    policeId: { type: String, unique: true },
    username: String,
    email: { type: String, unique: true },
    password: String,
    stationName: String,
    stationAddress: String,
    role: { type: String, default: "admin" },
  },
  { timestamps: true }
);



export default mongoose.model("Police", policeSchema);