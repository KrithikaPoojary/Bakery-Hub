import { Hourglass, AlertTriangle, RefreshCcw } from "lucide-react";

export default function OwnerPending() {
  return (
    /* 🌈 GLOBAL GRADIENT SAME AS HOME & DASHBOARD */
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-black px-6 text-white">
      
      {/* 🌈 GLASS CARD */}
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-10 text-center">
        
        {/* ICON */}
        <div className="flex justify-center mb-6">
          <Hourglass className="w-14 h-14 text-pink-400 animate-pulse" />
        </div>

        {/* TITLE */}
        <h1 className="text-3xl font-bold text-pink-400">
          Bakery Approval Pending
        </h1>

        {/* DESCRIPTION */}
        <p className="text-gray-300 mt-4 leading-relaxed text-sm">
          Your bakery registration has been submitted successfully and is
          currently under review by the admin team.
          <br />
          <span className="text-white font-medium">
            You’ll gain full dashboard access once approved.
          </span>
        </p>

        {/* INFO BOX */}
        <div className="mt-6 flex items-start gap-3 bg-yellow-500/10 border border-yellow-400/30 text-yellow-300 p-4 rounded-xl text-left">
          <AlertTriangle size={18} className="mt-0.5" />
          <p className="text-sm leading-relaxed">
            Approval usually takes a few hours.  
            Please check back later or refresh this page.
          </p>
        </div>

        {/* ACTION */}
        <button
          onClick={() => window.location.reload()}
          className="mt-8 w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl 
                     bg-gradient-to-r from-pink-600 to-purple-600 
                     text-white font-semibold shadow-lg hover:opacity-90 transition"
        >
          <RefreshCcw size={18} />
          Refresh Status
        </button>

        {/* FOOTER NOTE */}
        <p className="text-xs text-gray-400 mt-6">
          Thank you for choosing <span className="text-pink-400">BakeHub</span>.
        </p>
      </div>
    </div>
  );
}
