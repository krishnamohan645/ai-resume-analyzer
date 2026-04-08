const fs = require("fs");
const analyzeService = require("../services/analyzeService");

const analyze = async (req, res, next) => {
  const filePath = req.file?.path;
  try {
    const { jobDescription } = req.body;
    if (!filePath) {
      return res.status(400).json({ error: "Resume required" });
    }

    const result = await analyzeService.analyzeResume(filePath, jobDescription);

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

module.exports = { analyze };
