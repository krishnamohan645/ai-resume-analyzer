import axios from "axios";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";

const ScoreRing = ({ score }) => {
  const [displayScore, setDisplayScore] = useState(0);
  const circumference = 364.4;
  const offset = circumference - (score / 100) * circumference;

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const increment = score / (duration / 30);
    const timer = setInterval(() => {
      start += increment;
      if (start >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(start));
      }
    }, 30);

    return () => clearInterval(timer);
  }, [score]);

  const getColor = (s) => {
    if (s >= 80) return "var(--green)";
    if (s >= 60) return "var(--accent)";
    if (s >= 40) return "var(--yellow)";
    return "var(--red)";
  };

  const color = getColor(score);

  return (
    <div className="relative w-[140px] h-[140px] flex-shrink-0">
      <svg
        width="140"
        height="140"
        viewBox="0 0 140 140"
        className="-rotate-90"
      >
        <circle
          className="fill-none stroke-[var(--border)] stroke-[8]"
          cx="70"
          cy="70"
          r="58"
        />
        <circle
          className="fill-none stroke-[8] transition-all duration-1000 ease-out"
          cx="70"
          cy="70"
          r="58"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          stroke={color}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div
          className="font-syne text-[38px] font-extrabold leading-none"
          style={{ color }}
        >
          {displayScore}
        </div>
        <div className="text-[11px] text-[var(--muted)] tracking-widest mt-[2px]">
          / 100
        </div>
      </div>
    </div>
  );
};

