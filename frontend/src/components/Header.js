import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="bg-black text-white px-6 py-4 flex justify-between items-center border-b border-gray-800">
      <h1 className="text-2xl font-bold text-purple-500">BakeHub</h1>

      <nav className="flex gap-6">
        <Link to="/" className="hover:text-purple-400">Home</Link>
        <Link to="/login" className="hover:text-purple-400">Login</Link>
        <Link to="/register" className="hover:text-purple-400">Register</Link>
      </nav>
    </header>
  );
}
