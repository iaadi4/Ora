"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';

const OraLandingPage = () => {
  const router = useRouter();

  const gradientOrbs = [
    { size: 500, x: 25, y: 25, colors: 'from-purple-600/20 to-indigo-800/25' },
    { size: 450, x: 75, y: 70, colors: 'from-violet-500/15 to-purple-700/20' },
    { size: 400, x: 15, y: 75, colors: 'from-indigo-600/15 to-purple-800/20' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-purple-900/50">
        {gradientOrbs.map((orb, index) => (
          <div
            key={index}
            className={`absolute rounded-full bg-gradient-to-r ${orb.colors} blur-3xl opacity-60`}
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

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute text-purple-400/40 text-3xl"
            style={{
              left: '15%',
              top: '20%',
              animation: 'floatNote 25s ease-in-out infinite',
            }}
          >
            ♪
          </div>
          <div 
            className="absolute text-indigo-300/45 text-4xl"
            style={{
              right: '20%',
              top: '15%',
              animation: 'floatNote 30s ease-in-out infinite',
              animationDelay: '5s',
            }}
          >
            ♫
          </div>
          <div 
            className="absolute text-violet-400/40 text-3xl"
            style={{
              right: '15%',
              bottom: '25%',
              animation: 'floatNote 28s ease-in-out infinite',
              animationDelay: '10s',
            }}
          >
            ♬
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

      <div className="relative z-10 px-8 md:px-12 lg:px-16 py-8 md:py-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs md:text-sm">O</span>
            </div>
            <span className="text-white font-bold text-lg md:text-xl">Ora</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="group relative px-6 md:px-8 py-3 md:py-3 bg-transparent text-sm md:text-base text-white font-medium border border-purple-400/40 rounded-full hover:bg-purple-500/10 transition-all duration-300 hover:border-purple-400/80 hover:shadow-lg hover:shadow-purple-500/20">
              Login
            </Link>
            <Link href="/signup" className="group relative px-6 md:px-8 py-3 md:py-3 bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-white font-semibold text-sm md:text-base rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/40 border border-purple-400/40">
              Sign up
            </Link>
          </div>
        </div>
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
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-600/20 blur-2xl"></div>

                <div className="relative w-full h-full bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/30">
                  <div className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-white rounded-full flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 48 48" className="text-gray-800 md:w-7 md:h-7 lg:w-8 lg:h-8 animate-spin" style={{ animationDuration: '8s' }}>
                      <path 
                        d="M24 4C13.5 4 5 12.5 5 23s8.5 19 19 19c8.5 0 15.5-5.5 18-13M24 12c-6 0-11 5-11 11s5 11 11 11c4.5 0 8.5-2.5 10.5-6.5" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="3" 
                        strokeLinecap="round"
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
            
            <p className="text-base md:text-lg lg:text-xl text-gray-300 font-light max-w-3xl mx-auto leading-relaxed">
              Capture thoughts and memories through the natural power of voice journaling. Beautifully preserved in your personal journals.
            </p>
          </div>

          <div 
            className="mb-24 md:mb-24 lg:mb-32 px-4 md:px-8 lg:px-0"
            style={{
              animation: 'fadeInUp 1.5s ease-out 0.9s both',
            }}
          >
            <div className="flex items-center justify-center space-x-1 h-32 md:h-40 lg:h-48 mb-6 md:mb-8 lg:mb-10 w-full max-w-6xl mx-auto">
                {Array.from({ length: 40 }).map((_, index) => {
                  const baseHeights = [20, 35, 50, 65, 75, 80, 82, 80, 75, 65, 50, 35, 25, 40, 60, 75, 85, 88, 85, 75, 60, 40, 30, 45, 65, 80, 90, 92, 90, 80, 65, 45, 35, 50, 70, 85, 95, 98, 95, 85];
                  const delay = (index * 0.08);
                  return (
                    <div
                      key={index}
                      className="bg-gradient-to-t from-purple-600 via-purple-500 to-purple-400 rounded-full hover:from-indigo-600 hover:via-indigo-500 hover:to-indigo-400"
                      style={{
                        width: '5px',
                        height: `${baseHeights[index]}%`,
                        minHeight: '8px',
                        opacity: 0.85,
                        boxShadow: `0 0 12px rgba(147, 51, 234, ${0.4 + (baseHeights[index] / 100) * 0.6})`,
                        animation: `waveform 1.5s ease-in-out infinite`,
                        animationDelay: `${delay}s`,
                      }}
                    />
                  );
                })}
              </div>
          </div>

          <div 
            className="mb-20 md:mb-24 lg:mb-28 px-4 md:px-8 lg:px-0"
            style={{
              animation: 'fadeInUp 1.5s ease-out 1.2s both',
            }}
          >
            <p className="text-gray-300 mb-8 lg:mb-12 font-medium text-base md:text-lg lg:text-xl">
              Begin capturing your thoughts today
            </p>
            <button onClick={() => router.push('/home')} className="group relative px-12 md:px-16 lg:px-20 py-4 md:py-5 lg:py-6 bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-white rounded-full font-bold text-lg md:text-xl lg:text-2xl tracking-wide transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-purple-500/50 border border-purple-400/40 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
              <span className="relative z-10">Begin Journaling</span>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-smooth {
          0%, 100% { 
            transform: translate(-50%, -50%) translateY(0px); 
          }
          50% { 
            transform: translate(-50%, -50%) translateY(-20px); 
          }
        }
        
        @keyframes floatNote {
          0%, 100% { 
            transform: translateY(0px) translateX(0px);
            opacity: 0.4;
          }
          50% { 
            transform: translateY(-40px) translateX(15px);
            opacity: 0.5;
          }
        }
        
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes waveform {
          0%, 100% {
            transform: scaleY(1);
            filter: brightness(1);
          }
          50% {
            transform: scaleY(0.6);
            filter: brightness(0.8);
          }
        }
      `}</style>
    </div>
  );
};

export default OraLandingPage;