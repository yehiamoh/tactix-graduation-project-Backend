import asyncHandler from "express-async-handler";
import { Match } from "../../models/match.model.js";
import { AppError } from "../../utils/app.error.js";

export const getUploadStatusController = asyncHandler(async (req, res) => {
  const { matchId } = req.params;
  const userId = req.user.userId;

  // Find match and ensure it belongs to the user
  const match = await Match.findOne({ _id: matchId, userId });

  if (!match) {
    throw new AppError(404, "Match not found");
  }

  res.status(200).json({
    success: true,
    data: {
      matchId: match._id,
      uploadStatus: match.uploadStatus,
      uploadProgress: match.uploadProgress,
      videoURL: match.videoURL,
    },
  });
});
