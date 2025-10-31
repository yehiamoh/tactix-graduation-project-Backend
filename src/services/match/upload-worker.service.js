import { uploadMatchToCloudinary } from "../../config/match.cloudinary.config.js";
import { Match } from "../../models/match.model.js";
import { AppError } from "../../utils/app.error.js";

export const processVideoUpload = async (matchId, fileBuffer) => {
  try {
    console.time("total-upload-match-time");
    // Update status to processing
    await Match.findByIdAndUpdate(matchId, {
      uploadStatus: "processing",
      uploadProgress: 10,
    });

    console.log(`Starting background upload for match ${matchId}`);

    // Update progress to 50% before actual upload
    await Match.findByIdAndUpdate(matchId, { uploadProgress: 50 });

    // Upload video via cloudinary
    const { success, public_id, url } = await uploadMatchToCloudinary(
      fileBuffer
    );

    if (!success) {
      throw new AppError(500, "Failed to upload match video");
    }

    // Update match with video URL and mark as completed
    await Match.findByIdAndUpdate(matchId, {
      videoURL: url,
      uploadStatus: "completed",
      uploadProgress: 100,
    });

    console.log(`Upload completed successfully for match ${matchId}`);
    console.timeEnd("total-upload-match-time");
    return { success: true, url, public_id };
  } catch (error) {
    console.error(`Upload failed for match ${matchId}:`, error);

    // Update status to failed
    await Match.findByIdAndUpdate(matchId, {
      uploadStatus: "failed",
      uploadProgress: 0,
    });

    throw error;
  }
};
