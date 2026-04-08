import axios from "axios";
import { useState } from "react";

export default function Analyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [file, setFile] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState("");

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
    }
  };

  const handleDragDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (
      droppedFile &&
      (droppedFile.type === "application/pdf" ||
        droppedFile.name.endsWith(".docx"))
    ) {
      setFile(droppedFile);
    }
  };

  // const handleAnalyze = () => {
  //   if (!file) return;

  //   setIsAnalyzing(true);
  //   // Simulate API call
  //   setTimeout(() => {
  //     setResult({
  //       score: 82,
  //       strengths: [
  //         "Clear and well-organized structure",
  //         "Strong technical skills section",
  //         "Quantified achievements and metrics",
  //         "Good use of action verbs",
  //       ],
  //       weaknesses: [
  //         "Missing LinkedIn profile link",
  //         "Could add more certifications",
  //         "Job descriptions could be more impact-focused",
  //       ],
  //       suggestions: [
  //         "Add a professional summary at the top",
  //         "Include more quantifiable results",
  //         "Tailor keywords to the job description",
  //         "Reduce to one page if possible",
  //       ],
  //       keywords: [
  //         "React",
  //         "TypeScript",
  //         "Leadership",
  //         "Project Management",
  //         "API Design",
  //         "Agile",
  //         "Full Stack",
  //       ],
  //     });
  //     setIsAnalyzing(false);
  //   }, 2000);
  // };

  const handleAnalyze = async () => {
    if (!file) return;

    setIsAnalyzing(true);

    const token = localStorage.getItem("token");

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jobDescription", jobDescription);

      const res = await axios.post(
        "http://localhost:5000/api/analyze",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setResult(res.data.data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        {!result ? (
          <>
            {/* Title */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-2">
                Analyze Your Resume
              </h2>
              <p className="text-gray-600">
                Upload your resume and get AI-powered feedback to improve it
              </p>
            </div>

            {/* Upload Section */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDragDrop}
              className="mb-8 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 hover:bg-blue-50 transition cursor-pointer bg-white"
            >
              <svg
                className="w-12 h-12 mx-auto text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <p className="text-gray-900 font-semibold mb-2">
                {file ? file.name : "Drag and drop your resume here"}
              </p>
              {!file && <p className="text-gray-500 text-sm mb-4">or</p>}
              <label>
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <span className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-6 rounded-lg transition cursor-pointer">
                  Upload Resume
                </span>
              </label>
              <p className="text-gray-500 text-xs mt-4">
                PDF or DOCX • Max 10MB
              </p>
            </div>

            {/* Job Description */}
            <div className="mb-8">
              <label className="block text-gray-900 font-semibold mb-3">
                Job Description (Optional)
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here to get more tailored suggestions..."
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={!file || isAnalyzing}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-xl transition"
            >
              {isAnalyzing ? "Analyzing..." : "Analyze Resume"}
            </button>
          </>
        ) : (
          <>
            {/* Reset */}
            <button
              onClick={() => {
                setResult(null);
                setFile(null);
                setJobDescription("");
              }}
              className="mb-6 text-blue-600"
            >
              ← Analyze another
            </button>

            {/* Score */}
            <div className="bg-blue-100 p-6 rounded-xl text-center mb-6">
              <h2 className="text-5xl font-bold">{result.matchScore}</h2>
              <p>{result.matchLevel}</p>
            </div>

            {/* Summary */}
            <div className="bg-white p-4 rounded-xl mb-6">
              <h3 className="font-semibold mb-2">Summary</h3>
              <p>{result.summary}</p>
            </div>

            {/* Strengths */}
            <div className="bg-white p-4 rounded-xl mb-6">
              <h3 className="font-semibold mb-2 text-green-600">Strengths</h3>
              <ul>
                {result.topStrengths.map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            </div>

            {/* Gaps */}
            <div className="bg-white p-4 rounded-xl mb-6">
              <h3 className="font-semibold mb-2 text-red-600">Critical Gaps</h3>
              <ul>
                {result.criticalGaps.map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            </div>

            {/* Missing Keywords */}
            <div className="bg-white p-4 rounded-xl mb-6">
              <h3 className="font-semibold mb-2">Missing Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {result.missingKeywords.map((item, i) => (
                  <span key={i} className="bg-red-100 px-3 py-1 rounded-full">
                    {item.keyword} ({item.importance})
                  </span>
                ))}
              </div>
            </div>

            {/* Rewrite Suggestions */}
            <div className="bg-white p-4 rounded-xl mb-6">
              <h3 className="font-semibold mb-2">Rewrite Suggestions</h3>
              {result.rewriteSuggestions.map((item, i) => (
                <div key={i} className="mb-3">
                  <p className="text-gray-500">{item.original}</p>
                  <p className="text-green-600">{item.improved}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Loading State */}
        {isAnalyzing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-xl p-8 text-center">
              <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-900 font-semibold">
                Analyzing your resume...
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
