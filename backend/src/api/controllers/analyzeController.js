const fs = require("fs");
const analyzeService = require("../services/analyzeService");
const Analysis = require("../models/analysisModel");

const analyze = async (req, res, next) => {
  const filePath = req.file?.path;
  try {
    const { jobDescription } = req.body;
    if (!filePath) {
      return res.status(400).json({ error: "Resume required" });
    }

    const result = await analyzeService.analyzeResume(filePath, jobDescription);

    // Save to database
    await Analysis.create({
      userId: req.user.id,
      fileName: req.file.originalname,
      jobDescription: jobDescription || "",
      matchScore: result.matchScore,
      matchLevel: result.matchLevel,
      summary: result.summary,
      fullResults: result,
    });

    res.status(200).json({
      message: "Resume analyzed successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};

const getHistory = async (req, res, next) => {
  try {
    const history = await Analysis.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      message: "History fetched successfully",
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { analyze, getHistory };
