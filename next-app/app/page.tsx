"use client";

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

const OraLandingPage = () => {
  const [soundWaves, setSoundWaves] = useState(Array(80).fill(0));

  useEffect(() => {
    const interval = setInterval(() => {
      setSoundWaves(prev => prev.map((_, index) => {
        const time = Date.now() * 0.003;
        
        const wave1 = Math.sin(time + index * 0.3) * 25;
        const wave2 = Math.sin(time * 1.7 + index * 0.2) * 15;
        const wave3 = Math.sin(time * 0.8 + index * 0.4) * 20;
        const wave4 = Math.sin(time * 2.3 + index * 0.15) * 10;
      
        const baseHeight = 30 + Math.sin(index * 0.1) * 10;
        const combinedHeight = baseHeight + wave1 + wave2 + wave3 + wave4;

        return Math.max(8, Math.min(90, combinedHeight));
      }));
    }, 80);
    
    return () => clearInterval(interval);
  }, []);

  const gradientOrbs = [
    { size: 600, x: 20, y: 30, colors: 'from-purple-600/20 to-indigo-800/30' },
    { size: 400, x: 80, y: 20, colors: 'from-violet-500/15 to-purple-700/25' },
    { size: 500, x: 75, y: 75, colors: 'from-indigo-600/20 to-purple-800/20' },
  ];

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const handlePlay = () => {
      audioRef.current?.play().catch(err => {
        console.error("Audio play blocked:", err);
      });
    };
    
    window.addEventListener("click", handlePlay);
    window.addEventListener("touchstart", handlePlay);

    return () => {
      window.removeEventListener("click", handlePlay);
      window.removeEventListener("touchstart", handlePlay);
    };
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-purple-900/50">
        <audio ref={audioRef} src="/snowman.mp3" autoPlay></audio>

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

        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute text-purple-400/60 text-3xl font-bold"
            style={{
              left: '15%',
              top: '20%',
              animation: 'floatNote1 20s ease-in-out infinite',
              textShadow: '0 0 10px rgba(147, 51, 234, 0.5)',
            }}
          >
            ♪
          </div>
          <div 
            className="absolute text-indigo-300/65 text-4xl font-bold"
            style={{
              right: '20%',
              top: '15%',
              animation: 'floatNote2 25s ease-in-out infinite',
              animationDelay: '3s',
              textShadow: '0 0 12px rgba(99, 102, 241, 0.5)',
            }}
          >
            ♫
          </div>
          <div 
            className="absolute text-purple-300/70 text-2xl font-bold"
            style={{
              left: '10%',
              bottom: '30%',
              animation: 'floatNote3 18s ease-in-out infinite',
              animationDelay: '7s',
              textShadow: '0 0 8px rgba(147, 51, 234, 0.6)',
            }}
          >
            ♪
          </div>
          <div 
            className="absolute text-violet-400/65 text-3xl font-bold"
            style={{
              right: '15%',
              bottom: '25%',
              animation: 'floatNote1 22s ease-in-out infinite',
              animationDelay: '12s',
              textShadow: '0 0 10px rgba(139, 92, 246, 0.5)',
            }}
          >
            ♬
          </div>
          <div 
            className="absolute text-indigo-400/60 text-2xl font-bold"
            style={{
              left: '70%',
              top: '40%',
              animation: 'floatNote2 28s ease-in-out infinite',
              animationDelay: '5s',
              textShadow: '0 0 9px rgba(99, 102, 241, 0.6)',
            }}
          >
            ♫
          </div>
          <div 
            className="absolute text-purple-200/65 text-3xl font-bold"
            style={{
              left: '25%',
              top: '60%',
              animation: 'floatNote3 24s ease-in-out infinite',
              animationDelay: '15s',
              textShadow: '0 0 11px rgba(147, 51, 234, 0.5)',
            }}
          >
            ♪
          </div>
          <div 
            className="absolute text-violet-300/70 text-4xl font-bold"
            style={{
              right: '30%',
              top: '70%',
              animation: 'floatNote1 26s ease-in-out infinite',
              animationDelay: '8s',
              textShadow: '0 0 12px rgba(139, 92, 246, 0.6)',
            }}
          >
            ♬
          </div>
          <div 
            className="absolute text-indigo-200/65 text-2xl font-bold"
            style={{
              left: '60%',
              bottom: '20%',
              animation: 'floatNote2 20s ease-in-out infinite',
              animationDelay: '18s',
              textShadow: '0 0 8px rgba(99, 102, 241, 0.5)',
            }}
          >
            ♫
          </div>
        </div>

        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(rgba(147, 51, 234, 0.4) 1px, transparent 1px),
              linear-gradient(90deg, rgba(147, 51, 234, 0.4) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative z-10 px-8 md:px-12 lg:px-16 py-16 md:py-20 lg:py-24">
        <div className="max-w-6xl mx-auto text-center">

          <div className="mb-14 mt-16 md:mb-12 lg:mb-12">
            <div 
              className="flex items-center justify-center gap-6 md:gap-10 lg:gap-12 mb-8 md:mb-10 lg:mb-12"
              style={{
                animation: 'fadeInScale 1.5s ease-out',
              }}
            >
              <div 
                className="w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 relative flex-shrink-0"
                style={{
                  animation: 'breathe 4s ease-in-out infinite 2s',
                }}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/30 to-indigo-600/30 blur-xl animate-pulse"></div>

                <div className="relative w-full h-full bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/30">
                  <div className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-white rounded-full flex items-center justify-center relative overflow-hidden">
                    <svg width="24" height="24" viewBox="0 0 48 48" className="text-gray-800 md:w-7 md:h-7 lg:w-8 lg:h-8">
                      <path 
                        d="M24 4C13.5 4 5 12.5 5 23s8.5 19 19 19c8.5 0 15.5-5.5 18-13M24 12c-6 0-11 5-11 11s5 11 11 11c4.5 0 8.5-2.5 10.5-6.5" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="3" 
                        strokeLinecap="round"
                        style={{ 
                          transformOrigin: '24px 24px', 
                          animation: 'rotate-smooth 12s linear infinite'
                        }}
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold">
                <span className="bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent">
                  Ora
                </span>
              </h1>
            </div>
          </div>

          <div 
            className="mb-12 md:mb-20 lg:mb-20 space-y-4 md:space-y-6 lg:space-y-8 px-4 md:px-8 lg:px-0"
            style={{
              animation: 'fadeInUp 1.5s ease-out 0.6s both',
            }}
          >
            <p className="text-2xl md:text-3xl lg:text-4xl text-white font-light leading-relaxed">
              Your voice, your story
            </p>
            
            <p className="text-lg md:text-xl lg:text-2xl text-gray-300 font-light max-w-3xl mx-auto leading-relaxed">
              Capture thoughts and memories through the natural power of voice journaling
            </p>
          </div>

          <div 
            className="mb-24 md:mb-24 lg:mb-32 px-4 md:px-8 lg:px-0"
            style={{
              animation: 'fadeInUp 1.5s ease-out 0.9s both',
            }}
          >
            <div className="flex items-center justify-center space-x-0.5 h-28 md:h-36 lg:h-40 mb-6 md:mb-8 lg:mb-10 w-full max-w-6xl mx-auto">
              {soundWaves.map((height, index) => (
                <div
                  key={index}
                  className="relative flex items-center justify-center flex-1"
                  style={{ height: '100%', maxWidth: '8px' }}
                >
                  <div
                    className="bg-gradient-to-t from-purple-600 via-purple-500 to-purple-400 rounded-full transition-all duration-100 ease-out"
                    style={{
                      width: '3px',
                      height: `${height}%`,
                      minHeight: '6px',
                      boxShadow: '0 0 6px rgba(147, 51, 234, 0.4)',
                      opacity: 0.7 + Math.sin(Date.now() * 0.002 + index * 0.2) * 0.3,
                      transform: `scaleY(${0.8 + Math.sin(Date.now() * 0.003 + index * 0.15) * 0.2})`,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div 
            className="mb-20 md:mb-24 lg:mb-28 px-4 md:px-8 lg:px-0"
            style={{
              animation: 'fadeInUp 1.5s ease-out 1.2s both',
            }}
          >
            <p className="text-gray-400 mb-5 lg:mb-10 font-medium text-base md:text-lg lg:text-xl">
              Listen to your thoughts flow
            </p>
            <Link href="/home">
              <button className="group relative px-10 cursor-pointer md:px-12 lg:px-16 py-4 md:py-5 lg:py-6 bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-white rounded-full font-semibold text-lg md:text-xl lg:text-2xl tracking-wide transition-all duration-500 ease-out hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/40 border border-purple-400/40 hover:border-purple-300/60 backdrop-blur-sm overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-indigo-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                
                <span className="relative z-10 font-['Inter','system-ui','-apple-system','sans-serif'] font-medium">
                  Begin Journaling
                </span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-smooth {
          0%, 100% { 
            transform: translate(-50%, -50%) translateY(0px) rotate(0deg); 
          }
          33% { 
            transform: translate(-50%, -50%) translateY(-30px) rotate(120deg); 
          }
          66% { 
            transform: translate(-50%, -50%) translateY(15px) rotate(240deg); 
          }
        }
        
        @keyframes floatNote1 {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) rotate(0deg);
            opacity: 0.4;
          }
          25% { 
            transform: translateY(-40px) translateX(20px) rotate(10deg);
            opacity: 0.3;
          }
          50% { 
            transform: translateY(-20px) translateX(-15px) rotate(-5deg);
            opacity: 0.5;
          }
          75% { 
            transform: translateY(-60px) translateX(10px) rotate(8deg);
            opacity: 0.35;
          }
        }
        
        @keyframes floatNote2 {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) rotate(0deg) scale(1);
            opacity: 0.35;
          }
          30% { 
            transform: translateY(-50px) translateX(-25px) rotate(-8deg) scale(1.1);
            opacity: 0.5;
          }
          60% { 
            transform: translateY(-30px) translateX(30px) rotate(12deg) scale(0.9);
            opacity: 0.3;
          }
          80% { 
            transform: translateY(-70px) translateX(-10px) rotate(-3deg) scale(1.05);
            opacity: 0.4;
          }
        }
        
        @keyframes floatNote3 {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) rotate(0deg);
            opacity: 0.45;
          }
          20% { 
            transform: translateY(-30px) translateX(15px) rotate(15deg);
            opacity: 0.35;
          }
          40% { 
            transform: translateY(-55px) translateX(-20px) rotate(-10deg);
            opacity: 0.55;
          }
          70% { 
            transform: translateY(-25px) translateX(25px) rotate(5deg);
            opacity: 0.3;
          }
        }
        
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        
        @keyframes rotate-smooth {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(30px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default OraLandingPage;