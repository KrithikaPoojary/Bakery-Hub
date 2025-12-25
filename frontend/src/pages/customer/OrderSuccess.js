import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { CheckCircle, Clock, Bike } from "lucide-react";

export default function OrderSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    // Confetti burst
    confetti({
      particleCount: 200,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Gentle falling confetti for 2 seconds
    const duration = 2 * 1000;
    const end = Date.now() + duration;

    const interval = setInterval(() => {
      confetti({
        particleCount: 10,
        spread: 40,
        startVelocity: 30,
        scalar: 0.8,
      });

      if (Date.now() > end) clearInterval(interval);
    }, 150);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white px-5 py-10">
      <div className="bg-white p-12 rounded-3xl shadow-2xl border border-pink-100 max-w-xl text-center animate-fadeIn">
        {/* SUCCESS ICON */}
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-4 rounded-full shadow-inner">
            <CheckCircle size={90} className="text-green-600" />
          </div>
        </div>

        {/* HEADING */}
        <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
          Order Placed Successfully!
        </h1>

        <p className="text-gray-600 text-lg">
          Thank you for choosing{" "}
          <span className="text-pink-600 font-semibold">BakeHub</span>.
        </p>
        <p className="text-gray-500 mt-1">
          Your delicious treats are being prepared with love. 🍰✨
        </p>

        {/* DELIVERY ESTIMATE CARD */}
        <div className="bg-gradient-to-r from-pink-50 to-pink-100 p-6 mt-8 rounded-2xl border border-pink-200 shadow-inner">
          <h3 className="flex justify-center items-center gap-2 text-xl font-semibold text-pink-700">
            <Clock size={22} /> Estimated Delivery
          </h3>

          <p className="text-gray-800 text-2xl font-bold mt-2">
            30 – 45 minutes
          </p>

          {/* Bike animation */}
          <div className="flex justify-center mt-4">
            <Bike
              size={45}
              className="text-pink-600 animate-[slide_2s_infinite_linear]"
            />
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-12 flex flex-col gap-4">
          <button
            onClick={() => navigate("/orders")}
            className="w-full py-3 rounded-xl bg-pink-600 text-white text-lg font-semibold 
                       shadow-lg hover:bg-pink-700 transition active:scale-95"
          >
            Track My Order →
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full py-3 rounded-xl bg-white border text-gray-700 text-lg 
                       font-semibold shadow hover:bg-gray-100 transition active:scale-95"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
