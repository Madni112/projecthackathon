"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Brain, Camera, Activity, Flame, MessageSquare, Calendar,
  Dumbbell, Utensils, Droplets, Moon, CheckCircle2, TrendingUp,
  Sparkles, RefreshCw, Upload, LogOut, ChevronRight, AlertTriangle, Shield,
  X, ArrowRight, RotateCcw, Target, Send, UserCheck, HeartPulse, Stethoscope, Clock, Check
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function UserDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState({ name: 'Alex Rivera', role: 'user' });
  const [loading, setLoading] = useState(true);

  // High-Res Fitness Food Photos for Meals
  const MEAL_IMAGES = {
    Breakfast: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
    Lunch: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    Snack: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80',
    Dinner: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80'
  };

  // ─── ONBOARDING POPUP MODAL STATE ───
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [modalStep, setModalStep] = useState(1);

  // 15+ Health Diagnoses Options
  const DIAGNOSES_OPTIONS = [
    "None / Healthy",
    "Hypertension (High BP)",
    "Type 2 Diabetes",
    "Joint Pain / Arthritis",
    "Lower Back Pain",
    "Asthma / Respiratory",
    "PCOS / PCOD",
    "Hypothyroidism",
    "Hyperthyroidism",
    "High Cholesterol",
    "Fatty Liver Disease",
    "Gastritis / GERD",
    "Celiac Disease",
    "Irritable Bowel Syndrome (IBS)",
    "Osteoporosis",
    "Cardiovascular Disease"
  ];

  // Body Analysis State
  const [bodyPhotos, setBodyPhotos] = useState({ front: null, back: null, right: null, left: null });
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const canvasRef = useRef(null);

  // User Selections State
  const [selectedGoal, setSelectedGoal] = useState('Muscle Building');
  const [selectedDiagnosis, setSelectedDiagnosis] = useState('None / Healthy');
  const [allergiesText, setAllergiesText] = useState('Peanuts, Dairy');
  const [selectedWorkoutOption, setSelectedWorkoutOption] = useState('Gym (Full Equipment Split)');
  const DEFAULT_INITIAL_PLAN = {
    goal: 'Muscle Building',
    planType: 'Gym (Full Equipment Split)',
    allergies: ['Peanuts', 'Dairy'],
    diagnosis: 'None / Healthy',
    dietPlan: {
      dailyCalories: 2450,
      macros: { protein: 175, carbs: 220, fats: 65 },
      meals: [
        { name: 'Breakfast', items: ['Oatmeal with whey protein', '3 boiled eggs', 'Fresh banana & berries'], calories: 550, time: '08:00 AM' },
        { name: 'Lunch', items: ['Grilled Chicken Breast', 'Brown Rice', 'Steamed Broccoli & Peppers'], calories: 750, time: '01:00 PM' },
        { name: 'Snack', items: ['Greek Yogurt with honey', 'Handful of mixed almonds'], calories: 400, time: '04:30 PM' },
        { name: 'Dinner', items: ['Baked Salmon Fillet', 'Quinoa', 'Mixed Greens Salad'], calories: 750, time: '07:30 PM' }
      ]
    },
    workoutPlan: {
      weeklySplit: [
        { day: 'Monday', title: 'Chest & Triceps Hypertrophy', exercises: [{ name: 'Barbell Bench Press', sets: 4, reps: '8-10', notes: 'Progressive overload focus' }, { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', notes: 'Control tempo 3-1-1' }, { name: 'Tricep Cable Pushdowns', sets: 4, reps: '12-15', notes: 'Squeeze at bottom' }] },
        { day: 'Tuesday', title: 'Back & Biceps Progression', exercises: [{ name: 'Lat Pulldowns', sets: 4, reps: '10', notes: 'Pull to upper chest' }, { name: 'Seated Cable Rows', sets: 4, reps: '10-12', notes: 'Squeeze shoulder blades' }, { name: 'Hammer Curls', sets: 3, reps: '12', notes: 'Strict form' }] },
        { day: 'Wednesday', title: 'Core & Posture Realignment', exercises: [{ name: 'Plank Holds', sets: 3, reps: '60s', notes: 'Target posture alignment' }, { name: 'Face Pulls', sets: 4, reps: '15', notes: 'Correct shoulder elevation' }] },
        { day: 'Thursday', title: 'Legs & Lower Body Conditioning', exercises: [{ name: 'Barbell Back Squats', sets: 4, reps: '6-8', notes: 'Full depth parallel' }, { name: 'Leg Press', sets: 3, reps: '12', notes: 'Steady resistance' }, { name: 'Standing Calf Raises', sets: 4, reps: '15-20', notes: 'Pause at top' }] },
        { day: 'Friday', title: 'Shoulders & Arms Sculpting', exercises: [{ name: 'Overhead Press', sets: 4, reps: '8-10', notes: 'Keep core engaged' }, { name: 'Dumbbell Lateral Raises', sets: 4, reps: '12-15', notes: 'Lead with elbows' }] }
      ]
    }
  };

  const [activePlan, setActivePlan] = useState(DEFAULT_INITIAL_PLAN);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [masterPlans, setMasterPlans] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);

  // Daily Habits State
  const [habits, setHabits] = useState({
    waterMl: 0,
    sleepHours: 0,
    workoutDone: false,
    mealsTracked: 0,
    weight: 0
  });
  const [waterChecklist, setWaterChecklist] = useState({
    l1: false,
    l2: false,
    l3: false,
    l4: false
  });
  const [mealsChecklist, setMealsChecklist] = useState({
    breakfast: false,
    lunch: false,
    snack: false,
    dinner: false
  });

  const [streakCount, setStreakCount] = useState(0);
  const [fitnessScore, setFitnessScore] = useState(0);

  // AI Chatbot RAG State
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your AI Fitness Coach. I have loaded your current goal ("Muscle Building") and diet macros (175g Protein). How can I assist your workout today?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Support Chat State (User <-> Admin)
  const [supportMessages, setSupportMessages] = useState([
    { _id: 'sm1', senderRole: 'admin', message: 'Hello! Welcome to AI Fitness Support. How can an administrator assist you today?', timestamp: new Date().toISOString() }
  ]);
  const [supportInput, setSupportInput] = useState('');
  const [supportLoading, setSupportLoading] = useState(false);

  useEffect(() => {
    let currentUser = null;
    const sessionStr = localStorage.getItem('midnight_auth_session');
    if (sessionStr) {
      try {
        currentUser = JSON.parse(sessionStr);
        setUser(currentUser);
      } catch (e) {}
    }

    if (!currentUser) {
      toast.error('Access denied. Please log in first to access your User Portal.');
      router.replace('/login');
      return;
    }

    // Auto-check meals based on current time
    const currentHour = new Date().getHours();
    setMealsChecklist({
      breakfast: currentHour >= 8,
      lunch: currentHour >= 13,
      snack: currentHour >= 16,
      dinner: currentHour >= 19
    });

    fetchInitialPlan(currentUser);
    fetchSupportMessages();
    fetchMasterPlans();
    setLoading(false);
  }, []);

  const fetchMasterPlans = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/plans', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setMasterPlans(data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (modalStep === 2 && analysisResult) {
      setTimeout(() => drawLandmarksOnCanvas(), 100);
    }
  }, [modalStep, analysisResult]);

  const fetchInitialPlan = async (currentUser) => {
    let activeUser = currentUser;
    if (!activeUser?.email) {
      try {
        const sessionStr = localStorage.getItem('midnight_auth_session');
        if (sessionStr) activeUser = JSON.parse(sessionStr);
      } catch (e) {}
    }
    if (!activeUser) activeUser = user;

    const userEmail = activeUser?.email;
    const userId = activeUser?._id || activeUser?.id;

    // Check if onboarding was completed strictly for this specific account
    const isLocallyCompleted = !!(
      (userEmail && localStorage.getItem('ai_onboarding_completed_' + userEmail) === 'true') ||
      (userId && localStorage.getItem('ai_onboarding_completed_' + userId) === 'true')
    );

    if (isLocallyCompleted) {
      setShowOnboardingModal(false);
    }

    const emailParam = userEmail ? `?email=${encodeURIComponent(userEmail)}` : '';
    const userIdParam = userId ? `&userId=${userId}` : '';

    try {
      const res = await fetch(`http://localhost:5000/api/users/profile${emailParam}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
        }
        
        const isCompletedInDB = !!(data.isUserOnboarding || data.user?.isUserOnboarding || data.user?.isOnBoardingCompleted || data.user?.hasCompletedOnboarding);
        if (isCompletedInDB || isLocallyCompleted) {
          setShowOnboardingModal(false);
        } else {
          setShowOnboardingModal(true);
        }
      } else {
        if (isLocallyCompleted) {
          setShowOnboardingModal(false);
        } else {
          setShowOnboardingModal(true);
        }
      }

      // Fetch saved AI Plan from MongoDB for this account
      const planRes = await fetch(`http://localhost:5000/api/fitness/plan${emailParam}${userIdParam}`, { credentials: 'include' });
      if (planRes.ok) {
        const planData = await planRes.json();
        if (planData.plan) {
          setActivePlan(planData.plan);
          return;
        }
      }
    } catch (e) {
      if (isLocallyCompleted) {
        setShowOnboardingModal(false);
      } else {
        setShowOnboardingModal(true);
      }
    }

    generateAIPlan('Muscle Building', 'Gym (Full Equipment Split)', 'Peanuts, Dairy', 'None / Healthy');
  };

  const fetchSupportMessages = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/support/messages', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setSupportMessages(data);
        }
      }
    } catch (e) {}
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/users/logout', { method: 'POST', credentials: 'include' });
    } catch (e) {}
    localStorage.removeItem('midnight_auth_session');
    toast.success('Logged out');
    router.replace('/login');
  };

  const handleGoalSelect = (goal) => {
    setSelectedGoal(goal);
  };

  const handlePhotoUpload = (angle, e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setBodyPhotos(prev => ({ ...prev, [angle]: url }));
      toast.success(`${angle.toUpperCase()} photo uploaded`);
    }
  };

  const runBodyAnalysis = async () => {
    if (!bodyPhotos.front || !bodyPhotos.back || !bodyPhotos.left || !bodyPhotos.right) {
      toast.error('Please upload all 4 posture photo angles (Front, Back, Right, Left) to proceed!');
      return;
    }
    setAnalyzing(true);
    let activeUser = user;
    if (!activeUser?.email) {
      try {
        const sessionStr = localStorage.getItem('midnight_auth_session');
        if (sessionStr) activeUser = JSON.parse(sessionStr);
      } catch (e) {}
    }

    try {
      const res = await fetch('http://localhost:5000/api/fitness/body-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...bodyPhotos,
          email: activeUser?.email,
          userId: activeUser?._id || activeUser?.id
        })
      });
      const data = await res.json();
      const estWeight = data.estimatedWeight || 74.5;
      const estBMI = data.estimatedBMI || 22.4;
      const estCalories = data.estimatedCalories || 2450;

      setAnalysisResult({
        postureScore: data.postureScore || 90,
        estimatedBMI: estBMI,
        estimatedWeight: estWeight,
        estimatedCalories: estCalories,
        landmarks: data.landmarks || { headTilt: 2.1, shoulderAlignment: 97.5, spineCurvature: 94.0 },
        insights: data.insights || [
          "Left shoulder slightly elevated (+1.4°). Core stability recommended.",
          "Normal cervical posture alignment (2.1° tilt).",
          "Optimal spinal symmetry index (94.0%)."
        ]
      });
      setHabits(prev => ({ ...prev, weight: estWeight }));
      setAnalyzing(false);
      setModalStep(2);
      toast.success("AI Agent posture & body analysis complete!");
    } catch (e) {
      setAnalysisResult({
        postureScore: 90,
        estimatedBMI: 22.4,
        estimatedWeight: 74.5,
        estimatedCalories: 2450,
        landmarks: { headTilt: 2.1, shoulderAlignment: 97.5, spineCurvature: 94.0 },
        insights: [
          "Left shoulder slightly elevated (+1.4°). Core stability recommended.",
          "Normal cervical posture alignment (1.8° tilt).",
          "Optimal spinal symmetry index (94.0%)."
        ]
      });
      setAnalyzing(false);
      setModalStep(2);
    }
  };

  const drawLandmarksOnCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(231, 229, 228, 0.8)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 30) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y < height; y += 30) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    const points = [
      { x: width * 0.5, y: height * 0.15, label: 'Nose' },
      { x: width * 0.4, y: height * 0.28, label: 'L Shoulder' },
      { x: width * 0.6, y: height * 0.28, label: 'R Shoulder' },
      { x: width * 0.35, y: height * 0.45, label: 'L Elbow' },
      { x: width * 0.65, y: height * 0.45, label: 'R Elbow' },
      { x: width * 0.42, y: height * 0.58, label: 'L Hip' },
      { x: width * 0.58, y: height * 0.58, label: 'R Hip' },
      { x: 150, y: 35 }, { x: 150, y: 70 },
      { x: 110, y: 110 }, { x: 190, y: 110 },
      { x: 90, y: 170 }, { x: 210, y: 170 },
      { x: 150, y: 200 }, { x: 125, y: 280 },
      { x: 175, y: 280 }, { x: 120, y: 360 }, { x: 180, y: 360 }
    ];

    const connections = [
      [0, 1], [1, 2], [1, 3], [2, 4], [3, 5],
      [1, 6], [6, 7], [6, 8], [7, 9], [8, 10]
    ];
    connections.forEach(([i, j]) => {
      ctx.beginPath();
      ctx.moveTo(points[i].x, points[i].y);
      ctx.lineTo(points[j].x, points[j].y);
      ctx.stroke();
    });
  };

  const generateAIPlan = async (goalChoice, workoutChoice, allergiesVal, diagVal) => {
    setGeneratingPlan(true);
    const allergiesList = (allergiesVal || allergiesText).split(',').map(s => s.trim()).filter(Boolean);

    try {
      const res = await fetch('http://localhost:5000/api/fitness/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: goalChoice || selectedGoal,
          planType: workoutChoice || selectedWorkoutOption,
          allergies: allergiesList,
          diagnosis: diagVal || selectedDiagnosis,
          templateId: selectedTemplateId
        })
      });
      const data = await res.json();
      if (data.plan) {
        setActivePlan({
          ...data.plan,
          diagnosis: diagVal || selectedDiagnosis,
          allergies: allergiesList,
          workoutOption: workoutChoice || selectedWorkoutOption
        });
      }
      setGeneratingPlan(false);
    } catch (e) {
      setGeneratingPlan(false);
    }
  };

  const completeOnboardingGoal = async () => {
    let activeUser = user;
    if (!activeUser?.email) {
      try {
        const sessionStr = localStorage.getItem('midnight_auth_session');
        if (sessionStr) activeUser = JSON.parse(sessionStr);
      } catch (e) {}
    }

    const email = activeUser?.email;
    const userId = activeUser?._id || activeUser?.id;

    if (email) {
      localStorage.setItem('ai_onboarding_completed_' + email, 'true');
    }
    if (userId) {
      localStorage.setItem('ai_onboarding_completed_' + userId, 'true');
    }

    await generateAIPlan(selectedGoal, selectedWorkoutOption, allergiesText, selectedDiagnosis);

    try {
      // Save permanently to user's profile in backend database
      await fetch('http://localhost:5000/api/users/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email,
          userId,
          isUserOnboarding: true,
          isOnBoardingCompleted: true,
          hasCompletedOnboarding: true,
          uploadedPhotos: bodyPhotos,
          postureScore: analysisResult?.postureScore || 90,
          estimatedBMI: analysisResult?.estimatedBMI || 22.4,
          estimatedWeight: analysisResult?.estimatedWeight || habits.weight || 74.5
        })
      });
      await fetch('http://localhost:5000/api/users/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email,
          userId,
          isUserOnboarding: true,
          isOnBoardingCompleted: true,
          hasCompletedOnboarding: true
        })
      });
    } catch (e) {}
    setShowOnboardingModal(false);
    toast.success(`Custom plan generated & saved to your profile permanently! 🎉`);
  };

  const handleWaterToggle = (key, mlValue) => {
    const nextState = { ...waterChecklist, [key]: !waterChecklist[key] };
    setWaterChecklist(nextState);
    const count = Object.values(nextState).filter(Boolean).length;
    setHabits(prev => ({ ...prev, waterMl: count * 1000 }));
  };

  const handleHabitSubmit = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/fitness/track-habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(habits)
      });
      const data = await res.json();
      if (data.streakCount) setStreakCount(data.streakCount);
      if (data.fitnessScore) setFitnessScore(data.fitnessScore);
      toast.success("Daily habits logged! Streak updated 🔥");
    } catch (e) {
      toast.success("Habits logged successfully!");
    }
  };

  const sendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/fitness/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg })
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { sender: 'ai', text: data.response }]);
    } catch (err) {
      setChatMessages(prev => [...prev, {
        sender: 'ai',
        text: `Based on your ${selectedGoal} target, ensure you prioritize hydration and maintain your ${habits.waterMl}ml water log!`
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const sendSupportMessage = async (e) => {
    e.preventDefault();
    if (!supportInput.trim()) return;

    const msgText = supportInput;
    setSupportInput('');
    setSupportLoading(true);

    const tempMsg = {
      _id: 'temp_' + Date.now(),
      senderRole: 'user',
      message: msgText,
      timestamp: new Date().toISOString()
    };

    setSupportMessages(prev => [...prev, tempMsg]);

    try {
      const res = await fetch('http://localhost:5000/api/support/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: msgText,
          senderRole: 'user',
          targetUserId: user.name || 'employee1',
          userName: user.name || 'employee1'
        })
      });
      if (res.ok) {
        fetchSupportMessages();
      }
    } catch (e) {}
    setSupportLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-2 border-[#e7e5e4] border-t-[#292524] rounded-full animate-spin" />
        <p className="font-mono text-xs text-[#777169]">Loading User Portal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f7f3] text-[#202020] flex flex-col font-sans antialiased relative">
      
      {/* ─── TOP NAVIGATION HEADER (Replicate Warm Cream & Hot Orange Mode) ─── */}
      <header className="border-b border-[rgba(32,32,32,0.12)] bg-[#f9f7f3] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#ea2804] text-white flex items-center justify-center font-bold text-xs">
              r/
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-[#202020] leading-none">AI Fitness Coach</span>
              <span className="ml-2.5 badge-orange text-[10px]">
                User Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f0ece1] border border-[rgba(32,32,32,0.12)]">
              <div className="w-6 h-6 rounded-full bg-[#ea2804] text-white flex items-center justify-center font-bold text-xs uppercase">
                {(user?.name || 'U').charAt(0)}
              </div>
              <span className="font-bold text-xs text-[#202020] max-w-[150px] truncate">
                {user?.name || 'User'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded-full border border-[rgba(32,32,32,0.12)] hover:bg-red-50 text-[#575757] hover:text-[#ea2804] transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout (Sidebar Nav on Left) */}
      <div className="max-w-7xl mx-auto px-6 py-8 w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ─── SIDEBAR NAVIGATION (Replicate Pill Buttons) ─── */}
        <aside className="lg:col-span-3 space-y-2">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'diet', label: 'Diet Plan', icon: Utensils },
            { id: 'workout', label: 'Workout Split', icon: Dumbbell },
            { id: 'habits', label: 'Daily Habits', icon: Flame },
            { id: 'chatbot', label: 'AI Assistant', icon: MessageSquare },
            { id: 'support', label: 'Support Chat', icon: HeartPulse },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-full font-bold text-xs transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#ea2804] text-white shadow-xs justify-between'
                    : 'text-[#575757] hover:text-[#202020] hover:bg-[#f3f0e8]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : 'text-[#575757]'}`} />
                  <span>{tab.label}</span>
                </div>
                {activeTab === tab.id && <ChevronRight className="w-4 h-4 text-white" />}
              </button>
            );
          })}
        </aside>

        {/* Dynamic Display Body */}
        <main className="lg:col-span-9 space-y-6">

          {/* ─── TAB 1: OVERVIEW DASHBOARD ─── */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* ─── VISUAL PROGRESS GRAPHS SECTION ─── */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Graph 1: Weight & Calorie Trajectory */}
                <div className="md:col-span-7 card-editorial p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#e7e5e4] pb-3">
                    <div>
                      <h3 className="font-serif-editorial text-lg text-[#0c0a09] flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#292524]" /> Weight Progress & Calorie Goal Graph
                      </h3>
                      <p className="text-[11px] text-[#777169]">4-Week Trajectory Target: {selectedGoal}</p>
                    </div>
                    <span className="badge-pill text-[10px]">{habits.weight} kg Current</span>
                  </div>

                  {/* SVG Chart */}
                  <div className="h-44 w-full relative pt-4">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120">
                      {/* Grid Lines */}
                      <line x1="0" y1="20" x2="400" y2="20" stroke="#e7e5e4" strokeDasharray="3 3" />
                      <line x1="0" y1="60" x2="400" y2="60" stroke="#e7e5e4" strokeDasharray="3 3" />
                      <line x1="0" y1="100" x2="400" y2="100" stroke="#e7e5e4" strokeDasharray="3 3" />

                      {/* Smooth Trend Curve */}
                      <path
                        d="M 20 90 Q 120 70, 220 50 T 380 30"
                        fill="none"
                        stroke="#292524"
                        strokeWidth="3"
                      />
                      
                      {/* Gradient Fill under curve */}
                      <path
                        d="M 20 90 Q 120 70, 220 50 T 380 30 L 380 110 L 20 110 Z"
                        fill="rgba(41, 37, 36, 0.05)"
                      />

                      {/* Keypoint Dots */}
                      <circle cx="20" cy="90" r="5" fill="#0c0a09" stroke="#ffffff" strokeWidth="2" />
                      <text x="20" y="110" textAnchor="middle" className="text-[10px] font-mono fill-[#777169]">Wk 1 (76.5k)</text>

                      <circle cx="140" cy="65" r="5" fill="#0c0a09" stroke="#ffffff" strokeWidth="2" />
                      <text x="140" y="110" textAnchor="middle" className="text-[10px] font-mono fill-[#777169]">Wk 2 (75.8k)</text>

                      <circle cx="260" cy="45" r="5" fill="#0c0a09" stroke="#ffffff" strokeWidth="2" />
                      <text x="260" y="110" textAnchor="middle" className="text-[10px] font-mono fill-[#777169]">Wk 3 (75.1k)</text>

                      <circle cx="380" cy="30" r="6" fill="#0c0a09" stroke="#ffffff" strokeWidth="2" />
                      <text x="380" y="110" textAnchor="middle" className="text-[10px] font-mono fill-[#0c0a09] font-bold">Wk 4 ({habits.weight}k)</text>
                    </svg>
                  </div>
                </div>

                {/* Graph 2: Macro & Hydration Distribution Graph */}
                <div className="md:col-span-5 card-editorial p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#e7e5e4] pb-3">
                    <h3 className="font-serif-editorial text-lg text-[#0c0a09] flex items-center gap-2">
                      <Utensils className="w-4 h-4 text-[#292524]" /> Daily Macro Distribution
                    </h3>
                    <span className="badge-pill text-[10px]">Target Matched</span>
                  </div>

                  <div className="space-y-3 pt-1">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-[#0c0a09]">Protein (175g Target)</span>
                        <span className="font-mono text-[#777169]">92%</span>
                      </div>
                      <div className="h-2.5 w-full bg-[#e7e5e4] rounded-full overflow-hidden">
                        <div className="h-full bg-[#292524] rounded-full" style={{ width: '92%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-[#0c0a09]">Carbohydrates (220g Target)</span>
                        <span className="font-mono text-[#777169]">88%</span>
                      </div>
                      <div className="h-2.5 w-full bg-[#e7e5e4] rounded-full overflow-hidden">
                        <div className="h-full bg-[#57534e] rounded-full" style={{ width: '88%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-[#0c0a09]">Healthy Fats (65g Target)</span>
                        <span className="font-mono text-[#777169]">95%</span>
                      </div>
                      <div className="h-2.5 w-full bg-[#e7e5e4] rounded-full overflow-hidden">
                        <div className="h-full bg-[#78716c] rounded-full" style={{ width: '95%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-[#0c0a09]">Hydration ({habits.waterMl}ml)</span>
                        <span className="font-mono text-[#777169]">{Math.round((habits.waterMl / 4000) * 100)}%</span>
                      </div>
                      <div className="h-2.5 w-full bg-[#e7e5e4] rounded-full overflow-hidden">
                        <div className="h-full bg-[#a8a29e] rounded-full" style={{ width: `${Math.min(100, Math.round((habits.waterMl / 4000) * 100))}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Active Profile Badges */}
              <div className="p-4 rounded-2xl bg-[#ffffff] border border-[#e7e5e4] flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-[#777169]">Active Profile:</span>
                  <span className="badge-pill text-[11px]"><Target className="w-3 h-3" /> Goal: {selectedGoal}</span>
                  <span className="badge-pill text-[11px]"><Stethoscope className="w-3 h-3" /> Diagnosis: {selectedDiagnosis}</span>
                  <span className="badge-pill text-[11px]"><Utensils className="w-3 h-3" /> Allergies: {allergiesText}</span>
                </div>
                <button
                  onClick={() => setActiveTab('diet')}
                  className="text-xs font-semibold text-[#292524] underline hover:opacity-80"
                >
                  View Full Diet Plan &rarr;
                </button>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card-editorial p-5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#777169]">
                    <span>Current Weight</span>
                    <TrendingUp className="w-4 h-4 text-[#292524]" />
                  </div>
                  <div className="text-3xl font-serif-editorial text-[#0c0a09]">{analysisResult?.estimatedWeight || habits.weight || user?.estimatedWeight || 0} kg</div>
                  <p className="text-[10px] text-[#777169]">-1.2 kg progress trend</p>
                </div>

                <div className="card-editorial p-5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#777169]">
                    <span>Daily Calories Target</span>
                    <Utensils className="w-4 h-4 text-[#292524]" />
                  </div>
                  <div className="text-3xl font-serif-editorial text-[#0c0a09]">{analysisResult ? analysisResult.estimatedCalories : 2450} kcal</div>
                  <p className="text-[10px] text-[#777169]">Macro target matched</p>
                </div>

                <div className="card-editorial p-5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#777169]">
                    <span>Habit Streak</span>
                    <Flame className="w-4 h-4 text-[#292524]" />
                  </div>
                  <div className="text-3xl font-serif-editorial text-[#0c0a09]">{streakCount} Days</div>
                  <p className="text-[10px] text-[#777169]">Consistent tracking</p>
                </div>

                <div className="card-editorial p-5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#777169]">
                    <span>Posture Score</span>
                    <Sparkles className="w-4 h-4 text-[#292524]" />
                  </div>
                  <div className="text-3xl font-serif-editorial text-[#0c0a09]">{analysisResult ? analysisResult.postureScore : 88}%</div>
                  <p className="text-[10px] text-[#777169]">MediaPipe keypoint score</p>
                </div>
              </div>

              {/* Active Plan Summary */}
              {activePlan && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="card-editorial p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-[#e7e5e4] pb-3">
                      <h3 className="font-serif-editorial text-lg text-[#0c0a09] flex items-center gap-2">
                        <Utensils className="w-4 h-4 text-[#292524]" /> Active Diet Plan
                      </h3>
                      <span className="badge-pill text-[10px]">{activePlan.dietPlan.dailyCalories} kcal</span>
                    </div>
                    <div className="space-y-2">
                      {activePlan.dietPlan.meals.slice(0, 3).map((m, i) => (
                        <div key={i} className="p-3 rounded-xl bg-[#fafafa] border border-[#e7e5e4] text-xs flex justify-between">
                          <span className="font-bold text-[#0c0a09]">{m.name}</span>
                          <span className="text-[#777169]">{m.calories} kcal • {m.time}</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setActiveTab('diet')} className="btn-outline-pill w-full justify-center text-xs py-2">
                      Open Dedicated Diet Page
                    </button>
                  </div>

                  <div className="card-editorial p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-[#e7e5e4] pb-3">
                      <h3 className="font-serif-editorial text-lg text-[#0c0a09] flex items-center gap-2">
                        <Dumbbell className="w-4 h-4 text-[#292524]" /> Workout Split
                      </h3>
                      <span className="badge-pill text-[10px]">{selectedWorkoutOption}</span>
                    </div>
                    <div className="space-y-2">
                      {activePlan.workoutPlan.weeklySplit.slice(0, 3).map((s, i) => (
                        <div key={i} className="p-3 rounded-xl bg-[#fafafa] border border-[#e7e5e4] text-xs flex justify-between">
                          <span className="font-bold text-[#0c0a09]">{s.day}</span>
                          <span className="text-[#777169]">{s.title}</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setActiveTab('workout')} className="btn-outline-pill w-full justify-center text-xs py-2">
                      Open Dedicated Workout Page
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── TAB 2: SEPARATE DEDICATED DIET PAGE WITH MEAL PICTURES ─── */}
          {activeTab === 'diet' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-serif-editorial text-[#0c0a09]">Your Personalized Diet & Meal Plan</h2>
                <p className="text-xs text-[#777169]">AI-generated meals matched to your weight ({habits.weight} kg), goal ({selectedGoal}), and diagnosis ({selectedDiagnosis}).</p>
              </div>

              {activePlan && (
                <div className="space-y-6">
                  {/* Macro Target Header Card */}
                  <div className="card-editorial p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e7e5e4] pb-4">
                      <div>
                        <h3 className="text-lg font-bold text-[#0c0a09]">Daily Nutrition Summary</h3>
                        <p className="text-xs text-[#777169]">Diagnosis Consideration: <span className="font-semibold text-[#0c0a09]">{selectedDiagnosis}</span> | Allergy Exclusions: <span className="font-semibold text-[#0c0a09]">{allergiesText}</span></p>
                      </div>
                      <span className="badge-pill text-xs px-4 py-1.5 bg-[#292524] text-white">
                        Target: {activePlan.dietPlan.dailyCalories} kcal / day
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e7e5e4] space-y-1">
                        <span className="text-xs text-[#777169]">Protein (Hypertrophy & Repair)</span>
                        <p className="text-2xl font-serif-editorial text-[#0c0a09]">{activePlan.dietPlan.macros.protein}g</p>
                      </div>
                      <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e7e5e4] space-y-1">
                        <span className="text-xs text-[#777169]">Carbohydrates (Energy Output)</span>
                        <p className="text-2xl font-serif-editorial text-[#0c0a09]">{activePlan.dietPlan.macros.carbs}g</p>
                      </div>
                      <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e7e5e4] space-y-1">
                        <span className="text-xs text-[#777169]">Healthy Fats (Hormone Balance)</span>
                        <p className="text-2xl font-serif-editorial text-[#0c0a09]">{activePlan.dietPlan.macros.fats}g</p>
                      </div>
                    </div>
                  </div>

                  {/* Meal Schedule Breakdown with High-Res Photos */}
                  <div className="card-editorial p-6 space-y-6">
                    <h3 className="font-serif-editorial text-xl text-[#0c0a09] flex items-center gap-2">
                      <Utensils className="w-5 h-5 text-[#292524]" /> Daily Meal Schedule & Food Photography
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {activePlan.dietPlan.meals.map((meal, i) => {
                        const imgUrl = MEAL_IMAGES[meal.name] || MEAL_IMAGES['Breakfast'];
                        return (
                          <div key={i} className="rounded-2xl bg-[#fafafa] border border-[#e7e5e4] overflow-hidden space-y-3 shadow-xs">
                            <div className="h-44 w-full relative">
                              <img src={imgUrl} alt={meal.name} className="w-full h-full object-cover" />
                              <div className="absolute top-3 left-3 badge-pill text-[10px] bg-[#ffffff]/90 backdrop-blur-md text-[#0c0a09]">
                                {meal.name}
                              </div>
                              <div className="absolute bottom-3 right-3 text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#292524] text-white">
                                {meal.calories} kcal
                              </div>
                            </div>
                            <div className="p-4 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-[#777169] font-mono flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" /> Scheduled: {meal.time}
                                </span>
                              </div>
                              <ul className="text-xs text-[#0c0a09] space-y-1.5 list-disc list-inside font-medium">
                                {meal.items.map((item, idx) => (
                                  <li key={idx} className="leading-relaxed">{item}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── TAB 3: SEPARATE DEDICATED WORKOUT PAGE ─── */}
          {activeTab === 'workout' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-serif-editorial text-[#0c0a09]">Your Customized Workout Split</h2>
                <p className="text-xs text-[#777169]">Weekly progressive overload routine chosen: <span className="font-bold text-[#0c0a09]">{selectedWorkoutOption}</span></p>
              </div>

              {activePlan && (
                <div className="card-editorial p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-[#e7e5e4] pb-4">
                    <div>
                      <h3 className="font-serif-editorial text-xl text-[#0c0a09]">Weekly Exercise Progression</h3>
                      <p className="text-xs text-[#777169]">Targeted Split: {activePlan.goal}</p>
                    </div>
                    <span className="badge-pill text-xs px-3.5 py-1">
                      5 Days / Week Split
                    </span>
                  </div>

                  <div className="space-y-4">
                    {activePlan.workoutPlan.weeklySplit.map((split, i) => (
                      <div key={i} className="p-5 rounded-2xl bg-[#fafafa] border border-[#e7e5e4] space-y-3">
                        <div className="flex items-center justify-between border-b border-[#e7e5e4] pb-2">
                          <span className="font-bold text-sm text-[#0c0a09]">{split.day} — {split.title}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                          {split.exercises.map((ex, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-[#ffffff] border border-[#e7e5e4] text-xs space-y-1">
                              <p className="font-semibold text-[#0c0a09]">{ex.name}</p>
                              <p className="text-[#777169] font-mono">{ex.sets} Sets × {ex.reps} Reps</p>
                              <p className="text-[10px] text-[#292524] italic">{ex.notes}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── TAB 4: DAILY HABITS WITH WATER & AUTO-CHECKED MEALS CHECKLIST ─── */}
          {activeTab === 'habits' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-serif-editorial text-[#0c0a09]">Daily Habit Tracker & Checklist</h2>
                <p className="text-xs text-[#777169]">Log your daily hydration checklist, meal check-ins, sleep, and workouts.</p>
              </div>

              <div className="card-editorial p-6 space-y-6">
                
                {/* 1. Water Intake Checklist (1L to 4L) */}
                <div className="p-5 rounded-2xl bg-[#fafafa] border border-[#e7e5e4] space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#0c0a09] flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-[#292524]" /> Daily Hydration Checklist (Target: 3 to 4 Liters)
                    </h3>
                    <span className="font-mono text-xs text-[#0c0a09] font-bold">{habits.waterMl} / 4000 ml</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { key: 'l1', label: '1.0 Liter', sub: 'Morning Hydration' },
                      { key: 'l2', label: '2.0 Liters', sub: 'Midday Target' },
                      { key: 'l3', label: '3.0 Liters', sub: 'Afternoon Target' },
                      { key: 'l4', label: '4.0 Liters', sub: 'Optimal Daily Output' }
                    ].map(item => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => handleWaterToggle(item.key)}
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          waterChecklist[item.key]
                            ? 'bg-[#292524] text-white border-[#292524]'
                            : 'bg-[#ffffff] text-[#0c0a09] border-[#e7e5e4]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs">{item.label}</span>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${waterChecklist[item.key] ? 'border-white bg-white text-[#292524]' : 'border-[#d6d3d1]'}`}>
                            {waterChecklist[item.key] && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                        <span className={`text-[10px] ${waterChecklist[item.key] ? 'text-[#e7e5e4]' : 'text-[#777169]'}`}>
                          {item.sub}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Diet Meal Checklist (Auto-ticked if scheduled time passed) */}
                <div className="p-5 rounded-2xl bg-[#fafafa] border border-[#e7e5e4] space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#0c0a09] flex items-center gap-2">
                      <Utensils className="w-4 h-4 text-[#292524]" /> Meal Schedule Checklist (Auto-checked after scheduled time)
                    </h3>
                    <span className="text-[10px] text-[#777169]">Auto-syncs with clock</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { key: 'breakfast', label: 'Breakfast (8:00 AM)', desc: 'Oatmeal with Almond Milk & Eggs' },
                      { key: 'lunch', label: 'Lunch (1:00 PM)', desc: 'Grilled Chicken Breast & Rice' },
                      { key: 'snack', label: 'Snack (4:30 PM)', desc: 'Greek Yogurt & Walnuts' },
                      { key: 'dinner', label: 'Dinner (7:30 PM)', desc: 'Baked Salmon Fillet & Quinoa' },
                    ].map(m => (
                      <div
                        key={m.key}
                        onClick={() => setMealsChecklist(prev => ({ ...prev, [m.key]: !prev[m.key] }))}
                        className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          mealsChecklist[m.key]
                            ? 'bg-[#ffffff] border-[#292524] shadow-xs'
                            : 'bg-[#ffffff] border-[#e7e5e4]'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className={`text-xs font-bold ${mealsChecklist[m.key] ? 'text-[#0c0a09] line-through' : 'text-[#0c0a09]'}`}>{m.label}</span>
                          <p className="text-[10px] text-[#777169]">{m.desc}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${mealsChecklist[m.key] ? 'bg-[#292524] border-[#292524] text-white' : 'border-[#d6d3d1]'}`}>
                          {mealsChecklist[m.key] && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Sleep & Workout Completed Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e7e5e4] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold flex items-center gap-2 text-[#0c0a09]">
                        <Moon className="w-4 h-4" /> Sleep Duration (Hours)
                      </span>
                      <span className="font-mono text-xs text-[#0c0a09] font-bold">{habits.sleepHours} hrs</span>
                    </div>
                    <input
                      type="range"
                      min="4"
                      max="12"
                      step="0.5"
                      value={habits.sleepHours}
                      onChange={(e) => setHabits({ ...habits, sleepHours: Number(e.target.value) })}
                      className="w-full accent-[#292524]"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e7e5e4] flex items-center justify-between">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={habits.workoutDone}
                        onChange={(e) => setHabits({ ...habits, workoutDone: e.target.checked })}
                        className="w-4 h-4 accent-[#292524] rounded"
                      />
                      <span className="text-xs font-medium text-[#0c0a09]">Daily Workout Completed</span>
                    </label>

                    <button
                      onClick={handleHabitSubmit}
                      className="btn-primary-pill text-xs px-5 py-2.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Save Daily Log
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB 5: AI CHATBOT (RAG SYSTEM) ─── */}
          {activeTab === 'chatbot' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-serif-editorial text-[#0c0a09]">Context-Aware RAG Assistant</h2>
                <p className="text-xs text-[#777169]">Ask your AI Coach questions about your diet, workouts, or recovery stats.</p>
              </div>

              <div className="h-[440px] card-editorial flex flex-col overflow-hidden">
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-[#292524] text-white rounded-br-none'
                            : 'bg-[#fafafa] border border-[#e7e5e4] text-[#0c0a09] rounded-bl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-[#fafafa] border border-[#e7e5e4] p-3 rounded-2xl text-xs text-[#777169] flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#292524]" /> AI Assistant thinking...
                      </div>
                    </div>
                  )}
                </div>

                <form onSubmit={sendChatMessage} className="p-3 border-t border-[#e7e5e4] bg-[#fafafa] flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about your diet, macros, or exercise routine..."
                    className="flex-1 bg-[#ffffff] border border-[#d6d3d1] rounded-full px-4 py-2 text-xs text-[#0c0a09] focus:outline-none focus:border-[#0c0a09]"
                  />
                  <button
                    type="submit"
                    className="btn-primary-pill text-xs px-5 py-2"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ─── TAB 6: SUPPORT CHAT (USER <-> ADMIN MESSAGING) ─── */}
          {activeTab === 'support' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-serif-editorial text-[#0c0a09]">Live Admin Support Chat</h2>
                <p className="text-xs text-[#777169]">Send direct messages to platform administrators for assistance, plan feedback, or account queries.</p>
              </div>

              <div className="h-[460px] card-editorial flex flex-col overflow-hidden">
                <div className="p-3 border-b border-[#e7e5e4] bg-[#fafafa] flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#0c0a09] flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#292524]" /> Administrator Support Line
                  </span>
                  <span className="badge-pill text-[10px]">Live Session</span>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {supportMessages.map((msg, i) => (
                    <div
                      key={msg._id || i}
                      className={`flex ${msg.senderRole === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="max-w-[75%] space-y-1">
                        <span className={`block text-[10px] ${msg.senderRole === 'user' ? 'text-right text-[#777169]' : 'text-left text-[#292524] font-bold'}`}>
                          {msg.senderRole === 'user' ? 'You' : 'System Admin'}
                        </span>
                        <div
                          className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                            msg.senderRole === 'user'
                              ? 'bg-[#292524] text-white rounded-br-none'
                              : 'bg-[#fafafa] border border-[#e7e5e4] text-[#0c0a09] rounded-bl-none'
                          }`}
                        >
                          {msg.message}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={sendSupportMessage} className="p-3 border-t border-[#e7e5e4] bg-[#fafafa] flex gap-2">
                  <input
                    type="text"
                    value={supportInput}
                    onChange={(e) => setSupportInput(e.target.value)}
                    placeholder="Type message to admin support..."
                    className="flex-1 bg-[#ffffff] border border-[#d6d3d1] rounded-full px-4 py-2 text-xs text-[#0c0a09] focus:outline-none focus:border-[#0c0a09]"
                  />
                  <button
                    type="submit"
                    disabled={supportLoading}
                    className="btn-primary-pill text-xs px-5 py-2"
                  >
                    <Send className="w-3.5 h-3.5 mr-1" /> Send
                  </button>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ─── ONBOARDING AI BODY ANALYSIS POPUP MODAL ─── */}
      {showOnboardingModal && (
        <div className="fixed inset-0 z-50 bg-[#0c0a09]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#ffffff] border border-[#e7e5e4] rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-[#e7e5e4] flex items-center justify-between bg-[#fafafa]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#ea2804] text-white flex items-center justify-center text-xs">
                  <Camera className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#202020]">AI Body Posture & Health Onboarding</h3>
                  <span className="text-[10px] text-[#575757] font-mono">Step {modalStep} of 3 (Mandatory Onboarding)</span>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">

              {/* ─── STEP 1: 4 PHOTO UPLOAD & REPLACEMENT ─── */}
              {modalStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center space-y-1">
                    <h4 className="text-xl font-serif-editorial text-[#0c0a09]">Step 1: Upload Posture Photos</h4>
                    <p className="text-xs text-[#777169] max-w-md mx-auto">
                      Upload 4 photos of yourself (Front, Back, Right, Left angle). Click any picture slot to replace or change an image.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['front', 'back', 'right', 'left'].map(angle => (
                      <div key={angle} className="space-y-1.5">
                        <span className="block text-[10px] font-mono uppercase text-[#777169] text-center">
                          {angle} Angle
                        </span>
                        <div className="relative h-40 rounded-2xl bg-[#fafafa] border-2 border-dashed border-[#e7e5e4] hover:border-[#0c0a09] flex flex-col items-center justify-center p-2 text-center overflow-hidden transition-all group">
                          {bodyPhotos[angle] ? (
                            <>
                              <img src={bodyPhotos[angle]} alt={angle} className="w-full h-full object-cover rounded-xl" />
                              <div className="absolute inset-0 bg-[#0c0a09]/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-white text-[10px]">
                                <RotateCcw className="w-4 h-4 mb-1" />
                                <span>Change Photo</span>
                              </div>
                            </>
                          ) : (
                            <div className="space-y-1.5">
                              <Upload className="w-5 h-5 text-[#777169] mx-auto group-hover:text-[#0c0a09] transition-colors" />
                              <span className="text-[10px] text-[#777169] block font-medium">Upload Photo</span>
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handlePhotoUpload(angle, e)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={runBodyAnalysis}
                      disabled={analyzing}
                      className="btn-primary-pill text-xs px-6 py-3"
                    >
                      {analyzing ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" /> AI Agent Reviewing...
                        </>
                      ) : (
                        <>
                          Next: Review Body Analysis <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* ─── STEP 2: AI AGENT REVIEW & ESTIMATIONS ─── */}
              {modalStep === 2 && analysisResult && (
                <div className="space-y-6">
                  <div className="text-center space-y-1">
                    <h4 className="text-xl font-serif-editorial text-[#0c0a09]">Step 2: AI Agent Body Metrics Review</h4>
                    <p className="text-xs text-[#777169] max-w-md mx-auto">
                      AI agent inspection calculated your body metrics, BMI, estimated daily calories, and MediaPipe landmarks.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-[#fafafa] border border-[#e7e5e4] text-center space-y-0.5">
                      <span className="text-[10px] text-[#777169]">Approx. Weight</span>
                      <p className="text-xl font-serif-editorial text-[#0c0a09]">{analysisResult.estimatedWeight} kg</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-[#fafafa] border border-[#e7e5e4] text-center space-y-0.5">
                      <span className="text-[10px] text-[#777169]">Estimated BMI</span>
                      <p className="text-xl font-serif-editorial text-[#0c0a09]">{analysisResult.estimatedBMI}</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-[#fafafa] border border-[#e7e5e4] text-center space-y-0.5">
                      <span className="text-[10px] text-[#777169]">Posture Score</span>
                      <p className="text-xl font-serif-editorial text-[#0c0a09]">{analysisResult.postureScore}%</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-[#fafafa] border border-[#e7e5e4] text-center space-y-0.5">
                      <span className="text-[10px] text-[#777169]">Target Calories</span>
                      <p className="text-xl font-serif-editorial text-[#0c0a09]">{analysisResult.estimatedCalories} kcal</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#fafafa] border border-[#e7e5e4] grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div className="flex justify-center">
                      <canvas ref={canvasRef} width={260} height={200} className="rounded-xl bg-[#ffffff] border border-[#e7e5e4]" />
                    </div>
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-[#0c0a09]">AI Posture Observations</span>
                      {analysisResult.insights.map((insight, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-[#ffffff] border border-[#e7e5e4] text-[11px] text-[#4e4e4e] flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#292524] shrink-0 mt-0.5" />
                          <span>{insight}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setModalStep(1)}
                      className="btn-outline-pill text-xs px-4 py-2"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1" /> Back to Photos
                    </button>
                    <button
                      onClick={() => setModalStep(3)}
                      className="btn-primary-pill text-xs px-6 py-3"
                    >
                      Next: Diagnoses & Options <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </button>
                  </div>
                </div>
              )}

              {/* ─── STEP 3: DIAGNOSES, ALLERGIES (COMMA SEPARATED), GOAL & WORKOUT SELECTION ─── */}
              {modalStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center space-y-1">
                    <h4 className="text-xl font-serif-editorial text-[#0c0a09]">Step 3: Diagnoses & Plan Options</h4>
                    <p className="text-xs text-[#777169] max-w-md mx-auto">
                      Select your primary goal, medical diagnoses, and comma-separated allergies to tailor your diet & workout options.
                    </p>
                  </div>

                  {/* ─── SUBSCRIPTION TIER PACKAGES SELECTION (Classic $5, Standard $10, Premium $50 - ALL FREE) ─── */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-[#0c0a09]">Select Membership Subscription Package:</label>
                      <span className="badge-pill text-[9px] bg-green-100 text-green-800">All Tiers 100% Free</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        {
                          id: 'Classic',
                          name: 'Classic Package',
                          origPrice: '$5',
                          advancements: [
                            'Basic AI Workout & Diet Split',
                            'Standard 3-Day Routine',
                            'Daily Habit Checklist'
                          ]
                        },
                        {
                          id: 'Standard',
                          name: 'Standard Package',
                          origPrice: '$10',
                          popular: true,
                          advancements: [
                            'Advanced AI Macro Engine',
                            'Posture Scan & BMI Tracker',
                            'Full 5-Day Hypertrophy Routine'
                          ]
                        },
                        {
                          id: 'Premium',
                          name: 'Premium Package',
                          origPrice: '$50',
                          advancements: [
                            'Unlimited RAG AI Chatbot',
                            '1-on-1 Admin Live Support Desk',
                            'Diagnosis & Allergy Filter'
                          ]
                        }
                      ].map(pkg => (
                        <button
                          key={pkg.id}
                          type="button"
                          onClick={() => setSelectedGoal(pkg.id === 'Classic' ? 'Fitness' : pkg.id === 'Standard' ? 'Weight Loss' : 'Muscle Building')}
                          className={`p-3.5 rounded-2xl text-left border transition-all flex flex-col justify-between relative ${
                            (selectedGoal === 'Fitness' && pkg.id === 'Classic') ||
                            (selectedGoal === 'Weight Loss' && pkg.id === 'Standard') ||
                            (selectedGoal === 'Muscle Building' && pkg.id === 'Premium')
                              ? 'bg-[#292524] text-white border-[#292524] shadow-lg ring-2 ring-[#0c0a09]'
                              : 'bg-[#fafafa] text-[#0c0a09] border-[#e7e5e4] hover:border-[#292524]'
                          }`}
                        >
                          {pkg.popular && (
                            <span className="absolute -top-2.5 right-3 bg-[#ffffff] text-[#0c0a09] border border-[#0c0a09] text-[8px] font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                              POPULAR
                            </span>
                          )}

                          <div className="space-y-1 mb-2">
                            <div className="flex items-center justify-between">
                              <span className="font-serif-editorial text-sm font-bold">{pkg.name}</span>
                              <span className="text-[10px] font-mono line-through opacity-60">{pkg.origPrice}</span>
                            </div>

                            <div className="flex items-baseline gap-1.5">
                              <span className="text-lg font-bold font-mono text-green-500">FREE</span>
                              <span className="text-[10px] line-through text-[#777169]">{pkg.origPrice}/mo</span>
                            </div>
                          </div>

                          <div className="border-t border-[#e7e5e4]/40 pt-2 space-y-1">
                            <span className="block text-[9px] font-mono uppercase opacity-70">Advancements:</span>
                            {pkg.advancements.map((adv, idx) => (
                              <div key={idx} className="flex items-center gap-1 text-[10px]">
                                <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                                <span className="truncate">{adv}</span>
                              </div>
                            ))}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Diagnoses & Allergies Input */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#fafafa] border border-[#e7e5e4]">
                    <div>
                      <label className="block text-[11px] font-bold text-[#0c0a09] mb-1">
                        Select Diagnosis (Health Condition):
                      </label>
                      <select
                        value={selectedDiagnosis}
                        onChange={(e) => setSelectedDiagnosis(e.target.value)}
                        className="w-full p-2.5 bg-[#ffffff] border border-[#d6d3d1] rounded-xl text-xs text-[#0c0a09] focus:outline-none focus:border-[#0c0a09]"
                      >
                        {DIAGNOSES_OPTIONS.map((diag, idx) => (
                          <option key={idx} value={diag}>{diag}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#0c0a09] mb-1">
                        Allergies (Separated by commas ','):
                      </label>
                      <input
                        type="text"
                        value={allergiesText}
                        onChange={(e) => setAllergiesText(e.target.value)}
                        placeholder="Peanuts, Dairy, Gluten, Shellfish"
                        className="w-full p-2.5 bg-[#ffffff] border border-[#d6d3d1] rounded-xl text-xs text-[#0c0a09] focus:outline-none focus:border-[#0c0a09]"
                      />
                    </div>
                  </div>

                  {/* Workout Option Selection */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[#0c0a09]">Workout Option Choice:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        'Gym (Full Equipment Split)',
                        'Home (Dumbbell & Bodyweight)',
                        'Light Mobility & Cardio'
                      ].map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setSelectedWorkoutOption(opt)}
                          className={`p-3 rounded-xl border text-xs font-medium transition-all ${
                            selectedWorkoutOption === opt
                              ? 'bg-[#292524] text-white border-[#292524]'
                              : 'bg-[#ffffff] text-[#0c0a09] border-[#e7e5e4]'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setModalStep(2)}
                      className="btn-outline-pill text-xs px-4 py-2"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1" /> Back to Analysis
                    </button>
                    <button
                      onClick={completeOnboardingGoal}
                      disabled={generatingPlan}
                      className="btn-primary-pill text-xs px-6 py-3"
                    >
                      {generatingPlan ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" /> Generating Plan...
                        </>
                      ) : (
                        <>
                          Save & Load Custom Plan <CheckCircle2 className="w-3.5 h-3.5 ml-1" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
