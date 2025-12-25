import React, { useEffect, useState } from "react";
import { User, Phone, Lock } from "lucide-react";

export default function Settings() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    async function loadData() {
      const res = await fetch("http://localhost:5000/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setName(data.name || "");
      setPhone(data.phone || "");
    }
    loadData();
  }, [token]);

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
    <div className="min-h-screen flex justify-center py-14 px-6 bg-gradient-to-br from-pink-50 to-white">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-10 text-center text-gray-900 tracking-wide">
          Settings
        </h1>

        {/* CARD */}
        <div className="p-10 bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-pink-100 space-y-12 transition hover:shadow-2xl">
          {/* PROFILE SECTION */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Profile Information
            </h2>

            {/* Name */}
            <label className="block mb-7">
              <span className="flex items-center gap-2 text-gray-600 font-semibold">
                <User size={20} /> Full Name
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full p-3 rounded-xl border border-gray-300 bg-white focus:border-pink-400 focus:ring-2 focus:ring-pink-300 outline-none transition shadow-sm"
              />
            </label>

            {/* Phone */}
            <label className="block mb-7">
              <span className="flex items-center gap-2 text-gray-600 font-semibold">
                <Phone size={20} /> Phone Number
              </span>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2 w-full p-3 rounded-xl border border-gray-300 bg-white focus:border-pink-400 focus:ring-2 focus:ring-pink-300 outline-none transition shadow-sm"
                placeholder="Enter your phone"
              />
            </label>

            <button
              onClick={updateProfile}
              className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 rounded-xl shadow-md hover:opacity-90 transition font-semibold tracking-wide"
            >
              Save Changes
            </button>
          </div>

          {/* PASSWORD SECTION */}
          <hr className="border-pink-200" />

          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Security
            </h2>

            <label className="block mb-7">
              <span className="flex items-center gap-2 text-gray-600 font-semibold">
                <Lock size={20} /> New Password
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full p-3 rounded-xl border border-gray-300 bg-white focus:border-pink-400 focus:ring-2 focus:ring-pink-300 outline-none transition shadow-sm"
                placeholder="Enter new password"
              />
            </label>

            <button
              onClick={changePassword}
              className="w-full bg-gray-900 text-white py-3 rounded-xl shadow-md hover:bg-black transition font-semibold tracking-wide"
            >
              Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
