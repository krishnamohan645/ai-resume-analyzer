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

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
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

router.get("/history", authMiddleware, analyzeController.getHistory);
router.post("/improve", authMiddleware, analyzeController.improve);

module.exports = router;
