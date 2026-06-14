import React, { useState, useEffect } from "react";
import { Phone, Globe, Heart } from "lucide-react";

export default function CrisisAlert({ onClose }) {
  const [countdown, setCountdown] = useState(5);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanClose(true);
    }
  }, [countdown]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-surface/95 backdrop-blur-xl border border-white/[0.08] w-full max-w-lg rounded-2xl border-t-4 border-t-red-500 shadow-2xl overflow-hidden animate-slide-in">
        
        {/* Banner header */}
        <div className="p-6 bg-red-500/5 text-center border-b border-white/[0.04]">
          <div className="w-14 h-14 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-3 border border-red-500/20">
            <Heart className="h-8 w-8 animate-pulse" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-red-400 font-display">You Are Not Alone</h2>
          <p className="text-slate-400 text-sm mt-1">
            I hear you, and I care about you. Please connect with a real support counselor right now.
          </p>
        </div>

        {/* Global Resources */}
        <div className="p-6 space-y-4 max-h-[320px] overflow-y-auto">
          
          {/* International */}
          <div className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.06]">
            <h3 className="font-bold text-white text-sm sm:text-base font-display">International Resources</h3>
            <div className="mt-3 space-y-2 text-sm">
              <a
                href="https://www.befrienders.org"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.08] hover:border-red-500/30 hover:text-red-400 transition group font-medium"
              >
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-red-400" />
                  <span className="text-white group-hover:text-red-400 transition">Befrienders Worldwide</span>
                </div>
                <span className="text-xs text-slate-500">befrienders.org</span>
              </a>
              <a
                href="https://findahelpline.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.08] hover:border-red-500/30 hover:text-red-400 transition group font-medium"
              >
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-red-400" />
                  <span className="text-white group-hover:text-red-400 transition">Find A Helpline</span>
                </div>
                <span className="text-xs text-slate-500">findahelpline.com</span>
              </a>
              <a
                href="https://www.iasp.info/resources/Crisis_Centres/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.08] hover:border-red-500/30 hover:text-red-400 transition group font-medium"
              >
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-red-400" />
                  <span className="text-white group-hover:text-red-400 transition">IASP Crisis Centres</span>
                </div>
                <span className="text-xs text-slate-500">iasp.info</span>
              </a>
            </div>
          </div>

          {/* Regional Quick-Dial Examples */}
          <div className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.06]">
            <h3 className="font-bold text-white text-sm sm:text-base font-display">Regional Helplines</h3>
            <div className="mt-3 space-y-2 text-sm">
              <a
                href="tel:988"
                className="flex items-center justify-between bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.08] hover:border-red-500/30 transition group font-medium"
              >
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-red-400" />
                  <span className="text-white group-hover:text-red-400 transition">988 Suicide & Crisis Lifeline</span>
                </div>
                <span className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded font-bold">USA / Canada</span>
              </a>
              <a
                href="tel:9152987821"
                className="flex items-center justify-between bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.08] hover:border-red-500/30 transition group font-medium"
              >
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-red-400" />
                  <span className="text-white group-hover:text-red-400 transition">iCall (TISS Mumbai)</span>
                </div>
                <span className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded font-bold">India</span>
              </a>
              <a
                href="tel:116123"
                className="flex items-center justify-between bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.08] hover:border-red-500/30 transition group font-medium"
              >
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-red-400" />
                  <span className="text-white group-hover:text-red-400 transition">Samaritans</span>
                </div>
                <span className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded font-bold">UK / Ireland</span>
              </a>
              <a
                href="tel:0357740992"
                className="flex items-center justify-between bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.08] hover:border-red-500/30 transition group font-medium"
              >
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-red-400" />
                  <span className="text-white group-hover:text-red-400 transition">TELL Lifeline</span>
                </div>
                <span className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded font-bold">Japan</span>
              </a>
              <a
                href="tel:0800111011"
                className="flex items-center justify-between bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.08] hover:border-red-500/30 transition group font-medium"
              >
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-red-400" />
                  <span className="text-white group-hover:text-red-400 transition">Lifeline South Africa</span>
                </div>
                <span className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded font-bold">South Africa</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-6 bg-white/[0.02] border-t border-white/[0.04] flex flex-col items-center justify-center">
          <p className="text-xs text-slate-500 text-center mb-3">
            A real counselor is waiting to help. Please reach out to one of the resources above.
          </p>
          {canClose ? (
            <button
              onClick={onClose}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-sm transition cursor-pointer shadow-lg shadow-indigo-600/20"
            >
              I Understand & Want to Return
            </button>
          ) : (
            <button
              disabled
              className="w-full bg-white/[0.05] text-slate-600 font-bold py-2.5 rounded-xl text-sm cursor-not-allowed"
            >
              Please read crisis contacts ({countdown}s)
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
