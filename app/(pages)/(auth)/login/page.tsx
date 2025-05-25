"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import loginSchema from "@/lib/schemas/loginSchema";
import Link from "next/link";
import { z } from "zod";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { authClient } from "@/lib/authClient";
import { LoaderCircle } from "lucide-react";

export default function Login() {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    const { email, password } = values;
    await authClient.signIn.email({
      email,
      password,
      callbackURL: "/home"
    }, {
      onRequest: () => {
        setLoading(true);
        toast("Please wait", {
          position: "top-right",
          duration: 3000,
          icon: <LoaderCircle className="animate-spin h-4 w-4" />,
          style: {
            background: '#1a1a1a',
            color: '#ffffff',
            border: '1px solid #7c3aed'
          }
        })
      },
      onSuccess: () => {
        setLoading(false);
        form.reset();
      },
      onError: (ctx: { error: { message?: string } }) => {
        setLoading(false);
        toast.error(ctx.error.message || "Failed to login, please try again!", {
          position: "top-right",
          duration: 3000,
          style: {
            background: '#1a1a1a',
            color: '#ffffff',
            border: '1px solid #ef4444'
          }
        })
      }
    });
  }

  const gradientOrbs = [
    { size: 400, x: 15, y: 20, colors: 'from-purple-600/15 to-indigo-800/20' },
    { size: 300, x: 85, y: 80, colors: 'from-violet-500/10 to-purple-700/15' },
    { size: 350, x: 80, y: 15, colors: 'from-indigo-600/12 to-purple-800/18' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-black flex items-center justify-center px-4">
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
        <div className="text-center mb-8">
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

        <Card className="bg-black/40 border border-purple-500/20 backdrop-blur-xl shadow-2xl shadow-purple-500/10">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-semibold text-white">Welcome Back</CardTitle>
            <CardDescription className="text-gray-300">
              Continue your voice journaling journey
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200 font-medium">Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="Enter your email" 
                          {...field}
                          className="bg-white/5 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20 h-12 autofill:bg-black/40 autofill:text-white"
                          style={{
                            WebkitTextFillColor: 'white',
                            WebkitBoxShadow: '0 0 0 1000px rgba(0, 0, 0, 0.4) inset',
                          }}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center mb-2">
                        <FormLabel className="text-gray-200 font-medium">Password</FormLabel>
                        <Link 
                          href="/forget-password" 
                          className="text-sm text-purple-400 hover:text-purple-300 transition-colors font-medium"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Enter your password" 
                          {...field}
                          className="bg-white/5 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20 h-12 autofill:bg-black/40 autofill:text-white"
                          style={{
                            WebkitTextFillColor: 'white',
                            WebkitBoxShadow: '0 0 0 1000px rgba(0, 0, 0, 0.4) inset',
                          }}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit"
                  className="w-full cursor-pointer h-12 bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:via-purple-400 hover:to-indigo-500 text-white font-semibold text-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/25 border border-purple-400/40" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <LoaderCircle className="animate-spin h-5 w-5 mr-2" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          
          <CardFooter className="justify-center pt-6">
            <CardDescription className="text-gray-300">
              Don&apos;t have an account yet?{' '}
              <Link 
                href="/signup" 
                className="text-purple-400 hover:text-purple-300 transition-colors font-semibold"
              >
                Sign up
              </Link>
            </CardDescription>
          </CardFooter>
        </Card>
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