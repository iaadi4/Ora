"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Calendar,
  Search,
  Settings,
  User,
  LogOut,
  ArrowLeft,
  Grid,
  List,
  MoreVertical,
} from "lucide-react";

interface Journal {
  id: string;
  title: string;
  content: string | null;
  createdAt: string;
  updatedAt: string;
  isPrivate: boolean;
  userId: string;
  entryCount: number;
}

const AllJournalsPage = () => {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [filteredJournals, setFilteredJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"updated" | "created" | "title">("updated");

  useEffect(() => {
    fetchAllJournals();
  }, []);

  const fetchAllJournals = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/journals");
      const response = await res.json();
      const journalsData = Array.isArray(response.data) ? response.data : [];
      setJournals(journalsData);
      setFilteredJournals(journalsData);
    } catch (error) {
      console.error("Error fetching journals:", error);
      setJournals([]);
      setFilteredJournals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...journals];

    if (searchQuery.trim()) {
      filtered = filtered.filter(journal =>
        journal.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "created":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "updated":
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

    setFilteredJournals(filtered);
  }, [journals, searchQuery, sortBy]);

  const gradientOrbs = [
    { size: 400, x: 15, y: 20, colors: "from-purple-600/20 to-indigo-800/25" },
    { size: 300, x: 85, y: 80, colors: "from-violet-500/15 to-purple-700/20" },
    { size: 350, x: 75, y: 25, colors: "from-indigo-600/20 to-purple-800/20" },
  ];

  const handleJournalClick = (journalId: string) => {
    window.location.href = `/journal/${journalId}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };

  const getJournalColor = (index: number) => {
    const colors = ["purple", "indigo", "violet", "blue", "pink", "emerald"];
    return colors[index % colors.length];
  };

  const getJournalGradient = (color: string) => {
    const gradients: { [key: string]: string } = {
      purple: "from-purple-500/25 to-purple-700/35",
      indigo: "from-indigo-500/25 to-indigo-700/35",
      violet: "from-violet-500/25 to-violet-700/35",
      blue: "from-blue-500/25 to-blue-700/35",
      pink: "from-pink-500/25 to-pink-700/35",
      emerald: "from-emerald-500/25 to-emerald-700/35",
    };
    return gradients[color] || gradients.purple;
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-purple-900/60">
        {gradientOrbs.map((orb, index) => (
          <div
            key={index}
            className={`absolute rounded-full bg-gradient-to-r ${orb.colors} blur-3xl opacity-80`}
            style={{
              width: `${orb.size}px`,
              height: `${orb.size}px`,
              left: `${orb.x}%`,
              top: `${orb.y}%`,
              transform: "translate(-50%, -50%)",
              animation: `float-smooth ${15 + index * 5}s ease-in-out infinite`,
              animationDelay: `${index * 3}s`,
            }}
          />
        ))}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(rgba(147, 51, 234, 0.4) 1px, transparent 1px),
              linear-gradient(90deg, rgba(147, 51, 234, 0.4) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative z-10 px-4 sm:px-6 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={() => window.history.back()}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full flex items-center justify-center">
                <svg width="10" height="10" className="sm:w-3 sm:h-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c4.5 0 8.5-2.5 9-6.5M12 6c-3 0-5.5 2.5-5.5 5.5s2.5 5.5 5.5 5.5c2.5 0 4.5-1.5 5.5-3.5" className="text-gray-800"/>
                </svg>
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              All Journals
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-4 sm:px-6 py-4 sm:py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search journals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-900/70 border border-gray-700/60 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all backdrop-blur-sm"
                />
              </div>
              
              <div className="flex items-center justify-between gap-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "updated" | "created" | "title")}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gray-900/70 border border-gray-700/60 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all backdrop-blur-sm text-sm"
                >
                  <option value="updated">Last Updated</option>
                  <option value="created">Date Created</option>
                  <option value="title">Title</option>
                </select>

                <div className="flex items-center gap-1 bg-gray-900/70 border border-gray-700/60 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === "grid" 
                        ? "bg-purple-600 text-white shadow-lg" 
                        : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === "list" 
                        ? "bg-purple-600 text-white shadow-lg" 
                        : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {filteredJournals.map((journal, index) => (
                    <div
                      key={journal.id}
                      onClick={() => handleJournalClick(journal.id)}
                      className="group relative p-5 sm:p-6 bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/60 hover:border-purple-500/60 transition-all duration-300 hover:scale-105 cursor-pointer hover:shadow-2xl hover:shadow-purple-500/10"
                    >
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${getJournalGradient(
                          getJournalColor(index)
                        )} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                      />
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-purple-400 group-hover:text-purple-300 transition-colors" />
                          <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1">
                            <MoreVertical className="w-4 h-4 text-gray-400 hover:text-white" />
                          </button>
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-white mb-3 group-hover:text-purple-100 transition-colors line-clamp-2">
                          {journal.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 mb-3">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>{journal.entryCount} entries</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Updated {formatDate(journal.updatedAt)}
                        </p>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {filteredJournals.map((journal, index) => (
                    <div
                      key={journal.id}
                      onClick={() => handleJournalClick(journal.id)}
                      className="group relative p-4 sm:p-6 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700/60 hover:border-purple-500/60 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-purple-500/10"
                    >
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${getJournalGradient(
                          getJournalColor(index)
                        )} rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                      />
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                          <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 group-hover:text-purple-300 transition-colors flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <h3 className="text-base sm:text-lg font-semibold text-white group-hover:text-purple-100 transition-colors truncate">
                              {journal.title}
                            </h3>
                            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-400 mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                {journal.entryCount} entries
                              </span>
                              <span className="hidden sm:inline">Updated {formatDate(journal.updatedAt)}</span>
                              <span className="sm:hidden">{formatDate(journal.updatedAt)}</span>
                            </div>
                          </div>
                        </div>
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 flex-shrink-0">
                          <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-white" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {filteredJournals.length === 0 && !loading && (
                <div className="text-center py-12 sm:py-16">
                  <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-400 mb-2">
                    {searchQuery ? "No journals found" : "No journals yet"}
                  </h3>
                  <p className="text-gray-500 text-sm sm:text-base px-4">
                    {searchQuery 
                      ? `No journals match "${searchQuery}"`
                      : "Your journals will appear here once created"
                    }
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes float-smooth {
          0%,
          100% {
            transform: translate(-50%, -50%) translateY(0px) rotate(0deg);
          }
          33% {
            transform: translate(-50%, -50%) translateY(-20px) rotate(120deg);
          }
          66% {
            transform: translate(-50%, -50%) translateY(10px) rotate(240deg);
          }
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default AllJournalsPage;