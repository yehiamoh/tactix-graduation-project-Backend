import express from "express";
import { creatMatchController } from "../controllers/match/creat-match.controller.js";
import {
  getMatchController,
  getMatchesController,
} from "../controllers/match/get-match.controller.js";
import { getUploadStatusController } from "../controllers/match/get-upload-status.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { uploadMatchFile } from "../config/multer.match.config.js";
const matchRouter = express.Router();

// create match and make an backgorund for file upload
matchRouter.post(
  "/",
  authMiddleware,
  uploadMatchFile.single("video"),
  creatMatchController
);

// Get all matches for a user
matchRouter.get("/", authMiddleware, getMatchesController);

// Get single match
matchRouter.get("/:matchId", authMiddleware, getMatchController);

// Get upload status for a match
matchRouter.get(
  "/:matchId/upload-status",
  authMiddleware,
  getUploadStatusController
);

export default matchRouter;
