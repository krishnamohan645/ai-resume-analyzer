const { PDFParse } = require("pdf-parse");
const fs = require("fs");
// const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const extractPdfText = async (filePath) => {
  const buffer = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: buffer });
  const data = await parser.getText();
  await parser.destroy();
  return data.text;
};

const analyzeResume = async (filePath, jobDescription) => {
  const resumeFile = await extractPdfText(filePath);
  // const models = [
  //   // "gemini-2.5-flash", // primary
  //   // "gemini-2.5-flash-lite", // fallback 1
  //   "gemini-2.0-flash", // fallback 2 (optional)
  // ];

  // const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
You are an elite ATS (Applicant Tracking System) specialist and senior technical recruiter with 15+ years of experience hiring software engineers at top tech companies.

Your job is to perform a deep, brutally honest analysis of the candidate's resume.

${
  jobDescription
    ? `The candidate is applying for a specific role. Analyze the resume against the job description provided.`
    : `No job description was provided. Perform a general resume audit — evaluate the resume on its own merit, structure, impact, clarity, and presentation.`
}

ANALYSIS RULES:
- Be specific, not generic. Reference actual content from the resume.
- Missing keywords must be real skills/tools ${jobDescription ? "from the JD that are completely absent in the resume" : "that are commonly expected for a developer at this experience level but missing from the resume"}.
- Weak bullets are bullets that have no metric, no impact, no strong action verb, or are too vague.
- Rewrite suggestions must be dramatically better — add numbers, impact, and strong action verbs like "Engineered", "Architected", "Reduced", "Increased", "Automated", "Optimized".
- Match score must be calculated based on: ${
    jobDescription
      ? "skill overlap (40%), experience relevance (30%), keyword density (20%), overall presentation (10%)"
      : "impact of bullets (30%), clarity and structure (25%), keyword strength (25%), overall presentation (20%)"
  }.
- Summary must be direct and honest — like a senior recruiter giving real feedback, not sugarcoated.

SCORING GUIDE:
- 80-100: ${jobDescription ? "Strong match, call immediately" : "Excellent resume, ready to apply"}
- 60-79: ${jobDescription ? "Good match, worth interviewing" : "Good resume, minor improvements needed"}
- 40-59: ${jobDescription ? "Partial match, missing key skills" : "Average resume, needs significant improvement"}
- 20-39: ${jobDescription ? "Weak match, significant gaps" : "Weak resume, major rework needed"}
- 0-19: ${jobDescription ? "Poor match, wrong profile entirely" : "Poor resume, rebuild from scratch"}

Resume:
${resumeFile}

${jobDescription ? `Job Description:\n${jobDescription}` : "No job description provided — perform general resume audit."}

Return ONLY this exact JSON. No markdown. No backticks. No explanation. Just raw JSON:
{
  "matchScore": <number 0-100>,
  "matchLevel": "<one of: ${jobDescription ? "Strong Match | Good Match | Partial Match | Weak Match | Poor Match" : "Excellent | Good | Average | Weak | Poor"}>",
  "missingKeywords": [
    {
      "keyword": "<skill or tool name>",
      "importance": "<Critical | Important | Nice to have>"
    }
  ],
  "weakBullets": [
    {
      "bullet": "<exact weak bullet from resume>",
      "reason": "<why it is weak>"
    }
  ],
  "rewriteSuggestions": [
    {
      "original": "<original weak bullet>",
      "improved": "<dramatically stronger rewritten version>"
    }
  ],
  "topStrengths": [<array of 3 strings — what the candidate does well ${jobDescription ? "relative to this JD" : "in general"}>],
  "criticalGaps": [<array of 3 strings — the biggest gaps that could get them rejected>],
  "summary": "<3-4 sentence brutally honest verdict — mention specific skills, experience level, and one clear recommendation>"
}`;

  // const generateWithFallback = async (prompt) => {
  //   let lastError;

  //   for (let i = 0; i < models.length; i++) {
  //     const modelName = models[i];
  //     const model = genAI.getGenerativeModel({ model: modelName });

  //     try {
  //       console.log(`Trying model: ${modelName}`);
  //       const result = await model.generateContent(prompt);
  //       return result.response.text();
  //     } catch (err) {
  //       console.log(`❌ Failed: ${modelName}`);
  //       lastError = err;
  //       if (err.status === 503) {
  //         console.log("Retrying same model...");
  //         await delay(2000);

  //         try {
  //           const retryResult = await model.generateContent(prompt);
  //           return retryResult.response.text();
  //         } catch (retryErr) {
  //           lastError = retryErr;
  //         }
  //       }
  //       console.log("Switching to next model...");
  //     }
  //   }

  //   throw lastError;
  // };
  // const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  // // const result = await model.generateContent(prompt);
  // const text = await generateWithFallback(prompt);

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.3,
  });

  const text = completion.choices[0].message.content;

  let clean = text
    .replace(/```json|```/g, "")
    .replace(/[\x00-\x1F\x7F]/g, " ")
    .trim();

  const jsonStart = clean.indexOf("{");
  const jsonEnd = clean.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error("No valid JSON found in Gemini response");
  }
  clean = clean.slice(jsonStart, jsonEnd + 1);

  return {
    analysis: JSON.parse(clean),
    extractedText: resumeFile,
  };
};

const improveResume = async (resumeText, jobDescription) => {
  const prompt = `
You are a top-tier executive resume writer. Your task is to rewrite the provided resume to be high-impact, results-oriented, and keyword-optimized.

${jobDescription ? `TARGET JOB DESCRIPTION:\n${jobDescription}\n\n` : "Goal: General resume optimization for clarity, impact, and professional tone."}

ORIGINAL RESUME CONTENT:
${resumeText}

DIRECTIONS:
1. Preserve the factual accuracy of the resume.
2. Transform all job responsibilities into high-impact achievement statements (using the X-Y-Z formula: Accomplished [X] as measured by [Y], by doing [Z]).
3. Use strong action verbs (Engineered, Spearheaded, Orchestrated, Optimized).
4. For professional summaries, create a punchy 3-sentance narrative.
5. If a JD is provided, prioritize and highlight skills and keywords that match the JD.
6. The output should be formatted as clean Markdown.

Structure the response with high-level headers (Summary, Experience, Skills, Education).
Do not include any header or footer text — return only the rewritten resume content.
`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.5,
  });

  return completion.choices[0].message.content;
};

module.exports = { analyzeResume, improveResume };
