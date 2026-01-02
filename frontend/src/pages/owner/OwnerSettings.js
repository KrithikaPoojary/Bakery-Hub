import React, { useEffect, useState } from "react";
import { User, Phone, Lock, Save, ShieldCheck } from "lucide-react";

export default function OwnerSettings() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const token = localStorage.getItem("token");

  // ---------------- LOAD OWNER DATA ----------------
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("http://localhost:5000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setName(data.name || "");
        setPhone(data.phone || "");
      } catch (err) {
        console.error("Load profile error", err);
      }
    }
    loadData();
  }, [token]);

  // ---------------- UPDATE PROFILE ----------------
  const updateProfile = async () => {
    if (!name.trim() || !phone.trim()) {
      return alert("Name and phone cannot be empty");
    }

    const res = await fetch("http://localhost:5000/api/users/update-profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, phone }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error || "Failed to update profile");

    localStorage.setItem("name", name);
    localStorage.setItem("phone", phone);

    alert("Profile updated successfully!");
  };

  // ---------------- CHANGE PASSWORD ----------------
  const changePassword = async () => {
    if (!password.trim()) return alert("Enter a new password");

    const oldPassword = prompt("Enter your old password:");
    if (!oldPassword) return;

    const res = await fetch("http://localhost:5000/api/users/change-password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ oldPassword, newPassword: password }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error || "Failed to update password");

    setPassword("");
    alert("Password changed successfully!");
  };

  return (
    /* 🌈 GLOBAL GRADIENT */
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black px-6 py-14 text-white">
      
      <div className="max-w-3xl mx-auto">
        {/* TITLE */}
        <h1 className="text-4xl font-bold text-center text-pink-400 mb-12">
          Owner Settings
        </h1>

        {/* GLASS CARD */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-10 space-y-14">
          
          {/* ---------------- PROFILE ---------------- */}
          <div>
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <User className="text-pink-400" /> Profile Information
            </h2>

            {/* NAME */}
            <div className="mb-6">
              <label className="text-sm text-gray-300 flex items-center gap-2">
                <User size={16} /> Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 
                           text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                           focus:ring-pink-500"
              />
            </div>

            {/* PHONE */}
            <div className="mb-8">
              <label className="text-sm text-gray-300 flex items-center gap-2">
                <Phone size={16} /> Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 
                           text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                           focus:ring-pink-500"
                placeholder="Enter your phone number"
              />
            </div>

            <button
              onClick={updateProfile}
              className="w-full flex items-center justify-center gap-2 
                         bg-gradient-to-r from-pink-600 to-purple-600 
                         text-white py-3 rounded-xl font-semibold shadow-lg hover:opacity-90 transition"
            >
              <Save size={18} /> Save Profile
            </button>
          </div>

          <hr className="border-white/20" />

          {/* ---------------- SECURITY ---------------- */}
          <div>
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <ShieldCheck className="text-pink-400" /> Security
            </h2>

            <div className="mb-8">
              <label className="text-sm text-gray-300 flex items-center gap-2">
                <Lock size={16} /> New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 
                           text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                           focus:ring-pink-500"
                placeholder="Enter new password"
              />
            </div>

            <button
              onClick={changePassword}
              className="w-full flex items-center justify-center gap-2 
                         bg-black/70 border border-white/20 text-white 
                         py-3 rounded-xl font-semibold hover:bg-black transition"
            >
              <Lock size={18} /> Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
