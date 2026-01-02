import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Home,
  Store,
  BarChart2,
  Settings,
  LogOut,
  Clock,
  DollarSign,
} from "lucide-react";

export default function OwnerDashboard() {
  const token = localStorage.getItem("token");

  const [active, setActive] = useState("dashboard");
  const [bakery, setBakery] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    const loadAll = async () => {
      try {
        const bakeryRes = await axios.get(
          "http://localhost:5000/api/bakeries/mine",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setBakery(bakeryRes.data);

        const [prodRes, orderRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/products/${bakeryRes.data._id}`),
          axios.get("http://localhost:5000/api/orders/owner-orders", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setProducts(prodRes.data || []);
        setOrders(orderRes.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadAll();
  }, []);

  /* ---------------- STATS ---------------- */
  const stats = useMemo(() => {
    let revenue = 0;
    let paidOrders = 0;

    orders.forEach((o) => {
      if (o.paymentStatus === "paid") {
        paidOrders++;
        revenue += o.paidAmount || o.total || 0;
      }
    });

    return {
      totalOrders: orders.length,
      paidOrders,
      revenue,
    };
  }, [orders]);

  const menu = [
    { id: "dashboard", label: "Dashboard", icon: <Home size={18} /> },
    { id: "products", label: "Menu Items", icon: <Store size={18} /> },
    { id: "orders", label: "Orders", icon: <Clock size={18} /> },
    { id: "analytics", label: "Analytics", icon: <BarChart2 size={18} /> },
    { id: "payouts", label: "Payouts", icon: <DollarSign size={18} /> },
    { id: "settings", label: "Settings", icon: <Settings size={18} /> },
  ];

  return (
    /* 🌈 GLOBAL BACKGROUND */
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white">
      
      {/* 🌈 SIDEBAR */}
      <aside className="w-64 bg-gradient-to-b from-slate-900 via-gray-900 to-black border-r border-white/10 p-6 flex flex-col">
        <h1 className="text-3xl font-bold text-pink-400 mb-8">
          BakeHub • Owner
        </h1>

        {bakery && (
          <p className="text-sm text-gray-300 mb-6">
            Managing <span className="text-white font-semibold">{bakery.name}</span>
          </p>
        )}

        {menu.map((m) => (
          <button
            key={m.id}
            onClick={() => setActive(m.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 text-sm font-medium transition
              ${
                active === m.id
                  ? "bg-white/10 text-pink-400"
                  : "text-gray-300 hover:bg-white/5"
              }`}
          >
            {m.icon}
            {m.label}
          </button>
        ))}

        <button
          className="mt-auto flex items-center gap-3 text-red-400 hover:text-red-300"
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
        >
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* 🌈 MAIN CONTENT */}
      <main className="flex-1 p-10 overflow-y-auto">
        {active === "dashboard" && (
          <>
            <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
            <p className="text-gray-400 mb-8">
              Quick overview of your bakery performance
            </p>

            {/* 🌈 DASHBOARD CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              <div className="bg-gradient-to-br from-pink-600/20 to-purple-600/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <p className="text-xs text-gray-300">Products</p>
                <h3 className="text-3xl font-bold mt-1">{products.length}</h3>
              </div>

              <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <p className="text-xs text-gray-300">Orders</p>
                <h3 className="text-3xl font-bold mt-1">{stats.totalOrders}</h3>
              </div>

              <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <p className="text-xs text-gray-300">Paid Orders</p>
                <h3 className="text-3xl font-bold mt-1 text-green-400">
                  {stats.paidOrders}
                </h3>
              </div>

              <div className="bg-gradient-to-br from-pink-600/30 to-fuchsia-600/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <p className="text-xs text-gray-300">Revenue</p>
                <h3 className="text-3xl font-bold mt-1 text-pink-400">
                  ₹{stats.revenue.toFixed(2)}
                </h3>
              </div>

            </div>
          </>
        )}

        {active !== "dashboard" && (
          <div className="mt-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold capitalize mb-2">
              {active}
            </h2>
            <p className="text-gray-400">
              This section UI already exists in your project.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
