import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Home,
  Store,
  BarChart2,
  LogOut,
  CheckCircle,
  Clock,
  XCircle,
  Search as SearchIcon,
  User,
  ChevronLeft,
  ChevronRight,
  Activity,
  DollarSign,
} from "lucide-react";
import PayoutManagement from "./PayoutManagement";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

const PAGE_SIZE = 6;
const STATUS_COLORS = {
  approved: "#10B981",
  pending: "#F59E0B",
  rejected: "#EF4444",
};

export default function AdminDashboard() {
  const [section, setSection] = useState("dashboard"); // dashboard | bakeries | analytics
  const [bakeries, setBakeries] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const token = localStorage.getItem("token");

  // Fetch bakeries once
  useEffect(() => {
    const fetchBakeries = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:5000/api/bakeries", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // if ownerId is object id only, it's fine; otherwise populate fields as available
        setBakeries(res.data || []);
      } catch (err) {
        console.error("Failed to fetch bakeries", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchBakeries();
  }, [token]);

  // Approve / Reject single
  const handleApprove = async (id) => {
    if (!window.confirm("Approve this bakery?")) return;
    try {
      await axios.put(
        `http://localhost:5000/api/bakeries/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBakeries((p) =>
        p.map((b) =>
          b._id === id
            ? { ...b, status: "approved", updatedAt: new Date().toISOString() }
            : b
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to approve bakery.");
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Reject this bakery?")) return;
    try {
      await axios.put(
        `http://localhost:5000/api/bakeries/${id}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBakeries((p) =>
        p.map((b) =>
          b._id === id
            ? { ...b, status: "rejected", updatedAt: new Date().toISOString() }
            : b
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to reject bakery.");
    }
  };

  // Approve all pending
  const handleApproveAll = async () => {
    const pending = bakeries.filter((b) => b.status === "pending");
    if (!pending.length) return alert("No pending bakeries.");
    if (!window.confirm(`Approve all ${pending.length} pending bakeries?`))
      return;

    try {
      for (const b of pending) {
        await axios.put(
          `http://localhost:5000/api/bakeries/${b._id}/approve`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setBakeries((p) =>
        p.map((b) =>
          b.status === "pending"
            ? { ...b, status: "approved", updatedAt: new Date().toISOString() }
            : b
        )
      );
      alert("All pending bakeries approved.");
    } catch (err) {
      console.error(err);
      alert("Failed to approve all.");
    }
  };

  // Derived filtered list
  const filtered = useMemo(() => {
    let list = [...bakeries];

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (b) =>
          (b.name || "").toLowerCase().includes(q) ||
          (b.address || "").toLowerCase().includes(q) ||
          (b.ownerId?.name || "").toLowerCase().includes(q) ||
          (b.ownerId?.email || "").toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all")
      list = list.filter((b) => b.status === statusFilter);

    if (sortBy === "newest")
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sortBy === "oldest")
      list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    else if (sortBy === "name")
      list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    return list;
  }, [bakeries, query, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Analytics helpers
  const analytics = useMemo(() => {
    // monthly registrations (six months)
    const map = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      map[key] = 0;
    }
    bakeries.forEach((b) => {
      if (!b.createdAt) return;
      const key = new Date(b.createdAt).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      if (map[key] !== undefined) map[key] += 1;
    });
    const monthly = Object.entries(map).map(([month, count]) => ({
      month,
      count,
    }));

    // cumulative growth (line) — cumulative sum over monthsMap
    const cumulative = monthly.reduce((acc, cur, i) => {
      const prev = i === 0 ? 0 : acc[i - 1].value;
      acc.push({ month: cur.month, value: prev + cur.count });
      return acc;
    }, []);

    // status distribution
    const approved = bakeries.filter((b) => b.status === "approved").length;
    const pending = bakeries.filter((b) => b.status === "pending").length;
    const rejected = bakeries.filter((b) => b.status === "rejected").length;
    const pie = [
      { name: "Approved", value: approved, key: "approved" },
      { name: "Pending", value: pending, key: "pending" },
      { name: "Rejected", value: rejected, key: "rejected" },
    ];

    // top5 bakeries by products length if present else by recent approval/created
    const topCandidates = [...bakeries];
    topCandidates.forEach((b) => {
      b._productCount = Array.isArray(b.products) ? b.products.length : 0;
      // fallback: if no productCount, boost recently approved ones
      if (!b._productCount && b.status === "approved") b._productCount = 1;
    });
    topCandidates.sort(
      (a, b) =>
        b._productCount - a._productCount ||
        new Date(b.updatedAt || b.createdAt) -
          new Date(a.updatedAt || a.createdAt)
    );
    const top5 = topCandidates.slice(0, Math.min(5, topCandidates.length));

    // avg approval time: average (updatedAt - createdAt) for approved items
    const approvedItems = bakeries.filter(
      (b) => b.status === "approved" && b.createdAt && b.updatedAt
    );
    const totalMs = approvedItems.reduce(
      (sum, it) =>
        sum +
        (new Date(it.updatedAt).getTime() - new Date(it.createdAt).getTime()),
      0
    );
    const avgMs = approvedItems.length ? totalMs / approvedItems.length : 0;
    const avgDays = avgMs
      ? Math.round((avgMs / (1000 * 60 * 60 * 24)) * 10) / 10
      : null;

    // recent activity: collect approvals & registrations sorted by date
    const activities = [];
    bakeries.forEach((b) => {
      if (b.createdAt)
        activities.push({ type: "registered", at: b.createdAt, bakery: b });
      if (b.updatedAt && b.status === "approved")
        activities.push({ type: "approved", at: b.updatedAt, bakery: b });
      if (b.updatedAt && b.status === "rejected")
        activities.push({ type: "rejected", at: b.updatedAt, bakery: b });
    });
    activities.sort((a, b) => new Date(b.at) - new Date(a.at));
    const recent = activities.slice(0, 8);

    return {
      monthly,
      cumulative,
      pie,
      top5,
      avgDays,
      recent,
      counts: { approved, pending, rejected, total: bakeries.length },
    };
  }, [bakeries]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6 fixed h-full">
        <h1 className="text-2xl font-semibold text-pink-600 mb-8">BakeHub</h1>

        <nav className="flex flex-col gap-3 text-sm">
          <button
            onClick={() => setSection("dashboard")}
            className={`flex items-center gap-3 p-2 rounded-lg ${
              section === "dashboard"
                ? "bg-pink-50 text-pink-600"
                : "hover:bg-slate-100"
            }`}
          >
            <Home size={18} /> Overview
          </button>

          <button
            onClick={() => setSection("bakeries")}
            className={`flex items-center gap-3 p-2 rounded-lg ${
              section === "bakeries"
                ? "bg-pink-50 text-pink-600"
                : "hover:bg-slate-100"
            }`}
          >
            <Store size={18} /> Bakeries
          </button>

          <button
            onClick={() => setSection("analytics")}
            className={`flex items-center gap-3 p-2 rounded-lg ${
              section === "analytics"
                ? "bg-pink-50 text-pink-600"
                : "hover:bg-slate-100"
            }`}
          >
            <BarChart2 size={18} /> Analytics
          </button>

          <button
            onClick={() => setSection("payouts")}
            className={`flex items-center gap-3 p-2 rounded-lg ${
              section === "payouts"
                ? "bg-pink-50 text-pink-600"
                : "hover:bg-slate-100"
            }`}
          >
            <DollarSign size={18} /> Payouts
          </button>

          <button
            onClick={() => setSection("messages")}
            className={`flex items-center gap-3 p-2 rounded-lg ${
              section === "messages"
                ? "bg-pink-50 text-pink-600"
                : "hover:bg-slate-100"
            }`}
          >
            <User size={18} /> Messages
          </button>

          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/";
            }}
            className="flex items-center gap-3 p-2 mt-auto text-red-500 hover:bg-red-50 rounded-lg"
          >
            <LogOut size={18} /> Logout
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 p-10 max-w-7xl mx-auto w-full">
        {/* DASHBOARD view */}
        {section === "dashboard" && (
          <>
            <div className="mb-6 flex items-start justify-between gap-6">
              <div>
                <h2 className="text-3xl font-bold">Dashboard</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Overview & recent activity
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleApproveAll}
                  className="px-4 py-2 bg-pink-600 text-white rounded-xl shadow-sm"
                >
                  Approve all pending
                </button>
              </div>
            </div>

            {/* Overview cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 border shadow-sm">
                <div className="text-xs text-slate-500">Total Bakeries</div>
                <div className="text-2xl font-bold">
                  {analytics.counts.total}
                </div>
                <div className="text-xs text-slate-400 mt-2">Live</div>
              </div>

              <div className="bg-white rounded-2xl p-6 border shadow-sm">
                <div className="text-xs text-slate-500">Approved</div>
                <div className="text-2xl font-bold text-green-600">
                  {analytics.counts.approved}
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  Avg approval time:{" "}
                  {analytics.avgDays ? `${analytics.avgDays} days` : "N/A"}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border shadow-sm">
                <div className="text-xs text-slate-500">Pending</div>
                <div className="text-2xl font-bold text-amber-600">
                  {analytics.counts.pending}
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  Actions required
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border shadow-sm">
                <div className="text-xs text-slate-500">Rejected</div>
                <div className="text-2xl font-bold text-red-600">
                  {analytics.counts.rejected}
                </div>
                <div className="text-xs text-slate-400 mt-2">Review issues</div>
              </div>
            </div>

            {/* Main analytics row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="col-span-2 bg-white rounded-2xl p-6 border shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm text-slate-500">
                      Monthly Registrations
                    </div>
                    <div className="text-lg font-semibold">Last 6 months</div>
                  </div>
                </div>
                <div className="h-60">
                  <ResponsiveContainer>
                    <BarChart
                      data={analytics.monthly}
                      margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid stroke="#f1f5f9" />
                      <XAxis dataKey="month" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" allowDecimals={false} />
                      <Tooltip />
                      <Bar
                        dataKey="count"
                        fill="#6366f1"
                        barSize={18}
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border shadow-sm">
                <div className="text-sm text-slate-500 mb-2">
                  Status Distribution
                </div>
                <div className="h-60">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={analytics.pie}
                        dataKey="value"
                        innerRadius={36}
                        outerRadius={72}
                        paddingAngle={4}
                        label
                      >
                        {analytics.pie.map((entry) => (
                          <Cell
                            key={entry.key}
                            fill={STATUS_COLORS[entry.key]}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 text-sm text-slate-600">
                  <div>Approved: {analytics.counts.approved}</div>
                  <div>Pending: {analytics.counts.pending}</div>
                  <div>Rejected: {analytics.counts.rejected}</div>
                </div>
              </div>
            </div>

            {/* Recent activity + Top 5 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 border shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-lg font-semibold">Recent Activity</div>
                  <div className="text-sm text-slate-400">Latest events</div>
                </div>

                <div className="divide-y">
                  {analytics.recent.length ? (
                    analytics.recent.map((act, idx) => (
                      <div key={idx} className="py-3 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                          {act.type === "registered" ? (
                            <Clock size={16} />
                          ) : act.type === "approved" ? (
                            <CheckCircle size={16} />
                          ) : (
                            <XCircle size={16} />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm">
                            <span className="font-medium">
                              {act.type === "registered"
                                ? "New registration"
                                : act.type === "approved"
                                ? "Bakery approved"
                                : "Bakery rejected"}
                            </span>
                            {" — "}
                            <span className="text-slate-600">
                              {act.bakery?.name}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            {new Date(act.at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-slate-500">
                      No recent activity
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-lg font-semibold">Top Bakeries</div>
                  <div className="text-sm text-slate-400">By product count</div>
                </div>

                <ol className="space-y-3">
                  {analytics.top5.length ? (
                    analytics.top5.map((b, i) => (
                      <li key={b._id} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center text-sm font-medium">
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{b.name}</div>
                          <div className="text-xs text-slate-500">
                            {b.ownerId?.name || "—"} • {b._productCount || 0}{" "}
                            products
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-slate-500">No data</li>
                  )}
                </ol>
              </div>
            </div>
          </>
        )}

        {/* BAKERIES view */}
        {section === "bakeries" && (
          <>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold">Manage Bakeries</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Approve, reject, and review bakery details
                </p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  className="px-3 py-2 rounded-xl border bg-white"
                  placeholder="Search bakery or owner..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-2 rounded-xl border bg-white"
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 rounded-xl border bg-white"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="name">Name A–Z</option>
                </select>
                <button
                  onClick={handleApproveAll}
                  className="px-4 py-2 bg-pink-600 text-white rounded-xl"
                >
                  Approve All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
              {pageData.map((b) => (
                <article
                  key={b._id}
                  className="bg-white rounded-2xl border shadow-sm overflow-hidden"
                >
                  <div className="h-40 bg-slate-100 overflow-hidden">
                    <img
                      src={
                        b.imageUrl
                          ? b.imageUrl.startsWith("http")
                            ? b.imageUrl
                            : `http://localhost:5000${b.imageUrl}`
                          : "https://images.unsplash.com/photo-1542831371-d531d36971e6"
                      }
                      alt={b.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{b.name}</h3>
                        <p className="text-sm text-slate-500 mt-1">
                          {b.address || "No address"}
                        </p>
                        <p className="text-xs text-slate-400 mt-2">
                          <User size={12} /> {b.ownerId?.name || "—"} •{" "}
                          {b.ownerId?.email || "—"}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-slate-400">
                          {new Date(b.createdAt).toLocaleDateString()}
                        </div>
                        <div className="mt-3">
                          {b.status === "approved" && (
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs">
                              <CheckCircle size={14} /> Approved
                            </span>
                          )}
                          {b.status === "pending" && (
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs">
                              <Clock size={14} /> Pending
                            </span>
                          )}
                          {b.status === "rejected" && (
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs">
                              <XCircle size={14} /> Rejected
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {b.status === "pending" && (
                      <div className="mt-4 flex gap-3">
                        <button
                          onClick={() => handleApprove(b._id)}
                          className="flex-1 bg-green-600 text-white py-2 rounded-xl"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(b._id)}
                          className="flex-1 bg-red-500 text-white py-2 rounded-xl"
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    <div className="mt-3 text-xs text-slate-400 flex items-center justify-between">
                      <span>Id: {b._id.slice(0, 8)}…</span>
                      <span>
                        {new Date(
                          b.updatedAt || b.createdAt
                        ).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* pagination */}
            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Showing {Math.min(filtered.length, (page - 1) * PAGE_SIZE + 1)}{" "}
                - {Math.min(filtered.length, page * PAGE_SIZE)} of{" "}
                {filtered.length}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 bg-white border rounded-lg"
                >
                  <ChevronLeft />
                </button>
                <div className="px-3 py-1 bg-white border rounded-lg">
                  Page {page} / {totalPages}
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 bg-white border rounded-lg"
                >
                  <ChevronRight />
                </button>
              </div>
            </div>
          </>
        )}

        {section === "messages" && <Messages />}

        {/* PAYOUTS view */}
        {section === "payouts" && <PayoutManagement />}

        {/* ANALYTICS view */}
        {section === "analytics" && (
          <>
            <div className="mb-6">
              <h2 className="text-3xl font-bold">Analytics</h2>
              <p className="text-sm text-slate-500 mt-1">
                Detailed charts & trends
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-2xl p-6 border shadow-sm">
                <div className="text-sm text-slate-500 mb-3">
                  Cumulative Growth
                </div>
                <div className="h-64">
                  <ResponsiveContainer>
                    <LineChart data={analytics.cumulative}>
                      <CartesianGrid stroke="#f1f5f9" />
                      <XAxis dataKey="month" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" allowDecimals={false} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#6366f1"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border shadow-sm">
                <div className="text-sm text-slate-500 mb-3">
                  Status Distribution (percent)
                </div>
                <div className="h-64">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={analytics.pie}
                        dataKey="value"
                        innerRadius={36}
                        outerRadius={80}
                        label
                      >
                        {analytics.pie.map((entry) => (
                          <Cell
                            key={entry.key}
                            fill={STATUS_COLORS[entry.key]}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* extra: top5 and summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="col-span-2 bg-white rounded-2xl p-6 border shadow-sm">
                <div className="text-sm text-slate-500 mb-2">
                  Monthly Registrations
                </div>
                <div className="h-56">
                  <ResponsiveContainer>
                    <BarChart data={analytics.monthly}>
                      <CartesianGrid stroke="#f1f5f9" />
                      <XAxis dataKey="month" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#10b981" barSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border shadow-sm">
                <div className="text-sm text-slate-500 mb-2">Top Bakeries</div>
                <ol className="space-y-3">
                  {analytics.top5.map((b, i) => (
                    <li key={b._id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center">
                        {i + 1}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{b.name}</div>
                        <div className="text-xs text-slate-500">
                          {b._productCount || 0} products
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );

  function Messages() {
    const [messages, setMessages] = useState([]);
    const [replyText, setReplyText] = useState("");
    const [activeMsg, setActiveMsg] = useState(null);
    const [categoryFilter, setCategoryFilter] = useState("all");

    const token = localStorage.getItem("token");

    const CATEGORY_COLORS = {
      Support: "bg-blue-100 text-blue-700",
      Help: "bg-indigo-100 text-indigo-700",
      Complaint: "bg-red-100 text-red-700",
      Feedback: "bg-green-100 text-green-700",
      "Technical Issue": "bg-orange-100 text-orange-700",
    };

    useEffect(() => {
      loadMessages();
    }, []);

    const loadMessages = async () => {
      const res = await axios.get("http://localhost:5000/api/messages", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data);
    };

    const openMessage = async (msg) => {
      setActiveMsg(msg);

      if (msg.status === "unread") {
        await axios.put(
          `http://localhost:5000/api/messages/${msg._id}/read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        loadMessages();
      }
    };

    const sendReply = async () => {
      if (!replyText.trim()) return alert("Reply cannot be empty");

      await axios.put(
        `http://localhost:5000/api/messages/${activeMsg._id}/reply`,
        { replyText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Reply sent successfully!");
      setReplyText("");
      setActiveMsg(null);
      loadMessages();
    };

    const markResolved = async (id) => {
      await axios.put(
        `http://localhost:5000/api/messages/${id}/resolve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadMessages();
    };

    // Filter messages by category
    const filteredMessages =
      categoryFilter === "all"
        ? messages
        : messages.filter((m) => m.category === categoryFilter);

    return (
      <div>
        <h2 className="text-3xl font-bold mb-6">User Messages</h2>

        {/* FILTER BAR */}
        <div className="mb-6 flex items-center gap-4">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border rounded-xl shadow-sm"
          >
            <option value="all">All Categories</option>
            <option value="Support">Support</option>
            <option value="Help">Help</option>
            <option value="Complaint">Complaint</option>
            <option value="Feedback">Feedback</option>
            <option value="Technical Issue">Technical Issue</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* MESSAGE LIST */}
          <div className="space-y-4">
            {filteredMessages.map((m) => (
              <div
                key={m._id}
                onClick={() => openMessage(m)}
                className={`p-5 rounded-xl shadow cursor-pointer border transition 
                ${
                  m.status === "unread"
                    ? "bg-pink-50 border-pink-300"
                    : "bg-white"
                }`}
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">{m.name}</h3>

                  {/* STATUS */}
                  <span
                    className={`text-xs px-3 py-1 rounded-full ${
                      m.status === "unread"
                        ? "bg-red-100 text-red-700"
                        : m.status === "resolved"
                        ? "bg-gray-200"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {m.status}
                  </span>
                </div>

                <p className="text-sm text-gray-600">{m.email}</p>

                {/* CATEGORY BADGE */}
                <span
                  className={`inline-block mt-2 px-3 py-1 text-xs rounded-full 
                ${CATEGORY_COLORS[m.category]}`}
                >
                  {m.category}
                </span>

                <p className="text-sm text-gray-700 mt-3 line-clamp-2">
                  {m.message}
                </p>
              </div>
            ))}
          </div>

          {/* RIGHT SIDE: MESSAGE DETAILS */}
          {activeMsg && (
            <div className="bg-white p-6 rounded-xl border shadow">
              <h3 className="text-xl font-semibold">{activeMsg.name}</h3>
              <p className="text-gray-500">{activeMsg.email}</p>

              {/* CATEGORY BADGE */}
              <span
                className={`inline-block mt-3 px-3 py-1 text-xs rounded-full 
              ${CATEGORY_COLORS[activeMsg.category]}`}
              >
                {activeMsg.category}
              </span>

              <p className="mt-4 text-gray-800">{activeMsg.message}</p>

              {/* ADMIN REPLY BOX */}
              <textarea
                className="w-full border rounded-xl p-3 mt-4"
                rows="4"
                placeholder="Write your reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />

              <div className="flex gap-4 mt-4">
                <button
                  onClick={sendReply}
                  className="px-4 py-2 bg-pink-600 text-white rounded-xl"
                >
                  Send Reply
                </button>

                <button
                  onClick={() => markResolved(activeMsg._id)}
                  className="px-4 py-2 bg-gray-300 rounded-xl"
                >
                  Mark Resolved
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}
