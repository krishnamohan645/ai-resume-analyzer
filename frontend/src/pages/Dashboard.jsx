import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

const MiniScoreRing = ({ score }) => {
  const circumference = 364.4;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s) => {
    if (s >= 80) return "var(--green)";
    if (s >= 60) return "var(--accent)";
    if (s >= 40) return "var(--yellow)";
    return "var(--red)";
  };

  const color = getColor(score);

  return (
    <div className="relative w-12 h-12 flex-shrink-0">
      <svg width="48" height="48" viewBox="0 0 140 140" className="-rotate-90">
        <circle
          className="fill-none stroke-[var(--border)] stroke-[12]"
          cx="70"
          cy="70"
          r="58"
        />
        <circle
          className="fill-none stroke-[12] transition-all duration-1000 ease-out"
          cx="70"
          cy="70"
          r="58"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          stroke={color}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-bold font-syne" style={{ color }}>
          {score}
        </span>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--surface)] border border-[var(--border)] p-3 rounded-xl shadow-2xl backdrop-blur-md">
        <p className="text-[10px] uppercase tracking-widest text-[var(--muted)] mb-1">
          Match Score
        </p>
        <p className="text-xl font-syne font-extrabold text-[var(--accent)]">
          {payload[0].value}%
        </p>
        <p className="text-[10px] text-[var(--muted)]">
          {payload[0].payload.fullDate}
        </p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");
        if (userStr) setUser(JSON.parse(userStr));

        const res = await axios.get(
          "http://localhost:5000/api/analyze/history",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        setHistory(res.data.data);
      } catch (err) {
        console.error("Dashboard fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleViewHistory = (item) => {
    navigate("/analyze", { state: { result: item.fullResults } });
  };

  const totalAnalyzed = history.length;
  const avgScore = totalAnalyzed
    ? Math.round(
        history.reduce((acc, curr) => acc + curr.matchScore, 0) / totalAnalyzed,
      )
    : 0;

  const lastAnalyzed =
    history.length > 0
      ? new Date(history[0].createdAt).toLocaleDateString()
      : "None yet";

  const stats = [
    { label: "Total Analyzed", value: totalAnalyzed, icon: "📊" },
    { label: "Average Score", value: `${avgScore}%`, icon: "🎯" },
    { label: "Last Analysis", value: lastAnalyzed, icon: "⏱️" },
  ];

  // Prepare chart data (last 10 analyses, chronological order)
  const chartData = [...history]
    .slice(0, 10)
    .reverse()
    .map((item) => ({
      name: new Date(item.createdAt).toLocaleDateString([], {
        month: "short",
        day: "numeric",
      }),
      score: item.matchScore,
      fullDate: new Date(item.createdAt).toLocaleDateString([], {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-12 max-w-7xl mx-auto animate-fadeIn">
      {/* Welcome Section */}
      <div className="mb-12">
        <h2 className="text-4xl font-syne font-extrabold text-white mb-3">
          Welcome back,{" "}
          <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)] bg-clip-text text-transparent">
            {user?.name}
          </span>
        </h2>
        <p className="text-[var(--muted)] font-light">
          Track your progress and keep improving your resume quality.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 transition-all hover:border-[var(--accent)] hover:translate-y-[-2px] group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[var(--muted)] text-xs font-syne font-bold uppercase tracking-widest">
                {stat.label}
              </span>
              <span className="text-xl group-hover:grayscale-0 transition-all">
                {stat.icon}
              </span>
            </div>
            <p className="text-4xl font-syne font-extrabold text-white group-hover:text-[var(--accent)] transition-colors">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-[var(--surface)] border border-[var(--border)] rounded-[24px] p-8 shadow-2xl overflow-hidden relative group">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-syne font-bold text-white uppercase tracking-[3px] mb-1">
                Performance Trend
              </h3>
              <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-mono">
                Last 10 analyses
              </p>
            </div>
            <div className="bg-[rgba(0,229,255,0.05)] text-[var(--accent)] text-[10px] font-bold px-3 py-1 rounded-full border border-[rgba(0,229,255,0.2)]">
              LIVE METRICS
            </div>
          </div>

          <div className="h-[240px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--accent)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--accent)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="var(--muted)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="var(--muted)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                    dx={-10}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ stroke: "var(--accent)", strokeWidth: 1 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="var(--accent)"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorScore)"
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[var(--muted)] font-light italic text-sm">
                No data points yet. Complete an analysis to start tracking.
              </div>
            )}
          </div>
        </div>

        {/* Quick Tips or Action */}
        <div className="flex flex-col gap-6">
          <div className="bg-gradient-to-br from-[var(--surface)] to-[var(--surface2)] border border-[var(--border)] rounded-[24px] p-8 flex flex-col items-center justify-center text-center group hover:border-[var(--accent2)] transition-all">
            <div className="w-16 h-16 bg-[rgba(124,58,237,0.1)] rounded-full flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
              🚀
            </div>
            <h4 className="font-syne font-bold text-white mb-2 tracking-wide">
              Ready for lift off?
            </h4>
            <p className="text-[var(--muted)] text-sm font-light mb-6">
              Analyze a new resume and crush that score today.
            </p>
            <Link to="/analyze" className="w-full">
              <button className="w-full bg-white text-black font-syne font-bold py-3.5 rounded-xl uppercase tracking-wider text-xs hover:bg-[var(--accent)] transition-colors">
                Start Analysis
              </button>
            </Link>
          </div>

          <div className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-[24px] p-8 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 bg-[var(--green)] rounded-full animate-pulse" />
              <span className="text-[10px] font-syne font-bold text-white uppercase tracking-widest">
                Active Goals
              </span>
            </div>
            <p className="text-[var(--muted)] text-sm font-light leading-relaxed">
              Consistency is key. Users who analyze their resume at least{" "}
              <span className="text-white font-medium">3 times</span> see an
              average score increase of{" "}
              <span className="text-[var(--green)] font-bold">18%</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-[var(--surface)] rounded-[24px] border border-[var(--border)] overflow-hidden shadow-2xl">
        <div className="px-8 py-6 border-b border-[var(--border)] flex items-center justify-between bg-[rgba(255,255,255,0.02)]">
          <h3 className="text-sm font-syne font-bold text-white uppercase tracking-[3px]">
            Recent Activity
          </h3>
          <span className="text-[10px] text-[var(--muted)] font-mono tracking-widest uppercase">
            History ({history.length})
          </span>
        </div>
        <div className="">
          {history.length > 0 ? (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => handleViewHistory(item)}
                className="px-8 py-5 border-b border-[var(--border)] last:border-0 hover:bg-[rgba(255,255,255,0.02)] transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[var(--surface2)] flex items-center justify-center text-lg border border-[var(--border)] group-hover:border-[var(--accent)] transition-colors">
                    📄
                  </div>
                  <div>
                    <p className="text-white font-medium text-[15px] group-hover:text-[var(--accent)] transition-colors line-clamp-1 max-w-[200px] md:max-w-md">
                      {item.fileName}
                    </p>
                    <p className="text-[var(--muted)] text-[12px] font-light">
                      {new Date(item.createdAt).toLocaleDateString()} •{" "}
                      {item.jobDescription ? "JD Match" : "General Audit"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] font-mono text-[var(--muted)] uppercase tracking-tighter block mb-1">
                      Match Score
                    </span>
                    <div className="font-syne font-bold text-[var(--accent)]">
                      {item.matchScore}%
                    </div>
                  </div>
                  <MiniScoreRing score={item.matchScore} />
                  <div className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-white hover:border-white transition-all group-hover:bg-[var(--accent)] group-hover:text-black group-hover:border-[var(--accent)]">
                    →
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center text-[var(--muted)] font-light italic">
              No analysis history found. Start by analyzing your first resume!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
