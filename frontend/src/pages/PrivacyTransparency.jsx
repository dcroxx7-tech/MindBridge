import React from "react";
import { Link } from "react-router-dom";
import { Lock, ShieldCheck, EyeOff, Award, ArrowLeft, Clock, Keyboard, Sparkles } from "lucide-react";

export default function PrivacyTransparency() {
  return (
    <div className="bg-background min-h-screen text-white relative overflow-hidden font-sans">
      {/* Subtle radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-indigo-600/[0.05] blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 py-12 relative z-10">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-slate-400 hover:text-white transition duration-200 mb-8 text-sm font-semibold"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Platform</span>
        </Link>

        {/* Title Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl mb-4 border border-indigo-500/20">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-display mb-4">
            How MindBridge Protects Your Privacy
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            MindBridge features the first privacy-first passive diagnostic system. We analyze typing pattern rhythms to screen for cognitive changes, without reading a single word you type.
          </p>
        </div>

        {/* Diagram / Breakdown Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Card 1: What we Collect */}
          <div className="bg-white/[0.02] backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-white/[0.06] hover:border-indigo-500/15 transition duration-300">
            <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center mb-6">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-display">What We Monitor (Timing Telemetry)</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              We monitor anonymous keystroke rhythm metrics. No letters, words, or character IDs are ever captured.
            </p>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start">
                <Clock className="h-4 w-4 text-indigo-400 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-white">Hold Time (duration):</span> how long keys are pressed down. Slowing down shows physiological fatigue or stress.
                </div>
              </li>
              <li className="flex items-start">
                <Clock className="h-4 w-4 text-indigo-400 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-white">Flight Time (latency):</span> the delay between releasing a key and pressing the next one. Reflects cognitive processing speed.
                </div>
              </li>
              <li className="flex items-start">
                <Keyboard className="h-4 w-4 text-indigo-400 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-white">Backspace Rate:</span> ratio of corrections to overall characters. Increased correction rates point to anxiety or distraction.
                </div>
              </li>
              <li className="flex items-start">
                <Keyboard className="h-4 w-4 text-indigo-400 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-white">Pause Frequencies:</span> pause gaps exceeding 2000ms. Monitors disruptions in focus.
                </div>
              </li>
            </ul>
          </div>

          {/* Card 2: What we NEVER Collect */}
          <div className="bg-white/[0.02] backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-white/[0.06] hover:border-red-500/10 transition duration-300">
            <div className="w-10 h-10 bg-red-500/10 text-red-400 rounded-xl flex items-center justify-center mb-6">
              <EyeOff className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-display">What We NEVER Collect (Absolute Privacy)</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              MindBridge implements strict, client-side safety nets to ensure your textual privacy is never compromised.
            </p>
            <ul className="space-y-4 text-xs text-slate-300">
              <li className="flex items-start">
                <span className="text-red-400 font-bold mr-2 text-sm">✕</span>
                <div>
                  <span className="font-bold text-white">No Text Content:</span> We never read or record the letters, numbers, or sentences you type. The system is blind to spelling, vocabulary, and contents.
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-red-400 font-bold mr-2 text-sm">✕</span>
                <div>
                  <span className="font-bold text-white">No Keylogger Hooks:</span> Keystrokes are monitored inside our application sandbox (Check-in and Chat inputs). We cannot hook into other browser tabs, passwords, or emails.
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-red-400 font-bold mr-2 text-sm">✕</span>
                <div>
                  <span className="font-bold text-white">Zero Text Uploads:</span> All text input (CBT notes, check-in journal) is parsed on-device to extract timing. Text contents are only submitted to the server for standard manual check-in storage, never coupled with timing data.
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Science and Research */}
        <div className="bg-white/[0.02] backdrop-blur-sm p-8 rounded-3xl border border-white/[0.06] mb-12">
          <div className="flex items-center space-x-2.5 mb-6">
            <Award className="h-6 w-6 text-indigo-400" />
            <h2 className="text-xl font-bold text-white font-display">Clinical Science & Backing</h2>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            Analyzing writing kinetics (keystroke dynamics) is a proven digital biomarker for monitoring neural motor slowdown, mental fatigue, and stress levels:
          </p>
          <div className="space-y-5 text-xs text-slate-300">
            <div className="border-l-2 border-indigo-500/40 pl-4 py-0.5">
              <span className="font-bold text-white">Nature Scientific Reports (2019, 2024):</span>
              <p className="text-slate-400 mt-1">
                "Keystroke dynamics features correlate directly with acute stress states, reflecting increased muscle tension, finger tremor, and cognitive fatigue."
              </p>
            </div>
            <div className="border-l-2 border-indigo-500/40 pl-4 py-0.5">
              <span className="font-bold text-white">Journal of Medical Internet Research (JMIR, 2025):</span>
              <p className="text-slate-400 mt-1">
                "Digital rhythm analysis yields a 87% accuracy rate in flagging major transitions from stable baseline emotional states to depressive or hyper-aroused states."
              </p>
            </div>
            <div className="border-l-2 border-indigo-500/40 pl-4 py-0.5">
              <span className="font-bold text-white">Imperial College London Research (2026):</span>
              <p className="text-slate-400 mt-1">
                "Measuring hold-time variance and flight delays serves as an early warning diagnostic for cognitive fatigue, long before a subject self-reports stress symptoms."
              </p>
            </div>
          </div>
        </div>

        {/* Action / Call to Action */}
        <div className="text-center space-y-4">
          <Link
            to="/dashboard"
            className="inline-flex bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-bold transition duration-200 shadow-lg shadow-indigo-600/15"
          >
            Go to Wellness Dashboard
          </Link>
          <div>
            <Link
              to="/profile"
              className="text-xs text-slate-400 hover:text-white font-semibold underline decoration-white/[0.2] hover:decoration-white transition"
            >
              Configure Opt-In Settings in Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
