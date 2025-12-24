import React from "react";
import { Link } from "react-router-dom";

export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-black px-4">
      <div className="w-full max-w-md bg-gray-800/90 backdrop-blur border border-gray-700 rounded-2xl shadow-xl p-8 text-white">
        <h2 className="text-3xl font-bold text-center mb-2">
          Create Account
        </h2>
        <p className="text-gray-400 text-center mb-6">
          Join BakeHub today
        </p>

        <input
          className="w-full mb-4 px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
          placeholder="Name"
        />

        <input
          className="w-full mb-4 px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
          placeholder="Email"
        />

        <input
          type="password"
          className="w-full mb-6 px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
          placeholder="Password"
        />

        <button className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold transition">
          Register
        </button>

        <p className="text-sm text-gray-400 text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
