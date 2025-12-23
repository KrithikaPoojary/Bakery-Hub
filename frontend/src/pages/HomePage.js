import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Store, ShoppingBag, ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <div className="bg-gray-900 min-h-screen overflow-hidden">
      {/* ====================== HERO SECTION ====================== */}
      <section className="px-6 py-24 md:py-32 relative">
        {/* Background Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            initial={{ opacity: 0.1, scale: 0.8 }}
            animate={{ opacity: 0.25, scale: 1 }}
            transition={{ duration: 1.3 }}
            className="absolute top-0 right-0 w-96 h-96 bg-purple-900 rounded-full blur-[120px]"
          />
          <motion.div
            initial={{ opacity: 0.1, scale: 0.7 }}
            animate={{ opacity: 0.25, scale: 1 }}
            transition={{ duration: 1.6 }}
            className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-900 rounded-full blur-[120px]"
          />
        </div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center relative z-10">
          {/* LEFT TEXT */}
          <motion.div
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.9 }}
            className="space-y-6"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-white tracking-tight">
              Fresh Bakes, Happy Moments —
              <span className="text-purple-400 block">
                Delivered Straight to You.
              </span>
            </h1>

            <p className="text-base md:text-lg text-gray-300 max-w-lg leading-relaxed">
              Craving something sweet? Discover the best bakeries around you,
              explore menus full of magic, and let BakeHub turn your cravings
              into happiness — one delicious bite at a time.
            </p>

            {/* BUTTONS */}
            <div className="flex gap-4 flex-wrap mt-8">
              {/* Customer Login */}
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link
                  to="/login?role=customer"
                  className="px-7 py-3 bg-purple-600 text-white rounded-xl font-semibold shadow-lg hover:bg-purple-700 transition"
                >
                  I’m Here to Eat 😋
                </Link>
              </motion.div>

              {/* Owner Login */}
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link
                  to="/login?role=owner"
                  className="px-7 py-3 bg-gray-800 border border-gray-700 text-gray-200 rounded-xl font-semibold shadow hover:bg-gray-700 transition"
                >
                  I’m Here to Bake 🍞
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* RIGHT FLOATING CARDS */}
          <div className="grid gap-5">
            <FloatingCard
              title="Find Your Flavour"
              text="Explore bakeries that match your cravings and mood."
              delay={0.2}
            />
            <FloatingCard
              title="Bakers You Can Trust"
              text="Every bakery is approved — only real, quality creators here."
              delay={0.4}
            />
            <FloatingCard
              title="Order in a Tap"
              text="See it. Want it. Get it. Your cravings handled effortlessly."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* ====================== ABOUT PLATFORM ====================== */}
      <section className="py-20 px-6 bg-gray-800 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-3xl md:text-4xl font-extrabold text-white"
        >
          Made for Food Lovers & the Artists Who Bake for Them
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto mt-14">
          {/* CUSTOMER CARD */}
          <RoleCard
            title="Customer"
            text="Explore, taste, repeat. Your next favorite dessert is waiting."
            register="/register?role=customer"
            login="/login?role=customer"
          />

          {/* OWNER CARD */}
          <RoleCard
            title="Bakery Owner"
            text="Turn your passion into customers. Share your bakes with the world."
            register="/register?role=owner"
            login="/login?role=owner"
          />

          {/* ADMIN CARD */}
          <RoleCard
            title="Admin"
            text="Ensuring only the best and real bakeries get featured."
            login="/login?role=admin"
            isAdmin
          />
        </div>
      </section>

      {/* ====================== WHY BAKEHUB ====================== */}
      <section className="py-20 px-6 bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-3xl font-bold text-white"
          >
            Why People Love <span className="text-purple-400">BakeHub</span>
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-10 mt-14">
            <FeatureBox
              icon={<Store className="w-8 h-8 text-purple-400 mx-auto" />}
              title="Roam the Bakery World"
              text="No login needed — just scroll, explore, and find deliciousness."
            />
            <FeatureBox
              icon={<ShoppingBag className="w-8 h-8 text-purple-400 mx-auto" />}
              title="Your Bakery. Your Rules."
              text="Owners get full control — menu, orders, customers & stories."
            />
            <FeatureBox
              icon={<ShieldCheck className="w-8 h-8 text-purple-400 mx-auto" />}
              title="Only the Real Bakers"
              text="Every bakery is hand-approved for quality & trust."
            />
          </div>
        </div>
      </section>

      {/* ====================== CTA ====================== */}
      <section className="py-20 px-6 text-center bg-gray-800 border-t border-gray-700">
        <h2 className="text-3xl font-bold text-white">
          Ready to Bake Something Big?
        </h2>
        <p className="text-gray-300 mt-3">
          Join BakeHub and share your creations with your city.
        </p>

        <motion.div
          className="mt-8 flex justify-center"
          whileHover={{ scale: 1.03 }}
        >
          <Link
            to="/register?role=owner"
            className="px-10 py-4 bg-purple-600 text-white rounded-xl text-lg font-semibold shadow hover:bg-purple-700 transition"
          >
            Become a BakeHub Baker →
          </Link>
        </motion.div>
      </section>
    </div>
  );
}

/* ============================================================= */
/* ====================== COMPONENTS ============================ */
/* ============================================================= */

function FloatingCard({ title, text, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="bg-gray-800 p-6 rounded-xl shadow-md border border-gray-700 hover:shadow-lg transition"
    >
      <h3 className="font-bold text-white text-lg">{title}</h3>
      <p className="text-gray-300 text-sm mt-1">{text}</p>
    </motion.div>
  );
}

function RoleCard({ title, text, register, login, isAdmin }) {
  return (
    <div className="p-6 bg-gray-800 rounded-2xl border border-gray-700 shadow-sm hover:shadow-lg transition">
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <p className="text-gray-300 mt-2">{text}</p>

      <div className="flex flex-col gap-3 mt-5">
        {!isAdmin && (
          <Link
            to={register}
            className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition"
          >
            Register
          </Link>
        )}
        <Link
          to={login}
          className="w-full border border-gray-700 bg-gray-700 text-white py-2 rounded-lg font-semibold hover:bg-gray-600 transition"
        >
          Login
        </Link>
      </div>
    </div>
  );
}

function FeatureBox({ icon, title, text }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="bg-gray-800 p-7 rounded-2xl shadow-md border border-gray-700 text-center"
    >
      {icon}
      <h3 className="font-semibold text-lg mt-3 text-white">{title}</h3>
      <p className="text-sm text-gray-300 mt-2">{text}</p>
    </motion.div>
  );
}
