"use client";

import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, Mic, Calendar, Search, Settings, User, LogOut } from 'lucide-react';

const JournalHomepage = () => {
  const [soundWaves, setSoundWaves] = useState(Array(40).fill(0));
  const [journals, setJournals] = useState([
    { id: '1', title: 'Daily Reflections', entries: 12, lastModified: '2 hours ago', color: 'purple' },
    { id: '2', title: 'Travel Adventures', entries: 8, lastModified: '1 day ago', color: 'indigo' },
    { id: '3', title: 'Work Thoughts', entries: 15, lastModified: '3 days ago', color: 'violet' },
  ]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newJournalTitle, setNewJournalTitle] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setSoundWaves(prev => prev.map((_, index) => {
        const time = Date.now() * 0.002;
        const wave1 = Math.sin(time + index * 0.4) * 15;
        const wave2 = Math.sin(time * 1.3 + index * 0.3) * 10;
        const baseHeight = 20 + Math.sin(index * 0.15) * 8;
        const combinedHeight = baseHeight + wave1 + wave2;
        return Math.max(6, Math.min(50, combinedHeight));
      }));
    }, 100);
    
    return () => clearInterval(interval);
  }, []);

  const gradientOrbs = [
    { size: 400, x: 15, y: 20, colors: 'from-purple-600/15 to-indigo-800/20' },
    { size: 300, x: 85, y: 80, colors: 'from-violet-500/10 to-purple-700/15' },
    { size: 350, x: 75, y: 25, colors: 'from-indigo-600/15 to-purple-800/15' },
  ];

  const handleCreateJournal = () => {
    if (newJournalTitle.trim()) {
      const newJournal = {
        id: Date.now().toString(),
        title: newJournalTitle,
        entries: 0,
        lastModified: 'Just now',
        color: ['purple', 'indigo', 'violet'][Math.floor(Math.random() * 3)]
      };
      setJournals([newJournal, ...journals]);
      setNewJournalTitle('');
      setShowCreateModal(false);
    }
  };

  const getJournalGradient = (color: string) => {
    const gradients: { purple: string, indigo: string, violet: string } = {
      purple: 'from-purple-500/20 to-purple-700/30',
      indigo: 'from-indigo-500/20 to-indigo-700/30',
      violet: 'from-violet-500/20 to-violet-700/30'
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
              transform: 'translate(-50%, -50%)',
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
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Header */}
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
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <User className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Welcome back
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Continue your journaling journey
            </p>
            
            {/* Mini Sound Wave Visualization */}
            <div className="flex items-center justify-center space-x-1 h-16 mb-8 w-full max-w-md mx-auto">
              {soundWaves.map((height, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-t from-purple-600 to-purple-400 rounded-full transition-all duration-150 ease-out"
                  style={{
                    width: '4px',
                    height: `${height}%`,
                    minHeight: '4px',
                    boxShadow: '0 0 4px rgba(147, 51, 234, 0.4)',
                    opacity: 0.6 + Math.sin(Date.now() * 0.003 + index * 0.3) * 0.4,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Create New Journal Button */}
          <div className="text-center mb-12">
            <button 
              onClick={() => setShowCreateModal(true)}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
            >
              <Plus className="w-6 h-6 transition-transform group-hover:rotate-90" />
              Create New Journal
            </button>
          </div>

          {/* Journals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {journals.map((journal) => (
              <div 
                key={journal.id}
                className="group relative p-6 bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${getJournalGradient(journal.color)} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
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
                      {journal.entries} entries
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-500">
                    Last modified {journal.lastModified}
                  </p>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>

          {/* Empty State */}
          {journals.length === 0 && (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-400 mb-2">No journals yet</h3>
              <p className="text-gray-500 mb-6">Create your first journal to get started</p>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Journal
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Journal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          
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
                onKeyPress={(e) => e.key === 'Enter' && handleCreateJournal()}
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-3 bg-gray-700 text-gray-300 rounded-xl font-medium hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateJournal}
                disabled={!newJournalTitle.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes float-smooth {
          0%, 100% { 
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