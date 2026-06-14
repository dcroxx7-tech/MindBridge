import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Activity, MessageCircle, Network, Shield, ArrowRight } from "lucide-react";
import MindBridgeLogo from "../components/MindBridgeLogo";
import ParticleField from "../components/ParticleField";
import AgentPlayground from "../components/AgentPlayground";
import HeroOrb from "../components/HeroOrb";

export default function Home() {
  const { user } = useAuth();


  return (
    <div className="bg-background min-h-screen text-white relative overflow-hidden">

      {/* Hero Section */}
      <div className="relative min-h-[95vh] flex items-center border-b border-white/[0.04] py-12 lg:py-0">
        
        {/* Particle Field Background */}
        <div className="absolute inset-0">
          <ParticleField particleCount={160} />
        </div>

        {/* Subtle radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-indigo-600/[0.05] blur-[150px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left Column — Hero copy */}
            <div className="lg:col-span-7 text-left relative">

              {/* ── Neural Nexus — Floating behind hero text ── */}
              <div className="absolute -right-10 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none z-0 select-none hidden md:block">
                <HeroOrb size={450} />
              </div>

              <div className="relative z-10 space-y-8">
                {/* Brand Mark */}
                <div className="flex items-center space-x-3">
                  <MindBridgeLogo size="lg" />
                  <span className="text-lg font-display font-bold text-white/80 tracking-tight">
                    MindBridge
                  </span>
                </div>

                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[0.9] font-display">
                  Not a chatbot.<br />
                  <span className="bg-gradient-to-r from-indigo-300 via-indigo-400 to-indigo-500 bg-clip-text text-transparent">
                    A system that acts.
                  </span>
                </h1>
                
                <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-xl">
                  MindBridge orchestrates an autonomous three-agent network that analyzes behavioral patterns, delivers clinical CBT interventions, and connects users with verified mental health professionals worldwide.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <Link
                    to={user ? "/dashboard" : "/login"}
                    className="group bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-indigo-600/20 hover:shadow-xl hover:shadow-indigo-600/30 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 text-center flex items-center justify-center space-x-2"
                  >
                    <span>{user ? "Go to Dashboard" : "Enter Platform"}</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <a
                    href="#architecture"
                    className="bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 text-center"
                  >
                    Explore System
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column (Interactive Agent Sandbox Playground) */}
            <div className="lg:col-span-5 w-full relative z-20">
              <AgentPlayground />
            </div>

          </div>
        </div>
      </div>

      {/* The 3 Agents Info Section */}
      <div id="architecture" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 relative">
        
        <div className="text-center max-w-xl mx-auto mb-20">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
            Cooperative Tri-Agent Framework
          </h2>
          <p className="text-slate-400 text-sm mt-3 leading-relaxed">
            Three specialized AI agents running concurrently behind a unified client core, available to users worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-in">
          
          {/* Agent 1 */}
          <div className="bg-white/[0.02] backdrop-blur-sm p-8 rounded-3xl border border-white/[0.04] hover:border-indigo-500/20 transition-all duration-300 group">
            <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
              <Activity className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-bold text-indigo-400 tracking-[0.2em] uppercase">Agent 1</span>
            <h3 className="text-xl font-bold text-white mt-2 font-display">SentinelAI</h3>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-1">Behavioral Detection</p>
            <p className="text-sm text-slate-400 mt-4 leading-relaxed">
              Maintains silent, background monitoring of mood, circadian patterns, and textual syntax. Evaluates safety limits and logs alerts if a sustained decline is measured.
            </p>
          </div>

          {/* Agent 2 */}
          <div className="bg-white/[0.02] backdrop-blur-sm p-8 rounded-3xl border border-white/[0.04] hover:border-indigo-500/20 transition-all duration-300 group">
            <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
              <MessageCircle className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-bold text-indigo-400 tracking-[0.2em] uppercase">Agent 2</span>
            <h3 className="text-xl font-bold text-white mt-2 font-display">CompanionAI</h3>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-1">CBT Intervention</p>
            <p className="text-sm text-slate-400 mt-4 leading-relaxed">
              Instantiates a dialogue session upon alarm trigger. Employs clinical cognitive reframing strategies, stress reduction techniques, and autonomous crisis classification.
            </p>
          </div>

          {/* Agent 3 */}
          <div className="bg-white/[0.02] backdrop-blur-sm p-8 rounded-3xl border border-white/[0.04] hover:border-indigo-500/20 transition-all duration-300 group">
            <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
              <Network className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-bold text-indigo-400 tracking-[0.2em] uppercase">Agent 3</span>
            <h3 className="text-xl font-bold text-white mt-2 font-display">BridgeAI</h3>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-1">Clinical Routing</p>
            <p className="text-sm text-slate-400 mt-4 leading-relaxed">
              Monitors companion escalation state. Instantly compiles, ranks, and maps available physical helplines, support groups, and regional clinical directories based on geographic context.
            </p>
          </div>

        </div>
      </div>

      {/* Global Safety Footer */}
      <div className="bg-white/[0.01] backdrop-blur-sm text-white py-20 px-4 border-t border-white/[0.04] relative">
        <div className="max-w-4xl mx-auto text-center z-10 relative">
          <Shield className="h-10 w-10 text-indigo-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold tracking-tight font-display">Enterprise Safety & Data Shield</h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto mt-3 leading-relaxed">
            All user data is encrypted locally and in-transit. If clinical thresholds are exceeded, the system dynamically activates emergency routing overlays with verified global helpline resources.
          </p>
          <div className="mt-8">
            <Link
              to="/resources"
              className="inline-flex items-center space-x-2 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-white text-sm font-bold px-6 py-3 rounded-xl transition-all duration-300"
            >
              <span>View Global Resource Directory</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
