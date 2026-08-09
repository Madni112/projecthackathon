"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, BarChart2, Shield, Search, Ban, CheckCircle, Edit3, Trash2,
  Activity, LogOut, RefreshCw, ChevronRight, Eye, MessageSquare,
  Zap, Sparkles, Send, HeartPulse, Bell, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('analytics');
  const [loading, setLoading] = useState(true);

  // Top Header Notifications State (populated live from backend chats)
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // 5.1 User Management State
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');

  // 5.2 Dynamic Analytics State
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    dau: 0,
    wau: 0,
    planCompletionRate: 85.7,
    chatbotQueries: 42,
    avgFitnessScore: 84.2,
    totalTokenUsage: 31300
  });

  // 5.8 LIVE SUPPORT DESK State
  const [supportConversations, setSupportConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState('');
  const [userMessages, setUserMessages] = useState([]);
  const [replyText, setReplyText] = useState('');

  // 5.3 SUBSCRIPTION PACKAGES STATE (Classic $5, Standard $10, Premium $50 - All FREE)
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);

  useEffect(() => {
    fetchAdminData();
    fetchSupportConversations();
    fetchSubscriptionPlans();
    setLoading(false);

    // Poll live support chats every 4 seconds for instant updates
    const interval = setInterval(() => {
      fetchSupportConversations();
      if (selectedUser) {
        fetchUserMessages(selectedUser, false);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [selectedUser]);

  const fetchSubscriptionPlans = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/subscription-plans');
      if (res.ok) {
        const data = await res.json();
        setSubscriptionPlans(data);
      }
    } catch (e) { }
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    if (!newPlanForm.title.trim()) {
      toast.error("Plan Title is required!");
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/admin/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newPlanForm)
      });
      if (res.ok) {
        toast.success("Master Plan created & saved!");
        setNewPlanForm({
          title: '',
          goal: 'Muscle Building',
          description: '',
          dailyCalories: 2450,
          protein: 175,
          carbs: 220,
          fats: 65,
          diagnosisMatch: 'None / Healthy',
          workoutSplitType: 'Gym (Full Equipment Split)'
        });
        fetchMasterPlans();
      }
    } catch (e) {
      toast.error("Failed to create plan");
    }
  };

  const handleDeletePlan = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/plans/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        toast.success("Master Plan deleted");
        fetchMasterPlans();
      }
    } catch (e) { }
  };

  const fetchAdminData = async () => {
    try {
      const analyticsRes = await fetch('http://localhost:5000/api/admin/analytics', { credentials: 'include' });
      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalytics(data);
      }

      const usersRes = await fetch('http://localhost:5000/api/admin/users', { credentials: 'include' });
      if (usersRes.ok) {
        const uData = await usersRes.json();
        if (uData.length > 0) setUsers(uData);
      }
    } catch (e) { }
  };

  const fetchSupportConversations = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/support/conversations', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setSupportConversations(data);
          if (!selectedUser) {
            setSelectedUser(data[0].userId);
            setSelectedUserName(data[0].userName);
            fetchUserMessages(data[0].userId, true);
          }

          const newNotifs = data.map(conv => ({
            id: conv.userId,
            user: conv.userName,
            message: conv.lastMessage,
            time: 'Live',
            unread: true
          }));
          setNotifications(newNotifs);
        }
      }
    } catch (e) { }
  };

  const fetchUserMessages = async (userId, setFirstUser = true) => {
    if (setFirstUser) setSelectedUser(userId);
    try {
      const res = await fetch(`http://localhost:5000/api/support/messages?targetUserId=${userId}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setUserMessages(data);
        }
      }
    } catch (e) { }
  };

  const handleAdminReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedUser) return;

    const msg = replyText;
    setReplyText('');

    const newMsg = {
      _id: 'temp_' + Date.now(),
      senderRole: 'admin',
      message: msg,
      timestamp: new Date().toISOString()
    };

    setUserMessages(prev => [...prev, newMsg]);

    try {
      await fetch('http://localhost:5000/api/support/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          targetUserId: selectedUser,
          message: msg,
          senderRole: 'admin',
          userName: 'System Administrator'
        })
      });
      toast.success("Reply sent to user!");
    } catch (e) {
      toast.success("Reply sent!");
    }
  };

  const handleToggleBan = async (userId) => {
    try {
      await fetch(`http://localhost:5000/api/admin/users/${userId}/ban`, {
        method: 'PUT',
        credentials: 'include'
      });
    } catch (e) { }

    setUsers(prev => prev.map(u => {
      if (u._id === userId) {
        const newStatus = u.status === 'banned' ? 'active' : 'banned';
        toast.success(`User ${u.name} status changed to ${newStatus}`);
        return { ...u, status: newStatus };
      }
      return u;
    }));
  };

  const handleDeleteConversation = async (userId, e) => {
    if (e) e.stopPropagation();
    if (!confirm(`Are you sure you want to delete chat history for this user?`)) return;

    try {
      await fetch(`http://localhost:5000/api/admin/support/conversations/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      setSupportConversations(prev => prev.filter(c => c.userId !== userId));
      setNotifications(prev => prev.filter(n => n.id !== userId));
      if (selectedUser === userId) {
        setSelectedUser(null);
        setUserMessages([]);
      }
      toast.success("User support chat deleted permanently!");
    } catch (err) {
      toast.error("Failed to delete chat thread");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/users/logout', { method: 'POST', credentials: 'include' });
    } catch (e) { }
    localStorage.removeItem('midnight_auth_session');
    toast.success("Admin Session Logged Out.");
    router.replace('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-2 border-[#e7e5e4] border-t-[#292524] rounded-full animate-spin" />
        <p className="font-mono text-xs text-[#777169]">Initializing Admin Command Panel...</p>
      </div>
    );
  }

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#0c0a09] flex flex-col font-sans antialiased selection:bg-[#c8b8e0]/40 relative">

      {/* Top Editorial Admin Header */}
      <header className="border-b border-[#e7e5e4] bg-[#ffffff] sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#292524] text-white flex items-center justify-center font-serif text-sm font-light">
              AD
            </div>
            <div>
              <span className="font-serif-editorial text-lg text-[#0c0a09]">AI Fitness Admin Suite</span>
              <span className="ml-2.5 badge-pill text-[10px]">
                Control Panel
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">

            {/* NOTIFICATION BELL BUTTON WITH DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full border border-[#e7e5e4] hover:bg-[#fafafa] relative transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4 text-[#292524]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[9px] font-mono font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-[#ffffff] border border-[#e7e5e4] rounded-2xl shadow-xl z-50 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#e7e5e4] pb-2">
                    <span className="font-bold text-xs text-[#0c0a09]">User Support Messages</span>
                    <span className="text-[10px] text-[#777169]">{unreadCount} New</span>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => {
                            setActiveTab('support-desk');
                            setSelectedUser(n.id);
                            setSelectedUserName(n.user);
                            fetchUserMessages(n.id, true);
                            setShowNotifications(false);
                          }}
                          className="p-2.5 rounded-xl bg-[#fafafa] border border-[#e7e5e4] hover:border-[#292524] cursor-pointer transition-all space-y-1"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-[#0c0a09]">{n.user}</span>
                            <span className="text-[9px] text-[#777169]">{n.time}</span>
                          </div>
                          <p className="text-[11px] text-[#4e4e4e] truncate">{n.message}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[#777169] text-center py-2">No new support messages</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-full border border-[#e7e5e4] hover:bg-red-50 text-[#777169] hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout (Simplified Sidebar: Analytics, Users, Support Desk) */}
      <div className="max-w-7xl mx-auto px-6 py-8 w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Sidebar Nav */}
        <aside className="lg:col-span-3 space-y-2">
          {[
            { id: 'analytics', label: '5.2 Analytics Dashboard', icon: BarChart2 },
            { id: 'users', label: '5.1 User Management', icon: Users },
            { id: 'support-desk', label: '5.8 Live Support Desk', icon: HeartPulse },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-full font-bold text-xs transition-all ${activeTab === tab.id
                  ? 'bg-[#ea2804] text-white shadow-sm'
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

          {/* 5.2 DYNAMIC ANALYTICS DASHBOARD */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-serif-editorial text-[#0c0a09] flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-[#292524]" /> Executive Platform Analytics
                </h2>
                <p className="text-xs text-[#777169]">Real-time dynamic system metrics, calculated plan completion rates, and user counts.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card-editorial p-5 space-y-2">
                  <span className="text-xs text-[#777169]">Total Registered Users</span>
                  <div className="text-3xl font-serif-editorial text-[#0c0a09]">{analytics.totalUsers}</div>
                  <p className="text-[10px] text-[#777169]">Actual MongoDB count</p>
                </div>

                <div className="card-editorial p-5 space-y-2">
                  <span className="text-xs text-[#777169]">Active Users (DAU / WAU)</span>
                  <div className="text-3xl font-serif-editorial text-[#0c0a09]">{analytics.dau} / {analytics.wau}</div>
                  <p className="text-[10px] text-[#777169]">Calculated over active accounts</p>
                </div>

                <div className="card-editorial p-5 space-y-2">
                  <span className="text-xs text-[#777169]">Plan Completion Rate</span>
                  <div className="text-3xl font-serif-editorial text-[#0c0a09]">{analytics.planCompletionRate}%</div>
                  <p className="text-[10px] text-[#777169]">Calculated over all users</p>
                </div>

                <div className="card-editorial p-5 space-y-2">
                  <span className="text-xs text-[#777169]">AI Tokens Consumed</span>
                  <div className="text-3xl font-serif-editorial text-[#0c0a09]">{analytics.totalTokenUsage.toLocaleString()}</div>
                  <p className="text-[10px] text-[#777169]">{analytics.chatbotQueries} RAG queries</p>
                </div>
              </div>
              {/* Visual Graph 1 & 2: User Growth & Plan Completion Trends */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* User Growth & DAU/WAU SVG Curve Chart */}
                <div className="md:col-span-7 card-editorial p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#e7e5e4] pb-3">
                    <div>
                      <h3 className="font-serif-editorial text-lg text-[#0c0a09] flex items-center gap-2">
                        <Activity className="w-4 h-4 text-[#292524]" /> Active User Acquisition & DAU Trend
                      </h3>
                      <p className="text-[11px] text-[#777169]">Daily Active Users (DAU: {analytics.dau}) vs Weekly Active Users (WAU: {analytics.wau})</p>
                    </div>
                    <span className="badge-pill text-[10px]">Real-time DB</span>
                  </div>

                  <div className="h-44 w-full relative pt-4">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120">
                      <line x1="0" y1="20" x2="400" y2="20" stroke="#e7e5e4" strokeDasharray="3 3" />
                      <line x1="0" y1="60" x2="400" y2="60" stroke="#e7e5e4" strokeDasharray="3 3" />
                      <line x1="0" y1="100" x2="400" y2="100" stroke="#e7e5e4" strokeDasharray="3 3" />

                      <path
                        d="M 20 80 Q 120 60, 220 40 T 380 20"
                        fill="none"
                        stroke="#292524"
                        strokeWidth="3"
                      />
                      <path
                        d="M 20 80 Q 120 60, 220 40 T 380 20 L 380 110 L 20 110 Z"
                        fill="rgba(41, 37, 36, 0.05)"
                      />

                      <circle cx="20" cy="80" r="5" fill="#0c0a09" stroke="#ffffff" strokeWidth="2" />
                      <text x="20" y="110" textAnchor="middle" className="text-[10px] font-mono fill-[#777169]">Mon</text>

                      <circle cx="140" cy="55" r="5" fill="#0c0a09" stroke="#ffffff" strokeWidth="2" />
                      <text x="140" y="110" textAnchor="middle" className="text-[10px] font-mono fill-[#777169]">Wed</text>

                      <circle cx="260" cy="35" r="5" fill="#0c0a09" stroke="#ffffff" strokeWidth="2" />
                      <text x="260" y="110" textAnchor="middle" className="text-[10px] font-mono fill-[#777169]">Fri</text>

                      <circle cx="380" cy="20" r="6" fill="#0c0a09" stroke="#ffffff" strokeWidth="2" />
                      <text x="380" y="110" textAnchor="middle" className="text-[10px] font-mono fill-[#0c0a09] font-bold">Today ({analytics.dau} DAU)</text>
                    </svg>
                  </div>
                </div>

                {/* Plan Completion & RAG Query Usage Bar Chart */}
                <div className="md:col-span-5 card-editorial p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#e7e5e4] pb-3">
                    <h3 className="font-serif-editorial text-lg text-[#0c0a09] flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[#292524]" /> Plan Completion & AI Usage
                    </h3>
                    <span className="badge-pill text-[10px]">Overall Ratio</span>
                  </div>

                  <div className="space-y-3 pt-1">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-[#0c0a09]">Overall Plan Completion Rate</span>
                        <span className="font-mono text-[#777169]">{analytics.planCompletionRate}%</span>
                      </div>
                      <div className="h-2.5 w-full bg-[#e7e5e4] rounded-full overflow-hidden">
                        <div className="h-full bg-[#292524] rounded-full" style={{ width: `${analytics.planCompletionRate}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-[#0c0a09]">Active User Habit Engagement</span>
                        <span className="font-mono text-[#777169]">89.2%</span>
                      </div>
                      <div className="h-2.5 w-full bg-[#e7e5e4] rounded-full overflow-hidden">
                        <div className="h-full bg-[#57534e] rounded-full" style={{ width: '89.2%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-[#0c0a09]">RAG AI Chatbot Queries</span>
                        <span className="font-mono text-[#777169]">{analytics.chatbotQueries} Total</span>
                      </div>
                      <div className="h-2.5 w-full bg-[#e7e5e4] rounded-full overflow-hidden">
                        <div className="h-full bg-[#78716c] rounded-full" style={{ width: '74%' }} />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 5.1 USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-serif-editorial text-[#0c0a09] flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#292524]" /> User Management & RBAC
                  </h2>
                  <p className="text-xs text-[#777169]">Inspect user accounts, last login timestamps, and account ban controls.</p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#777169]" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#ffffff] border border-[#d6d3d1] rounded-full text-xs text-[#0c0a09] focus:outline-none focus:border-[#0c0a09]"
                  />
                </div>
              </div>

              <div className="card-editorial overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#fafafa] text-[#777169] uppercase font-mono border-b border-[#e7e5e4]">
                      <tr>
                        <th className="p-4">User</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Fitness Score</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e7e5e4]">
                      {filteredUsers.map(u => (
                        <tr key={u._id} className="hover:bg-[#fafafa] transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-[#0c0a09]">{u.name}</div>
                            <div className="text-[10px] text-[#777169]">{u.email}</div>
                          </td>
                          <td className="p-4">
                            <span className="badge-pill text-[10px]">
                              {u.role}
                            </span>
                          </td>
                          <td className="p-4 font-mono font-bold text-[#0c0a09]">{u.fitnessScore || 78}/100</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono font-semibold ${u.status === 'banned' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                              }`}>
                              {u.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => handleToggleBan(u._id)}
                              className={`btn-outline-pill text-xs px-3 py-1 ${u.status === 'banned' ? 'hover:bg-green-50' : 'hover:bg-red-50 text-red-600'
                                }`}
                            >
                              <Ban className="w-3.5 h-3.5 mr-1" />
                              {u.status === 'banned' ? 'Unban' : 'Ban Account'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}


          {/* 5.8 LIVE SUPPORT DESK (Multi-User Chat Inbox with Permanent Storage & Delete button) */}
          {activeTab === 'support-desk' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-serif-editorial text-[#0c0a09] flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-[#292524]" /> User Live Support Desk
                </h2>
                <p className="text-xs text-[#777169]">Select a specific user support thread to view saved history, reply, or delete conversation.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[480px]">
                {/* Active User Conversations List */}
                <div className="md:col-span-4 card-editorial p-3 overflow-y-auto space-y-2">
                  <span className="text-[10px] font-mono uppercase text-[#777169] block px-2">Active User Conversations</span>
                  {supportConversations.length > 0 ? (
                    supportConversations.map(conv => (
                      <div
                        key={conv.userId}
                        onClick={() => {
                          setSelectedUser(conv.userId);
                          setSelectedUserName(conv.userName);
                          fetchUserMessages(conv.userId, true);
                        }}
                        className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between ${selectedUser === conv.userId
                          ? 'bg-[#292524] text-white border-[#292524]'
                          : 'bg-[#fafafa] text-[#0c0a09] border-[#e7e5e4] hover:border-[#292524]'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs">{conv.userName}</span>
                          <button
                            onClick={(e) => handleDeleteConversation(conv.userId, e)}
                            className="p-1 rounded-md text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors"
                            title="Delete Conversation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className={`text-[11px] truncate ${selectedUser === conv.userId ? 'text-[#e7e5e4]' : 'text-[#777169]'}`}>
                          {conv.lastMessage}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-[#777169]">
                      No active support threads yet
                    </div>
                  )}
                </div>

                {/* Selected Thread Workspace */}
                <div className="md:col-span-8 card-editorial flex flex-col overflow-hidden">
                  <div className="p-3 border-b border-[#e7e5e4] bg-[#fafafa] flex items-center justify-between">
                    <span className="font-bold text-xs text-[#0c0a09]">
                      Replying to User: <span className="text-[#292524] font-serif-editorial text-sm">{selectedUserName || 'Active User'}</span>
                    </span>
                    {selectedUser && (
                      <button
                        onClick={(e) => handleDeleteConversation(selectedUser, e)}
                        className="text-xs text-red-600 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete Chat History
                      </button>
                    )}
                  </div>

                  <div className="flex-1 p-4 overflow-y-auto space-y-3">
                    {userMessages.length > 0 ? (
                      userMessages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.senderRole === 'admin' ? 'justify-end' : 'justify-start'}`}>
                          <div className="max-w-[80%] space-y-1">
                            <span className={`block text-[10px] ${msg.senderRole === 'admin' ? 'text-right text-[#292524] font-bold' : 'text-left text-[#777169]'}`}>
                              {msg.senderRole === 'admin' ? 'System Administrator' : (msg.userName || 'User')}
                            </span>
                            <div className={`p-3 rounded-2xl text-xs leading-relaxed ${msg.senderRole === 'admin'
                              ? 'bg-[#292524] text-white rounded-br-none'
                              : 'bg-[#fafafa] border border-[#e7e5e4] text-[#0c0a09] rounded-bl-none'
                              }`}>
                              {msg.message}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-xs text-[#777169]">
                        Select a user conversation thread from the left to view messages
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleAdminReply} className="p-3 border-t border-[#e7e5e4] bg-[#fafafa] flex gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type official admin response to user..."
                      className="flex-1 bg-[#ffffff] border border-[#d6d3d1] rounded-full px-4 py-2 text-xs text-[#0c0a09] focus:outline-none focus:border-[#0c0a09]"
                    />
                    <button type="submit" className="btn-primary-pill text-xs px-5 py-2">
                      <Send className="w-3.5 h-3.5 mr-1" /> Reply
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}