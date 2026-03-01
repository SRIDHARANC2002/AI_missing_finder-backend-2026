import express from "express";
import {
  registerUser,
  loginUser,
  loginPolice,
} from "../controllers/authController.js";

const router = express.Router();

/* USER */
router.post("/register", registerUser);
router.post("/login", loginUser);

/* POLICE */
router.post("/police/login", loginPolice);
router.post("/police-login", loginPolice);
export default router;