"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Trash2,
  Edit3,
  FileText,
  Download,
  ArrowLeft,
  Calendar,
  BookOpen,
  Settings,
  User,
  LogOut,
  Save,
  X,
  Upload,
  Play,
  Pause,
  Volume2,
  Clock,
  Mic,
  FileAudio,
  Globe,
  Lock,
  Languages,
  MessageSquare,
  Loader2,
  FileOutput,
  LoaderCircle,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

interface Entry {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  audioUrl: string;
  transcript?: string;
  sentiment?: {
    label: string;
    score: number;
  };
  duration?: number;
  language?: string;
  isPrivate: boolean;
  journalId: string;
}

interface Journal {
  id: string;
  title: string;
  content?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  entries: Entry[];
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: Journal | Entry;
  error?: {
    message: string;
  };
}

interface TranscriptionData {
  text: string;
  language?: string;
  sentiment?: {
    label: string;
    score: number;
  };
}

interface TranscriptionDialog {
  open: boolean;
  data: TranscriptionData | null;
}

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Dialog = ({ open, children }: DialogProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export default function JournalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [journal, setJournal] = useState<Journal | null>(null);
  const [loading, setLoading] = useState(true);
  const [newError, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
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

  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [transcriptionDialog, setTranscriptionDialog] =
    useState<TranscriptionDialog>({
      open: false,
      data: null,
    });

  const gradientOrbs = [
    { size: 400, x: 15, y: 20, colors: "from-purple-600/20 to-indigo-800/25" },
    { size: 300, x: 85, y: 80, colors: "from-violet-500/15 to-purple-700/20" },
    { size: 350, x: 75, y: 25, colors: "from-indigo-600/20 to-purple-800/20" },
  ];

  const fetchJournal = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/journals/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data: ApiResponse = await response.json();

      if (data.success && data.data) {
        setJournal(data.data as Journal);
        setEditTitle((data.data as Journal).title);
        setEditContent((data.data as Journal).content || "");
        setError(null);
      } else {
        setError(
          data.error?.message || data.message || "Failed to fetch journal"
        );
      }
    } catch (err) {
      setError("Network error occurred while fetching journal");
      console.error("Error fetching journal:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleUpdate = async () => {
    if (!journal || !id) return;

    try {
      setUpdating(true);
      const response = await fetch(`/api/journals/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
        }),
      });

      const data: ApiResponse = await response.json();

      if (data.success && data.data) {
        setJournal(data.data as Journal);
        setIsEditing(false);
        setError(null);
      } else {
        setError(
          data.error?.message || data.message || "Failed to update journal"
        );
      }
    } catch (err) {
      setError("Network error occurred while updating journal");
      console.error("Error updating journal:", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (
      !id ||
      !confirm(
        "Are you sure you want to delete this journal? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch(`/api/journals/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        router.push("/journals");
      } else {
        setError(
          data.error?.message || data.message || "Failed to delete journal"
        );
      }
    } catch (err) {
      setError("Network error occurred while deleting journal");
      console.error("Error deleting journal:", err);
    } finally {
      setDeleting(false);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFile || !id) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("journalId", id);

      const response = await fetch("/api/records", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        setShowUploadDialog(false);
        setUploadFile(null);
        await fetchJournal();
      } else {
        setError(
          data.error?.message || data.message || "Failed to upload entry"
        );
      }
    } catch (err) {
      setError("Network error occurred while uploading entry");
      console.error("Error uploading entry:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleExportPDF = async (text: string) => {
    setIsExportingPDF(true);

    try {
      const response = await fetch("http://localhost:3000/api/export-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("PDF export API request failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "journal-transcription.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF export failed:", error);
      alert(
        `PDF export failed: ${
          error instanceof Error ? error.message : String(error)
        }. Please try again.`
      );
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleTranscribe = async (audioUrl: string) => {
    setIsTranscribing(true);

    try {
      const transcriptionResponse = await fetch("http://localhost:3000/api/transcribe",{
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            s3Url: audioUrl,
          }),
        }
      );

      if (!transcriptionResponse.ok) {
        const errorData = await transcriptionResponse.json();
        throw new Error(
          errorData.message || "Transcription API request failed"
        );
      }

      const transcriptionData = await transcriptionResponse.json();

      setTranscriptionDialog({
        open: true,
        data: transcriptionData,
      });
    } catch (error) {
      console.error("Transcription failed:", error);
      alert(
        `Transcription failed: ${
          error instanceof Error ? error.message : String(error)
        }. Please try again.`
      );
    } finally {
      setIsTranscribing(false);
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    const icons = {
      joy: "😊",
      sadness: "😢",
      anger: "😠",
      fear: "😨",
      surprise: "😲",
      disgust: "🤢",
      neutral: "😐",
    };
    return icons[sentiment as keyof typeof icons] || "😐";
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setPlayingAudio(null);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [playingAudio]);

  const toggleAudio = (entryId: string, audioUrl: string) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playingAudio === entryId) {
      audio.pause();
      setPlayingAudio(null);
    } else {
      if (playingAudio !== null) {
        audio.pause();
      }
      audio.src = audioUrl;
      audio.volume = volume;
      audio.play();
      setPlayingAudio(entryId);
    }
  };

  const handleProgressClick = (e: React.MouseEvent) => {
    const audio = audioRef.current;
    if (!audio || !duration || !progressRef.current) return;

    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const skipBackward = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = Math.max(0, audio.currentTime - 10);
    }
  };

  const skipForward = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = Math.min(duration, audio.currentTime + 10);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
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

  function formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }

  useEffect(() => {
    if(authState == 'authenticated') {
      fetchJournal();
    }
  }, [id, fetchJournal, authState]);

  if (loading) {
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
                animation: `float-smooth ${
                  15 + index * 5
                }s ease-in-out infinite`,
                animationDelay: `${index * 3}s`,
              }}
            />
          ))}
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (newError) {
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
                animation: `float-smooth ${
                  15 + index * 5
                }s ease-in-out infinite`,
                animationDelay: `${index * 3}s`,
              }}
            />
          ))}
        </div>
        <div className="relative z-10 px-4 sm:px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-900/50 backdrop-blur-sm border border-red-500/60 rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-semibold text-red-200 mb-4">
                Error
              </h2>
              <p className="text-red-300 mb-6">{newError}</p>
              <button
                onClick={fetchJournal}
                className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-red-500/25"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!journal) {
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
                animation: `float-smooth ${
                  15 + index * 5
                }s ease-in-out infinite`,
                animationDelay: `${index * 3}s`,
              }}
            />
          ))}
        </div>
        <div className="relative z-10 px-4 sm:px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-yellow-900/50 backdrop-blur-sm border border-yellow-500/60 rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-semibold text-yellow-200">
                Journal Not Found
              </h2>
              <p className="text-yellow-300 mt-4">
                The requested journal could not be found.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      <audio ref={audioRef} />

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
              onClick={() => router.push("/journal")}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                {journal.title}
              </h1>
              <p className="text-sm text-gray-400">
                {journal.entries?.length || 0} audio entries
              </p>
            </div>
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
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/60 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-purple-400" />
                <span className="text-sm text-gray-400">
                  Created {formatDate(journal.createdAt)} • Updated{" "}
                  {formatDate(journal.updatedAt)}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg ${
                    isEditing
                      ? "flex items-center gap-2 bg-gradient-to-r from-purple-700 to-indigo-700 text-white px-4 py-2 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-purple-500/25"
                      : "flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-purple-500/25"
                  }`}
                  disabled={updating}
                >
                  {isEditing ? (
                    <X className="w-4 h-4" />
                  ) : (
                    <Edit3 className="w-4 h-4" />
                  )}
                  {isEditing ? "Cancel" : "Edit"}
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-purple-500/25"
                  disabled={deleting}
                >
                  <Trash2 className="w-4 h-4" />
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/70 border border-gray-600/60 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all backdrop-blur-sm"
                    placeholder="Journal title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Content
                  </label>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={8}
                    className="w-full px-4 py-3 bg-gray-800/70 border border-gray-600/60 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all backdrop-blur-sm resize-none"
                    placeholder="Write your thoughts here..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleUpdate}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-purple-500/25"
                  >
                    <Save className="w-4 h-4" />
                    {updating ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-purple-500/25"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
                  {journal.title}
                </h2>
                {journal.content && (
                  <div className="text-gray-300 whitespace-pre-wrap leading-relaxed mb-4 text-base sm:text-lg">
                    {journal.content}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/60 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Audio Entries ({journal?.entries?.length || 0})
              </h3>
              <button
                onClick={() => setShowUploadDialog(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-purple-500/25"
              >
                <Mic className="w-4 h-4" />
                Add Audio Entry
              </button>
            </div>

            {!journal?.entries?.length ? (
              <div className="text-center py-16">
                <FileAudio className="w-16 h-16 text-gray-600 mx-auto mb-6" />
                <h4 className="text-xl font-semibold text-gray-400 mb-3">
                  No audio entries yet
                </h4>
                <p className="text-gray-500">
                  Start by adding your first audio entry to this journal.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {journal.entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-600/60 p-6 hover:border-purple-500/60 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <button
                            onClick={() =>
                              toggleAudio(entry.id, entry.audioUrl)
                            }
                            className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 shadow-lg"
                          >
                            {playingAudio === entry.id ? (
                              <Pause className="w-5 h-5 text-white" />
                            ) : (
                              <Play className="w-5 h-5 text-white ml-0.5" />
                            )}
                          </button>

                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <Volume2 className="w-4 h-4 text-purple-400" />
                              <span className="text-sm font-medium text-white">
                                {formatTimestamp(entry.createdAt)}
                              </span>
                              {entry.duration && (
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                  <Clock className="w-3 h-3" />
                                  {formatTime(entry.duration)}
                                </div>
                              )}
                              {entry.language && (
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                  <Languages className="w-3 h-3" />
                                  {entry.language.toUpperCase()}
                                </div>
                              )}
                              <div className="flex items-center gap-1 text-xs text-gray-400">
                                {entry.isPrivate ? (
                                  <Lock className="w-3 h-3" />
                                ) : (
                                  <Globe className="w-3 h-3" />
                                )}
                                {entry.isPrivate ? "Private" : "Public"}
                              </div>
                            </div>
                            <p className="text-xs text-gray-500">
                              {formatDate(entry.createdAt)}
                            </p>
                          </div>
                        </div>

                        {playingAudio === entry.id && (
                          <div className="bg-gray-700/50 rounded-lg p-4 mt-4">
                            <div className="flex items-center gap-4 mb-3">
                              <button
                                onClick={skipBackward}
                                className="p-2 text-gray-400 hover:text-white transition-colors"
                              >
                                <div className="w-4 h-4 relative">
                                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                                    ⏪
                                  </div>
                                </div>
                              </button>

                              <div className="flex-1">
                                <div
                                  ref={progressRef}
                                  className="w-full h-2 bg-gray-600 rounded-full cursor-pointer relative"
                                  onClick={handleProgressClick}
                                >
                                  <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-100"
                                    style={{
                                      width: `${
                                        (currentTime / duration) * 100
                                      }%`,
                                    }}
                                  />
                                </div>
                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                  <span>{formatTime(currentTime)}</span>
                                  <span>{formatTime(duration)}</span>
                                </div>
                              </div>

                              <button
                                onClick={skipForward}
                                className="p-2 text-gray-400 hover:text-white transition-colors"
                              >
                                <div className="w-4 h-4 relative">
                                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                                    ⏩
                                  </div>
                                </div>
                              </button>
                            </div>

                            <div className="flex items-center gap-3">
                              <Volume2 className="w-4 h-4 text-gray-400" />
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                                style={{
                                  background: `linear-gradient(to right, rgb(147, 51, 234) 0%, rgb(147, 51, 234) ${
                                    volume * 100
                                  }%, rgb(75, 85, 99) ${
                                    volume * 100
                                  }%, rgb(75, 85, 99) 100%)`,
                                }}
                              />
                              <span className="text-xs text-gray-400 w-8">
                                {Math.round(volume * 100)}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {entry.transcript ? (
                          <button
                            onClick={() => {
                              setTranscriptionDialog({
                                open: true,
                                data: {
                                  text: entry.transcript ?? "",
                                  language: entry.language,
                                  sentiment: entry.sentiment,
                                },
                              });
                            }}
                            className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/25"
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span className="text-sm">View Transcript</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleTranscribe(entry.audioUrl)}
                            disabled={isTranscribing}
                            className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isTranscribing ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <MessageSquare className="w-4 h-4" />
                            )}
                            <span className="text-sm">
                              {isTranscribing ? "Transcribing..." : "Transcribe"}
                            </span>
                          </button>
                        )}

                        <a
                          href={entry.audioUrl}
                          download
                          className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-green-500/25"
                        >
                          <Download className="w-4 h-4" />
                          <span className="text-sm">Download</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog
        open={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">
              Add Audio Entry
            </h3>
            <button
              onClick={() => setShowUploadDialog(false)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Audio File
              </label>
              <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-purple-500 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300 mb-2">
                  {uploadFile ? uploadFile.name : "Drop your audio file here"}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Supports MP3, WAV, M4A, and other audio formats
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Choose File
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleFileUpload}
                disabled={!uploadFile || uploading}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {uploading ? "Uploading..." : "Upload Entry"}
              </button>
              <button
                onClick={() => {
                  setShowUploadDialog(false);
                  setUploadFile(null);
                }}
                className="bg-gray-700 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={transcriptionDialog.open}
        onClose={() => setTranscriptionDialog({ open: false, data: null })}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">
              Transcription Results
            </h3>
            <button
              onClick={() =>
                setTranscriptionDialog({ open: false, data: null })
              }
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {transcriptionDialog.data && (
            <div className="space-y-6">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-purple-400" />
                  <span className="text-sm font-medium text-white">
                    Transcription
                  </span>
                  {transcriptionDialog.data.language && (
                    <div className="flex items-center gap-1 ml-auto">
                      <Languages className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-300">
                        {transcriptionDialog.data.language}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-gray-300 leading-relaxed">
                  {transcriptionDialog.data.text}
                </p>
              </div>

              {transcriptionDialog.data.sentiment && (
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="text-2xl">
                      {getSentimentIcon(
                        transcriptionDialog.data.sentiment.label
                      )}
                    </div>
                    <span className="text-sm font-medium text-white">
                      Sentiment Analysis
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-300 capitalize">
                      {transcriptionDialog.data.sentiment.label}
                    </span>
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            transcriptionDialog.data.sentiment.score * 100
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-400">
                      {Math.round(
                        transcriptionDialog.data.sentiment.score * 100
                      )}
                      %
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (transcriptionDialog.data) {
                      handleExportPDF(transcriptionDialog.data.text);
                    }
                  }}
                  disabled={isExportingPDF || !transcriptionDialog.data}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExportingPDF ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileOutput className="w-4 h-4" />
                  )}
                  {isExportingPDF ? "Exporting..." : "Export PDF"}
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      transcriptionDialog.data?.text ?? ""
                    );
                    toast("Text copied", {
                      position: "top-right",
                      duration: 3000,
                      icon: <LoaderCircle className="animate-spin h-4 w-4" />,
                      style: {
                        background: '#1a1a1a',
                        color: '#ffffff',
                        border: '1px solid #7c3aed'
                      }
                    })
                  }}
                  className="bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  Copy Text
                </button>
              </div>
            </div>
          )}
        </div>
      </Dialog>

      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 0 0 1px #8b5cf6;
        }

        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 0 0 1px #8b5cf6;
        }

        @keyframes float-smooth {
          0%,
          100% {
            transform: translate(-50%, -50%) translateY(0px) rotate(0deg);
          }
          25% {
            transform: translate(-50%, -50%) translateY(-10px) rotate(1deg);
          }
          50% {
            transform: translate(-50%, -50%) translateY(-5px) rotate(0deg);
          }
          75% {
            transform: translate(-50%, -50%) translateY(-15px) rotate(-1deg);
          }
        }
      `}</style>
    </div>
  );
}
