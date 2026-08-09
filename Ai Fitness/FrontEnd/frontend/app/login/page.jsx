"use client";

import React, { useState } from 'react';
import AuthCards from './AuthCards';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(false);

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#0c0a09] flex antialiased relative overflow-hidden select-none w-full justify-center items-center font-sans">
      
      {/* ─── PASTEL ATMOSPHERIC GRADIENT ORBS ─── */}
      <div className="absolute top-[-100px] left-1/4 w-[550px] h-[550px] bg-gradient-to-tr from-[#a7e5d3]/40 via-[#c8b8e0]/40 to-[#f4c5a8]/35 rounded-full blur-[140px] pointer-events-none animate-orb-drift" />
      <div className="absolute -bottom-20 right-1/4 w-[450px] h-[450px] bg-gradient-to-br from-[#a8c8e8]/35 to-[#e8b8c4]/35 rounded-full blur-[130px] pointer-events-none" />

      <div className="relative w-full max-w-5xl h-[660px] bg-[#ffffff] border border-[#e7e5e4] lg:rounded-3xl overflow-hidden shadow-sm flex">
        
        {/* ─── LAYER 1: FORMS LAYER ─── */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 z-10">
          <div className="w-full flex justify-center">
            <AuthCards isLogin={false} setIsLogin={setIsLogin} />
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 z-10">
          <div className="w-full flex justify-center">
            <AuthCards isLogin={true} setIsLogin={setIsLogin} />
          </div>
        </div>

        {/* ─── LAYER 2: EDITORIAL SLIDING OVERLAY PANEL ─── */}
        <div 
          className={`hidden lg:flex absolute top-0 bottom-0 left-0 w-1/2 bg-[#fafafa] overflow-hidden items-center justify-center p-12 transition-transform duration-700 ease-in-out z-20 ${
            isLogin ? 'translate-x-0 border-r border-[#e7e5e4]' : 'translate-x-full border-l border-[#e7e5e4]'
          }`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,#c8b8e0/30,transparent_60%)] pointer-events-none" />
          
          <div className="relative z-10 w-full max-w-sm space-y-8 text-center">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#292524] text-white flex items-center justify-center font-serif text-lg font-light mx-auto shadow-sm">
                AI
              </div>
              <h1 className="text-4xl font-serif-editorial text-[#0c0a09]">
                AI Fitness Coach
              </h1>
              <p className="text-[#777169] text-xs leading-relaxed font-normal min-h-[44px]">
                {isLogin 
                  ? "Access your personalized fitness dashboard & AI body scan history." 
                  : "Join the premier AI platform for computer vision posture & habit tracking."
                }
              </p>
            </div>

            {/* Editorial Status Plate */}
            <div className="rounded-2xl bg-[#ffffff] border border-[#e7e5e4] p-5 shadow-sm space-y-2 text-left">
              <div className="flex items-center justify-between text-xs text-[#777169]">
                <span className="font-mono uppercase tracking-wider text-[10px]">Platform Portal</span>
                <span className="w-2 h-2 rounded-full bg-[#292524]" />
              </div>
              <p className="text-xs font-mono text-[#0c0a09] font-medium">
                Role Context: <span className="text-[#292524] font-bold">{isLogin ? "AUTHENTICATION" : "REGISTRATION"}</span>
              </p>
              <p className="text-xs text-[#4e4e4e]">
                {isLogin ? "Sign in to resume tracking" : "Create account for AI diet & training plans"}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
