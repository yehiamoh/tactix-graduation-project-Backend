// src/config/multer.match.config.js
import multer from "multer";
import { AppError } from "../utils/app.error.js";

// Use memory storage (keeps file in RAM for Cloudinary upload)
const storage = multer.memoryStorage();

// Accept only video or image files
const matchFileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("video/") ||
    file.mimetype.startsWith("image/")
  ) {
    cb(null, true);
  } else {
    cb(new AppError(400, "Only video or image files are allowed for matches"));
  }
};

// Export Multer instance for match uploads
export const uploadMatchFile = multer({
  storage,
  fileFilter: matchFileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // max 500MB for videos
    files: 1,
  },
});
