import React, { useEffect, useState } from "react";

export default function MyProfile() {
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("token");

  // Load real user from backend
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("http://localhost:5000/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setUser(data);

        // update navbar name/phone
        localStorage.setItem("name", data.name || "");
        localStorage.setItem("phone", data.phone || "");
        localStorage.setItem("email", data.email || "");
      } catch (err) {
        console.log("Error loading profile:", err);
      }
    }

    loadProfile();
  }, [token]);

  if (!user) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center py-14 px-6">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-semibold text-gray-900 mb-10">
          My Profile
        </h1>

        <div className="bg-white p-10 rounded-3xl shadow-lg border border-gray-200">
          {/* Avatar */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-4xl font-semibold text-gray-700">
              {user.name?.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Name */}
          <div className="mb-8">
            <p className="text-sm text-gray-500 mb-1">Full Name</p>
            <p className="text-xl font-medium text-gray-800">{user.name}</p>
          </div>

          {/* Email */}
          <div className="mb-8">
            <p className="text-sm text-gray-500 mb-1">Email</p>
            <p className="text-lg text-gray-700">{user.email}</p>
          </div>

          {/* Phone */}
          <div className="mb-8">
            <p className="text-sm text-gray-500 mb-1">Phone Number</p>
            <p className="text-lg text-gray-700">
              {user.phone && user.phone.trim() !== ""
                ? user.phone
                : "Not Provided"}
            </p>
          </div>

          {/* Role */}
          <div className="mb-8">
            <p className="text-sm text-gray-500 mb-1">Account Type</p>
            <p className="text-lg capitalize text-gray-800">{user.role}</p>
          </div>

          {/* Joined */}
          <div>
            <p className="text-sm text-gray-500 mb-1">Joined On</p>
            <p className="text-lg text-gray-700">
              {new Date(user.createdAt).toDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
