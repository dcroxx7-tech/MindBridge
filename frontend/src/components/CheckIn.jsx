import React, { useState } from "react";
import api from "../api";
import { Smile, Moon, Users, Zap, BookOpen, Send, CheckCircle2, AlertTriangle } from "lucide-react";
import useKeystrokeAnalytics from "../hooks/useKeystrokeAnalytics";

export default function CheckIn({ onCheckInSuccess }) {
  const keystroke = useKeystrokeAnalytics('checkin');
  const [mood, setMood] = useState(5);
  const [sleep, setSleep] = useState(7.0);
  const [social, setSocial] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [journalText, setJournalText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState(null);



  const getMoodLabel = (score) => {
    if (score <= 2) return "Very Low";
    if (score <= 4) return "Down / Sad";
    if (score <= 6) return "Okay / Neutral";
    if (score <= 8) return "Good / Peaceful";
    return "Excellent / Joyful";
  };

  const getSocialLabel = (score) => {
    const labels = ["Isolated / Alone", "Minimal Contact", "Average", "Active", "Highly Social"];
    return labels[score - 1];
  };

  const getEnergyLabel = (score) => {
    const labels = ["Exhausted", "Low Energy", "Moderate", "High Energy", "Fully Charged"];
    return labels[score - 1];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/checkin/", {
        mood_score: parseInt(mood),
        sleep_hours: parseFloat(sleep),
        social_score: parseInt(social),
        energy_level: parseInt(energy),
        journal_text: journalText,
      });
      
      // Submit keystroke analytics telemetry
      await keystroke.submitSession();

      setSuccessData(response.data);
      if (onCheckInSuccess) {
        onCheckInSuccess(response.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to submit check-in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    const hasWarning = successData.analysis.warning;
    const isCrisis = successData.analysis.is_crisis;
    
    return (
      <div className="bg-surface/50 backdrop-blur-md p-8 rounded-2xl border border-white/[0.06] shadow-xl text-center animate-slide-in font-sans max-w-xl mx-auto">
        <div className="w-16 h-16 bg-secondary/10 text-secondary-light rounded-full flex items-center justify-center mx-auto mb-4 border border-secondary/20">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-text mb-2">Check-in Completed!</h2>
        <p className="text-text-light mb-6">
          Thank you for taking care of yourself today. SentinelAI has analyzed your input.
        </p>

        {hasWarning && (
          <div className={`p-4 rounded-xl mb-6 text-left ${
            isCrisis ? "bg-crisis-light text-crisis border border-crisis/20" : "bg-warning-light text-warning border border-warning/20"
          }`}>
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold text-sm">
                  {isCrisis ? "CRITICAL ADVISORY" : "SENTINEL AI DETECTED WARNING"}
                </p>
                <p className="text-sm mt-1">{successData.analysis.message}</p>
                {successData.analysis.triggers.length > 0 && (
                  <ul className="text-xs list-disc pl-4 mt-2 space-y-1">
                    {successData.analysis.triggers.map((trigger, idx) => (
                      <li key={idx}>{trigger}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 justify-center">
          {hasWarning ? (
            <button
              onClick={() => window.location.href = "/chat"}
              className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm hover:shadow"
            >
              Talk to CompanionAI Chat
            </button>
          ) : (
            <button
              onClick={() => setSuccessData(null)}
              className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm hover:shadow"
            >
              Update / Submit Another Check-in
            </button>
          )}
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-100 hover:bg-gray-200 text-text px-6 py-2.5 rounded-xl text-sm font-medium transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface/50 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-white/[0.06] shadow-xl max-w-xl mx-auto font-sans animate-slide-in">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Daily Check-in</h2>
        <p className="text-text-light text-sm mt-1">
          Take 60 seconds to reflect on your wellness today. All data is kept strictly confidential.
        </p>
      </div>

      {error && (
        <div className="bg-crisis-light text-crisis border border-crisis/10 p-3 rounded-xl text-sm mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mood Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="flex items-center space-x-2 text-sm font-semibold text-white">
              <Smile className="h-4 w-4 text-primary-light" />
              <span>How is your mood today?</span>
            </label>
            <span className="text-lg font-bold text-primary-light">
              <span>{mood}/10</span>
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            className="w-full h-2 bg-white/[0.06] rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
          />
          <div className="flex justify-between text-xs text-text-light font-medium">
            <span>Struggling (1)</span>
            <span className="text-primary-light font-semibold">{getMoodLabel(mood)}</span>
            <span>Great (10)</span>
          </div>
        </div>

        {/* Sleep input */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="flex items-center space-x-2 text-sm font-semibold text-white">
              <Moon className="h-4 w-4 text-primary-light" />
              <span>Sleep Duration</span>
            </label>
            <span className="text-sm font-bold text-primary-light">{sleep} hours</span>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="range"
              min="0"
              max="16"
              step="0.5"
              value={sleep}
              onChange={(e) => setSleep(parseFloat(e.target.value))}
              className="w-full h-2 bg-white/[0.06] rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
            />
          </div>
          <div className="flex justify-between text-xs text-text-light">
            <span>0 hrs</span>
            <span>Recommended: 7-9 hrs</span>
            <span>16+ hrs</span>
          </div>
        </div>

        {/* Grid for Social & Energy */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Social score */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="flex items-center space-x-2 text-sm font-semibold text-white">
                <Users className="h-4 w-4 text-primary-light" />
                <span>Social Connection</span>
              </label>
              <span className="text-xs font-bold text-primary-light">{social}/5</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={social}
              onChange={(e) => setSocial(e.target.value)}
              className="w-full h-2 bg-white/[0.06] rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
            />
            <div className="text-right text-xs text-primary-light font-medium">
              {getSocialLabel(social)}
            </div>
          </div>

          {/* Energy level */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="flex items-center space-x-2 text-sm font-semibold text-white">
                <Zap className="h-4 w-4 text-primary-light" />
                <span>Energy Level</span>
              </label>
              <span className="text-xs font-bold text-primary-light">{energy}/5</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={energy}
              onChange={(e) => setEnergy(e.target.value)}
              className="w-full h-2 bg-white/[0.06] rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
            />
            <div className="text-right text-xs text-primary-light font-medium">
              {getEnergyLabel(energy)}
            </div>
          </div>
        </div>

        {/* Journal Textarea */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-semibold text-white">
            <BookOpen className="h-4 w-4 text-primary-light" />
            <span>Journal Note (Optional)</span>
          </label>
          <textarea
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
            onKeyDown={keystroke.handleKeyDown}
            onKeyUp={keystroke.handleKeyUp}
            rows="3"
            placeholder="Write down any thoughts, worries, or highlights from your day..."
            className="w-full p-3 text-sm bg-white/[0.02] border border-white/[0.08] text-white rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition duration-200"
          ></textarea>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white font-semibold py-3 rounded-xl flex items-center justify-center space-x-2 shadow-sm hover:shadow transition duration-200"
        >
          {loading ? (
            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>Submit Check-in</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
