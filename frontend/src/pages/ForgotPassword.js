import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        { email }
      );
      setInfo(
        res.data.message || "If that email exists, a reset link will be sent."
      );
    } catch (err) {
      setError(err.response?.data?.error || "Error sending reset email");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-pink-50 to-slate-100">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-lg px-8 py-10">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Forgot password</h1>
          <p className="text-sm text-slate-500 mt-1">
            Enter your email and we&apos;ll send you a password reset link.
          </p>
        </div>

        {info && (
          <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            {info}
          </div>
        )}
        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-pink-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-pink-700 transition shadow-sm"
          >
            Send reset link
          </button>
        </form>

        <p className="text-xs text-center text-slate-500 mt-6">
          Remembered your password?{" "}
          <span
            className="text-pink-600 hover:text-pink-700 font-medium cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Back to login
          </span>
        </p>
      </div>
    </div>
  );
}
