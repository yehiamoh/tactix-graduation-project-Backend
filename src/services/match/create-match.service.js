import { Match } from "../../models/match.model.js";
import { AppError } from "../../utils/app.error.js";
import { z } from "zod";
import { processVideoUpload } from "./upload-worker.service.js";

const matchSchema = z.object({
  userId: z.string({ required_error: "User ID is required" }),
  title: z
    .string({ required_error: "Title is required" })
    .min(2, "Title must be at least 2 characters long"),
  description: z.string().optional(),
  teamA: z
    .string({ required_error: "Team A name is required" })
    .min(2, "Team A name must be at least 2 characters long"),
  teamB: z
    .string({ required_error: "Team B name is required" })
    .min(2, "Team B name must be at least 2 characters long"),
  matchDate: z
    .string({ required_error: "Match date is required" })
    .refine((val) => !isNaN(Date.parse(val)), "Invalid date format")
    .optional(),
  fileBuffer: z.any({ required_error: "Match video file is required" }),
});

export const creatMatchService = async (
  userId,
  title,
  description,
  teamA,
  teamB,
  matchDate,
  fileBuffer
) => {
  // to rollback if DB instertion failed
  let uploadedPublicId = null;
  try {
    const parsedResult = matchSchema.safeParse({
      userId,
      title,
      description,
      teamA,
      teamB,
      matchDate,
      fileBuffer,
    });

    if (!parsedResult.success) {
      const errorMessages = parsedResult.error.issues
        .map((e) => e.message)
        .join(", ");
      throw new AppError(400, `Invalid input: ${errorMessages}`);
    }
    console.timeEnd("Validation Time");

    // Create match record immediately without video URL
    const match = await Match.create({
      userId,
      title,
      description,
      teamA,
      teamB,
      matchDate,
      uploadStatus: "pending",
    });

    // Start background upload process (don't wait for completion)
    // described as fire-and-forget.
    processVideoUpload(match._id.toString(), fileBuffer).catch((error) => {
      console.error("Background upload failed:", error);
    });
    return {
      success: true,
      message: "Match created successfully. Video upload in progress.",
      data: {
        match,
        matchId: match._id.toString(),
        uploadStatus: match.uploadStatus,
        uploadProgress: match.uploadProgress,
      },
    };
  } catch (err) {
    console.log(err);
    console.timeEnd("Total Match Creation Time");

    // delete the uploaded match if we error been occured
    if (uploadedPublicId) {
      console.log("Rolling back Cloudinary upload...");
      try {
        await deleteMatchFromCloudinary(uploadedPublicId);
        console.log("Cloudinary file deleted successfully (rollback)");
      } catch (deleteErr) {
        console.error(
          "Rollback failed: Could not delete file from Cloudinary",
          deleteErr
        );
      }
    }

    throw new AppError(500, err.message || "Match Creation failed");
  }
};
