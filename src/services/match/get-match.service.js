import { Match } from "../../models/match.model.js";
import { AppError } from "../../utils/app.error.js";

export const getMatchService = async (matchId, userId) => {
  const match = await Match.findOne({ _id: matchId, userId });

  if (!match) {
    throw new AppError(404, "Match not found");
  }

  // If video is required for editing/analysis, check upload status
  if (match.uploadStatus !== "completed") {
    throw new AppError(
      409,
      `Video upload not complete. Status: ${match.uploadStatus}, Progress: ${match.uploadProgress}%`
    );
  }

  return {
    success: true,
    data: match,
  };
};

export const getMatchesService = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  // pagination
  const matches = await Match.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("tags");

  const total = await Match.countDocuments({ userId });

  return {
    success: true,
    data: {
      matches,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalMatches: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    },
  };
};
