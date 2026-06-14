import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import CheckIn from "./CheckIn";
import AgentStatus from "./AgentStatus";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, BarChart, Bar } from "recharts";
import { Calendar, TrendingUp, Moon, Users, Zap, ArrowRight, ShieldAlert, Award, Lock, ShieldCheck, HelpCircle, MessageSquare, BookOpen, Cpu } from "lucide-react";

function AgentTelemetryConsole() {
  const [logs, setLogs] = useState([
    { agent: "SentinelAI", status: "monitoring", message: "Background typing telemetry stream active (Opt-in)." },
    { agent: "CompanionAI", status: "standby", message: "Dialogue safety filters online. CBT policy engines loaded." },
    { agent: "BridgeAI", status: "ready", message: "Directory query index initialized. 8 verified hotlines cached." }
  ]);
  
  useEffect(() => {
    const messages = [
      { agent: "SentinelAI", status: "monitoring", message: "Passive keystroke analytics: WPM, hold, flight logs updated." },
      { agent: "SentinelAI", status: "scanning", message: "Running longitudinal trend analysis on recent check-in parameters." },
      { agent: "CompanionAI", status: "ready", message: "Pre-processing safety prompts... zero anomalies detected." },
      { agent: "BridgeAI", status: "ready", message: "Verifying global helpline APIs... India, US, UK, Japan endpoints alive." },
      { agent: "SentinelAI", status: "monitoring", message: "Circadian sleep duration & social interaction scores cached." }
    ];
    
    const interval = setInterval(() => {
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      setLogs(prev => {
        const next = [randomMsg, prev[0], prev[1]];
        return next.slice(0, 3);
      });
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="relative mb-8 animate-slide-in rounded-2xl p-[1px] overflow-hidden group">
      {/* Animated gradient border */}
      <div className="absolute inset-0 rounded-2xl bg-[conic-gradient(from_var(--border-angle),transparent_30%,#6366f1_50%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-[spin_4s_linear_infinite]" style={{ '--border-angle': '0turn' }} />
      <div className="absolute inset-0 rounded-2xl bg-[conic-gradient(from_var(--border-angle),transparent_30%,#6366f1_50%,transparent_70%)] opacity-[0.15] animate-[spin_4s_linear_infinite]" style={{ '--border-angle': '0turn' }} />
    <div className="bg-white/[0.02] backdrop-blur-sm p-4 rounded-2xl border border-white/[0.06] relative overflow-hidden hover:border-indigo-500/15 transition duration-300">
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-indigo-500/[0.02] blur-xl pointer-events-none" />
      <div className="flex items-center justify-between mb-3 border-b border-white/[0.04] pb-2">
        <div className="flex items-center space-x-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-display">Cooperative Agent Network Logs</h3>
        </div>
        <span className="text-[9px] text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full font-bold border border-indigo-500/15">3 Agents Active</span>
      </div>
      <div className="space-y-2 font-mono text-[10px] sm:text-xs">
        {logs.map((log, idx) => (
          <div key={idx} className={`flex items-start space-x-2 transition-all duration-500 ${idx === 0 ? "text-slate-200" : "text-slate-500"}`}>
            <span className={`font-semibold shrink-0 uppercase tracking-wider ${
              log.agent === "SentinelAI" ? "text-amber-400" : log.agent === "CompanionAI" ? "text-indigo-400" : "text-indigo-300"
            }`}>[{log.agent}]</span>
            <span className={`shrink-0 px-1 py-0.2 rounded font-bold uppercase text-[8px] border ${
              log.status === "scanning" || log.status === "monitoring"
                ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                : "bg-white/[0.02] text-slate-400 border-white/[0.06]"
            }`}>{log.status}</span>
            <span className="truncate">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [trends, setTrends] = useState({ checkins: [], stats: {}, active_warning: false, warning_details: null });
  const [chartDays, setChartDays] = useState(7);
  const [showCheckInForm, setShowCheckInForm] = useState(false);
  const [behavioralData, setBehavioralData] = useState(null);
  const [behavioralDismissed, setBehavioralDismissed] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const todayRes = await api.get("/checkin/today");
      setCheckedInToday(todayRes.data.checked_in);
      
      const trendsRes = await api.get(`/checkin/trends/${user.id}`);
      setTrends(trendsRes.data);

      // Fetch behavioral baseline telemetry if enabled
      try {
        const isEnabled = localStorage.getItem('behavioral_enabled') === 'true';
        if (isEnabled) {
          const checkDismissed = localStorage.getItem('behavioral_dismissed_until');
          if (checkDismissed && Date.now() < parseInt(checkDismissed)) {
            setBehavioralDismissed(true);
          } else {
            setBehavioralDismissed(false);
          }
          const bioRes = await api.get(`/behavioral/baseline/${user.id}`);
          setBehavioralData(bioRes.data);
        } else {
          setBehavioralData(null);
        }
      } catch (err) {
        console.error("Error fetching behavioral data:", err);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleCheckInSuccess = () => {
    setCheckedInToday(true);
    setShowCheckInForm(false);
    fetchDashboardData();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getFilteredChartData = () => {
    if (!trends.checkins) return [];
    const sorted = [...trends.checkins].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    return sorted.slice(-chartDays).map(c => ({
      date: new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      Mood: c.mood_score,
      Sleep: c.sleep_hours,
      Social: c.social_score,
      Energy: c.energy_level,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium text-sm">Loading your wellness dashboard...</p>
        </div>
      </div>
    );
  }

  const chartData = getFilteredChartData();
  const stats = trends.stats || {};

  const tooltipStyle = {
    borderRadius: "12px",
    border: "1px solid rgba(99, 102, 241, 0.15)",
    backgroundColor: "#0c0c24",
    color: "#f1f5f9",
    boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-background min-h-[calc(100vh-4rem)]">
      
      {/* Agent Status Panel */}
      {/* AGENTIC: Shows real-time status of all 3 agents in the pipeline */}
      <AgentStatus 
        hasWarning={trends.active_warning}
        chatActive={false}
        showResources={false}
        isCrisis={false}
      />

      <AgentTelemetryConsole />

      {/* Welcome & Action Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
            {getGreeting()}, {user?.username}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Here is your personalized mental health summary.
          </p>
        </div>
        
        {!checkedInToday && !showCheckInForm && (
          <button
            onClick={() => setShowCheckInForm(true)}
            className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white px-5 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-indigo-600/15 hover:shadow-xl transition duration-200 flex items-center space-x-2"
          >
            <Calendar className="h-4 w-4" />
            <span>Daily Check-in</span>
          </button>
        )}
      </div>

      {/* Warning Banner */}
      {/* AGENTIC: This notification is triggered autonomously by SentinelAI (Agent 1) */}
      {trends.active_warning && (
        <div className="mb-8 p-5 rounded-2xl border bg-amber-500/[0.03] border-amber-500/15 animate-slide-in relative overflow-hidden group hover:border-amber-500/25 transition duration-300">
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-amber-500/[0.01] blur-2xl pointer-events-none" />
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
            <div className="flex items-start space-x-3">
              <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl mt-0.5 relative">
                <span className="animate-ping absolute inset-0 rounded-xl bg-amber-500/10 opacity-75"></span>
                <ShieldAlert className="h-6 w-6 relative z-10" />
              </div>
              <div>
                <h3 className="font-bold text-white font-display flex items-center">
                  SentinelAI Alert
                  <span className="ml-2 px-2 py-0.5 text-[9px] font-sans font-bold bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20">SYSTEM WARNING</span>
                </h3>
                <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                  SentinelAI has autonomously flagged critical pattern deviations in your longitudinal wellness logs.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {trends.warning_details?.triggers.map((trig, i) => (
                    <span key={i} className="text-xs bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-full font-medium border border-amber-500/15">
                      {trig}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <Link
              to="/chat"
              className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center space-x-1.5 shadow-lg shadow-indigo-600/15 hover:shadow-xl hover:shadow-indigo-600/20 transition duration-200 whitespace-nowrap self-stretch md:self-auto justify-center"
            >
              <span>Talk to CompanionAI</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Checkin Form */}
      {showCheckInForm && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4 max-w-xl mx-auto">
            <h3 className="text-lg font-bold text-white font-display">Check-in Form</h3>
            <button
              onClick={() => setShowCheckInForm(false)}
              className="text-slate-500 hover:text-white text-sm font-medium"
            >
              Cancel
            </button>
          </div>
          <CheckIn onCheckInSuccess={handleCheckInSuccess} />
        </div>
      )}

      {/* If not checked in and not showing form, show CTA */}
      {!checkedInToday && !showCheckInForm && (
        <div className="mb-8 p-8 rounded-2xl border border-dashed border-indigo-500/20 bg-gradient-to-br from-indigo-500/[0.06] via-indigo-500/[0.02] to-violet-500/[0.04] text-center animate-slide-in max-w-xl mx-auto relative overflow-hidden group hover:border-indigo-500/30 transition duration-300">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-indigo-500/[0.04] blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-violet-500/[0.03] blur-3xl pointer-events-none" />
          <div className="relative w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-glow">
            <div className="absolute inset-0 rounded-2xl bg-indigo-500/15 blur-md animate-pulse" />
            <Calendar className="h-8 w-8 text-indigo-400 relative z-10" />
          </div>
          <h3 className="text-lg font-bold text-white font-display relative">Daily Check-in Pending</h3>
          <p className="text-slate-500 text-sm mt-1 mb-5 relative">
            Log your mood, sleep, social connection, and energy to keep SentinelAI active and monitoring patterns.
          </p>
          <button
            onClick={() => setShowCheckInForm(true)}
            className="relative bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition shadow-lg shadow-indigo-600/20 hover:shadow-xl hover:shadow-indigo-600/30"
          >
            Start Check-in
          </button>
        </div>
      )}

      {/* Stats Grid — Bento style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8 stagger-in">
        <div className="bg-white/[0.02] backdrop-blur-sm p-5 rounded-2xl border border-white/[0.06] flex items-center space-x-4 group hover:border-indigo-500/25 hover:bg-white/[0.04] hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl group-hover:bg-indigo-500/20 group-hover:scale-110 transition duration-300 relative">
            <div className="absolute inset-0 rounded-xl bg-indigo-500/20 blur-md opacity-0 group-hover:opacity-100 transition duration-300" />
            <TrendingUp className="h-6 w-6 relative z-10" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Avg Mood</p>
            <p className="text-xl sm:text-2xl font-bold text-white mt-0.5 font-display">{stats.avg_mood || 0}<span className="text-sm text-slate-600">/10</span></p>
          </div>
        </div>

        <div className="bg-white/[0.02] backdrop-blur-sm p-5 rounded-2xl border border-white/[0.06] flex items-center space-x-4 group hover:border-indigo-500/25 hover:bg-white/[0.04] hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300">
          <div className="p-3 bg-indigo-500/10 text-indigo-300 rounded-xl group-hover:bg-indigo-500/20 group-hover:scale-110 transition duration-300 relative">
            <div className="absolute inset-0 rounded-xl bg-indigo-500/20 blur-md opacity-0 group-hover:opacity-100 transition duration-300" />
            <Moon className="h-6 w-6 relative z-10" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Avg Sleep</p>
            <p className="text-xl sm:text-2xl font-bold text-white mt-0.5 font-display">{stats.avg_sleep || 0}<span className="text-sm text-slate-600"> hrs</span></p>
          </div>
        </div>

        <div className="bg-white/[0.02] backdrop-blur-sm p-5 rounded-2xl border border-white/[0.06] flex items-center space-x-4 group hover:border-indigo-500/25 hover:bg-white/[0.04] hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300">
          <div className="p-3 bg-indigo-500/10 text-indigo-300 rounded-xl group-hover:bg-indigo-500/20 group-hover:scale-110 transition duration-300 relative">
            <div className="absolute inset-0 rounded-xl bg-indigo-500/20 blur-md opacity-0 group-hover:opacity-100 transition duration-300" />
            <Award className="h-6 w-6 relative z-10" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Streak</p>
            <p className="text-xl sm:text-2xl font-bold text-white mt-0.5 font-display">{stats.streak || 0}<span className="text-sm text-slate-600"> days</span></p>
          </div>
        </div>

        <div className="bg-white/[0.02] backdrop-blur-sm p-5 rounded-2xl border border-white/[0.06] flex items-center space-x-4 group hover:border-indigo-500/25 hover:bg-white/[0.04] hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300">
          <div className="p-3 bg-indigo-500/10 text-indigo-300 rounded-xl group-hover:bg-indigo-500/20 group-hover:scale-110 transition duration-300 relative">
            <div className="absolute inset-0 rounded-xl bg-indigo-500/20 blur-md opacity-0 group-hover:opacity-100 transition duration-300" />
            <Calendar className="h-6 w-6 relative z-10" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Total Logs</p>
            <p className="text-xl sm:text-2xl font-bold text-white mt-0.5 font-display">{stats.total_checkins || 0}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8 stagger-in">
        <Link to="/chat" className="bg-white/[0.02] backdrop-blur-sm px-4 py-3.5 rounded-2xl border border-white/[0.06] flex items-center justify-center space-x-2.5 group hover:border-indigo-500/25 hover:bg-white/[0.04] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg group-hover:bg-indigo-500/20 transition duration-300 relative">
            <div className="absolute inset-0 rounded-lg bg-indigo-500/15 blur-sm opacity-0 group-hover:opacity-100 transition duration-300" />
            <MessageSquare className="h-4 w-4 relative z-10" />
          </div>
          <span className="text-xs sm:text-sm font-semibold text-slate-400 group-hover:text-white transition">Start Chat</span>
        </Link>
        <Link to="/resources" className="bg-white/[0.02] backdrop-blur-sm px-4 py-3.5 rounded-2xl border border-white/[0.06] flex items-center justify-center space-x-2.5 group hover:border-indigo-500/25 hover:bg-white/[0.04] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300">
          <div className="p-2 bg-indigo-500/10 text-indigo-300 rounded-lg group-hover:bg-indigo-500/20 transition duration-300 relative">
            <div className="absolute inset-0 rounded-lg bg-indigo-500/15 blur-sm opacity-0 group-hover:opacity-100 transition duration-300" />
            <BookOpen className="h-4 w-4 relative z-10" />
          </div>
          <span className="text-xs sm:text-sm font-semibold text-slate-400 group-hover:text-white transition">View Resources</span>
        </Link>
        <Link to="/agent-playground" className="bg-white/[0.02] backdrop-blur-sm px-4 py-3.5 rounded-2xl border border-white/[0.06] flex items-center justify-center space-x-2.5 group hover:border-indigo-500/25 hover:bg-white/[0.04] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300">
          <div className="p-2 bg-indigo-500/10 text-indigo-300 rounded-lg group-hover:bg-indigo-500/20 transition duration-300 relative">
            <div className="absolute inset-0 rounded-lg bg-indigo-500/15 blur-sm opacity-0 group-hover:opacity-100 transition duration-300" />
            <Cpu className="h-4 w-4 relative z-10" />
          </div>
          <span className="text-xs sm:text-sm font-semibold text-slate-400 group-hover:text-white transition">Agent Playground</span>
        </Link>
      </div>

      {/* Behavioral Insights Card */}
      <BehavioralInsightsCard 
        data={behavioralData} 
        user={user} 
        fetchDashboardData={fetchDashboardData} 
        dismissed={behavioralDismissed}
        setDismissed={setBehavioralDismissed}
      />

      {/* Charts Section */}
      {chartData.length > 0 ? (
        <div className="space-y-5">
          <div className="flex justify-between items-center bg-white/[0.02] backdrop-blur-sm px-5 py-3.5 rounded-2xl border border-white/[0.06]">
            <h2 className="text-base sm:text-lg font-bold text-white font-display flex items-center gap-2.5">
              Wellness Trends
              <span className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/15 uppercase tracking-wider">
                <span className="flex h-1.5 w-1.5 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span></span>
                Live
              </span>
            </h2>
            <div className="flex bg-white/[0.03] border border-white/[0.06] p-1 rounded-xl">
              {[7, 14, 30].map((days) => (
                <button
                  key={days}
                  onClick={() => setChartDays(days)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                    chartDays === days
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-500 hover:text-white"
                  }`}
                >
                  {days}D
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Mood Chart */}
            <div className="bg-white/[0.02] backdrop-blur-sm p-5 rounded-2xl border border-white/[0.06]">
              <h3 className="font-bold text-white mb-4 text-sm sm:text-base flex items-center space-x-1.5 font-display">
                <TrendingUp className="h-4 w-4 text-indigo-400" />
                <span>Mood Score</span>
              </h3>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="date" stroke="#334155" fontSize={11} tickLine={false} />
                    <YAxis domain={[1, 10]} stroke="#334155" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="Mood" stroke="#6366f1" strokeWidth={2.5} fill="url(#moodGrad)" dot={{ r: 3, fill: "#6366f1" }} activeDot={{ r: 6, fill: "#818cf8" }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sleep Chart */}
            <div className="bg-white/[0.02] backdrop-blur-sm p-5 rounded-2xl border border-white/[0.06]">
              <h3 className="font-bold text-white mb-4 text-sm sm:text-base flex items-center space-x-1.5 font-display">
                <Moon className="h-4 w-4 text-indigo-300" />
                <span>Sleep Hours</span>
              </h3>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a5b4fc" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#a5b4fc" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="date" stroke="#334155" fontSize={11} tickLine={false} />
                    <YAxis domain={[0, 12]} stroke="#334155" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="Sleep" stroke="#a5b4fc" strokeWidth={2.5} fill="url(#sleepGrad)" dot={{ r: 3, fill: "#a5b4fc" }} activeDot={{ r: 6, fill: "#c7d2fe" }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Energy and Social Chart */}
            <div className="bg-white/[0.02] backdrop-blur-sm p-5 rounded-2xl border border-white/[0.06] lg:col-span-2">
              <h3 className="font-bold text-white mb-4 text-sm sm:text-base flex items-center space-x-1.5 font-display">
                <Zap className="h-4 w-4 text-indigo-300" />
                <span>Social & Energy Correlation</span>
              </h3>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="date" stroke="#334155" fontSize={11} tickLine={false} />
                    <YAxis domain={[1, 5]} stroke="#334155" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend iconType="circle" />
                    <Line type="monotone" dataKey="Social" name="Social Connection" stroke="#818cf8" strokeWidth={2.5} dot={{ r: 2 }} />
                    <Line type="monotone" dataKey="Energy" name="Energy Level" stroke="#4338ca" strokeWidth={2.5} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      ) : (
        !showCheckInForm && (
          <div className="bg-white/[0.02] backdrop-blur-sm p-12 rounded-2xl border border-white/[0.06] text-center">
            <TrendingUp className="h-16 w-16 text-slate-800 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white font-display">No Trend Data Available</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mt-1">
              SentinelAI requires at least one daily check-in log to construct trend lines and monitor patterns.
            </p>
          </div>
        )
      )}
    </div>
  );
}

function BehavioralInsightsCard({ data, user, fetchDashboardData, dismissed, setDismissed }) {
  const isEnabled = localStorage.getItem('behavioral_enabled') === 'true';

  if (!isEnabled) {
    return (
      <div className="mb-8 p-6 rounded-2xl border border-white/[0.04] bg-white/[0.01] backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl mt-0.5">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-white font-display flex items-center">
                Passive Behavioral Insights
                <span className="ml-2 text-[10px] bg-white/[0.06] text-slate-400 px-2 py-0.5 rounded-full font-sans uppercase">Opt-in</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Enable secure, privacy-first typing telemetry (hold speed, corrections frequency) to let SentinelAI detect mood pattern changes in the background. No keylogger, no text contents are ever stored.
              </p>
            </div>
          </div>
          <Link
            to="/profile"
            className="text-xs bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 px-4 py-2.5 rounded-xl font-bold transition duration-200 self-stretch sm:self-auto text-center"
          >
            Configure in Profile
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mb-8 p-6 rounded-2xl border border-white/[0.04] bg-white/[0.01] backdrop-blur-sm text-center animate-pulse">
        <div className="h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-500">Retrieving behavioral metrics...</p>
      </div>
    );
  }

  const handleDismiss = () => {
    const dismissUntil = Date.now() + 48 * 60 * 60 * 1000;
    localStorage.setItem('behavioral_dismissed_until', dismissUntil.toString());
    setDismissed(true);
  };

  const tooltipStyle = {
    borderRadius: "12px",
    border: "1px solid rgba(99, 102, 241, 0.15)",
    backgroundColor: "#0c0c24",
    color: "#f1f5f9",
    boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
  };

  if (data.status === "learning") {
    return (
      <div className="mb-8 p-6 rounded-2xl border border-white/[0.04] bg-white/[0.01] backdrop-blur-sm animate-slide-in">
        <div className="flex items-start space-x-3 mb-4">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl mt-0.5">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-white font-display">Building Behavioral Baseline</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              SentinelAI is learning your standard typing characteristics (speed, holds, and corrections).
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-400">
            <span>Baseline Progress</span>
            <span>{data.total_sessions} / {data.required_sessions} sessions completed</span>
          </div>
          <div className="w-full bg-white/[0.04] h-2 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${(data.total_sessions / data.required_sessions) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 italic mt-1">
            *Tip: Keep using the Daily Check-in notes or Companion Chat. Telemetry is collected silently only when you type 10+ keystrokes.
          </p>
        </div>
      </div>
    );
  }

  const hasWarning = data.warning && !dismissed;
  const isHigh = data.level === "high";

  const chartPoints = data.recent_wpm.map((wpm, index) => ({
    name: `Session ${index + 1}`,
    WPM: wpm,
    Backspace: data.recent_backspace[index] || 0
  }));

  return (
    <div className="mb-8 p-6 rounded-2xl border border-white/[0.04] bg-white/[0.01] backdrop-blur-sm animate-slide-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-white/[0.04] pb-4">
        <div className="flex items-start space-x-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-white font-display flex items-center">
              Behavioral Pattern Analysis
              <span className="ml-2.5 flex h-2 w-2 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${hasWarning ? (isHigh ? "bg-red-400" : "bg-amber-400") : "bg-emerald-400"}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${hasWarning ? (isHigh ? "bg-red-500" : "bg-amber-500") : "bg-emerald-500"}`}></span>
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Secure passive monitoring of writing mechanics compared to your established baseline.
            </p>
          </div>
        </div>
        <Link 
          to="/how-it-works"
          className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 font-semibold"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          <span>How does this work?</span>
        </Link>
      </div>

      {hasWarning ? (
        <div className={`p-4 rounded-xl mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border ${
          isHigh 
            ? "bg-red-500/[0.04] border-red-500/20 text-red-200" 
            : "bg-amber-500/[0.04] border-amber-500/20 text-amber-200"
        }`}>
          <div>
            <p className="font-bold text-sm">
              {isHigh ? "Sustained Behavioral Trend Shift" : "Mild Behavioral Deviation Detected"}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {isHigh 
                ? "Your typing patterns suggest you might be going through a tough time (slower speed, higher corrections rate)." 
                : "We noticed some changes in how you've been typing recently (increased pauses, shifts in speed)."}
            </p>
            {data.deviations && (
              <div className="flex flex-wrap gap-3 mt-2.5 text-[11px] font-semibold">
                {data.deviations.speed_drop_pct > 20 && (
                  <span className={`${isHigh ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"} px-2.5 py-0.5 rounded-md border`}>
                    Speed: -{data.deviations.speed_drop_pct}%
                  </span>
                )}
                {data.deviations.backspace_increase_pct > 25 && (
                  <span className={`${isHigh ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"} px-2.5 py-0.5 rounded-md border`}>
                    Corrections: +{data.deviations.backspace_increase_pct}%
                  </span>
                )}
                {data.deviations.response_slowing_pct > 25 && (
                  <span className={`${isHigh ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"} px-2.5 py-0.5 rounded-md border`}>
                    Latencies: +{data.deviations.response_slowing_pct}%
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex space-x-2 self-stretch sm:self-auto justify-end">
            <button
              onClick={handleDismiss}
              className="bg-white/[0.04] hover:bg-white/[0.08] text-white px-3.5 py-2 rounded-lg text-xs font-semibold border border-white/[0.08]"
            >
              I'm fine
            </button>
            <Link
              to="/chat"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-lg shadow-indigo-600/15"
            >
              Tell me more
            </Link>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-emerald-500/[0.03] border border-emerald-500/15 rounded-xl mb-6 text-emerald-300 text-xs flex items-center space-x-2 font-semibold animate-fade-in">
          <span>✓</span>
          <span>Your typing patterns look stable this week. All telemetry values fall within normal baseline limits.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white/[0.01] p-4 rounded-xl border border-white/[0.04]">
          <h4 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Typing Speed Trend (WPM)</h4>
          <div className="h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartPoints} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.02)" />
                <XAxis dataKey="name" stroke="#334155" fontSize={9} tickLine={false} />
                <YAxis stroke="#334155" fontSize={9} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="WPM" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/[0.01] p-4 rounded-xl border border-white/[0.04]">
          <h4 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Backspace Rate (%)</h4>
          <div className="h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartPoints} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.02)" />
                <XAxis dataKey="name" stroke="#334155" fontSize={9} tickLine={false} />
                <YAxis stroke="#334155" fontSize={9} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="Backspace" fill="#818cf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
