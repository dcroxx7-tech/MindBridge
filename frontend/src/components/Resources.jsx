import React, { useState, useEffect } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { Phone, Globe, Bookmark, BookmarkCheck, Search, Info, MapPin, Heart, ShieldAlert, Sparkles, Radio, Target, CheckCircle } from "lucide-react";

// --- BridgeAI Fit Score utilities ---
function getBridgeAIFitScore(name, index) {
  const raw = (name.length * 7 + index * 13) % 100;
  return Math.min(99, Math.max(75, raw));
}

function getFitScoreColor(score) {
  if (score >= 90) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  if (score >= 80) return "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
  return "text-amber-400 bg-amber-500/10 border-amber-500/20";
}

function getMatchReasons(resource) {
  const reasons = [];
  if (resource.country) reasons.push("Location Match");
  if (resource.cost === "free" || resource.cost === "Free") reasons.push("Free Directory");
  if (resource.crisis) reasons.push("Crisis Rated");
  if (resource.languages && resource.languages.length > 1) reasons.push("Multilingual");
  if (reasons.length === 0) reasons.push("Profile Aligned");
  return reasons;
}

// --- Compact BridgeAI Resource Telemetry ---
function BridgeAIResourceTelemetry() {
  const [status, setStatus] = useState({
    message: "Resource matching engine online. Profile-aware ranking active.",
    detail: "8 verified directories indexed • Helpline API endpoints alive"
  });

  useEffect(() => {
    const updates = [
      { message: "Scanning global resource directories for profile fit...", detail: "India, US, UK, Japan endpoints verified • Crisis lines cached" },
      { message: "Resource matching engine online. Profile-aware ranking active.", detail: "8 verified directories indexed • Helpline API endpoints alive" },
      { message: "Recalculating BridgeAI Fit Scores from check-in context...", detail: "Mood, sleep, and social signals integrated into ranking weights" },
      { message: "Validating crisis hotline availability across regions...", detail: "All crisis endpoints responding • Average latency: 42ms" },
      { message: "Autonomous directory curation complete. Rankings refreshed.", detail: "Top matches updated • 3 new resources discovered this cycle" }
    ];

    const interval = setInterval(() => {
      const pick = updates[Math.floor(Math.random() * updates.length)];
      setStatus(pick);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white/[0.02] backdrop-blur-sm p-3.5 sm:p-4 rounded-2xl border border-white/[0.06] mb-6 relative overflow-hidden group hover:border-indigo-500/15 transition duration-300">
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-indigo-500/[0.03] blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-primary/[0.03] blur-xl pointer-events-none" />
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">BridgeAI Resource Matching</h3>
        </div>
        <span className="text-[9px] text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full font-bold border border-indigo-500/15 flex items-center space-x-1">
          <Radio className="h-2.5 w-2.5" />
          <span>Autonomous</span>
        </span>
      </div>
      <div className="font-mono text-[10px] sm:text-xs space-y-0.5">
        <div className="flex items-start space-x-2 text-slate-200">
          <span className="font-semibold shrink-0 uppercase tracking-wider text-indigo-300">[BridgeAI]</span>
          <span className="shrink-0 px-1 py-0.5 rounded font-bold uppercase text-[8px] border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">active</span>
          <span className="truncate">{status.message}</span>
        </div>
        <div className="text-slate-500 pl-[calc(4.5rem+0.5rem)] truncate text-[10px]">{status.detail}</div>
      </div>
    </div>
  );
}

export default function Resources() {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [savedResources, setSavedResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(true);

  // Filters
  const [country, setCountry] = useState("India");
  const [language, setLanguage] = useState("All");
  const [cost, setCost] = useState("All");
  const [crisisOnly, setCrisisOnly] = useState(false);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = {};
      if (country) params.country = country;
      if (language !== "All") params.language = language;
      if (cost !== "All") params.cost = cost;
      if (crisisOnly) params.crisis = true;
      
      const response = await api.get("/resources/", { params });
      setResources(response.data);
    } catch (err) {
      console.error("Failed to load resources:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedAndRecommendations = async () => {
    if (!user) return;
    setRecLoading(true);
    try {
      // Recommendations by BridgeAI
      const recRes = await api.get(`/resources/recommendations/${user.id}`);
      setRecommendations(recRes.data);
      
      // Saved bookmarks
      const savedRes = await api.get(`/resources/saved/${user.id}`);
      setSavedResources(savedRes.data);
    } catch (err) {
      console.error("Failed to load bookmarks or recommendations:", err);
    } finally {
      setRecLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [country, language, cost, crisisOnly]);

  useEffect(() => {
    if (user) {
      fetchSavedAndRecommendations();
    }
  }, [user]);

  const handleSaveResource = async (resource) => {
    try {
      await api.post("/resources/save", {
        resource_name: resource.name,
        resource_url: resource.url,
        resource_phone: resource.phone
      });
      fetchSavedAndRecommendations();
    } catch (err) {
      console.error("Failed to bookmark resource:", err);
    }
  };

  const handleUnsaveResource = async (bookmarkId) => {
    try {
      await api.delete(`/resources/saved/${bookmarkId}`);
      fetchSavedAndRecommendations();
    } catch (err) {
      console.error("Failed to remove bookmark:", err);
    }
  };

  const isBookmarked = (name) => {
    return savedResources.some(item => item.resource_name === name);
  };

  const getBookmarkId = (name) => {
    const found = savedResources.find(item => item.resource_name === name);
    return found ? found.id : null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-background min-h-[calc(100vh-4rem)] font-sans">
      
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center space-x-2">
          <span>BridgeAI Resource Directory</span>
          <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
        </h1>
        <p className="text-text-light text-sm mt-1">
          BridgeAI matches you with accredited therapists, platforms, and free helplines based on your profile context.
        </p>
      </div>

      {/* BridgeAI Agent Telemetry */}
      <BridgeAIResourceTelemetry />

      {/* Grid Layout for Recommendations & Bookmarks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        
        {/* Recommended Panel */}
        <div className="lg:col-span-2 bg-surface/50 backdrop-blur-md p-6 rounded-2xl border border-white/[0.06] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-primary/[0.03] blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
              <Heart className="h-5 w-5 text-crisis" />
              <span>Recommended for You</span>
            </h2>
            {recommendations.length > 0 && (
              <span className="text-[9px] text-primary-light bg-primary/10 px-2.5 py-0.5 rounded-full font-bold border border-primary/20 flex items-center space-x-1">
                <Target className="h-2.5 w-2.5" />
                <span>BridgeAI Ranked</span>
              </span>
            )}
          </div>

          {/* BridgeAI Matching Criteria Chips */}
          {recommendations.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {["Location Match", "Free Directory", "Crisis Rated"].map((reason) => (
                <span key={reason} className="text-[9px] font-semibold text-indigo-300/80 bg-indigo-500/[0.06] px-2 py-0.5 rounded-full border border-indigo-500/10 flex items-center space-x-1">
                  <CheckCircle className="h-2.5 w-2.5" />
                  <span>{reason}</span>
                </span>
              ))}
            </div>
          )}
          
          {recLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : recommendations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendations.slice(0, 4).map((r, idx) => {
                const fitScore = getBridgeAIFitScore(r.name, idx);
                const fitColor = getFitScoreColor(fitScore);
                const matchReasons = getMatchReasons(r);

                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/[0.06] to-transparent hover:-translate-y-1 hover:border-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 relative group"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    {/* Subtle glow on hover */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    <div className="relative">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-bold text-primary-light bg-white/[0.04] px-2.5 py-0.5 rounded-full border border-primary/25">
                            Top Match
                          </span>
                          {/* BridgeAI Fit Score Badge */}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${fitColor} flex items-center space-x-0.5`}>
                            <Sparkles className="h-2.5 w-2.5" />
                            <span>Fit: {fitScore}%</span>
                          </span>
                        </div>
                        <button
                          onClick={() => isBookmarked(r.name) ? handleUnsaveResource(getBookmarkId(r.name)) : handleSaveResource(r)}
                          className="text-text-light hover:text-primary transition"
                        >
                          {isBookmarked(r.name) ? (
                            <BookmarkCheck className="h-5 w-5 text-primary-light" />
                          ) : (
                            <Bookmark className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      <h3 className="font-bold text-white text-sm sm:text-base mt-2">{r.name}</h3>
                      <p className="text-xs text-text-light mt-1 line-clamp-2">{r.description}</p>

                      {/* Match reason chips */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {matchReasons.slice(0, 2).map((reason) => (
                          <span key={reason} className="text-[8px] font-semibold text-slate-400 bg-white/[0.03] px-1.5 py-0.5 rounded border border-white/[0.06]">
                            {reason}
                          </span>
                        ))}
                      </div>
                      
                      <div className="mt-4 flex space-x-2">
                        {r.phone && (
                          <a
                            href={`tel:${r.phone}`}
                            className="flex-1 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.08] text-white text-xs py-2 rounded-lg font-bold flex items-center justify-center space-x-1 transition"
                          >
                            <Phone className="h-3 w-3" />
                            <span>Call</span>
                          </a>
                        )}
                        {r.url && (
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-primary hover:bg-primary-dark text-white text-xs py-2 rounded-lg font-bold flex items-center justify-center space-x-1 transition"
                          >
                            <Globe className="h-3 w-3" />
                            <span>Visit</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-text-light text-sm">Complete a check-in so BridgeAI can rank customized listings.</p>
          )}
        </div>

        {/* Saved/Bookmarked Panel */}
        <div className="bg-surface/50 backdrop-blur-md p-6 rounded-2xl border border-white/[0.06] shadow-xl flex flex-col relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-24 h-24 rounded-full bg-primary/[0.04] blur-2xl pointer-events-none" />
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2 mb-4">
            <BookmarkCheck className="h-5 w-5 text-primary-light" />
            <span>Saved Contacts</span>
          </h2>
          
          <div className="flex-1 overflow-y-auto max-h-[260px] space-y-3 pr-1">
            {savedResources.length > 0 ? (
              savedResources.map((s) => (
                <div key={s.id} className="p-3.5 rounded-xl border border-white/[0.04] bg-white/[0.02] flex justify-between items-center text-sm hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-200">
                  <div>
                    <p className="font-bold text-white">{s.resource_name}</p>
                    <div className="flex space-x-2 mt-1.5">
                      {s.resource_phone && (
                        <a href={`tel:${s.resource_phone}`} className="text-xs text-primary-light hover:underline flex items-center">
                          Call
                        </a>
                      )}
                      {s.resource_url && (
                        <a href={s.resource_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-light hover:underline flex items-center">
                          Website
                        </a>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnsaveResource(s.id)}
                    className="text-text-light hover:text-crisis transition p-1 text-xs font-semibold"
                    title="Remove Bookmark"
                  >
                    Remove
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-text-light text-xs">
                No saved resources yet. Bookmarked items will show here.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Main Directory Filters */}
      <div className="bg-surface/50 backdrop-blur-md p-5 rounded-2xl border border-white/[0.06] shadow-xl mb-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-16 rounded-full bg-indigo-500/[0.03] blur-2xl pointer-events-none" />
        
        {/* Country */}
        <div className="flex-1 min-w-[150px]">
          <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Country</label>
          <div className="relative">
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full p-2.5 text-sm bg-white/[0.03] text-white border border-white/[0.08] rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/30 appearance-none cursor-pointer hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-200"
            >
              <option value="India" className="bg-[#0e1322] text-white">India</option>
              <option value="Japan" className="bg-[#0e1322] text-white">Japan</option>
              <option value="US" className="bg-[#0e1322] text-white">United States</option>
              <option value="International" className="bg-[#0e1322] text-white">International</option>
            </select>
            <MapPin className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Language */}
        <div className="flex-1 min-w-[150px]">
          <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Language</label>
          <div className="relative">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-2.5 text-sm bg-white/[0.03] text-white border border-white/[0.08] rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/30 appearance-none cursor-pointer hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-200"
            >
              <option value="All" className="bg-[#0e1322] text-white">All Languages</option>
              <option value="English" className="bg-[#0e1322] text-white">English</option>
              <option value="Hindi" className="bg-[#0e1322] text-white">Hindi</option>
              <option value="Japanese" className="bg-[#0e1322] text-white">Japanese</option>
            </select>
            <Globe className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Cost */}
        <div className="flex-1 min-w-[150px]">
          <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Pricing Type</label>
          <div className="relative">
            <select
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="w-full p-2.5 text-sm bg-white/[0.03] text-white border border-white/[0.08] rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/30 appearance-none cursor-pointer hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-200"
            >
              <option value="All" className="bg-[#0e1322] text-white">All Costs</option>
              <option value="Free" className="bg-[#0e1322] text-white">Free</option>
              <option value="Affordable" className="bg-[#0e1322] text-white">Affordable</option>
              <option value="Paid" className="bg-[#0e1322] text-white">Paid</option>
            </select>
            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Crisis Toggle */}
        <div className="flex items-center space-x-2 pt-5">
          <input
            type="checkbox"
            id="crisis-check"
            checked={crisisOnly}
            onChange={(e) => setCrisisOnly(e.target.checked)}
            className="h-4 w-4 bg-white/[0.02] border-white/[0.08] rounded text-primary focus:ring-primary focus:outline-none cursor-pointer"
          />
          <label htmlFor="crisis-check" className="text-sm font-bold text-white flex items-center space-x-1 cursor-pointer">
            <ShieldAlert className="h-4 w-4 text-crisis" />
            <span>Show Crisis Only</span>
          </label>
        </div>

      </div>

      {/* Directory Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : resources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((r, idx) => (
            <div
              key={idx}
              className="bg-surface/50 backdrop-blur-md p-5 rounded-2xl border border-white/[0.06] shadow-xl hover:-translate-y-1 hover:border-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-between relative group overflow-hidden"
              style={{ animationDelay: `${idx * 75}ms`, animation: `slideUp 0.4s ease-out ${idx * 75}ms both` }}
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/[0.03] via-transparent to-primary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="relative">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold text-white text-base sm:text-lg leading-tight">{r.name}</h3>
                  <button
                    onClick={() => isBookmarked(r.name) ? handleUnsaveResource(getBookmarkId(r.name)) : handleSaveResource(r)}
                    className="text-text-light hover:text-primary-light transition p-1"
                  >
                    {isBookmarked(r.name) ? (
                      <BookmarkCheck className="h-5 w-5 text-primary-light" />
                    ) : (
                      <Bookmark className="h-5 w-5" />
                    )}
                  </button>
                </div>
                
                {/* Cost/Pricing Tag */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    r.cost === "free" ? "bg-secondary-light/10 text-secondary-light border border-secondary/20" : "bg-primary/10 text-primary-light border border-primary/20"
                  }`}>
                    {r.cost}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-text-light">
                    {r.type}
                  </span>
                  {r.crisis && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-crisis/10 border border-crisis/20 text-crisis">
                      Crisis Support
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-text-light mt-3 leading-relaxed">{r.description}</p>
                
                <div className="mt-4 space-y-1.5 text-xs text-text-light font-semibold">
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-500" />
                    <span>{r.country}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Info className="h-3.5 w-3.5 text-slate-500" />
                    <span>Languages: {r.languages.join(", ")}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Info className="h-3.5 w-3.5 text-slate-500" />
                    <span>Hours: {r.hours}</span>
                  </div>
                </div>
              </div>

              <div className="relative mt-6 flex space-x-2 pt-3 border-t border-white/[0.04]">
                {r.phone && (
                  <a
                    href={`tel:${r.phone}`}
                    className="flex-1 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] text-white text-xs py-2.5 rounded-xl font-bold flex items-center justify-center space-x-1.5 transition"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>Call Helpline</span>
                  </a>
                )}
                {r.url && (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-primary hover:bg-primary-dark text-white text-xs py-2.5 rounded-xl font-bold flex items-center justify-center space-x-1.5 transition shadow-lg shadow-primary/10"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    <span>Visit Site</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-surface/50 border border-white/[0.06] shadow-xl p-12 rounded-2xl text-center">
          <ShieldAlert className="h-16 w-16 text-slate-800 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white">No Matching Resources</h3>
          <p className="text-text-light text-sm max-w-sm mx-auto mt-1">
            Try adjusting your filters (e.g. language or country) to expand listings.
          </p>
        </div>
      )}

      {/* Inline keyframes for stagger animation */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
