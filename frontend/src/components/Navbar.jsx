import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Phone, LogOut, Menu, X, User, AlertTriangle } from "lucide-react";
import MindBridgeLogo from "./MindBridgeLogo";
import CrisisAlert from "./CrisisAlert";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2.5">
                <MindBridgeLogo size="sm" />
                <span className="text-lg font-display font-bold text-white tracking-tight">
                  Mind<span className="text-indigo-400">Bridge</span>
                </span>
              </Link>
              
              {/* Desktop Navigation */}
              <div className="hidden md:ml-8 md:flex md:space-x-1">
                {user && (
                  <>
                    <Link
                      to="/dashboard"
                      className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        isActive("/dashboard")
                          ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                          : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/chat"
                      className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        isActive("/chat")
                          ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                          : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                      }`}
                    >
                      Companion Chat
                    </Link>
                    <Link
                      to="/resources"
                      className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        isActive("/resources")
                          ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                          : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                      }`}
                    >
                      Resources
                    </Link>
                  </>
                )}
                <Link
                  to="/how-it-works"
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive("/how-it-works")
                      ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                      : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  How It Works
                </Link>
              </div>
            </div>
 
            {/* Right side buttons */}
            <div className="hidden md:flex items-center space-x-3">
              {/* Universal Emergency Help button — opens CrisisAlert overlay */}
              <button
                onClick={() => setShowCrisisAlert(true)}
                className="flex items-center space-x-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200"
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Emergency Help</span>
              </button>
 
              {user ? (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/profile"
                    className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive("/profile")
                        ? "bg-white/[0.06] text-white border border-white/[0.08]"
                        : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                    }`}
                  >
                    <User className="h-4 w-4" />
                    <span>{user.username}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-slate-400 hover:text-red-400 hover:bg-white/[0.04] p-2 rounded-xl transition-all duration-200"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-indigo-600/10 transition-all duration-250 transform hover:-translate-y-0.5"
                >
                  Log In
                </Link>
              )}
            </div>
 
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden space-x-2">
              <button
                onClick={() => setShowCrisisAlert(true)}
                className="flex items-center justify-center bg-red-500/10 border border-red-500/20 text-red-400 p-2.5 rounded-xl"
                title="Emergency Help"
              >
                <AlertTriangle className="h-4 w-4" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-xl text-white hover:bg-white/[0.04]"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
 
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-surface border-b border-white/[0.04] px-4 pt-2 pb-4 space-y-1 animate-slide-in">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-base font-semibold ${
                    isActive("/dashboard") ? "bg-indigo-500/10 text-indigo-300" : "text-slate-400 hover:bg-white/[0.04]"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/chat"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-base font-semibold ${
                    isActive("/chat") ? "bg-indigo-500/10 text-indigo-300" : "text-slate-400 hover:bg-white/[0.04]"
                  }`}
                >
                  Companion Chat
                </Link>
                <Link
                  to="/resources"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-base font-semibold ${
                    isActive("/resources") ? "bg-indigo-500/10 text-indigo-300" : "text-slate-400 hover:bg-white/[0.04]"
                  }`}
                >
                  Resources
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-base font-semibold ${
                    isActive("/profile") ? "bg-white/[0.06] text-white" : "text-slate-400 hover:bg-white/[0.04]"
                  }`}
                >
                  Profile
                </Link>
                <Link
                  to="/how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-base font-semibold ${
                    isActive("/how-it-works") ? "bg-indigo-500/10 text-indigo-300" : "text-slate-400 hover:bg-white/[0.04]"
                  }`}
                >
                  How It Works
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left block px-4 py-2.5 rounded-xl text-base font-semibold text-red-400 hover:bg-white/[0.04]"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-base font-semibold mb-2 ${
                    isActive("/how-it-works") ? "bg-indigo-500/10 text-indigo-300" : "text-slate-400 hover:bg-white/[0.04]"
                  }`}
                >
                  How It Works
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-md shadow-indigo-600/10"
                >
                  Log In / Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </nav>

      {/* Crisis Alert Overlay */}
      {showCrisisAlert && (
        <CrisisAlert onClose={() => setShowCrisisAlert(false)} />
      )}
    </>
  );
}
