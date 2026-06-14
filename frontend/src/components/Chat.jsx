import React, { useState, useEffect, useRef } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import CrisisAlert from "./CrisisAlert";
import { Send, PhoneCall, AlertCircle, ArrowRight, CornerDownRight, Sparkles, ChevronDown, Shield, Brain, Activity } from "lucide-react";
import MindBridgeLogo from "./MindBridgeLogo";
import useKeystrokeAnalytics from "../hooks/useKeystrokeAnalytics";

export default function Chat() {
  const { user } = useAuth();
  const keystroke = useKeystrokeAnalytics('chat');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCrisisTriggered, setIsCrisisTriggered] = useState(false);
  const [showResourceEscalation, setShowResourceEscalation] = useState(false);
  const [expandedAnalysisId, setExpandedAnalysisId] = useState(null);
  
  const chatBottomRef = useRef(null);

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Start chat session on mount
  useEffect(() => {
    const startSession = async () => {
      try {
        const response = await api.post("/chat/start");
        setSessionId(response.data.session_id);
        
        // Add initial greeting from CompanionAI
        setMessages([
          {
            id: "greeting",
            role: "assistant",
            content: `Hello ${user?.username || "friend"}. I'm CompanionAI, your supportive mental health space. 
            
I'm here to listen, offer Cognitive Behavioral Therapy (CBT) exercises, and walk through thoughts with you. 

How are you holding up today? What's on your mind?`,
            created_at: new Date().toISOString()
          }
        ]);
      } catch (err) {
        console.error("Failed to start chat session:", err);
      }
    };

    if (user) {
      startSession();
    }
  }, [user]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !sessionId || loading || isCrisisTriggered) return;

    const userText = inputText;
    setInputText("");
    
    // Submit keystroke analytics telemetry
    await keystroke.submitSession();
    
    // Add user message to UI immediately
    const tempUserMsg = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userText,
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, tempUserMsg]);
    setLoading(true);

    /* AGENTIC: CompanionAI (Agent 2) is activated automatically by SentinelAI. 
       It autonomously conducts CBT conversations and decides when to escalate. */
    try {
      const response = await api.post("/chat/", {
        message: userText,
        session_id: sessionId
      });
      
      const { response: aiReply, is_crisis, show_resources, agent_analysis } = response.data;
      
      const tempAiMsg = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: aiReply,
        created_at: new Date().toISOString(),
        agent_analysis: agent_analysis
      };
      
      setMessages(prev => [...prev, tempAiMsg]);
      
      if (is_crisis) {
        setIsCrisisTriggered(true);
      }
      
      if (show_resources) {
        setShowResourceEscalation(true);
      }
    } catch (err) {
      console.error("Chat message delivery failed:", err);
      // Fallback message if server error
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: "I'm having trouble connecting right now, but please know I am here for you. Take a deep breath and let's try again in a moment.",
        created_at: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 font-sans flex flex-col h-[calc(100vh-4rem)] bg-background">
      
      {/* Ambient Glow Backdrop */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-600/[0.04] rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-violet-600/[0.03] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Top Banner Header */}
      <div className="relative bg-surface/60 backdrop-blur-xl p-4 rounded-t-2xl border border-white/[0.06] shadow-2xl shadow-indigo-950/20 flex justify-between items-center flex-shrink-0 z-10">
        {/* Subtle top gradient line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent rounded-t-2xl" />
        
        <div className="flex items-center space-x-3">
          <div className="relative p-2.5 bg-indigo-500/10 text-primary-light rounded-xl ring-1 ring-indigo-500/20">
            <MindBridgeLogo size="sm" />
            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-emerald-400 rounded-full border-2 border-surface animate-pulse" />
          </div>
          <div>
            <h2 className="font-bold text-white text-sm sm:text-base tracking-tight">CompanionAI Chat</h2>
            <p className="text-xs text-text-light flex items-center mt-0.5">
              <span className="relative flex h-1.5 w-1.5 mr-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
              </span>
              CBT Support Active
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCrisisTriggered(true)}
          className="flex items-center space-x-1.5 text-xs font-semibold text-crisis hover:bg-crisis/10 px-3 py-2 rounded-xl transition-all duration-200 border border-crisis/25 hover:border-crisis/40 hover:shadow-lg hover:shadow-red-500/5"
        >
          <PhoneCall className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Need Urgent Help?</span>
        </button>
      </div>

      {/* Message Area */}
      <div className="relative flex-1 bg-surface/40 backdrop-blur-xl border-x border-white/[0.06] p-4 sm:p-6 overflow-y-auto space-y-5 shadow-xl min-h-0 z-10" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(99,102,241,0.15) transparent' }}>
        
        {messages.map((msg, idx) => (
          <div
            key={msg.id}
            className={`flex items-start max-w-[85%] sm:max-w-[75%] ${
              msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            }`}
            style={{ animation: `chat-msg-enter 0.4s cubic-bezier(0.16,1,0.3,1) ${idx * 0.05}s both` }}
          >
            {/* Avatar */}
            {msg.role !== "user" && (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/15 to-violet-500/10 text-primary-light flex items-center justify-center flex-shrink-0 mr-3 shadow-lg shadow-indigo-500/5 border border-indigo-500/15 ring-1 ring-white/[0.04]">
                <MindBridgeLogo size="sm" />
              </div>
            )}

            {/* Message Bubble Container */}
            <div className="flex-1 flex flex-col items-stretch">
              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap transition-all duration-200 ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-500 text-white rounded-tr-sm shadow-xl shadow-indigo-600/20 ring-1 ring-indigo-400/20"
                    : "bg-[#0a0a1e]/70 backdrop-blur-sm text-white/95 border border-white/[0.08] rounded-tl-sm shadow-lg ring-1 ring-white/[0.03]"
                }`}
              >
                {msg.content}
              </div>
              
              {/* Agentic Reasoning Console */}
              {msg.role === "assistant" && msg.agent_analysis && (
                <div className="mt-2.5 font-sans self-start">
                  <button
                    type="button"
                    onClick={() => setExpandedAnalysisId(expandedAnalysisId === msg.id ? null : msg.id)}
                    className="group text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1.5 transition-all duration-200 cursor-pointer text-xs px-2 py-1 rounded-lg hover:bg-indigo-500/5"
                  >
                    <Sparkles className="h-3 w-3 group-hover:animate-spin" style={{ animationDuration: '2s' }} />
                    <span>{expandedAnalysisId === msg.id ? "Hide Autonomy Logs" : "View Agent Autonomy Logs"}</span>
                    <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${expandedAnalysisId === msg.id ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {expandedAnalysisId === msg.id && (
                    <div
                      className="mt-2 p-4 bg-gradient-to-br from-white/[0.02] to-indigo-500/[0.02] border border-white/[0.08] rounded-xl space-y-3 relative overflow-hidden font-mono text-[10px] sm:text-xs min-w-[300px] sm:min-w-[380px] ring-1 ring-indigo-500/10 shadow-xl shadow-indigo-950/10"
                      style={{ animation: 'reasoning-panel-enter 0.35s cubic-bezier(0.16,1,0.3,1) both' }}
                    >
                      {/* Decorative glows */}
                      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-indigo-500/[0.04] blur-2xl pointer-events-none" />
                      <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-violet-500/[0.03] blur-2xl pointer-events-none" />
                      
                      {/* Panel Header */}
                      <div className="flex justify-between items-center border-b border-white/[0.06] pb-2.5">
                        <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px] flex items-center space-x-1.5">
                          <Brain className="h-3 w-3 text-indigo-400" />
                          <span>CompanionAI Decision Logs</span>
                        </span>
                        <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/20 flex items-center space-x-1">
                          <span className="h-1 w-1 bg-emerald-400 rounded-full animate-pulse" />
                          <span>Active Policy</span>
                        </span>
                      </div>
                      
                      {/* Metrics Grid */}
                      <div className="grid grid-cols-2 gap-3 text-slate-400">
                        <div className="bg-white/[0.02] rounded-lg p-2.5 border border-white/[0.04]">
                          <span className="text-slate-500 font-bold flex items-center space-x-1 uppercase text-[8px] tracking-wider mb-1">
                            <Shield className="h-2.5 w-2.5" />
                            <span>Linguistic Safety</span>
                          </span>
                          <span className={`font-bold text-xs flex items-center space-x-1 ${msg.agent_analysis.safety_check === "PASSED" ? "text-emerald-400" : "text-red-400 animate-pulse"}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${msg.agent_analysis.safety_check === "PASSED" ? "bg-emerald-400" : "bg-red-400"}`} />
                            <span>{msg.agent_analysis.safety_check}</span>
                          </span>
                        </div>
                        <div className="bg-white/[0.02] rounded-lg p-2.5 border border-white/[0.04]">
                          <span className="text-slate-500 font-bold flex items-center space-x-1 uppercase text-[8px] tracking-wider mb-1">
                            <Activity className="h-2.5 w-2.5" />
                            <span>Escalation Threat</span>
                          </span>
                          <span className="font-bold text-xs text-slate-200">{msg.agent_analysis.escalation_score} / 1.0</span>
                          {/* Mini progress bar */}
                          <div className="mt-1.5 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                msg.agent_analysis.escalation_score > 0.7 ? 'bg-red-400' : msg.agent_analysis.escalation_score > 0.4 ? 'bg-amber-400' : 'bg-emerald-400'
                              }`}
                              style={{ width: `${msg.agent_analysis.escalation_score * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Distortions */}
                      <div className="bg-white/[0.02] rounded-lg p-2.5 border border-white/[0.04]">
                        <span className="text-slate-500 font-bold block uppercase text-[8px] tracking-wider mb-1">Linguistic Distortions</span>
                        <span className="font-semibold text-slate-200">
                          {msg.agent_analysis.cognitive_distortions.length > 0 
                            ? msg.agent_analysis.cognitive_distortions.map((d, i) => (
                                <span key={i} className="inline-block bg-amber-500/10 text-amber-300 border border-amber-500/15 rounded-md px-1.5 py-0.5 mr-1 mb-0.5 text-[9px]">{d}</span>
                              ))
                            : <span className="text-emerald-400/80">None (Nominal Writing)</span>}
                        </span>
                      </div>
                      
                      {/* CBT Policy */}
                      <div className="bg-white/[0.02] rounded-lg p-2.5 border border-white/[0.04]">
                        <span className="text-slate-500 font-bold block uppercase text-[8px] tracking-wider mb-1">CBT Protocol Policy</span>
                        <span className="font-semibold text-indigo-300 text-xs">{msg.agent_analysis.selected_policy}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading / Typing Indicator */}
        {loading && (
          <div className="flex items-start mr-auto max-w-[75%]" style={{ animation: 'chat-msg-enter 0.3s cubic-bezier(0.16,1,0.3,1) both' }}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/15 to-violet-500/10 text-primary-light flex items-center justify-center mr-3 shadow-lg shadow-indigo-500/5 border border-indigo-500/15">
              <MindBridgeLogo size="sm" className="animate-pulse" />
            </div>
            <div className="bg-[#0a0a1e]/70 backdrop-blur-sm border border-white/[0.08] p-4 rounded-2xl rounded-tl-sm flex items-center space-x-2 ring-1 ring-white/[0.03]">
              <span className="h-2 w-2 bg-indigo-400/70 rounded-full typing-dot"></span>
              <span className="h-2 w-2 bg-indigo-400/70 rounded-full typing-dot" style={{ animationDelay: '0.15s' }}></span>
              <span className="h-2 w-2 bg-indigo-400/70 rounded-full typing-dot" style={{ animationDelay: '0.3s' }}></span>
              <span className="ml-2 text-[10px] text-slate-500 font-mono">reasoning...</span>
            </div>
          </div>
        )}

        {/* Escalation Bridge prompt */}
        {showResourceEscalation && (
          <div className="bg-warning-light/80 backdrop-blur-sm border border-warning/20 p-4 rounded-2xl text-warning flex items-start space-x-2.5 max-w-[90%] sm:max-w-[80%] mx-auto ring-1 ring-warning/10 shadow-xl" style={{ animation: 'chat-msg-enter 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm text-white">BridgeAI Connection Prompt</p>
              <p className="text-xs text-text-light mt-1">
                You've been chatting with CompanionAI for a bit. BridgeAI recommends looking at local mental health professionals or free support organizations to assist you further.
              </p>
              <a
                href="/resources"
                className="mt-3 inline-flex items-center text-xs font-bold bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20"
              >
                <span>View recommended resources</span>
                <ArrowRight className="h-3 w-3 ml-1" />
              </a>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input area */}
      <form onSubmit={handleSendMessage} className="relative bg-surface/60 backdrop-blur-xl p-3 rounded-b-2xl border border-white/[0.06] border-t-0 shadow-2xl shadow-indigo-950/20 flex items-center space-x-2.5 flex-shrink-0 z-10">
        {/* Bottom gradient line */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent rounded-b-2xl" />
        
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={keystroke.handleKeyDown}
          onKeyUp={keystroke.handleKeyUp}
          disabled={loading || isCrisisTriggered}
          placeholder={
            isCrisisTriggered
              ? "AI chat suspended for safety. Please use resources."
              : "Type a supportive message or describe how you feel..."
          }
          className="flex-1 py-3 px-4 text-sm border border-white/[0.08] text-white rounded-xl bg-white/[0.03] focus:bg-white/[0.05] focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500/40 focus:shadow-lg focus:shadow-indigo-500/5 focus:outline-none transition-all duration-300 placeholder:text-slate-500"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || loading || isCrisisTriggered}
          className="group relative bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-white/[0.05] disabled:to-white/[0.05] disabled:text-text-light text-white p-3 rounded-xl shadow-lg shadow-indigo-500/15 hover:shadow-xl hover:shadow-indigo-500/25 transition-all duration-300 flex items-center justify-center flex-shrink-0 disabled:shadow-none"
        >
          <Send className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </button>
      </form>

      {/* Inline keyframe styles */}
      <style>{`
        @keyframes chat-msg-enter {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes reasoning-panel-enter {
          from { opacity: 0; transform: translateY(-6px) scaleY(0.95); max-height: 0; }
          to   { opacity: 1; transform: translateY(0) scaleY(1); max-height: 600px; }
        }
        .typing-dot {
          animation: typing-bounce 1.2s ease-in-out infinite;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.15s; }
        .typing-dot:nth-child(3) { animation-delay: 0.3s; }
        @keyframes typing-bounce {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-4px); }
        }
      `}</style>

      {/* Full screen Crisis overlay */}
      {isCrisisTriggered && (
        <CrisisAlert onClose={() => setIsCrisisTriggered(false)} />
      )}
    </div>
  );
}
