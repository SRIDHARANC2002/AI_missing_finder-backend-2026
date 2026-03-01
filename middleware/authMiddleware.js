import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Police from "../models/Police.js";

/* ===============================
   PROTECT MIDDLEWARE
================================ */
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user = null;

    if (decoded.role === "admin" || decoded.role === "police") {
      user = await Police.findById(decoded.id).select("-password");
    } else {
      user = await User.findById(decoded.id).select("-password");
    }

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = {
      ...user._doc,
      role: decoded.role, // 🔥 Important
    };

    next();
  } catch (error) {
    console.error("AUTH ERROR:", error.message);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

/* ===============================
   ROLE CHECK MIDDLEWARE
================================ */
export const allowAdminAndPolice = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  if (!["admin", "police"].includes(req.user.role)) {
    return res.status(403).json({ message: "Not authorized" });
  }

  next();
};

export default protect;