import express from "express";
import { registerController } from "../controllers/auth/register.controller.js";
import { verifyEmailController } from "../controllers/auth/verifyEmail.controller.js";
import { loginController } from "../controllers/auth/login.controller.js";
import { uploadProfilePicture } from "../config/multer.config.js";
const authRouter = express.Router();

// Public routes
authRouter.post(
  "/register",
  uploadProfilePicture.single("image"),
  registerController
);
authRouter.get("/verify", verifyEmailController);
// Remove login validation temporarly
authRouter.post("/login", loginController);

export default authRouter;