export default function Analyzer() {
  const location = useLocation();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [improvedContent, setImprovedContent] = useState("");
  const [error, setError] = useState("");
  const [loadingStep, setLoadingStep] = useState("");

  useEffect(() => {
    if (location.state?.result) {
      setResult(location.state.result);
    }
  }, [location.state]);

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setError("");
    }
  };

  const handleDragDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      setError("");
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please upload a resume first.");
      return;
    }

    setIsAnalyzing(true);
    setLoadingStep("Extracting resume...");
    setError("");
    setImprovedContent("");

    const t1 = setTimeout(() => setLoadingStep("Analyzing skills..."), 1000);
    const t2 = setTimeout(
      () => setLoadingStep("Generating suggestions..."),
      2000,
    );

    const token = localStorage.getItem("token");

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jobDescription", jobDescription);

      const res = await axios.post(
        // "http://localhost:5000/api/analyze",
        "https://ai-resume-analyzer-v5pg.onrender.com/api/analyze",
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
      setError(
        err.response?.data?.error || "Analysis failed. Please try again.",
      );
    } finally {
      setIsAnalyzing(false);
      clearTimeout(t1);
      clearTimeout(t2);
    }
  };

  const handleOptimize = async () => {
    if (!result?.extractedText) return;

    setIsOptimizing(true);
    const token = localStorage.getItem("token");

    try {
      const res = await axios.post(
        // "http://localhost:5000/api/analyze/improve",
        "https://ai-resume-analyzer-v5pg.onrender.com/api/analyze/improve",
        {
          resumeText: result.extractedText,
          jobDescription: jobDescription,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setImprovedContent(res.data.data);
      toast.success("Resume optimized successfully!");

      // Scroll to optimized section
      setTimeout(() => {
        document
          .getElementById("optimized-resume-section")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      console.error(err);
      toast.error("Optimization failed. Please try again.");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(improvedContent);
    toast.success("Copied to clipboard!");
  };

  const getMatchStyles = (level) => {
    const l = level?.toLowerCase() || "";
    if (l.includes("strong") || l.includes("excellent"))
      return {
        bg: "rgba(34,197,94,0.12)",
        color: "#22c55e",
        border: "rgba(34,197,94,0.3)",
      };
    if (l.includes("good"))
      return {
        bg: "rgba(0,229,255,0.1)",
        color: "#00e5ff",
        border: "rgba(0,229,255,0.3)",
      };
    if (l.includes("partial") || l.includes("average"))
      return {
        bg: "rgba(245,158,11,0.1)",
        color: "#f59e0b",
        border: "rgba(245,158,11,0.3)",
      };
    return {
      bg: "rgba(239,68,68,0.1)",
      color: "#ef4444",
      border: "rgba(239,68,68,0.3)",
    };
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-[var(--accent)] rounded-full animate-pulse"></div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="font-syne text-sm uppercase tracking-[3px] text-[var(--muted)] animate-pulse">
            {loadingStep}
          </div>
          <div className="text-[10px] font-mono text-[var(--accent)] opacity-50 uppercase tracking-widest">
            AI Engine active
          </div>
        </div>
      </div>
    );
  }

  if (result) {
    const matchStyles = getMatchStyles(result.matchLevel);

    return (
      <div className="min-h-screen py-10 px-5 max-w-[900px] mx-auto animate-fadeIn pb-32">
        <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
          <div className="font-syne text-[13px] font-bold tracking-[4px] text-[var(--accent)] uppercase">
            ⬡ ResumeAI
          </div>
          <button
            onClick={() => {
              setResult(null);
              setFile(null);
              setJobDescription("");
              setImprovedContent("");
            }}
            className="bg-transparent border border-[var(--border)] text-[var(--muted)] rounded-lg py-2 px-4 font-sans text-[13px] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
          >
            ← Analyze Another
          </button>
        </div>

        {/* Score Hero */}
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 items-center bg-[var(--surface)] border border-[var(--border)] rounded-[20px] p-9 mb-6">
          <ScoreRing score={result.matchScore} />
          <div className="flex-1 text-center md:text-left">
            <div
              className="inline-block font-mono text-[11px] font-medium tracking-[2px] uppercase py-1 px-3 rounded-[20px] mb-4 border"
              style={{
                backgroundColor: matchStyles.bg,
                color: matchStyles.color,
                borderColor: matchStyles.border,
              }}
            >
              {result.matchLevel || "—"}
            </div>
            <p className="text-[#8a9fb0] text-[15px] leading-[1.7] font-light">
              {result.summary || "No summary available."}
            </p>

            <button
              onClick={handleOptimize}
              disabled={isOptimizing}
              className="mt-6 bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)] text-black font-syne font-bold py-2.5 px-6 rounded-lg text-xs uppercase tracking-widest transition-all hover:scale-[1.02] hover:shadow-[0_4px_20px_rgba(0,229,255,0.2)] disabled:opacity-50 disabled:scale-100"
            >
              {isOptimizing ? "Optimizing..." : "✨ Optimize Resume Content"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Strengths */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[16px] p-6">
            <div className="flex items-center gap-2 font-syne text-[11px] font-bold tracking-[3px] uppercase text-[var(--muted)] mb-[18px]">
              <div className="w-4 h-[2px] bg-[var(--accent)] rounded-[2px]" />
              Top Strengths
            </div>
            <div className="flex flex-col gap-[10px]">
              {(result.topStrengths || []).map((s, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-sm leading-[1.5]"
                >
                  <div className="w-[6px] h-[6px] rounded-full mt-[6px] flex-shrink-0 bg-[var(--green)]" />
                  <span className="text-[#c8d8e4]">{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Gaps */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[16px] p-6">
            <div className="flex items-center gap-2 font-syne text-[11px] font-bold tracking-[3px] uppercase text-[var(--muted)] mb-[18px]">
              <div className="w-4 h-[2px] bg-[var(--accent)] rounded-[2px]" />
              Critical Gaps
            </div>
            <div className="flex flex-col gap-[10px]">
              {(result.criticalGaps || []).map((g, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-sm leading-[1.5]"
                >
                  <div className="w-[6px] h-[6px] rounded-full mt-[6px] flex-shrink-0 bg-[var(--red)]" />
                  <span className="text-[#c8d8e4]">{g}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Missing Keywords */}
          <div className="md:col-span-2 bg-[var(--surface)] border border-[var(--border)] rounded-[16px] p-6">
            <div className="flex items-center gap-2 font-syne text-[11px] font-bold tracking-[3px] uppercase text-[var(--muted)] mb-[18px]">
              <div className="w-4 h-[2px] bg-[var(--accent)] rounded-[2px]" />
              Missing Keywords
            </div>
            <div className="flex flex-wrap gap-2 text-white">
              {(result.missingKeywords || []).map((k, i) => {
                const imp = k.importance?.toLowerCase() || "";
                const isCritical = imp === "critical";
                const isImportant = imp === "important";
                const color = isCritical
                  ? "var(--red)"
                  : isImportant
                    ? "var(--yellow)"
                    : "var(--muted)";
                const bg = isCritical
                  ? "rgba(239,68,68,0.08)"
                  : isImportant
                    ? "rgba(245,158,11,0.08)"
                    : "rgba(90,112,128,0.08)";
                const border = isCritical
                  ? "rgba(239,68,68,0.3)"
                  : isImportant
                    ? "rgba(245,158,11,0.3)"
                    : "rgba(90,112,128,0.3)";

                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 py-1.5 px-3 rounded-lg font-mono text-xs border"
                    style={{ backgroundColor: bg, borderColor: border, color }}
                  >
                    <span
                      className="text-[9px] py-0.5 px-1.5 rounded font-bold tracking-[0.5px] uppercase"
                      style={{ backgroundColor: color, color: "#000" }}
                    >
                      {isCritical ? "CRIT" : isImportant ? "IMP" : "NICE"}
                    </span>
                    {k.keyword}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weak Bullets */}
          <div className="md:col-span-2 bg-[var(--surface)] border border-[var(--border)] rounded-[16px] p-6 text-white">
            <div className="flex items-center gap-2 font-syne text-[11px] font-bold tracking-[3px] uppercase text-[var(--muted)] mb-[18px]">
              <div className="w-4 h-[2px] bg-[var(--accent)] rounded-[2px]" />
              Weak Bullets
            </div>
            <div className="flex flex-col gap-4">
              {(result.weakBullets || []).map((w, i) => (
                <div
                  key={i}
                  className="pb-4 border-b border-[var(--border)] last:border-0 last:pb-0"
                >
                  <div className="text-[13px] text-[var(--muted)] italic mb-1.5">
                    "{w.bullet}"
                  </div>
                  <div className="text-xs text-[var(--red)] flex items-start gap-1.5">
                    <span>⚠</span> {w.reason}
                  </div>
                </div>
              ))}
              {(!result.weakBullets || result.weakBullets.length === 0) && (
                <div className="text-[var(--muted)] text-sm">
                  No weak bullets found.
                </div>
              )}
            </div>
          </div>

          {/* Rewrite Suggestions */}
          <div className="md:col-span-2 bg-[var(--surface)] border border-[var(--border)] rounded-[16px] p-6 text-white">
            <div className="flex items-center gap-2 font-syne text-[11px] font-bold tracking-[3px] uppercase text-[var(--muted)] mb-[18px]">
              <div className="w-4 h-[2px] bg-[var(--accent)] rounded-[2px]" />
              Rewrite Suggestions
            </div>
            <div className="flex flex-col gap-5">
              {(result.rewriteSuggestions || []).map((r, i) => (
                <div
                  key={i}
                  className="pb-5 border-b border-[var(--border)] last:border-0 last:pb-0"
                >
                  <div className="text-[10px] font-bold tracking-[2px] uppercase text-[var(--red)] mb-1.5">
                    Original
                  </div>
                  <div className="text-[13px] text-[var(--muted)] leading-[1.5] p-3 rounded-r-md bg-[rgba(239,68,68,0.05)] border-l-2 border-[rgba(239,68,68,0.4)] mb-2.5">
                    {r.original}
                  </div>
                  <div className="text-[10px] font-bold tracking-[2px] uppercase text-[var(--green)] mb-1.5">
                    Improved
                  </div>
                  <div className="text-[13px] text-[var(--green)] leading-[1.5] p-3 rounded-r-md bg-[rgba(34,197,94,0.05)] border-l-2 border-[rgba(34,197,94,0.4)]">
                    ✦ {r.improved}
                  </div>
                </div>
              ))}
              {(!result.rewriteSuggestions ||
                result.rewriteSuggestions.length === 0) && (
                <div className="text-[var(--muted)] text-sm">
                  No suggestions available.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Improved Resume Display */}
        {improvedContent && (
          <div id="optimized-resume-section" className="mt-12 animate-slideUp">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--accent)] rounded-xl flex items-center justify-center text-black text-xl">
                  ✨
                </div>
                <div>
                  <h3 className="text-xl font-syne font-extrabold text-white">
                    Optimized Resume
                  </h3>
                  <p className="text-[var(--muted)] text-xs uppercase tracking-wider font-mono">
                    AI-Generated Content
                  </p>
                </div>
              </div>
              <button
                onClick={handleCopy}
                className="bg-[var(--surface)] border border-[var(--border)] text-white px-5 py-2 rounded-lg text-xs font-bold hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all flex items-center gap-2"
              >
                <span>📋</span> Copy Content
              </button>
            </div>

            <div className="bg-[var(--surface)] border border-[var(--accent)] rounded-[24px] p-10 prose prose-invert max-w-none shadow-[0_0_50px_rgba(0,229,255,0.1)]">
              <div className="markdown-body">
                <ReactMarkdown>{improvedContent}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-10 px-5 bg-[radial-gradient(ellipse_at_60%_0%,#0a1628_0%,#080c10_70%)]">
      <div className="font-syne text-[13px] font-bold tracking-[4px] uppercase text-[var(--accent)] mb-12 flex items-center gap-2.5">
        <div className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full" />
        ResumeAI
        <div className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full" />
      </div>

      <h1 className="font-syne text-center text-4xl md:text-6xl font-extrabold leading-[1.1] mb-4 tracking-[-1px] text-white">
        Know your{" "}
        <span className="bg-gradient-to-br from-[var(--accent)] to-[var(--accent2)] bg-clip-text text-transparent">
          real score
        </span>
        <br />
        before they do
      </h1>
      <p className="text-[var(--muted)] text-center text-base mb-12 font-light">
        AI-powered resume analysis against any job description
      </p>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[20px] p-10 w-full max-w-[560px] flex flex-col gap-5 shadow-2xl">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.classList.add(
              "border-[var(--accent)]",
              "bg-[rgba(0,229,255,0.04)]",
            );
          }}
          onDragLeave={(e) => {
            e.currentTarget.classList.remove(
              "border-[var(--accent)]",
              "bg-[rgba(0,229,255,0.04)]",
            );
          }}
          onDrop={(e) => {
            e.currentTarget.classList.remove(
              "border-[var(--accent)]",
              "bg-[rgba(0,229,255,0.04)]",
            );
            handleDragDrop(e);
          }}
          className="relative border-2 border-dashed border-[var(--border)] rounded-[14px] p-10 text-center cursor-pointer transition-all hover:border-[var(--accent)] hover:bg-[rgba(0,229,255,0.04)] group"
        >
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <div className="text-4xl mb-3">📄</div>
          <div className="font-syne font-semibold text-[15px] mb-1 text-white">
            {file ? file.name : "Drop your resume here"}
          </div>
          <div className="text-[var(--muted)] text-[13px]">
            {file ? "File selected" : "PDF or DOCX · Max 10MB"}
          </div>
        </div>

        {file && (
          <div className="bg-[rgba(0,229,255,0.08)] border border-[rgba(0,229,255,0.3)] rounded-lg p-2.5 font-mono text-[13px] text-[var(--accent)] flex items-center gap-2">
            <span>📎</span>
            {file.name}
          </div>
        )}

        <div className="flex items-center gap-3 text-[12px] tracking-[2px] text-[var(--muted)] uppercase">
          <div className="flex-1 h-[1px] bg-[var(--border)]" />
          Job Description
          <div className="flex-1 h-[1px] bg-[var(--border)]" />
        </div>

        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste job description here (optional — leave blank for general audit)"
          className="bg-[var(--surface2)] border border-[var(--border)] rounded-xl p-4 text-[var(--text)] font-sans text-sm resize-none min-h-[120px] w-full outline-none focus:border-[var(--accent)] transition-all placeholder:text-[var(--muted)]"
        />

        <button
          onClick={handleAnalyze}
          disabled={!file || isAnalyzing}
          className="bg-gradient-to-br from-[var(--accent)] to-[#0080ff] text-black border-none rounded-xl py-4 font-syne font-bold text-[15px] tracking-[1px] uppercase cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,229,255,0.25)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isAnalyzing ? "Analyzing..." : "Analyze Resume →"}
        </button>

        {error && (
          <div className="bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.3)] rounded-xl p-5 text-[var(--red)] text-sm text-center mt-3 animate-pulse">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
