"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, Dumbbell, Activity, Shield, Sparkles, RefreshCw,
  LogOut, ChevronRight, CheckCircle2, Flame, HeartPulse, Edit3
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function EmployeeDashboard() {
  const router = useRouter();
  const [userPlans, setUserPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserItem, setSelectedUserItem] = useState(null);
  const [generatingWorkout, setGeneratingWorkout] = useState(false);

  const [workoutForm, setWorkoutForm] = useState({
    goal: 'Muscle Building',
    splitType: 'Gym (Full Equipment Split)',
    trainerNotes: 'Focus on posture realignment and progressive overload.'
  });

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const fetchEmployeeData = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/employee/users');
      if (res.ok) {
        const data = await res.json();
        setUserPlans(data);
        if (data.length > 0 && !selectedUserItem) {
          setSelectedUserItem(data[0]);
        }
      }
    } catch (e) {
      toast.error("Could not load user data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/users/logout', { method: 'POST', credentials: 'include' });
    } catch (e) {}
    localStorage.removeItem('midnight_auth_session');
    toast.success('Logged out');
    router.replace('/login');
  };

  const handleGenerateAiWorkout = async (e) => {
    e.preventDefault();
    if (!selectedUserItem) return;

    setGeneratingWorkout(true);
    try {
      const res = await fetch('http://localhost:5000/api/employee/generate-workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: selectedUserItem.user._id,
          customGoal: workoutForm.goal,
          customSplit: workoutForm.splitType,
          notes: workoutForm.trainerNotes
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`AI Workout Split generated for ${selectedUserItem.user.name}! 🎉`);
        fetchEmployeeData();
      } else {
        toast.error(data.error || "Failed to generate workout");
      }
    } catch (err) {
      toast.error("Error connecting to AI engine");
    } finally {
      setGeneratingWorkout(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f7f3] flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-2 border-[#e2ded4] border-t-[#ea2804] rounded-full animate-spin" />
        <p className="font-mono text-xs text-[#575757]">Loading Trainer & Employee Portal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f7f3] text-[#202020] flex flex-col font-sans antialiased relative">
      
      {/* ─── TOP NAVIGATION HEADER (Replicate Theme) ─── */}
      <header className="border-b border-[rgba(32,32,32,0.12)] bg-[#f9f7f3] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#ea2804] text-white flex items-center justify-center font-bold text-xs">
              e/
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-[#202020] leading-none">Employee Trainer Portal</h1>
              <span className="badge-orange text-[10px] inline-block mt-0.5">
                AI Workout Generator Active
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="p-2 rounded-full border border-[rgba(32,32,32,0.12)] hover:bg-red-50 text-[#575757] hover:text-[#ea2804] transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="max-w-7xl mx-auto px-6 py-8 w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: User Selection List */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-[#202020] leading-none flex items-center gap-2">
              <Users className="w-5 h-5 text-[#ea2804]" /> Assigned User Roster
            </h2>
            <p className="text-xs text-[#575757]">Select a user to review AI posture metrics and generate custom AI workout splits.</p>
          </div>

          <div className="space-y-3">
            {userPlans.length === 0 ? (
              <div className="card-editorial p-6 text-center text-xs text-[#575757]">
                No registered users found in system.
              </div>
            ) : (
              userPlans.map(item => (
                <button
                  key={item.user._id}
                  onClick={() => setSelectedUserItem(item)}
                  className={`w-full card-editorial p-4 text-left transition-all flex items-center justify-between ${
                    selectedUserItem?.user._id === item.user._id
                      ? 'border-[#ea2804] ring-2 ring-[#ea2804]/20 bg-[#ffffff] shadow-md'
                      : 'hover:border-[#202020]'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#202020]">{item.user.name}</span>
                      <span className="badge-pill text-[9px]">{item.plan?.goal || 'Muscle Building'}</span>
                    </div>
                    <p className="text-xs text-[#575757] truncate">{item.user.email}</p>
                    <div className="flex items-center gap-3 text-[10px] font-mono text-[#575757] pt-1">
                      <span>Posture: {item.user.postureScore || 88}%</span>
                      <span>BMI: {item.user.estimatedBMI || 22.4}</span>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${selectedUserItem?.user._id === item.user._id ? 'text-[#ea2804]' : 'text-[#8d8d8d]'}`} />
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Right Column: AI Workout Generator & Display */}
        <main className="lg:col-span-8 space-y-6">
          {selectedUserItem ? (
            <div className="space-y-6">
              
              {/* Selected User Metrics Bar */}
              <div className="card-editorial p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[rgba(32,32,32,0.12)] pb-3">
                  <div>
                    <h3 className="font-bold text-xl text-[#202020] leading-none">
                      {selectedUserItem.user.name}'s AI Profile
                    </h3>
                    <p className="text-xs text-[#575757] mt-1">{selectedUserItem.user.email}</p>
                  </div>
                  <span className="badge-orange text-xs">
                    {selectedUserItem.plan?.goal || 'Muscle Building'} Target
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono text-xs">
                  <div className="bg-[#f3f0e8] p-3 rounded-2xl border border-[rgba(32,32,32,0.12)]">
                    <span className="block text-[9px] text-[#575757] uppercase">POSTURE SCORE</span>
                    <span className="font-bold text-base text-[#202020]">{selectedUserItem.user.postureScore || 88}%</span>
                  </div>
                  <div className="bg-[#f3f0e8] p-3 rounded-2xl border border-[rgba(32,32,32,0.12)]">
                    <span className="block text-[9px] text-[#575757] uppercase">ESTIMATED BMI</span>
                    <span className="font-bold text-base text-[#202020]">{selectedUserItem.user.estimatedBMI || 22.4}</span>
                  </div>
                  <div className="bg-[#f3f0e8] p-3 rounded-2xl border border-[rgba(32,32,32,0.12)]">
                    <span className="block text-[9px] text-[#575757] uppercase">EQUIPMENT SPLIT</span>
                    <span className="font-bold text-xs text-[#202020] truncate block">{selectedUserItem.plan?.planType || 'Gym'}</span>
                  </div>
                  <div className="bg-[#f3f0e8] p-3 rounded-2xl border border-[rgba(32,32,32,0.12)]">
                    <span className="block text-[9px] text-[#575757] uppercase">DAILY CALORIES</span>
                    <span className="font-bold text-base text-[#202020]">{selectedUserItem.plan?.dietPlan?.dailyCalories || 2450} kcal</span>
                  </div>
                </div>
              </div>

              {/* Form to Generate New Custom AI Workout Split */}
              <div className="card-editorial p-6 space-y-4">
                <h3 className="font-bold text-lg text-[#202020] border-b border-[rgba(32,32,32,0.12)] pb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#ea2804]" /> Generate AI Custom Workout Split
                </h3>
                <form onSubmit={handleGenerateAiWorkout} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono text-[#575757] mb-1">Target Fitness Goal</label>
                      <select
                        value={workoutForm.goal}
                        onChange={(e) => setWorkoutForm({ ...workoutForm, goal: e.target.value })}
                        className="input-replicate w-full text-xs"
                      >
                        <option value="Muscle Building">Muscle Building / Hypertrophy</option>
                        <option value="Weight Loss">Weight Loss / Fat Oxidation</option>
                        <option value="Weight Gain">Weight Gain / Caloric Surplus</option>
                        <option value="Fitness">General Fitness & Mobility</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-[#575757] mb-1">Equipment & Split Type</label>
                      <select
                        value={workoutForm.splitType}
                        onChange={(e) => setWorkoutForm({ ...workoutForm, splitType: e.target.value })}
                        className="input-replicate w-full text-xs"
                      >
                        <option value="Gym (Full Equipment Split)">Gym (Full Equipment Split)</option>
                        <option value="Dumbbell & Home Equipment">Dumbbell & Home Equipment</option>
                        <option value="Bodyweight & Calisthenics">Bodyweight & Calisthenics</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-[#575757] mb-1">Trainer Guidance Notes for AI Engine</label>
                    <input
                      type="text"
                      placeholder="e.g. Focus on chest contraction, control tempo 3-1-1..."
                      value={workoutForm.trainerNotes}
                      onChange={(e) => setWorkoutForm({ ...workoutForm, trainerNotes: e.target.value })}
                      className="input-replicate w-full text-xs"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={generatingWorkout}
                      className="btn-primary-pill text-xs px-6 py-2.5"
                    >
                      {generatingWorkout ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" /> AI LLM Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Generate AI Workout Split
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Display AI-Generated Weekly Workout Split */}
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-[#202020] flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Dumbbell className="w-5 h-5 text-[#ea2804]" /> AI Generated Workout Split
                  </span>
                  <span className="badge-pill text-[10px]">OpenRouter AI Tailored</span>
                </h3>

                {!selectedUserItem.plan?.workoutPlan?.weeklySplit ? (
                  <div className="code-block-replicate text-center text-xs py-8">
                    No workout split generated yet. Click "Generate AI Workout Split" above to create one for this user!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedUserItem.plan.workoutPlan.weeklySplit.map((dayPlan, idx) => (
                      <div key={idx} className="card-editorial p-5 space-y-3">
                        <div className="flex items-center justify-between border-b border-[rgba(32,32,32,0.12)] pb-2">
                          <span className="badge-orange text-[10px]">{dayPlan.day}</span>
                          <h4 className="font-bold text-sm text-[#202020]">{dayPlan.title}</h4>
                        </div>

                        <div className="space-y-2">
                          {dayPlan.exercises.map((ex, exIdx) => (
                            <div key={exIdx} className="bg-[#f3f0e8] p-3 rounded-xl flex items-center justify-between text-xs">
                              <div>
                                <span className="font-bold text-[#202020] block">{ex.name}</span>
                                <span className="text-[10px] text-[#575757] italic">{ex.notes}</span>
                              </div>
                              <span className="font-mono text-xs bg-[#ffffff] px-2.5 py-1 rounded-lg border border-[rgba(32,32,32,0.12)] font-bold text-[#ea2804]">
                                {ex.sets} sets × {ex.reps}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="card-editorial p-12 text-center text-xs text-[#575757]">
              Select a user from the left roster to view and generate their AI Workout Split.
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
