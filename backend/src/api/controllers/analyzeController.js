const analyzeService = require("../services/analyzeService");
const Analysis = require("../models/analysisModel");

const analyze = async (req, res, next) => {
  try {
    const { jobDescription } = req.body;
    if (!req.file?.buffer) {
      return res.status(400).json({ error: "Resume required" });
    }

    const { analysis, extractedText } = await analyzeService.analyzeResume(
      req.file.buffer,
      jobDescription,
    );
console.log(req.file.buffer, "[Controller] Resume analysis completed:", analysis);
    // Save to database
    await Analysis.create({
      userId: req.user.id,
      fileName: req.file.originalname,
      jobDescription: jobDescription || "",
      matchScore: analysis.matchScore,
      matchLevel: analysis.matchLevel,
      summary: analysis.summary,
      fullResults: { ...analysis, extractedText },
    });

    res.status(200).json({
      message: "Resume analyzed successfully",
      data: { ...analysis, extractedText },
    });
  } catch (error) {
    next(error);
  }
};

const improve = async (req, res, next) => {
  try {
    const { resumeText, jobDescription } = req.body;
    if (!resumeText) {
      return res.status(400).json({ error: "Resume text required" });
    }

    const improvedContent = await analyzeService.improveResume(
      resumeText,
      jobDescription,
    );

    res.status(200).json({
      message: "Resume optimized successfully",
      data: improvedContent,
    });
  } catch (error) {
    next(error);
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

module.exports = { analyze, improve, getHistory };
