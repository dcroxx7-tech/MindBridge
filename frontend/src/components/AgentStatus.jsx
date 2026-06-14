import React from "react";
import { Activity, MessageCircle, Network } from "lucide-react";

/**
 * AgentStatus — Shows live pipeline status of all 3 AI agents.
 * Displays on the Dashboard so users can see which agent is doing what.
 * 
 * @param {object} props
 * @param {boolean} props.hasWarning - If SentinelAI has detected a warning
 * @param {boolean} props.chatActive - If a CompanionAI chat session is active
 * @param {boolean} props.showResources - If BridgeAI is routing resources
 * @param {boolean} props.isCrisis - If crisis mode is active
 */
export default function AgentStatus({ 
  hasWarning = false, 
  chatActive = false, 
  showResources = false,
  isCrisis = false 
}) {
  const agents = [
    {
      name: "SentinelAI",
      role: "Behavioral Detection",
      icon: Activity,
      status: isCrisis ? "Crisis Detected" : hasWarning ? "Alert Flagged" : "Monitoring",
      statusColor: isCrisis
        ? "bg-red-500/20 text-red-400 border-red-500/30"
        : hasWarning
        ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
        : "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
      pulseColor: isCrisis
        ? "bg-red-400"
        : hasWarning
        ? "bg-amber-400"
        : "bg-indigo-400",
      active: true, // Sentinel is always monitoring
    },
    {
      name: "CompanionAI",
      role: "CBT Intervention",
      icon: MessageCircle,
      status: isCrisis ? "Crisis Mode" : chatActive ? "Session Active" : "Standby",
      statusColor: isCrisis
        ? "bg-red-500/20 text-red-400 border-red-500/30"
        : chatActive
        ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
        : "bg-white/[0.04] text-slate-500 border-white/[0.06]",
      pulseColor: isCrisis ? "bg-red-400" : chatActive ? "bg-indigo-400" : "bg-slate-600",
      active: chatActive || isCrisis,
    },
    {
      name: "BridgeAI",
      role: "Clinical Routing",
      icon: Network,
      status: isCrisis ? "Escalation Active" : showResources ? "Routing Resources" : "Idle",
      statusColor: isCrisis
        ? "bg-red-500/20 text-red-400 border-red-500/30"
        : showResources
        ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
        : "bg-white/[0.04] text-slate-500 border-white/[0.06]",
      pulseColor: isCrisis ? "bg-red-400" : showResources ? "bg-indigo-400" : "bg-slate-600",
      active: showResources || isCrisis,
    },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 font-display">
        Agent Pipeline Status
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {agents.map((agent, idx) => {
          const Icon = agent.icon;
          return (
            <div
              key={agent.name}
              className="relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-4 flex items-center space-x-3.5 group hover:border-indigo-500/20 transition-all duration-300"
            >
              {/* Connection line between agents */}
              {idx < agents.length - 1 && (
                <div className="hidden md:block absolute -right-[13px] top-1/2 -translate-y-1/2 w-[26px] h-px bg-gradient-to-r from-white/[0.08] to-white/[0.08] z-10">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/[0.1]" />
                </div>
              )}

              {/* Icon */}
              <div className={`p-2.5 rounded-xl ${agent.active ? "bg-indigo-500/10" : "bg-white/[0.03]"} transition-colors`}>
                <Icon className={`h-4.5 w-4.5 ${agent.active ? "text-indigo-400" : "text-slate-600"}`} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white truncate font-display">
                    {agent.name}
                  </h3>
                </div>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">{agent.role}</p>
              </div>

              {/* Status Badge */}
              <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wide ${agent.statusColor}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${agent.pulseColor} ${agent.active ? "animate-pulse" : ""}`} />
                <span className="whitespace-nowrap">{agent.status}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
