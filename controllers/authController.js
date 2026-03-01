import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Police from "../models/Police.js";
import generateToken from "../utils/generateToken.js";

/* =============================
   USER REGISTER
============================= */
export const registerUser = async (req, res) => {
  try {
    console.log("REGISTER BODY:", req.body);

    const {
      fullName,
      email,
      phone,
      password,
      agreeToTerms,
    } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    if (!agreeToTerms) {
      return res.status(400).json({
        message: "You must agree to Terms and Privacy Policy",
      });
    }

    const cleanedEmail = email.trim().toLowerCase();

    const userExists = await User.findOne({ email: cleanedEmail });
    if (userExists) {
      console.log("REGISTER FAILED: Email already exists ->", cleanedEmail);
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    const user = await User.create({
      fullName: fullName.trim(),
      email: cleanedEmail,
      phone,
      password: hashedPassword,
      agreeToTerms,
      role: "user",
    });

    console.log("SUCCESS: User registered ->", user.email);

    res.status(201).json({
      message: "Account created successfully",
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};


/* =============================
   USER LOGIN
============================= */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const cleanedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanedEmail });

    if (!user) {
      console.log("LOGIN FAILED: User not found ->", cleanedEmail);
      return res.status(400).json({ message: "Invalid Email" });
    }

    console.log("LOGIN ATTEMPT: Comparing passwords for ->", cleanedEmail);
    const isMatch = await bcrypt.compare(password.trim(), user.password);
    console.log("BCRYPT RESULT:", isMatch);

    if (!isMatch) {
      console.log("LOGIN FAILED: Password mismatch for user ->", cleanedEmail);
      return res.status(400).json({ message: "Invalid Citizen Password" });
    }

    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: "user",
      token: generateToken(user._id, "user"),
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =============================
   POLICE LOGIN
============================= */
export const loginPolice = async (req, res) => {
  try {
    const { email, password } = req.body;

    const cleanedEmail = email.trim().toLowerCase();

    const police = await Police.findOne({ email: cleanedEmail });

    if (!police) {
      console.log("LOGIN FAILED: Police not found ->", cleanedEmail);
      return res.status(400).json({ message: "Invalid email" });
    }

    console.log("LOGIN ATTEMPT: Comparing police password for ->", cleanedEmail);
    const isMatch = await bcrypt.compare(password.trim(), police.password);
    console.log("BCRYPT RESULT:", isMatch);

    if (!isMatch) {
      console.log("LOGIN FAILED: Police password mismatch for ->", cleanedEmail);
      return res.status(400).json({ message: "Invalid Police Password" });
    }

    res.json({
      _id: police._id,
      policeId: police.policeId,
      stationName: police.stationName,
      email: police.email,
      role: "admin", // Explicitly set to 'admin' for frontend consistency
      token: generateToken(police._id, "admin"),
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};