// src/config/cloudinary.match.config.js
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload match file (supports both video and image)
export const uploadMatchToCloudinary = async (
  fileBuffer,
  resourceType = "video"
) => {
  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "tactix-match", // folder for all match uploads
          resource_type: resourceType, // auto-detects type (image/video)
          // Performance optimizations for video uploads
          format: resourceType === "video" ? "mp4" : undefined,
          // Use lower quality for faster uploads
          quality: resourceType === "video" ? "auto:good" : undefined,
          // Reduce video size significantly
          video_codec: resourceType === "video" ? "h264" : undefined,
          // Lower bitrate for faster processing
          bit_rate: resourceType === "video" ? "500k" : undefined, // 500kbps instead of default ~2-5Mbps
          // Disable eager transformations to speed up initial upload
          eager: [], // Remove eager transformations that slow down upload
          // Add upload optimizations
          chunk_size: 6000000, // 6MB chunks for better streaming
          // Set reasonable timeout
          timeout: 120000, // 2 minutes max (reduced from 5)
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(fileBuffer);
    });

    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error("Cloudinary match upload error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Delete match file by public_id
export const deleteMatchFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "video", // or "image" depending on your usage
    });
    return { success: true, result };
  } catch (error) {
    console.error("Cloudinary match delete error:", error);
    return { success: false, error: error.message };
  }
};

export default cloudinary;
