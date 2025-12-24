import React, { useState } from "react";
import axios from "axios";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    category: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const categories = [
    "Support",
    "Help",
    "Complaint",
    "Feedback",
    "Technical Issue",
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitForm = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.category || !form.message) {
      alert("All fields are required");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/messages", form);

      setSuccessMsg("Your message has been sent successfully! Our team will get back to you.");
      setForm({
        name: "",
        email: "",
        category: "",
        message: "",
      });
    } catch (err) {
      alert("Failed to send message");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center p-6">
      <div className="bg-white shadow-xl p-10 rounded-3xl max-w-xl w-full">
        <h2 className="text-3xl font-bold text-center text-pink-600 mb-6">
          Contact Us
        </h2>

        {successMsg && (
          <p className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 text-center">
            {successMsg}
          </p>
        )}

        <form onSubmit={submitForm} className="space-y-5">
          {/* Name */}
          <div>
            <label className="text-sm font-semibold">Your Name</label>
            <input
              type="text"
              name="name"
              className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-pink-400"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-semibold">Email</label>
            <input
              type="email"
              name="email"
              className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-pink-400"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          {/* CATEGORY DROPDOWN — MATCHES ADMIN */}
          <div>
            <label className="text-sm font-semibold">Category</label>
            <select
              name="category"
              className="w-full mt-1 p-3 border rounded-xl bg-white focus:ring-2 focus:ring-pink-400"
              value={form.category}
              onChange={handleChange}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="text-sm font-semibold">Message</label>
            <textarea
              name="message"
              rows="4"
              className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-pink-400"
              value={form.message}
              onChange={handleChange}
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-pink-600 text-white py-3 rounded-xl mt-4 text-lg font-semibold hover:bg-pink-700 transition"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}
