import React, { useState, useEffect } from "react";
import { Activity, MessageCircle, Network, Play, RotateCcw, AlertTriangle, ShieldCheck, Check, Sparkles, Send, ArrowRight, Eye } from "lucide-react";

export default function AgentPlayground() {
  const [activeTab, setActiveTab] = useState(1); // 1: Sentinel, 2: Companion, 3: Bridge
  const [sentinelSubTab, setSentinelSubTab] = useState("scores"); // scores, behavioral
  const [behavioralSimMode, setBehavioralSimMode] = useState("baseline"); // baseline, deviation
  const [activeKey, setActiveKey] = useState("");
  
  // Input parameters
  const [mood, setMood] = useState(3);
  const [sleep, setSleep] = useState(4);
  const [journalText, setJournalText] = useState("I am feeling extremely lonely and overwhelmed today. Everything feels like too much of a burden.");
  const [country, setCountry] = useState("US");
  
  // Sentinel State
  const [sentinelStatus, setSentinelStatus] = useState("idle"); // idle, scanning, complete
  const [flaggedKeywords, setFlaggedKeywords] = useState([]);
  const [warningLevel, setWarningLevel] = useState("none"); // none, medium, high
  const [sentinelLogs, setSentinelLogs] = useState([]);

  // Companion State
  const [companionStatus, setCompanionStatus] = useState("idle"); // idle, typing, active
  const [thinkingChain, setThinkingChain] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [selectedReply, setSelectedReply] = useState(null);

  // Bridge State
  const [bridgeStatus, setBridgeStatus] = useState("idle"); // idle, searching, complete
  const [costFilter, setCostFilter] = useState("all");
  const [matchedResources, setMatchedResources] = useState([]);

  // Pre-configured templates
  const templates = {
    distress: {
      mood: 3,
      sleep: 4.5,
      text: "I am feeling extremely lonely and overwhelmed today. Everything feels like too much of a burden.",
    },
    crisis: {
      mood: 1,
      sleep: 2,
      text: "I don't want to live like this anymore. I feel like hurting myself and ending my life.",
    },
    stable: {
      mood: 8,
      sleep: 8,
      text: "Had a productive day today. Got some good rest last night and spent time with friends.",
    }
  };

  const applyTemplate = (type) => {
    const temp = templates[type];
    setMood(temp.mood);
    setSleep(temp.sleep);
    setJournalText(temp.text);
    // Reset play state
    setSentinelStatus("idle");
    setWarningLevel("none");
    setFlaggedKeywords([]);
    setSentinelLogs([]);
    setCompanionStatus("idle");
    setThinkingChain("");
    setChatMessages([]);
    setSelectedReply(null);
  };

  const resetSimulation = () => {
    setActiveTab(1);
    setMood(3);
    setSleep(4);
    setJournalText("I am feeling extremely lonely and overwhelmed today. Everything feels like too much of a burden.");
    setSentinelStatus("idle");
    setWarningLevel("none");
    setFlaggedKeywords([]);
    setSentinelLogs([]);
    setCompanionStatus("idle");
    setThinkingChain("");
    setChatMessages([]);
    setSelectedReply(null);
    setBridgeStatus("idle");
    setCostFilter("all");
    setMatchedResources([]);
  };

  useEffect(() => {
    const keys = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Backspace', 'Space'];
    const intervalTime = behavioralSimMode === "baseline" ? 180 : 420;
    
    const interval = setInterval(() => {
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      setActiveKey(randomKey);
      setTimeout(() => {
        setActiveKey("");
      }, behavioralSimMode === "baseline" ? 80 : 200);
    }, intervalTime);

    return () => clearInterval(interval);
  }, [behavioralSimMode]);

  // Run SentinelAI
  const runSentinelAnalysis = () => {
    setSentinelStatus("scanning");
    setSentinelLogs(["Initializing SentinelAI telemetry scan...", "Scanning circadian metrics (sleep: " + sleep + " hrs)...", "Evaluating mood index (score: " + mood + "/10)...", "Analyzing linguistic syntax patterns..."]);
    
    setTimeout(() => {
      // Find flagged words
      const lower = journalText.toLowerCase();
      const keywords = ["lonely", "overwhelmed", "burden", "hurting myself", "ending my life", "don't want to live", "suicide"];
      const detected = keywords.filter(w => lower.includes(w));
      setFlaggedKeywords(detected);

      let level = "none";
      let isCrisis = false;
      if (mood <= 3 || detected.length > 0) {
        level = "medium";
      }
      if (detected.some(w => ["hurting myself", "ending my life", "suicide"].includes(w))) {
        level = "high";
        isCrisis = true;
      }

      setWarningLevel(level);
      setSentinelStatus("complete");
      setSentinelLogs(prev => [
        ...prev,
        `Scan complete. Circumstantial risk score: ${10 - mood}/10.`,
        detected.length > 0 
          ? `Linguistic safety alert: Flagged keywords: [${detected.join(", ")}].`
          : "Linguistic safety alert: Clean syntax.",
        level === "high"
          ? "CRITICAL WARNING: Crisis signatures active. CompanionAI and BridgeAI escalation forced."
          : level === "medium"
          ? "WARNING DETECTED: Early symptoms of cognitive decline. CompanionAI support triggered."
          : "METRICS STABLE: System remaining on monitoring standby."
      ]);
    }, 2000);
  };

  // Run CompanionAI (trigger when Sentinel is done)
  useEffect(() => {
    if (sentinelStatus !== "complete" || warningLevel === "none") return;
    
    setCompanionStatus("typing");
    setThinkingChain("Evaluating SentinelAI trigger context... Warning level: " + warningLevel.toUpperCase() + ". Flagged keywords: " + flaggedKeywords.join(", ") + ".");

    setTimeout(() => {
      if (warningLevel === "high") {
        setThinkingChain("CRITICAL: Crisis indicators detected. Standard LLM chatbot therapy suspended to prevent harmful therapeutic hallucination. Invoking absolute safety protocol: Routing immediately to certified helpline directory.");
        setChatMessages([
          {
            role: "assistant",
            content: "I hear you, and I care about you. Please know you are not alone. I am here to help you connect with people who can support you right now. Let's look at emergency helpline resources immediately."
          }
        ]);
        setCompanionStatus("active");
        // Auto navigate to BridgeAI after 3 seconds for crisis
        setTimeout(() => {
          setActiveTab(3);
          runBridgeSearch();
        }, 3000);
      } else {
        setThinkingChain("DISTRESS DETECTED: Low mood, loneliness. Plan: Initiate CBT active listening, validate emotional distress, and check for cognitive distortions (catastrophizing/labeling). Prompt user to identify one small controllable aspect of their day.");
        setChatMessages([
          {
            role: "assistant",
            content: "I hear you, and it sounds like you are carrying a lot of weight today. Loneliness can feel incredibly heavy, and it is completely valid to feel overwhelmed. When everything feels like a burden, it can help to take a step back. What is one small thought or task we could look at together?"
          }
        ]);
        setCompanionStatus("active");
      }
    }, 2500);
  }, [sentinelStatus, warningLevel]);

  // User responds to CompanionAI
  const handleUserReply = (optionId) => {
    setSelectedReply(optionId);
    setCompanionStatus("typing");
    
    if (optionId === 1) {
      // Catastrophizing response
      setChatMessages(prev => [...prev, { role: "user", content: "I feel like I'll never get through this, it's just hopeless." }]);
      setThinkingChain("CBT ANALYZER: Flagged cognitive distortion 'Catastrophizing' ('never get through this'). Reframing Strategy: Acknowledge the emotional validity of the statement, introduce gentle reality testing, and prompt a grounding technique (4-7-8 breathing) to de-escalate physiological distress.");
      
      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          role: "assistant",
          content: "It feels completely overwhelming right now, which makes it feel like it will last forever. That is a very natural response when you are exhausted. But feelings do shift, even if slightly. Would you be open to doing a quick, 1-minute breathing exercise with me to help ground ourselves?"
        }]);
        setCompanionStatus("active");
      }, 3000);
    } else {
      // Grounding response
      setChatMessages(prev => [...prev, { role: "user", content: "Maybe I can try to take a deep breath. Can you guide me?" }]);
      setThinkingChain("CBT ANALYZER: User receptive to coping strategy. Guided grounding protocol selected. Instructing 4-7-8 pacing to regulate autonomic nervous system.");
      
      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          role: "assistant",
          content: "Absolutely. Let's do it together. \n\n1. Inhale quietly through your nose for 4 seconds.\n2. Hold your breath for 7 seconds.\n3. Exhale completely through your mouth, making a whoosh sound, for 8 seconds.\n\nTry this cycle twice. Let me know how your body feels after."
        }]);
        setCompanionStatus("active");
      }, 3000);
    }
  };

  // Run BridgeAI
  const runBridgeSearch = () => {
    setBridgeStatus("searching");
    
    setTimeout(() => {
      // Mock resource DB query
      const allResources = [
        { name: "Crisis Text Line", type: "helpline", phone: "741741", url: "crisistextline.org", cost: "Free", location: "US", priority: 1 },
        { name: "National Suicide Prevention Lifeline", type: "helpline", phone: "988", url: "988lifeline.org", cost: "Free", location: "US", priority: 1 },
        { name: "iCall Psychosocial Support Helpline", type: "helpline", phone: "9152987821", url: "icallhelpline.org", cost: "Free", location: "India", priority: 1 },
        { name: "Vandrevala Foundation Helpline", type: "helpline", phone: "18602662345", url: "vandrevalafoundation.com", cost: "Free", location: "India", priority: 2 },
        { name: "Befrienders Tokyo", type: "helpline", phone: "03-5774-0992", url: "befrienders-jp.org", cost: "Free", location: "Japan", priority: 1 },
        { name: "Tokyo Mental Health", type: "clinic", phone: "03-5687-3211", url: "tokyomentalhealth.com", cost: "Paid", location: "Japan", priority: 3 },
        { name: "Tokyo English Lifeline", type: "helpline", phone: "03-5774-0992", url: "telljp.com", cost: "Free", location: "Japan", priority: 1 },
        { name: "Mindbridge Global Support Group", type: "support", phone: "N/A", url: "mindbridge.org/global", cost: "Free", location: "Global", priority: 2 }
      ];

      const filtered = allResources.filter(res => {
        // filter by location
        if (res.location !== "Global" && res.location !== country) return false;
        // filter by cost
        if (costFilter === "free" && res.cost !== "Free") return false;
        if (costFilter === "paid" && res.cost !== "Paid") return false;
        return true;
      }).sort((a, b) => a.priority - b.priority);

      setMatchedResources(filtered);
      setBridgeStatus("complete");
    }, 1500);
  };

  useEffect(() => {
    if (activeTab === 3) {
      runBridgeSearch();
    }
  }, [country, costFilter, activeTab]);

  return (
    <div className="bg-white/[0.01] backdrop-blur-md rounded-3xl border border-white/[0.06] shadow-2xl relative overflow-hidden group hover:border-indigo-500/15 transition-all duration-300">
      
      {/* Tab/Stepper Bar */}
      <div className="flex border-b border-white/[0.04] bg-white/[0.02]">
        {[
          { id: 1, label: "1. SentinelAI Monitor", icon: Activity, activeColor: "text-amber-400 border-amber-400/40 bg-amber-400/5" },
          { id: 2, label: "2. CompanionAI CBT", icon: MessageCircle, activeColor: "text-indigo-400 border-indigo-400/40 bg-indigo-400/5" },
          { id: 3, label: "3. BridgeAI Router", icon: Network, activeColor: "text-indigo-300 border-indigo-300/40 bg-indigo-300/5" }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-4 text-xs font-bold font-display border-b-2 transition duration-200 cursor-pointer ${
                isActive 
                  ? tab.activeColor
                  : "text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/[0.01]"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-6">
        
        {/* TAB 1: SentinelAI Monitor */}
        {activeTab === 1 && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="text-sm font-bold text-white font-display">Behavioral Pattern Analyzer</h3>
                <p className="text-[11px] text-slate-500">SentinelAI runs on user check-in entries to score mood indicators and scan linguistic syntax.</p>
              </div>
              {sentinelSubTab === "scores" && (
                <div className="flex space-x-1 self-stretch sm:self-auto justify-end">
                  <button onClick={() => applyTemplate("stable")} className="text-[10px] bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-bold px-2.5 py-1.5 rounded-lg border border-indigo-500/20 cursor-pointer">
                    Stable
                  </button>
                  <button onClick={() => applyTemplate("distress")} className="text-[10px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold px-2.5 py-1.5 rounded-lg border border-amber-500/20 cursor-pointer">
                    Distressed
                  </button>
                  <button onClick={() => applyTemplate("crisis")} className="text-[10px] bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold px-2.5 py-1.5 rounded-lg border border-red-500/20 cursor-pointer">
                    Crisis
                  </button>
                </div>
              )}
            </div>

            {/* Sub-tab Selector */}
            <div className="flex bg-white/[0.02] border border-white/[0.04] p-1 rounded-xl w-fit">
              <button
                onClick={() => setSentinelSubTab("scores")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                  sentinelSubTab === "scores"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-white hover:bg-white/[0.01]"
                }`}
              >
                1A: Check-in Scores
              </button>
              <button
                onClick={() => setSentinelSubTab("behavioral")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                  sentinelSubTab === "behavioral"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-white hover:bg-white/[0.01]"
                }`}
              >
                1B: Keystroke Behavioral Signal
              </button>
            </div>

            {sentinelSubTab === "scores" ? (
              <div className="space-y-5 animate-slide-in">
                {/* Input Configurator */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/[0.01] border border-white/[0.04] p-4 rounded-2xl">
                  <div className="space-y-4">
                    {/* Mood Slider */}
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
                        <span>Mood Score</span>
                        <span className="text-white font-mono">{mood}/10</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={mood}
                        onChange={(e) => { setMood(parseInt(e.target.value)); setSentinelStatus("idle"); }}
                        className="w-full accent-indigo-500 bg-white/[0.08] rounded-lg h-1.5 cursor-pointer"
                      />
                    </div>

                    {/* Sleep Input */}
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
                        <span>Sleep Duration</span>
                        <span className="text-white font-mono">{sleep} hrs</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="12"
                        value={sleep}
                        onChange={(e) => { setSleep(parseFloat(e.target.value)); setSentinelStatus("idle"); }}
                        className="w-full accent-indigo-500 bg-white/[0.08] rounded-lg h-1.5 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Journal Box */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1">Journal Entry text</label>
                    <textarea
                      value={journalText}
                      onChange={(e) => { setJournalText(e.target.value); setSentinelStatus("idle"); }}
                      className="w-full h-[88px] text-xs p-3 bg-[#04040f] border border-white/[0.06] text-white rounded-xl focus:border-indigo-500/40 focus:outline-none transition resize-none"
                      placeholder="How are you feeling today?"
                    />
                  </div>
                </div>

                {/* Run Button */}
                {sentinelStatus === "idle" && (
                  <button
                    onClick={runSentinelAnalysis}
                    className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/25 transition duration-200 flex items-center justify-center space-x-2 text-xs cursor-pointer"
                  >
                    <Play className="h-3.5 w-3.5" />
                    <span>Run SentinelAI Analysis Scan</span>
                  </button>
                )}

                {/* Running state */}
                {sentinelStatus === "scanning" && (
                  <div className="bg-[#04040f] border border-white/[0.06] rounded-2xl p-4 h-36 font-mono text-[10px] text-amber-400 leading-relaxed overflow-y-auto space-y-1 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/[0.01] to-amber-500/[0.04] animate-pulse pointer-events-none" />
                    <div className="flex items-center space-x-2 text-xs font-bold mb-2">
                      <div className="h-3 w-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                      <span>Scanning telemetry...</span>
                    </div>
                    {sentinelLogs.map((log, i) => (
                      <div key={i} className="animate-fade-in">{log}</div>
                    ))}
                  </div>
                )}

                {/* Complete state */}
                {sentinelStatus === "complete" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-[#04040f] border border-white/[0.06] rounded-xl p-3 flex flex-col justify-center text-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Warning Level</span>
                        <span className={`text-sm font-extrabold uppercase mt-1 font-display ${
                          warningLevel === "high" ? "text-red-400" : warningLevel === "medium" ? "text-amber-400" : "text-emerald-400"
                        }`}>
                          {warningLevel}
                        </span>
                      </div>
                      <div className="bg-[#04040f] border border-white/[0.06] rounded-xl p-3 flex flex-col justify-center text-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Linguistic Safety</span>
                        <span className={`text-sm font-extrabold mt-1 font-display ${flaggedKeywords.length > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                          {flaggedKeywords.length > 0 ? `${flaggedKeywords.length} Flags` : "Clean"}
                        </span>
                      </div>
                      <div className="bg-[#04040f] border border-white/[0.06] rounded-xl p-3 flex flex-col justify-center text-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Pipeline Status</span>
                        <span className="text-xs font-extrabold text-white mt-1 uppercase font-display flex items-center justify-center space-x-1.5">
                          <span className={`h-2 w-2 rounded-full animate-ping ${warningLevel !== "none" ? "bg-amber-400" : "bg-indigo-400"}`} />
                          <span>{warningLevel !== "none" ? "companion triggered" : "standby active"}</span>
                        </span>
                      </div>
                    </div>

                    <div className="bg-[#04040f] border border-white/[0.06] rounded-2xl p-4 font-mono text-[10px] leading-relaxed text-slate-400 space-y-1">
                      {sentinelLogs.map((log, i) => {
                        const isAlert = log.includes("WARNING") || log.includes("CRITICAL") || log.includes("safety alert");
                        return (
                          <div key={i} className={isAlert ? "text-amber-400 font-semibold" : "text-indigo-300"}>
                            {log}
                          </div>
                        );
                      })}
                    </div>

                    {warningLevel !== "none" ? (
                      <button
                        onClick={() => setActiveTab(2)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-xl transition duration-200 flex items-center justify-center space-x-2 text-xs cursor-pointer"
                      >
                        <span>Proceed to CompanionAI CBT Support</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <div className="p-3.5 text-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold">
                        SentinelAI reports mood metrics are healthy. System remains in diagnostic standby mode.
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // BEHAVIORAL SIMULATOR TAB
              <div className="space-y-4 animate-slide-in">
                <div className="flex justify-between items-center bg-[#04040f] border border-white/[0.06] p-4 rounded-xl">
                  <div>
                    <h4 className="text-xs font-bold text-white font-display">Behavioral Deviation Simulation</h4>
                    <p className="text-[10px] text-slate-500">Toggle between baseline typing and stressed deviation state to see SentinelAI response.</p>
                  </div>
                  <div className="flex bg-white/[0.03] border border-white/[0.06] p-1 rounded-xl">
                    <button
                      onClick={() => setBehavioralSimMode("baseline")}
                      className={`px-3 py-1 text-[10px] font-bold rounded-lg transition cursor-pointer ${
                        behavioralSimMode === "baseline"
                          ? "bg-indigo-600 text-white"
                          : "text-slate-500 hover:text-white"
                      }`}
                    >
                      Baseline Week
                    </button>
                    <button
                      onClick={() => setBehavioralSimMode("deviation")}
                      className={`px-3 py-1 text-[10px] font-bold rounded-lg transition cursor-pointer ${
                        behavioralSimMode === "deviation"
                          ? "bg-amber-600 text-white"
                          : "text-slate-500 hover:text-white"
                      }`}
                    >
                      Stressed Deviation
                    </button>
                  </div>
                </div>

                {/* Animated Keyboard & Live metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Visual Keyboard */}
                  <div className="bg-[#04040f] border border-white/[0.06] p-4 rounded-2xl flex flex-col justify-center space-y-2">
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider text-center mb-1 flex justify-center items-center">
                      <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full mr-1.5 animate-ping"></span>
                      Interactive Telemetry Stream (Simulated)
                    </div>
                    {/* Rows */}
                    {[
                      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
                      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
                      ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Backspace'],
                      ['Space']
                    ].map((row, rIdx) => (
                      <div key={rIdx} className="flex justify-center space-x-1">
                        {row.map((key) => {
                          const isHighlighted = activeKey === key;
                          const isSpecial = ['Backspace', 'Space'].includes(key);
                          return (
                            <div
                              key={key}
                              className={`text-[9px] font-bold h-6 rounded flex items-center justify-center transition-all duration-100 ${
                                isSpecial ? "px-2.5" : "w-5"
                              } ${
                                isHighlighted
                                  ? behavioralSimMode === "baseline"
                                    ? "bg-indigo-500 text-white scale-110 shadow shadow-indigo-500/50"
                                    : "bg-amber-500 text-white scale-110 shadow shadow-amber-500/50"
                                  : "bg-white/[0.03] text-slate-500 border border-white/[0.04]"
                              }`}
                            >
                              {key}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  {/* Metrics Table */}
                  <div className="bg-[#04040f] border border-white/[0.06] p-4 rounded-2xl flex flex-col justify-center space-y-3">
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider text-center mb-1">
                      Metrics Comparison (Baseline vs Current)
                    </div>
                    
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-semibold">Typing Speed</span>
                        <div className="flex space-x-3 items-center">
                          <span className="text-slate-600">45 WPM</span>
                          <span className={`font-mono font-bold ${behavioralSimMode === "baseline" ? "text-emerald-400" : "text-red-400"}`}>
                            {behavioralSimMode === "baseline" ? "46 WPM (Normal)" : "27 WPM (-40%)"}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-semibold">Key Hold Duration</span>
                        <div className="flex space-x-3 items-center">
                          <span className="text-slate-600">120 ms</span>
                          <span className={`font-mono font-bold ${behavioralSimMode === "baseline" ? "text-emerald-400" : "text-red-400"}`}>
                            {behavioralSimMode === "baseline" ? "118 ms (Normal)" : "190 ms (+58%)"}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-semibold">Backspace Rate</span>
                        <div className="flex space-x-3 items-center">
                          <span className="text-slate-600">12%</span>
                          <span className={`font-mono font-bold ${behavioralSimMode === "baseline" ? "text-emerald-400" : "text-red-400"}`}>
                            {behavioralSimMode === "baseline" ? "11% (Normal)" : "31% (+158%)"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sentinel logs */}
                <div className="bg-[#04040f] border border-white/[0.06] rounded-2xl p-4 font-mono text-[10px] leading-relaxed space-y-1">
                  <div className="flex items-center space-x-2 text-xs font-bold mb-1 text-slate-300">
                    <span>SentinelAI Behavioral Inspector Logs:</span>
                  </div>
                  {behavioralSimMode === "baseline" ? (
                    <div className="text-emerald-400 font-semibold">
                      [INFO] Active behavioral monitoring standby...<br />
                      [METRIC] Typing speed: 46 WPM. Hold time: 118ms. Backspaces: 11%.<br />
                      [RESULT] No deviation detected. Circumstantial risk score: NOMINAL.
                    </div>
                  ) : (
                    <div className="text-amber-400 font-semibold space-y-1">
                      <div className="text-red-400">[WARNING] Significant behavioral anomaly measured: speed drop (-40%), pause duration increase (+58%).</div>
                      <div>[ANALYSIS] Deviations exceed Baseline variance limit (Threshold: 25.0%).</div>
                      <div>[ACTION] Behavioral warning flag set to MEDIUM. SentinelAI Combined Alert escalated to MEDIUM.</div>
                    </div>
                  )}
                </div>

                <p className="text-[10px] text-slate-500 italic text-center">
                  *Privacy Safe: MindBridge never reads what you type — only how you type. Opt-in/out at any time.
                </p>

                {behavioralSimMode === "deviation" && (
                  <button
                    onClick={() => {
                      setActiveTab(2);
                      setWarningLevel("medium");
                      setSentinelStatus("complete");
                      setFlaggedKeywords(["typing slowdown"]);
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-xl transition duration-200 flex items-center justify-center space-x-2 text-xs cursor-pointer"
                  >
                    <span>Proceed to CompanionAI CBT Support</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CompanionAI CBT */}
        {activeTab === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white font-display">CBT Therapeutic Chat Sandbox</h3>
              <p className="text-[11px] text-slate-500">CompanionAI processes Distress Alerts. It exposes its internal Cognitive Reframing decisions via the "Thinking Chain" panel.</p>
            </div>

            {companionStatus === "idle" && (
              <div className="bg-[#04040f] border border-dashed border-white/[0.08] p-8 text-center rounded-2xl text-slate-500 text-xs">
                Go to Step 1 (SentinelAI) and run analysis on "Distressed" or "Crisis" entry templates to boot the CBT dialogue.
              </div>
            )}

            {companionStatus !== "idle" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Left: Chat bubble area */}
                <div className="lg:col-span-7 flex flex-col h-[320px] bg-[#04040f] border border-white/[0.06] rounded-2xl overflow-hidden">
                  <div className="bg-white/[0.02] border-b border-white/[0.04] p-3 text-[10px] font-bold text-indigo-300 flex items-center space-x-2 flex-shrink-0">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                    <span>CompanionAI Session Sandbox</span>
                  </div>
                  
                  {/* Messages container */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`flex items-start max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
                        {msg.role !== "user" && (
                          <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-300 flex items-center justify-center mr-2 flex-shrink-0 border border-indigo-500/20 text-[9px] font-bold">
                            C
                          </div>
                        )}
                        <div className={`p-2.5 rounded-xl text-[11px] leading-relaxed whitespace-pre-wrap ${
                          msg.role === "user" 
                            ? "bg-indigo-600 text-white rounded-tr-none ml-2" 
                            : "bg-white/[0.04] text-slate-200 border border-white/[0.06] rounded-tl-none"
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {companionStatus === "typing" && (
                      <div className="flex items-center space-x-1.5 bg-white/[0.02] border border-white/[0.04] px-3 py-2 rounded-xl w-16">
                        <span className="h-1.5 w-1.5 bg-slate-500 rounded-full animate-bounce" />
                        <span className="h-1.5 w-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="h-1.5 w-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    )}
                  </div>

                  {/* Predefined replies selector */}
                  {companionStatus === "active" && chatMessages.length === 1 && warningLevel !== "high" && (
                    <div className="p-3 border-t border-white/[0.04] bg-white/[0.01] flex flex-col space-y-2 flex-shrink-0">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Select simulated response:</p>
                      <button
                        onClick={() => handleUserReply(1)}
                        className="text-left text-[10px] bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-indigo-500/30 text-slate-300 p-2.5 rounded-xl transition duration-150 cursor-pointer text-ellipsis overflow-hidden"
                      >
                        "I feel like I'll never get through this, it's just hopeless."
                      </button>
                      <button
                        onClick={() => handleUserReply(2)}
                        className="text-left text-[10px] bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-indigo-500/30 text-slate-300 p-2.5 rounded-xl transition duration-150 cursor-pointer text-ellipsis overflow-hidden"
                      >
                        "Maybe I can try to take a deep breath. Can you guide me?"
                      </button>
                    </div>
                  )}
                </div>

                {/* Right: Agent Internal Thinking Panel */}
                <div className="lg:col-span-5 flex flex-col h-[320px] bg-[#04040f] border border-white/[0.06] rounded-2xl overflow-hidden font-mono">
                  <div className="bg-indigo-500/10 border-b border-white/[0.04] p-3 text-[10px] font-bold text-indigo-400 flex items-center space-x-2 flex-shrink-0">
                    <Eye className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Internal Cognitive Chain</span>
                  </div>
                  <div className="flex-1 p-4 text-[10px] leading-relaxed text-indigo-300/80 overflow-y-auto space-y-2 select-text selection:bg-indigo-500/30">
                    {thinkingChain ? (
                      <div className="animate-fade-in whitespace-pre-wrap">
                        {thinkingChain}
                      </div>
                    ) : (
                      <div className="text-slate-600 italic text-center py-12">
                        Analyzing chat state updates...
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {companionStatus === "active" && (chatMessages.length > 1 || warningLevel === "high") && (
              <button
                onClick={() => setActiveTab(3)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-xl transition duration-200 flex items-center justify-center space-x-2 text-xs cursor-pointer"
              >
                <span>Proceed to BridgeAI Resource Routing</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* TAB 3: BridgeAI Router */}
        {activeTab === 3 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-white font-display">Dynamic Resource Connector</h3>
                <p className="text-[11px] text-slate-500">BridgeAI ranks matching helpline registries according to location coordinates and price parameters.</p>
              </div>
            </div>

            {/* Filter controls */}
            <div className="grid grid-cols-2 gap-4 bg-white/[0.01] border border-white/[0.04] p-4 rounded-2xl">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">User Region</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full text-xs p-2.5 bg-[#04040f] border border-white/[0.08] text-white rounded-xl focus:outline-none transition cursor-pointer"
                >
                  <option value="US">United States (US)</option>
                  <option value="India">India (IN)</option>
                  <option value="Japan">Japan (JP)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Cost Constraint</label>
                <select
                  value={costFilter}
                  onChange={(e) => setCostFilter(e.target.value)}
                  className="w-full text-xs p-2.5 bg-[#04040f] border border-white/[0.08] text-white rounded-xl focus:outline-none transition cursor-pointer"
                >
                  <option value="all">Display All Resources</option>
                  <option value="free">Free Only (Non-Profit)</option>
                  <option value="paid">Paid Services Only</option>
                </select>
              </div>
            </div>

            {/* Matched Resources Cards */}
            {bridgeStatus === "searching" ? (
              <div className="h-36 flex flex-col items-center justify-center space-y-2">
                <div className="h-6 w-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] text-slate-500 font-mono">Running query matching engines...</span>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {matchedResources.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-white/[0.06] rounded-2xl">
                    No resources found matching filter criteria.
                  </div>
                ) : (
                  matchedResources.map((res) => (
                    <div
                      key={res.name}
                      className="bg-white/[0.02] border border-white/[0.06] hover:border-indigo-500/20 p-3.5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all duration-300"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-xs font-bold text-white font-display">{res.name}</h4>
                          <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            res.cost === "Free" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                          }`}>
                            {res.cost}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500">
                          Primary Locale: <span className="text-slate-400 font-semibold">{res.location}</span> | Contact: <span className="text-indigo-300 font-mono">{res.phone}</span>
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 self-stretch sm:self-auto justify-end border-t border-white/[0.02] sm:border-0 pt-2 sm:pt-0">
                        <div className="text-[9px] font-bold font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1.5 rounded-lg border border-indigo-500/15">
                          Match Index: {res.location === country ? "100%" : "90%"}
                        </div>
                        <a
                          href={`https://${res.url}`}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-indigo-500/20 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] transition cursor-pointer"
                        >
                          Visit Site
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Reset Button */}
            <div className="pt-2">
              <button
                onClick={resetSimulation}
                className="w-full bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/[0.12] text-white font-bold py-3 rounded-xl transition duration-200 flex items-center justify-center space-x-2 text-xs cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Entire Tri-Agent Sandbox</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
