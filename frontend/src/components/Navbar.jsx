import React, { useState } from "react";
import { Link } from "react-router-dom";

export const Navbar = () => {
  const [showLogout, setShowLogout] = useState(false);

  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : {};

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <nav className="border-b border-[var(--border)] bg-[var(--surface)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-5 h-5 border border-[var(--accent)] flex items-center justify-center rounded-sm rotate-45 group-hover:bg-[var(--accent)] transition-all">
            <div className="w-2 h-2 bg-[var(--accent)] group-hover:bg-black" />
          </div>
          <h1 className="text-lg font-syne font-bold tracking-[3px] uppercase text-white">
            ResumeAI
          </h1>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            to="/dashboard"
            className="text-sm font-medium text-[var(--muted)] hover:text-white transition-colors"
          >
            Dashboard
          </Link>
          <div className="w-[1px] h-4 bg-[var(--border)]" />

          <div className="relative">
            <button
              onClick={() => setShowLogout(!showLogout)}
              className="flex items-center gap-3 px-3 py-1.5 text-sm font-medium text-[var(--muted)] hover:text-white transition-all rounded-lg border border-transparent hover:border-[var(--border)] hover:bg-[var(--surface2)]"
            >
              <span>{user?.name || "User"}</span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent2)] flex items-center justify-center text-black font-bold">
                {user?.name?.[0] || "?"}
              </div>
            </button>

            {showLogout && (
              <div className="absolute right-0 mt-3 w-48 bg-[var(--surface2)] border border-[var(--border)] rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2 border-b border-[var(--border)] mb-1">
                  <div className="text-xs text-[var(--muted)]">
                    Signed in as
                  </div>
                  <div className="text-sm font-medium text-white truncate">
                    {user?.email}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-[var(--red)] hover:bg-[rgba(239,68,68,0.05)] transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
