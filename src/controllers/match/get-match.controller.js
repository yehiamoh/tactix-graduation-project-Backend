import asyncHandler from "express-async-handler";
import {
  getMatchService,
  getMatchesService,
} from "../../services/match/get-match.service.js";

export const getMatchController = asyncHandler(async (req, res) => {
  const { matchId } = req.params;
  const userId = req.user.userId;
  const result = await getMatchService(matchId, userId);

  res.status(200).json(result);
});

export const getMatchesController = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const result = await getMatchesService(userId, page, limit);

  res.status(200).json(result);
});
