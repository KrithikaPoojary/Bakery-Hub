import React from "react";
import { Link } from "react-router-dom";

function Register() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-2xl shadow-xl px-8 py-10 text-white">
        <h2 className="text-2xl font-bold text-center mb-2">
          Create Account
        </h2>
        <p className="text-gray-400 text-center mb-6">
          Join BakeHub and get started
        </p>

        {/* Name */}
        <input
          type="text"
          placeholder="Name"
          className="w-full mb-4 px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        {/* Button */}
        <button className="w-full bg-purple-600 hover:bg-purple-700 transition text-white py-3 rounded-xl font-semibold">
          Register
        </button>

        {/* Login link */}
        <p className="text-sm text-gray-400 text-center mt-5">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}

export default Register;
