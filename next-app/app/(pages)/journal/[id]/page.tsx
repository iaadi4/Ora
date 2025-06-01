"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  Heart,
  Meh,
  Frown,
  Languages
} from 'lucide-react';

interface Entry {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  audioUrl: string;
  transcript?: string;
  sentiment?: any;
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

export default function JournalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const [journal, setJournal] = useState<Journal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const audioRefs = useRef<{[key: string]: HTMLAudioElement}>({});

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
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data: ApiResponse = await response.json();
      
      if (data.success && data.data) {
        setJournal(data.data as Journal);
        setEditTitle((data.data as Journal).title);
        setEditContent((data.data as Journal).content || '');
        setError(null);
      } else {
        setError(data.error?.message || data.message || 'Failed to fetch journal');
      }
    } catch (err) {
      setError('Network error occurred while fetching journal');
      console.error('Error fetching journal:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleUpdate = async () => {
    if (!journal || !id) return;
    
    try {
      setUpdating(true);
      const response = await fetch(`/api/journals/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
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
        setError(data.error?.message || data.message || 'Failed to update journal');
      }
    } catch (err) {
      setError('Network error occurred while updating journal');
      console.error('Error updating journal:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this journal? This action cannot be undone.')) {
      return;
    }
    
    try {
      setDeleting(true);
      const response = await fetch(`/api/journals/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data: ApiResponse = await response.json();
      
      if (data.success) {
        router.push('/journals');
      } else {
        setError(data.error?.message || data.message || 'Failed to delete journal');
      }
    } catch (err) {
      setError('Network error occurred while deleting journal');
      console.error('Error deleting journal:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFile || !id) return;
    
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('journalId', id);
      
      const response = await fetch('/api/records', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data: ApiResponse = await response.json();
      
      if (data.success) {
        setShowUploadDialog(false);
        setUploadFile(null);
        await fetchJournal();
      } else {
        setError(data.error?.message || data.message || 'Failed to upload entry');
      }
    } catch (err) {
      setError('Network error occurred while uploading entry');
      console.error('Error uploading entry:', err);
    } finally {
      setUploading(false);
    }
  };

  const toggleAudio = (entryId: string, audioUrl: string) => {
    if (playingAudio === entryId) {
      audioRefs.current[entryId]?.pause();
      setPlayingAudio(null);
    } else {
      Object.values(audioRefs.current).forEach(audio => audio?.pause());
      setPlayingAudio(entryId);
      
      if (!audioRefs.current[entryId]) {
        audioRefs.current[entryId] = new Audio(audioUrl);
        audioRefs.current[entryId].addEventListener('ended', () => {
          setPlayingAudio(null);
        });
      }
      
      audioRefs.current[entryId]?.play();
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSentimentIcon = (sentiment?: any) => {
    if (!sentiment) return <Meh className="w-4 h-4 text-gray-400" />;
    
    const score = sentiment.score || sentiment.compound || 0;
    if (score > 0.1) return <Heart className="w-4 h-4 text-green-400" />;
    if (score < -0.1) return <Frown className="w-4 h-4 text-red-400" />;
    return <Meh className="w-4 h-4 text-yellow-400" />;
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

  useEffect(() => {
    fetchJournal();
  }, [id, fetchJournal]);

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
                animation: `float-smooth ${15 + index * 5}s ease-in-out infinite`,
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

  if (error) {
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
        </div>
        <div className="relative z-10 px-4 sm:px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-900/50 backdrop-blur-sm border border-red-500/60 rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-semibold text-red-200 mb-4">Error</h2>
              <p className="text-red-300 mb-6">{error}</p>
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
                animation: `float-smooth ${15 + index * 5}s ease-in-out infinite`,
                animationDelay: `${index * 3}s`,
              }}
            />
          ))}
        </div>
        <div className="relative z-10 px-4 sm:px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-yellow-900/50 backdrop-blur-sm border border-yellow-500/60 rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-semibold text-yellow-200">Journal Not Found</h2>
              <p className="text-yellow-300 mt-4">The requested journal could not be found.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              onClick={() => router.push('/journals')}
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
                  Created {formatDate(journal.createdAt)} • Updated {formatDate(journal.updatedAt)}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg ${
                    isEditing 
                      ? 'bg-gray-600 text-white hover:bg-gray-700 hover:shadow-gray-500/25' 
                      : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-500/25'
                  }`}
                  disabled={updating}
                >
                  {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-red-500/25"
                  disabled={deleting}
                >
                  <Trash2 className="w-4 h-4" />
                  {deleting ? 'Deleting...' : 'Delete'}
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
                    className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-green-500/25"
                    disabled={updating}
                  >
                    <Save className="w-4 h-4" />
                    {updating ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-700 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">{journal.title}</h2>
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
                <h4 className="text-xl font-semibold text-gray-400 mb-3">No audio entries yet</h4>
                <p className="text-gray-500">Start by adding your first audio entry to this journal.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {journal.entries.map((entry) => (
                  <div key={entry.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-600/60 p-6 hover:border-purple-500/60 transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <button
                            onClick={() => toggleAudio(entry.id, entry.audioUrl)}
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
                              <span className="text-sm font-medium text-white">Audio Entry</span>
                              {entry.duration && (
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                  <Clock className="w-3 h-3" />
                                  {formatDuration(entry.duration)}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(entry.createdAt).toLocaleDateString()} at {new Date(entry.createdAt).toLocaleTimeString()}
                              </div>
                              <div className="flex items-center gap-1">
                                {entry.isPrivate ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                                {entry.isPrivate ? 'Private' : 'Public'}
                              </div>
                              {entry.language && (
                                <div className="flex items-center gap-1">
                                  <Languages className="w-3 h-3" />
                                  {entry.language.toUpperCase()}
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                {getSentimentIcon(entry.sentiment)}
                                Sentiment
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {entry.transcript && (
                          <div className="bg-gray-700/30 rounded-lg p-4 mt-4">
                            <h5 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              Transcript
                            </h5>
                            <p className="text-gray-200 text-sm leading-relaxed">
                              {entry.transcript}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <a
                          href={entry.audioUrl}
                          download
                          className="p-2 text-green-400 hover:text-green-300 hover:bg-green-900/30 rounded-lg transition-all"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showUploadDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Upload Audio Entry</h3>
              <button
                onClick={() => setShowUploadDialog(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Select Audio File
                </label>
                <div
                  className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500 transition-all duration-300"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileAudio className="w-8 h-8 text-purple-400" />
                      <div>
                        <p className="text-white font-medium">{uploadFile.name}</p>
                        <p className="text-sm text-gray-400">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-white font-medium mb-2">Choose an audio file</p>
                      <p className="text-sm text-gray-400">MP3, WAV, M4A up to 50MB</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleFileUpload}
                  disabled={!uploadFile || uploading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {uploading ? 'Uploading...' : 'Upload Entry'}
                </button>
                <button
                  onClick={() => {
                    setShowUploadDialog(false);
                    setUploadFile(null);
                  }}
                  className="bg-gray-700 text-white py-3 px-4 rounded-xl hover:bg-gray-600 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes float-smooth {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px) rotate(0deg); }
          33% { transform: translate(-50%, -50%) translateY(-30px) rotate(120deg); }
          66% { transform: translate(-50%, -50%) translateY(-10px) rotate(240deg); }
        }
      `}</style>
    </div>
  );
}