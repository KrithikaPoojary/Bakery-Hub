import { Hourglass, AlertTriangle } from "lucide-react";

export default function OwnerPending() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF5FA] px-6">
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full text-center border border-pink-200">
        <div className="flex justify-center mb-4">
          <Hourglass className="w-12 h-12 text-pink-600 animate-pulse" />
        </div>

        <h1 className="text-2xl font-bold text-pink-700">
          Bakery Approval Pending
        </h1>

        <p className="text-gray-600 mt-3 leading-relaxed">
          Your bakery registration is under review by the admin. You will gain
          access to the dashboard once approved.
        </p>

        <div className="bg-yellow-50 text-yellow-700 border border-yellow-300 p-3 rounded-lg mt-6 flex items-center gap-2">
          <AlertTriangle size={18} />
          <p className="text-sm text-left">
            Approval may take a few hours. Please check back later.
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-pink-600 text-white rounded-xl shadow hover:bg-pink-700 transition"
        >
          Refresh Status
        </button>
      </div>
    </div>
  );
}
