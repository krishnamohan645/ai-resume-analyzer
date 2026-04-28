const { PDFParse } = require("pdf-parse");
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");
const path = require("path");

// Initialize Clients
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const extractPdfText = async (buffer) => {
  const parser = new PDFParse({ data: buffer });
  const data = await parser.getText();
  await parser.destroy();
  return data.text;
};

// Fallback Model Configurations
const MODELS = [
  { provider: "groq", name: "llama-3.3-70b-versatile" },
  { provider: "groq", name: "mixtral-8x7b-32768" },
  { provider: "google", name: "gemini-1.5-flash" },
  { provider: "groq", name: "llama-3.1-8b-instant" },
];

const callAIWithFallback = async (prompt) => {
  let lastError;

  for (const model of MODELS) {
    try {
      console.log(`[AI] Attempting with ${model.provider}:${model.name}...`);
      
      if (model.provider === "groq") {
        const completion = await groq.chat.completions.create({
          model: model.name,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
        });
        const content = completion.choices[0].message.content;
        console.log(`[AI] ✅ Success with Groq:${model.name}`);
        return content;
      } 
      
      if (model.provider === "google") {
        const geminiModel = genAI.getGenerativeModel({ model: model.name });
        const result = await geminiModel.generateContent(prompt);
        const content = result.response.text();
        console.log(`[AI] ✅ Success with Google:${model.name}`);
        return content;
      }
    } catch (err) {
      console.error(`[AI] ❌ Failed with ${model.provider}:${model.name}:`, err.message);
      lastError = err;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  throw new Error(`All AI models failed. Last error: ${lastError?.message}`);
};

// RAG-lite: Retrieve expert context from knowledge base
const retrieveExpertContext = (resumeText) => {
  try {
    const knowledgePath = path.join(__dirname, "../data/knowledge.json");
    const knowledge = JSON.parse(fs.readFileSync(knowledgePath, "utf-8"));
    const text = resumeText.toLowerCase();

    // Find first matching industry
    const matchedIndustry = knowledge.industries.find(ind => 
      ind.triggers.some(trigger => text.includes(trigger))
    );

    if (matchedIndustry) {
      console.log(`[RAG-lite] 🧠 Context retrieved for: ${matchedIndustry.id}`);
      return `
Expert Context: This resume appears to be for a candidate in the ${matchedIndustry.id.replace("_", " ")} industry.
Gold Standard Guidelines: ${matchedIndustry.guidelines}
Must-have Keywords: ${matchedIndustry.keywords.join(", ")}
      `;
    }

    return `Expert Context: ${knowledge.general.guidelines}`;
  } catch (err) {
    console.warn("[RAG-lite] ⚠️ Failure retrieving context:", err.message);
    return "";
  }
};

const analyzeResume = async (fileBuffer, jobDescription) => {
  console.log("[Analyze] Starting resume analysis...", jobDescription);
  const resumeFile = await extractPdfText(fileBuffer);
  const expertContext = retrieveExpertContext(resumeFile);

  const prompt = `
You are an elite ATS (Applicant Tracking System) specialist and senior technical recruiter.
Your job is to perform a deep, brutally honest analysis of the candidate's resume.

${expertContext}

${
  jobDescription
    ? `The candidate is applying for a specific role. Analyze the resume against the job description provided.`
    : `No job description was provided. Perform a general resume audit.`
}

ANALYSIS RULES:
- Be specific, reference actual content from the resume.
- Weak bullets are bullets that have no metric, no impact, or no strong action verb.
- Rewrite suggestions must be dramatically better (using X-Y-Z formula).

Resume:
${resumeFile}

${jobDescription ? `Job Description:\n${jobDescription}` : "No job description provided."}

Return ONLY this exact JSON format. No markdown, no backticks, no text before or after JSON:
{
  "matchScore": <number 0-100>,
  "matchLevel": "<one of: Strong Match | Good Match | Partial Match | Weak Match | Poor Match>",
  "missingKeywords": [{"keyword": "name", "importance": "Critical|Important|Nice"}],
  "weakBullets": [{"bullet": "original", "reason": "why"}],
  "rewriteSuggestions": [{"original": "old", "improved": "new"}],
  "topStrengths": ["3 strings"],
  "criticalGaps": ["3 strings"],
  "summary": "3-4 sentence brutally honest verdict."
}
`;

  const text = await callAIWithFallback(prompt);

  let clean = text
    .replace(/```json|```/g, "")
    .replace(/[\x00-\x1F\x7F]/g, " ")
    .trim();

  const jsonStart = clean.indexOf("{");
  const jsonEnd = clean.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error("No valid JSON found in AI response");
  }
  clean = clean.slice(jsonStart, jsonEnd + 1);

  return {
    analysis: JSON.parse(clean),
    extractedText: resumeFile,
  };
};

const improveResume = async (resumeText, jobDescription) => {
  const expertContext = retrieveExpertContext(resumeText);
  const prompt = `
You are a top-tier executive resume writer. Rewrite the provided resume to be high-impact and result-oriented.

${expertContext}

${jobDescription ? `TARGET JOB DESCRIPTION:\n${jobDescription}\n\n` : "Goal: General resume optimization."}

ORIGINAL RESUME CONTENT:
${resumeText}

DIRECTIONS:
1. Transform responsibilities into high-impact achievement statements (X-Y-Z formula).
2. Use strong action verbs.
3. If a JD is provided, prioritize matching keys.
4. Output as clean Markdown with headers (Summary, Experience, Skills, Education).
5. DO NOT include any intro/outro text.
`;

  return await callAIWithFallback(prompt);
};

module.exports = { analyzeResume, improveResume };
