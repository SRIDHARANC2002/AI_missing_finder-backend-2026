import express from "express";
import multer from "multer";
import { verifyUnknownPerson }
  from "../controllers/faceRecognitionController.js";

const router = express.Router();

const upload = multer();

router.post(
  "/verify",
  upload.single("image"),
  verifyUnknownPerson
);

export default router;