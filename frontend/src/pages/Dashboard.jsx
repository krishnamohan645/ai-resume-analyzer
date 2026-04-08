import { useState } from "react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [user] = useState("Sarah");

  const stats = [
    { label: "Total Resumes Analyzed", value: "24" },
    { label: "Average Score", value: "82/100" },
    { label: "Last Analyzed", value: "Today" },
  ];

  const recentActivity = [
    { fileName: "Sarah_Resume_2024.pdf", score: 85, date: "Jan 15, 2024" },
    { fileName: "Sarah_Resume_v2.docx", score: 79, date: "Jan 12, 2024" },
    { fileName: "Tech_Lead_Position.pdf", score: 88, date: "Jan 10, 2024" },
    { fileName: "Resume_Final.docx", score: 75, date: "Jan 8, 2024" },
    { fileName: "Updated_Resume.pdf", score: 81, date: "Jan 5, 2024" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user}
          </h2>
          <p className="text-gray-600">
            Here's a summary of your resume analyses and scores.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition border border-gray-100"
            >
              <p className="text-gray-600 text-sm font-medium mb-2">
                {stat.label}
              </p>
              <p className="text-4xl font-bold text-blue-600">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Action Section */}
        <div className="mb-12">
          <Link to={"/analyze"}>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition shadow-sm hover:shadow-md">
              + Analyze New Resume
            </button>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Activity
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {recentActivity.map((item, idx) => (
              <div
                key={idx}
                className="px-6 py-4 hover:bg-gray-50 transition flex items-center justify-between"
              >
                <div>
                  <p className="text-gray-900 font-medium">{item.fileName}</p>
                  <p className="text-gray-500 text-sm">{item.date}</p>
                </div>
                <div className="text-right">
                  <div className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {item.score}/100
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
