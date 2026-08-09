"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Activity, Shield, Brain, Zap, Flame, Camera, 
  ChevronRight, ArrowRight, Sparkles, CheckCircle2, Sliders, MessageSquare, Play, Volume2
} from 'lucide-react';

export default function RootPage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const storedAuth = localStorage.getItem('midnight_auth_session');
    if (storedAuth) {
      try {
        const parsed = JSON.parse(storedAuth);
        if (parsed.role === 'admin') {
          router.replace('/admin');
          return;
        } else {
          router.replace('/user');
          return;
        }
      } catch (e) {
        localStorage.removeItem('midnight_auth_session');
      }
    }
    setCheckingSession(false);
  }, [router]);

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center space-y-4 w-full">
        <div className="w-10 h-10 border-2 border-[#e7e5e4] border-t-[#292524] rounded-full animate-spin" />
        <p className="font-mono text-xs text-[#777169] tracking-widest uppercase animate-pulse">
          ElevenLabs Editorial Fitness Engine...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#0c0a09] flex flex-col selection:bg-[#c8b8e0]/40 relative overflow-x-hidden font-sans">
      
      {/* ─── ATMOSPHERIC DECORATIVE PASTEL GRADIENT ORBS ─── */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-[#a7e5d3]/40 via-[#f4c5a8]/35 to-[#c8b8e0]/40 blur-[130px] rounded-full pointer-events-none animate-orb-drift" />
      <div className="absolute top-[800px] -left-[150px] w-[500px] h-[500px] bg-gradient-to-br from-[#a8c8e8]/30 to-[#e8b8c4]/35 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-[1800px] -right-[150px] w-[600px] h-[600px] bg-gradient-to-bl from-[#f4c5a8]/30 via-[#c8b8e0]/30 to-[#a7e5d3]/30 blur-[150px] rounded-full pointer-events-none" />

      {/* Top Editorial Header */}
      <header className="border-b border-[#e7e5e4] bg-[#f5f5f5]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#292524] text-white flex items-center justify-center font-serif text-sm font-light shadow-sm">
              AI
            </div>
            <div>
              <span className="text-lg font-serif-editorial tracking-tight text-[#0c0a09]">
                AI Fitness Coach
              </span>
              <span className="ml-2.5 text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full bg-[#f0efed] text-[#777169] border border-[#e7e5e4]">
                Editorial Platform
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/login')}
              className="btn-outline-pill text-xs px-4 py-2"
            >
              Sign In
            </button>
            <button 
              onClick={() => router.push('/login')}
              className="btn-primary-pill text-xs px-5 py-2"
            >
              Try Free <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 max-w-5xl mx-auto text-center space-y-8 z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ffffff] border border-[#e7e5e4] text-xs text-[#4e4e4e] shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#292524] animate-pulse" />
          <span>Computer Vision & Context-Aware RAG Coaching</span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-serif-editorial text-[#0c0a09] leading-[1.05] tracking-[-0.03em] max-w-4xl mx-auto">
          Personalized AI fitness guidance crafted with editorial precision.
        </h1>

        <p className="text-base sm:text-lg text-[#4e4e4e] max-w-2xl mx-auto leading-relaxed font-normal tracking-[0.015em]">
          Upload body photography for MediaPipe keypoint posture detection & estimated BMI. Generate calorie & macro-precise diet plans, home or gym workout splits, daily habit streaks, and access our context-aware RAG assistant — backed by complete administrative control.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={() => router.push('/login')}
            className="btn-primary-pill text-sm px-6 py-3"
          >
            Launch End User Platform <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => router.push('/login')}
            className="btn-outline-pill text-sm px-6 py-3"
          >
            <Shield className="w-4 h-4 mr-1 text-[#292524]" /> Access Admin Panel
          </button>
        </div>
      </section>

      {/* Signature Atmospheric Gradient Orb Card Showcase */}
      <section className="max-w-7xl mx-auto px-6 py-12 w-full z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Mint Atmospheric Orb */}
          <div className="relative overflow-hidden rounded-[24px] bg-[#fafafa] border border-[#e7e5e4] p-8 space-y-6 shadow-sm">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#a7e5d3]/60 blur-[80px] rounded-full pointer-events-none" />
            <div className="relative z-10 space-y-3">
              <span className="badge-pill">01 • AI Body Scan</span>
              <h3 className="text-2xl font-serif-editorial text-[#0c0a09]">MediaPipe Posture Detection</h3>
              <p className="text-sm text-[#4e4e4e] leading-relaxed">
                Instant 4-angle landmark extraction (Front, Back, Left, Right). Computes cervical tilt, spine curvature alignment, and estimated BMI scores.
              </p>
            </div>
            <div className="relative z-10 p-4 rounded-2xl bg-[#ffffff] border border-[#e7e5e4] shadow-sm flex items-center justify-between text-xs font-mono text-[#292524]">
              <span>Landmark Alignment Index</span>
              <span className="font-bold text-[#0c0a09]">94.2% Optimal</span>
            </div>
          </div>

          {/* Card 2: Peach Atmospheric Orb */}
          <div className="relative overflow-hidden rounded-[24px] bg-[#fafafa] border border-[#e7e5e4] p-8 space-y-6 shadow-sm">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#f4c5a8]/60 blur-[80px] rounded-full pointer-events-none" />
            <div className="relative z-10 space-y-3">
              <span className="badge-pill">02 • Macro Precision</span>
              <h3 className="text-2xl font-serif-editorial text-[#0c0a09]">Allergy-Aware Diet Generator</h3>
              <p className="text-sm text-[#4e4e4e] leading-relaxed">
                Generates high-protein, calorie-matched daily meal schedules custom-tailored to user allergies (peanuts, gluten, lactose) and training targets.
              </p>
            </div>
            <div className="relative z-10 p-4 rounded-2xl bg-[#ffffff] border border-[#e7e5e4] shadow-sm flex items-center justify-between text-xs font-mono text-[#292524]">
              <span>Daily Target</span>
              <span className="font-bold text-[#0c0a09]">2,450 kcal • 175g Protein</span>
            </div>
          </div>

        </div>
      </section>

      {/* Feature Grid (3-Up) */}
      <section className="max-w-7xl mx-auto px-6 py-16 w-full z-10 space-y-12">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-3xl font-serif-editorial text-[#0c0a09]">Comprehensive Fitness Architecture</h2>
          <p className="text-sm text-[#777169]">Every core user function backed by real-time administrative oversight</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="card-editorial p-6 space-y-4">
            <div className="w-10 h-10 rounded-full bg-[#f0efed] flex items-center justify-center text-[#292524]">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-serif-editorial text-[#0c0a09]">Habit & Streak Tracking</h3>
            <p className="text-xs text-[#4e4e4e] leading-relaxed">
              Log daily water intake (ml), sleep duration, workout completions, and build streak consistency scores.
            </p>
          </div>

          <div className="card-editorial p-6 space-y-4">
            <div className="w-10 h-10 rounded-full bg-[#f0efed] flex items-center justify-center text-[#292524]">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-serif-editorial text-[#0c0a09]">Context-Aware RAG AI</h3>
            <p className="text-xs text-[#4e4e4e] leading-relaxed">
              Query your active training split, diet macros, and recovery metrics with safety-moderated RAG AI responses.
            </p>
          </div>

          <div className="card-editorial p-6 space-y-4">
            <div className="w-10 h-10 rounded-full bg-[#f0efed] flex items-center justify-center text-[#292524]">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-serif-editorial text-[#0c0a09]">Advanced Admin Moderation</h3>
            <p className="text-xs text-[#4e4e4e] leading-relaxed">
              User RBAC management, prompt tuning, photo moderation filters, manual plan overrides, and real-time audit logs.
            </p>
          </div>

        </div>
      </section>

      {/* Atmospheric CTA Band */}
      <section className="py-24 px-6 text-center max-w-4xl mx-auto z-10 space-y-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#c8b8e0] via-[#f4c5a8] to-[#a7e5d3] p-0.5 mx-auto shadow-md">
          <div className="w-full h-full bg-[#ffffff] rounded-full flex items-center justify-center text-[#0c0a09] font-serif text-lg font-light">
            AI
          </div>
        </div>
        
        <h2 className="text-4xl sm:text-5xl font-serif-editorial text-[#0c0a09]">
          Elevate your daily physical potential.
        </h2>

        <p className="text-sm text-[#777169] max-w-lg mx-auto">
          Start your personalized AI onboarding body scan today or explore the administrative control suite.
        </p>

        <div>
          <button
            onClick={() => router.push('/login')}
            className="btn-primary-pill text-sm px-8 py-3.5"
          >
            Get Started Now <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e7e5e4] py-8 text-center text-xs text-[#777169] bg-[#f5f5f5]">
        <p>AI Fitness Coach • Editorial Magazine Voice-AI Design System</p>
      </footer>

    </div>
  );
}
