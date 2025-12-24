import React from "react";
import { Heart, Star, Globe, ShieldCheck, Sparkles } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-pink-50 pt-24 px-6 pb-20">
      {/* MAIN TITLE */}
      <h1 className="text-4xl md:text-5xl font-extrabold text-center text-pink-600 mb-4 tracking-tight">
        About BakeHub
      </h1>

      {/* SUBTITLE */}
      <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto text-center leading-relaxed mb-14">
        A seamless platform designed to connect customers with the best local
        bakeries — making fresh treats just a click away.
      </p>

      {/* SECTION 1 — OUR MISSION */}
      <div className="max-w-5xl mx-auto bg-white border border-pink-100 rounded-3xl p-10 shadow-lg mb-14">
        <div className="flex items-center gap-3 mb-4">
          <Heart className="text-pink-500" size={28} />
          <h2 className="text-3xl font-bold text-pink-600">Our Mission</h2>
        </div>

        <p className="text-gray-700 text-lg leading-relaxed">
          Our mission is to empower local bakeries by giving them a powerful yet
          simple digital presence. BakeHub helps bakeries reach customers easily
          while providing users with a smooth and enjoyable browsing and
          ordering experience.
        </p>
      </div>

      {/* SECTION 2 — WHAT WE DO */}
      <div className="max-w-5xl mx-auto bg-white border border-pink-100 rounded-3xl p-10 shadow-lg mb-14">
        <div className="flex items-center gap-3 mb-4">
          <Globe className="text-pink-500" size={28} />
          <h2 className="text-3xl font-bold text-pink-600">What We Do</h2>
        </div>

        <ul className="space-y-4 text-gray-700 text-lg leading-relaxed pl-1">
          <li>• Allow customers to browse nearby bakeries effortlessly.</li>
          <li>
            • Provide bakery owners with smooth and powerful management tools.
          </li>
          <li>
            • Ensure a faster and more reliable online ordering experience.
          </li>
          <li>
            • Deliver real-time updates on orders and bakery availability.
          </li>
          <li>• Offer a clean, mobile-friendly user experience.</li>
        </ul>
      </div>

      {/* SECTION 3 — WHY BAKEHUB */}
      <div className="max-w-5xl mx-auto bg-white border border-pink-100 rounded-3xl p-10 shadow-lg mb-14">
        <div className="flex items-center gap-3 mb-4">
          <Star className="text-pink-500" size={28} />
          <h2 className="text-3xl font-bold text-pink-600">Why BakeHub?</h2>
        </div>

        <p className="text-gray-700 text-lg leading-relaxed mb-3">
          BakeHub blends simplicity, speed, and trust. Our platform is built
          with the goal of enhancing the customer journey and supporting local
          bakery businesses.
        </p>

        <p className="text-gray-700 text-lg leading-relaxed">
          Whether you're discovering new desserts or managing your bakery
          operations, BakeHub provides a beautiful and easy-to-use experience
          for everyone.
        </p>
      </div>

      {/* SECTION 4 — OUR VALUES */}
      <div className="max-w-5xl mx-auto bg-white border border-pink-100 rounded-3xl p-10 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <ShieldCheck className="text-pink-500" size={28} />
          <h2 className="text-3xl font-bold text-pink-600">Our Values</h2>
        </div>

        <ul className="space-y-4 text-gray-700 text-lg leading-relaxed pl-1">
          <li>✨ Customer Convenience First</li>
          <li>✨ Support for Local Businesses</li>
          <li>✨ Clean, Modern & Trustworthy Design</li>
          <li>✨ Fast & Reliable Performance</li>
          <li>✨ User-Friendly Experience for Everyone</li>
        </ul>
      </div>
    </div>
  );
}
