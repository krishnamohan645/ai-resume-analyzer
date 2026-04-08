const express = require("express");
const authMiddleware = require("../../middleware/authMiddleware");
const multer = require("multer");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const analyzeController = require("../controllers/analyzeController");

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: "Too many requests , please try again after an hour" },
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only pdf files are allowed"));
  },
});

router.post(
  "/",
  authMiddleware,
  limiter,
  upload.single("resume"),
  analyzeController.analyze,
);

module.exports = router;
