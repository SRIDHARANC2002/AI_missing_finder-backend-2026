import express from "express";
import protect from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/roleMiddleware.js";
import {
  getAllComplaints,
  approveComplaint,
  markCompleted,
  getCompletedCases,
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/complaints", protect, isAdmin, getAllComplaints);

router.put("/approve/:id", protect, isAdmin, approveComplaint);

router.put("/complete/:id", protect, isAdmin, markCompleted);

router.get("/completed", protect, isAdmin, getCompletedCases);


export default router;
