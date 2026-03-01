import express from "express";
import protect from "../middleware/authMiddleware.js";
import { isUser } from "../middleware/roleMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

import {
  createComplaint,
  getUserComplaints,
  verifyComplaintImage,
} from "../controllers/complaintController.js";

const router = express.Router();

/* ===============================
   CREATE COMPLAINT
================================ */
router.post(
  "/",
  protect,
  isUser,
  upload.single("image"),
  createComplaint
);

/* ===============================
   GET USER COMPLAINTS
================================ */
router.get(
  "/",
  protect,
  isUser,
  getUserComplaints
);

/* ===============================
   VERIFY COMPLAINT IMAGE
================================ */
router.post(
  "/verify/:complaintId",
  protect,
  upload.single("image"),
  verifyComplaintImage
);

export default router;