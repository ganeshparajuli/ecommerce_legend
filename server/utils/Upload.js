const multer = require("multer");
const path = require("path");

// UPDATED Multer storage setup with unique filenames
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    // Add random number to ensure unique filenames even with same timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// Check file type function (your existing one is fine)
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif|webp/; // Added webp
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}

// Initialize upload with common configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
});

module.exports = upload;
