const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Create function for dynamic multer configuration
const createUpload = (uploadPath, allowedTypes, errorMessage) => {
  // Storage configuration
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, uniqueSuffix);
    }
  });

  // File filter
  const fileFilter = (req, file, cb) => {
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error(errorMessage));
  };

  // File size limit (in bytes)
  const limits = {
    fileSize: 1024 * 1024 * 5 // 5 MB
  };

  return multer({
    storage,
    fileFilter,
    limits
  });
};

module.exports = createUpload;