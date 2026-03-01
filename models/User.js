import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },


    email: {
      type: String,
      required: true,
      unique: true,
    },

    phone: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
    },

    agreeToTerms: {
      type: Boolean,
      required: true,
    },

    role: {
      type: String,
      default: "user",
    },
  },
  { timestamps: true }
);



export default mongoose.model("User", userSchema);