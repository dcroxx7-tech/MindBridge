import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, User, Globe, MessageSquare } from "lucide-react";
import MindBridgeLogo from "../components/MindBridgeLogo";
import ParticleField from "../components/ParticleField";

export default function Login() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [country, setCountry] = useState("");
  const [language, setLanguage] = useState("English");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignUp) {
        await signup(username, email, password, country, language);
      } else {
        await login(email, password);
      }
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background px-4 py-8 relative overflow-hidden">
      
      {/* Subtle Particle Background */}
      <div className="absolute inset-0">
        <ParticleField particleCount={80} compact />
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-600/[0.04] blur-[120px] pointer-events-none" />

      <div className="relative z-10 bg-white/[0.02] backdrop-blur-md w-full max-w-md p-6 sm:p-8 rounded-2xl border border-white/[0.06] shadow-2xl animate-slide-in">
        
        {/* Brand Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-indigo-500/10 rounded-2xl mb-3">
            <MindBridgeLogo size="lg" />
          </div>
          <h2 className="text-2xl font-bold text-white font-display">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {isSignUp 
              ? "Join MindBridge for personal mental health support." 
              : "Access your dashboard and check in on your wellness."
            }
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs sm:text-sm font-semibold mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isSignUp && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Username</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-600">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="john_doe"
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-white/[0.02] border border-white/[0.08] text-white rounded-xl focus:bg-white/[0.04] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 focus:outline-none transition"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-600">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-white/[0.02] border border-white/[0.08] text-white rounded-xl focus:bg-white/[0.04] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 focus:outline-none transition"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-600">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-white/[0.02] border border-white/[0.08] text-white rounded-xl focus:bg-white/[0.04] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 focus:outline-none transition"
              />
            </div>
          </div>

          {isSignUp && (
            <div className="grid grid-cols-2 gap-4">
              {/* Country Selection — Global */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Country / Region</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-600">
                    <Globe className="h-4 w-4" />
                  </span>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full pl-9 pr-2 py-2.5 text-sm bg-white/[0.02] border border-white/[0.08] text-white rounded-xl focus:bg-white/[0.04] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 focus:outline-none transition"
                  >
                    <option value="" className="bg-[#0c0c24] text-white">Select...</option>
                    <option value="India" className="bg-[#0c0c24] text-white">India</option>
                    <option value="US" className="bg-[#0c0c24] text-white">United States</option>
                    <option value="UK" className="bg-[#0c0c24] text-white">United Kingdom</option>
                    <option value="Canada" className="bg-[#0c0c24] text-white">Canada</option>
                    <option value="Australia" className="bg-[#0c0c24] text-white">Australia</option>
                    <option value="Germany" className="bg-[#0c0c24] text-white">Germany</option>
                    <option value="France" className="bg-[#0c0c24] text-white">France</option>
                    <option value="Japan" className="bg-[#0c0c24] text-white">Japan</option>
                    <option value="Brazil" className="bg-[#0c0c24] text-white">Brazil</option>
                    <option value="South Africa" className="bg-[#0c0c24] text-white">South Africa</option>
                    <option value="UAE" className="bg-[#0c0c24] text-white">UAE</option>
                    <option value="Singapore" className="bg-[#0c0c24] text-white">Singapore</option>
                    <option value="Netherlands" className="bg-[#0c0c24] text-white">Netherlands</option>
                    <option value="Other" className="bg-[#0c0c24] text-white">Other</option>
                  </select>
                </div>
              </div>

              {/* Language Selection — Global */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Language</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-600">
                    <MessageSquare className="h-4 w-4" />
                  </span>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full pl-9 pr-2 py-2.5 text-sm bg-white/[0.02] border border-white/[0.08] text-white rounded-xl focus:bg-white/[0.04] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 focus:outline-none transition"
                  >
                    <option value="English" className="bg-[#0c0c24] text-white">English</option>
                    <option value="Hindi" className="bg-[#0c0c24] text-white">Hindi</option>
                    <option value="Spanish" className="bg-[#0c0c24] text-white">Spanish</option>
                    <option value="French" className="bg-[#0c0c24] text-white">French</option>
                    <option value="German" className="bg-[#0c0c24] text-white">German</option>
                    <option value="Portuguese" className="bg-[#0c0c24] text-white">Portuguese</option>
                    <option value="Japanese" className="bg-[#0c0c24] text-white">Japanese</option>
                    <option value="Arabic" className="bg-[#0c0c24] text-white">Arabic</option>
                    <option value="Chinese" className="bg-[#0c0c24] text-white">Chinese</option>
                    <option value="Korean" className="bg-[#0c0c24] text-white">Korean</option>
                    <option value="Dutch" className="bg-[#0c0c24] text-white">Dutch</option>
                    <option value="Other" className="bg-[#0c0c24] text-white">Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 disabled:from-indigo-600/50 disabled:to-indigo-500/50 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-xl transition duration-200 flex items-center justify-center cursor-pointer mt-2"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>{isSignUp ? "Sign Up" : "Log In"}</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-white/[0.04] pt-4">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
            className="text-sm font-bold text-indigo-400 hover:underline cursor-pointer"
          >
            {isSignUp 
              ? "Already have an account? Log In" 
              : "Don't have an account? Sign Up"
            }
          </button>
        </div>

      </div>
    </div>
  );
}
