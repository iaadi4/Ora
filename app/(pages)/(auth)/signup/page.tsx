"use client"

import React, { useState } from 'react';
import { LoaderCircle, Eye, EyeOff } from 'lucide-react';
import { authClient } from '@/app/lib/authClient';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface Errors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

interface Toast {
  message: string;
  type: 'info' | 'success' | 'error' | 'loading';
}

export default function Signup() {
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Errors>({});
  const [toast, setToast] = useState<Toast | null>(null);

  const validateForm = (): Errors => {
    const newErrors: Errors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name as keyof Errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const showToast = (message: string, type: Toast['type'] = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  async function onSubmit(values: { name: string; email: string; password: string; confirmPassword: string }) {
    const { name, email, password } = values;
    await authClient.signUp.email({
      email,
      password,
      name,
      callbackURL: "/login"
    }, {
      onRequest: () => {
        setLoading(true);
        showToast("Please wait", 'loading');
      },
      onSuccess: () => {
        setLoading(false);
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        window.location.href = '/login';
      },
      onError: (ctx: { error: { message?: string } }) => {
        setLoading(false);
        showToast(ctx.error.message || "Failed to signup, please try again!", 'error');
      }
    });
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    await onSubmit(formData);
  };

  const gradientOrbs = [
    { size: 400, x: 15, y: 20, colors: 'from-purple-600/15 to-indigo-800/20' },
    { size: 300, x: 85, y: 80, colors: 'from-violet-500/10 to-purple-700/15' },
    { size: 350, x: 80, y: 15, colors: 'from-indigo-600/12 to-purple-800/18' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-black flex items-center justify-center px-4 py-8">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-black/80 border border-purple-500/30 backdrop-blur-xl p-4 rounded-lg shadow-2xl shadow-purple-500/20">
          <div className="flex items-center space-x-2">
            {toast.type === 'loading' && <LoaderCircle className="animate-spin h-4 w-4 text-purple-400" />}
            {toast.type === 'success' && <div className="w-4 h-4 bg-green-500 rounded-full"></div>}
            {toast.type === 'error' && <div className="w-4 h-4 bg-red-500 rounded-full"></div>}
            <span className="text-white text-sm">{toast.message}</span>
          </div>
        </div>
      )}

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

        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute text-purple-400/40 text-2xl font-bold"
            style={{
              left: '10%',
              top: '15%',
              animation: 'floatNote1 20s ease-in-out infinite',
              textShadow: '0 0 10px rgba(147, 51, 234, 0.3)',
            }}
          >
            ♪
          </div>
          <div 
            className="absolute text-indigo-300/45 text-3xl font-bold"
            style={{
              right: '15%',
              top: '20%',
              animation: 'floatNote2 25s ease-in-out infinite',
              animationDelay: '3s',
              textShadow: '0 0 12px rgba(99, 102, 241, 0.3)',
            }}
          >
            ♫
          </div>
          <div 
            className="absolute text-violet-400/45 text-2xl font-bold"
            style={{
              right: '10%',
              bottom: '25%',
              animation: 'floatNote1 22s ease-in-out infinite',
              animationDelay: '12s',
              textShadow: '0 0 10px rgba(139, 92, 246, 0.3)',
            }}
          >
            ♬
          </div>
        </div>

        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(147, 51, 234, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(147, 51, 234, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-6">
          <div 
            className="w-20 h-20 mx-auto mb-4 relative"
            style={{
              animation: 'fadeInScale 1.5s ease-out, breathe 4s ease-in-out infinite 2s',
            }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/30 to-indigo-600/30 blur-xl animate-pulse"></div>
            <div className="relative w-full h-full bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/30">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center relative overflow-hidden">
                <svg width="20" height="20" viewBox="0 0 48 48" className="text-gray-800">
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
          
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent">
              Ora
            </span>
          </h1>
        </div>

        <div className="bg-black/40 border border-purple-500/20 backdrop-blur-xl shadow-2xl shadow-purple-500/10 rounded-lg">
          <div className="text-center p-6 pb-4">
            <h2 className="text-2xl font-semibold text-white">Create Account</h2>
            <p className="text-gray-300 mt-2">
              Start your voice journaling journey
            </p>
          </div>
          
          <div className="px-6 pb-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-gray-200 font-medium block mb-2">Name</label>
                <input 
                  type="text" 
                  name="name"
                  placeholder="Enter your name" 
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-purple-500/30 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 h-12 px-4 rounded-md outline-none transition-all"
                  style={{
                    WebkitTextFillColor: 'white',
                    WebkitBoxShadow: '0 0 0 1000px rgba(0, 0, 0, 0.4) inset',
                  }}
                />
                {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="text-gray-200 font-medium block mb-2">Email</label>
                <input 
                  type="email" 
                  name="email"
                  placeholder="Enter your email" 
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-purple-500/30 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 h-12 px-4 rounded-md outline-none transition-all"
                  style={{
                    WebkitTextFillColor: 'white',
                    WebkitBoxShadow: '0 0 0 1000px rgba(0, 0, 0, 0.4) inset',
                  }}
                />
                {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
              </div>
              
              <div>
                <label className="text-gray-200 font-medium block mb-2">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="At least 6 characters" 
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-purple-500/30 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 h-12 px-4 pr-12 rounded-md outline-none transition-all"
                    style={{
                      WebkitTextFillColor: 'white',
                      WebkitBoxShadow: '0 0 0 1000px rgba(0, 0, 0, 0.4) inset',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="text-gray-200 font-medium block mb-2">Confirm Password</label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Re-type your password" 
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-purple-500/30 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 h-12 px-4 pr-12 rounded-md outline-none transition-all"
                    style={{
                      WebkitTextFillColor: 'white',
                      WebkitBoxShadow: '0 0 0 1000px rgba(0, 0, 0, 0.4) inset',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
              
              <button 
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:via-purple-400 hover:to-indigo-500 text-white font-semibold text-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/25 border border-purple-400/40 rounded-md" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <LoaderCircle className="animate-spin h-5 w-5 mr-2" />
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          </div>
          
          <div className="text-center p-6 pt-0">
            <p className="text-gray-300">
              Already have an account?{' '}
              <a 
                href="/login" 
                className="text-purple-400 hover:text-purple-300 transition-colors font-semibold"
              >
                Sign in
              </a>
            </p>
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
      `}</style>
    </div>
  );
}