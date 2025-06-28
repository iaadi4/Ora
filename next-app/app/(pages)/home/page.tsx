"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  BookOpen,
  Mic,
  Calendar,
  Settings,
  LogOut,
  ArrowRight,
} from "lucide-react";

import { authClient } from "@/lib/auth-client"
import { toast } from "sonner";

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

const JournalHomepage = () => {
  const router = useRouter();
  const [soundWaves, setSoundWaves] = useState(Array(40).fill(0));
  const [journals, setJournals] = useState<Journal[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newJournalTitle, setNewJournalTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [authState, setAuthState] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  const { data, isPending, error } = authClient.useSession();

  useEffect(() => {
    const checkAuthState = () => {
      if (isPending) {
        setAuthState('loading');
        return;
      }
      if (error) {
        console.error('Auth error:', error);
        setAuthState('unauthenticated');
        return;
      }
      if (data?.session && data?.user) {
        setAuthState('authenticated');
      } else {
        setAuthState('unauthenticated');
      }
    };

    checkAuthState();
  }, [data, isPending, error]);

  useEffect(() => {
    if (authState === 'unauthenticated') {
      const timer = setTimeout(() => {
        router.push('/login');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [authState, router]);

  const fetchJournals = useCallback(async () => {
    if (authState !== 'authenticated') return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/journals?top=true", {
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const response = await res.json();
      const journalsData = Array.isArray(response.data) ? response.data : [];
      setJournals(journalsData);
    } catch (error) {
      console.error("Error fetching journals:", error);
      setJournals([]);
    } finally {
      setLoading(false);
    }
  }, [authState]);

  useEffect(() => {
    setMounted(true);
    if (authState === 'authenticated') {
      fetchJournals();
    }
  }, [authState, fetchJournals]);

  useEffect(() => {
    if (!mounted) return;
    
    const interval = setInterval(() => {
      setSoundWaves((prev) =>
        prev.map((_, index) => {
          const time = Date.now() * 0.002;
          const wave1 = Math.sin(time + index * 0.4) * 15;
          const wave2 = Math.sin(time * 1.3 + index * 0.3) * 10;
          const baseHeight = 20 + Math.sin(index * 0.15) * 8;
          const combinedHeight = baseHeight + wave1 + wave2;
          return Math.max(6, Math.min(50, combinedHeight));
        })
      );
    }, 100);
    return () => clearInterval(interval);
  }, [mounted]);

  if (authState === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (authState === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-400 text-sm">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const gradientOrbs = [
    { size: 400, x: 15, y: 20, colors: "from-purple-600/15 to-indigo-800/20" },
    { size: 300, x: 85, y: 80, colors: "from-violet-500/10 to-purple-700/15" },
    { size: 350, x: 75, y: 25, colors: "from-indigo-600/15 to-purple-800/15" },
  ];

  const handleCreateJournal = async () => {
    if (!newJournalTitle.trim() || createLoading || authState !== 'authenticated') return;
    
    setCreateLoading(true);
    try {
      const res = await fetch("/api/journals", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({ title: newJournalTitle.trim() }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create journal");
      }
      
      setNewJournalTitle("");
      setShowCreateModal(false);
      await fetchJournals();
    } catch (error) {
      console.error("Create journal error:", error);
      toast.error("Error creating journal");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJournalClick = (journalId: string) => {
    if (authState === 'authenticated') {
      router.push(`/journal/${journalId}`);
    }
  };

  const handleLogout = async () => {
    try {
      await authClient.signOut();
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/login');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Unknown date";
      
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
      return `${Math.ceil(diffDays / 365)} years ago`;
    } catch (error) {
      console.error('Date formatting error:', error);
      return "Unknown date";
    }
  };

  const getJournalColor = (index: number) => {
    const colors = ["purple", "indigo", "violet"];
    return colors[index % colors.length];
  };

  const getJournalGradient = (color: string) => {
    const gradients: { purple: string; indigo: string; violet: string } = {
      purple: "from-purple-500/20 to-purple-700/30",
      indigo: "from-indigo-500/20 to-indigo-700/30",
      violet: "from-violet-500/20 to-violet-700/30",
    };
    return gradients[color as keyof typeof gradients] || gradients.purple;
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-purple-900/50">
        {gradientOrbs.map((orb, index) => (
          <div
            key={index}
            className={`absolute rounded-full bg-gradient-to-r ${orb.colors} blur-3xl opacity-70`}
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
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(147, 51, 234, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(147, 51, 234, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative z-10 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" className="text-gray-800">
                  <path
                    d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c4.5 0 8.5-2.5 9-6.5M12 6c-3 0-5.5 2.5-5.5 5.5s2.5 5.5 5.5 5.5c2.5 0 4.5-1.5 5.5-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Ora
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Welcome back{data?.user?.name ? `, ${data.user.name}` : ''}
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Continue your journaling journey
            </p>
            <div className="flex items-center justify-center space-x-1 h-16 mb-8 w-full max-w-md mx-auto">
              {soundWaves.map((height, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-t from-purple-600 to-purple-400 rounded-full transition-all duration-150 ease-out"
                  style={{
                    width: "4px",
                    height: mounted ? `${height}%` : "20%",
                    minHeight: "4px",
                    boxShadow: "0 0 4px rgba(147, 51, 234, 0.4)",
                    opacity: mounted ? 0.6 + Math.sin(Date.now() * 0.003 + index * 0.3) * 0.4 : 0.6,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="text-center mb-12">
            <button
              onClick={() => setShowCreateModal(true)}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
            >
              <Plus className="w-6 h-6 transition-transform group-hover:rotate-90" />
              Create New Journal
            </button>
          </div>

          {Array.isArray(journals) && journals.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Recent Journals</h3>
                <Link
                  href="/journal"
                  className="group inline-flex items-center gap-2 px-4 py-2 text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <span>View All</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(journals) && journals.map((journal, index) => (
              <div
                key={journal.id}
                onClick={() => handleJournalClick(journal.id)}
                className="group relative p-6 bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${getJournalGradient(
                    getJournalColor(index)
                  )} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <BookOpen className="w-8 h-8 text-purple-400" />
                    <Mic className="w-6 h-6 text-gray-400 group-hover:text-purple-300 transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-100 transition-colors">
                    {journal.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {journal.entryCount} {journal.entryCount === 1 ? 'entry' : 'entries'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Last modified {formatDate(journal.updatedAt)}
                  </p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>

          {!loading && (!Array.isArray(journals) || journals.length === 0) && (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-400 mb-2">No journals yet</h3>
              <p className="text-gray-500 mb-6">Create your first journal to get started</p>
            </div>
          )}

          {loading && (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading journals...</p>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !createLoading && setShowCreateModal(false)}
          />
          <div className="relative bg-gray-900 rounded-2xl p-8 max-w-md w-full border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-6">Create New Journal</h3>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Journal Title
              </label>
              <input
                type="text"
                value={newJournalTitle}
                onChange={(e) => setNewJournalTitle(e.target.value)}
                placeholder="Enter journal title..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                onKeyDown={(e) => e.key === "Enter" && !createLoading && handleCreateJournal()}
                disabled={createLoading}
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                disabled={createLoading}
                className="flex-1 px-4 py-3 bg-gray-700 text-gray-300 rounded-xl font-medium hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateJournal}
                disabled={!newJournalTitle.trim() || createLoading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createLoading ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

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
      `}</style>
    </div>
  );
};

export default JournalHomepage;