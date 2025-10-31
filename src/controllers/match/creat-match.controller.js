import asyncHandler from "express-async-handler";
import { creatMatchService } from "../../services/match/create-match.service.js";
import { AppError } from "../../utils/app.error.js";
export const creatMatchController = asyncHandler(async (req, res) => {
  // get user ID from auth middleware
  const userId = req.user.userId;

  let { title, description, teamA, teamB, matchDate } = req.body;

  //if (!matchDate) matchDate = Date.now().toString();
  if (!req.file) throw new AppError(400, "Match video file is required");

  console.time("Total Request Time");

  const result = await creatMatchService(
    userId,
    title,
    description,
    teamA,
    teamB,
    matchDate,
    req.file.buffer
  );

  console.timeEnd("Total Request Time");
  res.status(201).json(result);
});
