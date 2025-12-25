import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Home,
  Store,
  BarChart2,
  Settings,
  LogOut,
  PlusCircle,
  Edit3,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
} from "lucide-react";

export default function OwnerDashboard() {
  const token = localStorage.getItem("token");

  const [active, setActive] = useState("dashboard");
  const [bakery, setBakery] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [payouts, setPayouts] = useState([]);

  // product modal
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
    isSoldOut: false,
    isVisible: true,
    category: "Uncategorized",
  });

  const [imageFile, setImageFile] = useState(null); // NEW

  // order filter (all / paid / pending)
  const [orderFilter, setOrderFilter] = useState("all");

  // -------------------------------------------------------------------
  // HELPERS
  // -------------------------------------------------------------------
  const formatDateTime = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatMoney = (value) => {
    if (!value || isNaN(value)) return "₹0";
    return `₹${Number(value).toFixed(2)}`;
  };

  const isSameDay = (a, b) => {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  };

  // -------------------------------------------------------------------
  // FETCH OWNER BAKERY
  // -------------------------------------------------------------------
  const loadBakery = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/bakeries/mine", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBakery(res.data);
    } catch (err) {
      console.error("Bakery load error", err);
    }
  };

  // -------------------------------------------------------------------
  // FETCH OWNER PRODUCTS
  // -------------------------------------------------------------------
  const loadProducts = async () => {
    if (!bakery?._id) return;
    try {
      const res = await axios.get(
        `http://localhost:5000/api/products/${bakery._id}`
      );
      setProducts(res.data || []);
    } catch (err) {
      console.error("Products load error", err);
    }
  };

  // -------------------------------------------------------------------
  // FETCH OWNER ORDERS
  // -------------------------------------------------------------------
  const loadOrders = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/orders/owner-orders",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(res.data || []);
    } catch (err) {
      console.error("Orders load error", err);
    }
  };

  // -------------------------------------------------------------------
  // FETCH OWNER PAYOUTS
  // -------------------------------------------------------------------
  const loadPayouts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/payouts/mine", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPayouts(res.data || []);
    } catch (err) {
      console.error("Payouts load error", err);
    }
  };

  // FETCH ALL DATA ON LOAD
  useEffect(() => {
    loadBakery();
  }, []);

  useEffect(() => {
    if (bakery?._id) {
      loadProducts();
      loadOrders();
      loadPayouts();
    }
  }, [bakery]);

  // -------------------------------------------------------------------
  // SAVE PRODUCT (CREATE / UPDATE)
  // -------------------------------------------------------------------
  const saveProduct = async () => {
    try {
      if (!editProduct.name || !editProduct.price) {
        alert("Name and price are required.");
        return;
      }

      const formData = new FormData();

      if (!editProduct._id) {
        formData.append("bakeryId", bakery._id);
      }

      formData.append("name", editProduct.name);
      formData.append("description", editProduct.description || "");
      formData.append("price", editProduct.price);
      formData.append("category", editProduct.category || "Uncategorized");
      formData.append("isSoldOut", editProduct.isSoldOut ? "true" : "false");
      formData.append("isVisible", editProduct.isVisible !== false ? "true" : "false");

      if (imageFile) {
        formData.append("image", imageFile);
      } else if (editProduct.imageUrl) {
        formData.append("imageUrl", editProduct.imageUrl);
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      if (editProduct._id) {
        await axios.put(
          `http://localhost:5000/api/products/${editProduct._id}`,
          formData,
          config
        );
      } else {
        await axios.post(
          `http://localhost:5000/api/products`,
          formData,
          config
        );
      }

      setShowModal(false);
      setImageFile(null);
      setEditProduct({
        name: "",
        description: "",
        price: "",
        imageUrl: "",
        isSoldOut: false,
        isVisible: true,
        category: "Uncategorized",
      });

      loadProducts();
    } catch (err) {
      console.error("Save product error", err);
      alert("Failed to save product.");
    }
  };

  // -------------------------------------------------------------------
  // DELETE PRODUCT
  // -------------------------------------------------------------------
  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      loadProducts();
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  // -------------------------------------------------------------------
  // UPDATE ORDER STATUS
  // -------------------------------------------------------------------
  const updateOrderStatus = async (id, status) => {
    try {
      await axios.put(
        `http://localhost:5000/api/orders/status/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadOrders();
    } catch (err) {
      console.error("Order update error", err);
    }
  };

  // ------------------ UPLOAD BAKERY IMAGE ------------------
  const uploadBakeryImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      await axios.put(
        "http://localhost:5000/api/bakeries/upload-image",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Refresh bakery details
      loadBakery();
      alert("Bakery image updated successfully!");
    } catch (err) {
      console.error("Bakery image upload error:", err);
      alert("Failed to upload bakery image.");
    }
  };

  // -------------------------------------------------------------------
  // ANALYTICS FROM ORDERS (NO EXTRA BACKEND NEEDED)
  // -------------------------------------------------------------------
  const stats = useMemo(() => {
    if (!orders.length) {
      return {
        totalOrders: 0,
        paidOrders: 0,
        pendingPayments: 0,
        totalRevenue: 0,
        todaysOrdersCount: 0,
        todaysRevenue: 0,
        itemRevenue: [],
        topTodayOrders: [],
      };
    }

    const today = new Date();

    let paidOrders = 0;
    let pendingPayments = 0;
    let totalRevenue = 0;
    let todaysOrdersCount = 0;
    let todaysRevenue = 0;

    const itemMap = {};

    orders.forEach((order) => {
      const isPaid = order.paymentStatus === "paid";

      if (isPaid) paidOrders++;
      else pendingPayments++;

      const paidAmount =
        typeof order.paidAmount === "number" && !isNaN(order.paidAmount)
          ? order.paidAmount
          : isPaid
          ? order.total || 0
          : 0;

      if (isPaid) totalRevenue += paidAmount;

      const created = order.createdAt ? new Date(order.createdAt) : null;
      if (created && isSameDay(created, today)) {
        todaysOrdersCount++;
        if (isPaid) todaysRevenue += paidAmount;
      }

      (order.items || []).forEach((it) => {
        const key = it.name || "Unknown item";
        if (!itemMap[key]) {
          itemMap[key] = { name: key, qty: 0, revenue: 0 };
        }
        const qty = it.qty || 0;
        const price = it.price || 0;
        itemMap[key].qty += qty;
        itemMap[key].revenue += qty * price;
      });
    });

    const itemRevenue = Object.values(itemMap).sort(
      (a, b) => b.revenue - a.revenue
    );

    const todayOrdersList = orders.filter((order) => {
      if (!order.createdAt) return false;
      return isSameDay(new Date(order.createdAt), today);
    });

    const topTodayOrders = [...todayOrdersList]
      .sort((a, b) => {
        const aAmt =
          typeof a.paidAmount === "number" && !isNaN(a.paidAmount)
            ? a.paidAmount
            : a.total || 0;
        const bAmt =
          typeof b.paidAmount === "number" && !isNaN(b.paidAmount)
            ? b.paidAmount
            : b.total || 0;
        return bAmt - aAmt;
      })
      .slice(0, 5);

    return {
      totalOrders: orders.length,
      paidOrders,
      pendingPayments,
      totalRevenue,
      todaysOrdersCount,
      todaysRevenue,
      itemRevenue,
      topTodayOrders,
    };
  }, [orders]);

  // filtered orders by payment status
  const filteredOrders = useMemo(() => {
    if (orderFilter === "paid") {
      return orders.filter((o) => o.paymentStatus === "paid");
    }
    if (orderFilter === "pending") {
      return orders.filter((o) => o.paymentStatus !== "paid");
    }
    return orders;
  }, [orders, orderFilter]);

  // -------------------------------------------------------------------
  // UI MENU
  // -------------------------------------------------------------------
  const menu = [
    { id: "dashboard", label: "Dashboard", icon: <Home size={18} /> },
    { id: "products", label: "Menu Items", icon: <Store size={18} /> },
    { id: "orders", label: "Orders", icon: <Clock size={18} /> },
    { id: "analytics", label: "Analytics", icon: <BarChart2 size={18} /> },
    { id: "payouts", label: "Payouts", icon: <DollarSign size={18} /> },
    { id: "settings", label: "Settings", icon: <Settings size={18} /> },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8F4FF]">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white shadow-xl border-r p-6 flex flex-col">
        <h1 className="text-3xl font-bold text-pink-600 mb-8">
          BakeHub • Owner
        </h1>
        {bakery && (
          <p className="text-sm text-gray-500 mb-6">
            Managing{" "}
            <span className="font-semibold text-gray-800">{bakery.name}</span>
          </p>
        )}

        {menu.map((m) => (
          <button
            key={m.id}
            onClick={() => setActive(m.id)}
            className={`flex gap-3 items-center p-3 rounded-lg mb-2 text-sm font-medium transition ${
              active === m.id ? "bg-pink-100 text-pink-600" : "text-gray-700"
            }`}
          >
            {m.icon} {m.label}
          </button>
        ))}

        <button
          className="flex gap-3 items-center mt-auto text-red-500 hover:text-red-600 text-sm"
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
        >
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-10 overflow-y-auto">
        {/* ------------------ DASHBOARD ------------------ */}
        {active === "dashboard" && (
          <div>
            <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
            <p className="text-sm text-gray-500 mb-6">
              Quick overview of your bakery performance.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-5 rounded-2xl shadow border">
                <p className="text-xs text-gray-500 mb-1">Total Products</p>
                <h3 className="text-2xl font-bold">{products.length}</h3>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow border">
                <p className="text-xs text-gray-500 mb-1">Total Orders</p>
                <h3 className="text-2xl font-bold">{stats.totalOrders}</h3>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow border">
                <p className="text-xs text-gray-500 mb-1">Paid Orders</p>
                <h3 className="text-2xl font-bold text-green-600">
                  {stats.paidOrders}
                </h3>
                <p className="text-[11px] text-gray-500 mt-1">
                  Pending payments: {stats.pendingPayments}
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow border">
                <p className="text-xs text-gray-500 mb-1">Total Revenue</p>
                <h3 className="text-2xl font-bold text-pink-600">
                  {formatMoney(stats.totalRevenue)}
                </h3>
                <p className="text-[11px] text-gray-500 mt-1">
                  Today: {formatMoney(stats.todaysRevenue)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ------------------ PRODUCTS ------------------ */}
        {active === "products" && (
          <div>
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-3xl font-bold">Menu Items</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Add, edit or remove products from your bakery menu.
                </p>
              </div>
              <button
                className="bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow hover:bg-pink-700"
                onClick={() => {
                  setEditProduct({
                    name: "",
                    description: "",
                    price: "",
                    imageUrl: "",
                    isSoldOut: false,
                    isVisible: true,
                    category: "Uncategorized",
                  });
                  setShowModal(true);
                }}
              >
                <PlusCircle size={20} /> Add Item
              </button>
            </div>

            {/* PRODUCT LIST */}
            {products.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border text-center text-gray-500">
                No products added yet. Click{" "}
                <span className="font-semibold text-pink-600">“Add Item”</span>{" "}
                to create your first menu item.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => (
                  <div
                    key={p._id}
                    className="bg-white p-5 rounded-2xl border shadow hover:shadow-lg transition"
                  >
                    <img
                      src={
                        p.imageUrl
                          ? p.imageUrl.startsWith("http")
                            ? p.imageUrl
                            : `http://localhost:5000${p.imageUrl}`
                          : "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600"
                      }
                      className="w-full h-40 object-cover rounded-xl mb-3"
                      alt={p.name}
                    />

                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {p.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {p.description || "No description"}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        {p.isSoldOut && (
                          <span className="text-[11px] px-2 py-1 bg-red-100 text-red-600 rounded-full">
                            Sold Out
                          </span>
                        )}
                        {p.isVisible === false && (
                          <span className="text-[11px] px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                            Hidden
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <span className="text-lg font-bold text-pink-600">
                        ₹{p.price}
                      </span>
                      <span className="text-[11px] px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                        {p.category || "Uncategorized"}
                      </span>
                    </div>

                    <div className="flex justify-between mt-4 text-sm">
                      <button
                        onClick={() => {
                          setEditProduct(p);
                          setShowModal(true);
                        }}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                      >
                        <Edit3 size={16} /> Edit
                      </button>
                      <button
                        onClick={() => deleteProduct(p._id)}
                        className="flex items-center gap-1 text-red-500 hover:text-red-600"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ------------------ ORDERS ------------------ */}
        {active === "orders" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold">Orders</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Manage your orders and update payment status.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setOrderFilter("all")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                    orderFilter === "all"
                      ? "bg-pink-600 text-white border-pink-600"
                      : "bg-white text-gray-700 border-gray-200"
                  }`}
                >
                  All
                </button>

                <button
                  onClick={() => setOrderFilter("paid")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                    orderFilter === "paid"
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-white text-gray-700 border-gray-200"
                  }`}
                >
                  Paid
                </button>

                <button
                  onClick={() => setOrderFilter("pending")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                    orderFilter === "pending"
                      ? "bg-amber-500 text-white border-amber-500"
                      : "bg-white text-gray-700 border-gray-200"
                  }`}
                >
                  Pending Payment
                </button>
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border text-center text-gray-500">
                No orders available.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((o) => {
                  const isPaid = o.paymentStatus === "paid";
                  const amount =
                    typeof o.paidAmount === "number" && !isNaN(o.paidAmount)
                      ? o.paidAmount
                      : o.total || 0;

                  return (
                    <div
                      key={o._id}
                      className="bg-white p-5 rounded-2xl border shadow-sm hover:shadow-md transition"
                    >
                      {/* ORDER HEADER */}
                      <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Order #{o._id.slice(-6)}
                          </h3>
                          <p className="text-xs text-gray-500">
                            Placed on {formatDateTime(o.createdAt)}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {/* Order Status Badge */}
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                              o.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : o.status === "ready"
                                ? "bg-purple-100 text-purple-700"
                                : o.status === "confirmed"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {o.status.toUpperCase()}
                          </span>

                          {/* Payment Badge */}
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                              o.paymentStatus === "paid"
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {o.paymentStatus === "paid"
                              ? "PAID"
                              : "PENDING PAYMENT"}
                          </span>

                          {/* Payment Method */}
                          {o.paymentMethod && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              Method: {o.paymentMethod.toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* ITEMS */}
                      <div className="mt-4 border-t border-pink-50 pt-3">
                        {o.items.map((i, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between text-sm text-gray-800"
                          >
                            <span>
                              {i.qty} × {i.name}
                            </span>
                            <span>₹{i.qty * i.price}</span>
                          </div>
                        ))}
                      </div>

                      {/* CUSTOMER DETAILS */}
                      <div className="mt-4 bg-gray-50 p-4 rounded-xl">
                        <h3 className="text-sm font-semibold text-gray-800 mb-2">
                          Customer Details
                        </h3>

                        <p className="text-sm text-gray-700">
                          <span className="font-semibold">Name:</span>{" "}
                          {o.customerId?.name || "N/A"}
                        </p>

                        <p className="text-sm text-gray-700 mt-1">
                          <span className="font-semibold">Email:</span>{" "}
                          {o.customerId?.email || "N/A"}
                        </p>

                        <p className="text-sm text-gray-700 mt-1">
                          <span className="font-semibold">Phone:</span>{" "}
                          {o.phone}
                        </p>

                        <p className="text-sm text-gray-700 mt-1">
                          <span className="font-semibold">Address:</span>{" "}
                          {o.address}
                        </p>
                      </div>

                      {/* ORDER TOTAL */}
                      <div className="mt-4">
                        <p className="text-sm text-gray-500">Order Total</p>
                        <p className="text-xl font-bold text-pink-600">
                          ₹{o.total}
                        </p>

                        {o.paymentStatus === "paid" && (
                          <p className="text-xs text-green-600 mt-1">
                            Paid: ₹
                            {typeof o.paidAmount === "number"
                              ? o.paidAmount
                              : o.total}
                          </p>
                        )}
                      </div>

                      {/* STATUS + PAYMENT UPDATE */}
                      <div className="mt-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Payment Update */}
                        <div>
                          <label className="text-sm text-gray-600">
                            Payment Status:
                          </label>
                          <select
                            className="p-2 border rounded-lg ml-2 text-sm"
                            value={o.paymentStatus}
                            onChange={async (e) => {
                              await axios.put(
                                `http://localhost:5000/api/orders/update-payment/${o._id}`,
                                { paymentStatus: e.target.value },
                                {
                                  headers: { Authorization: `Bearer ${token}` },
                                }
                              );
                              loadOrders();
                            }}
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                          </select>
                        </div>

                        {/* Order Status */}
                        <div>
                          <label className="text-sm text-gray-600">
                            Order Status:
                          </label>
                          <select
                            className="p-2 border rounded-lg ml-2 text-sm"
                            value={o.status}
                            onChange={(e) =>
                              updateOrderStatus(o._id, e.target.value)
                            }
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="ready">Ready</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ------------------ ANALYTICS ------------------ */}
        {active === "analytics" && (
          <div>
            <h2 className="text-3xl font-bold mb-2">Analytics</h2>
            <p className="text-sm text-gray-500 mb-6">
              Payment overview, today’s performance and top-selling items.
            </p>

            {/* Top summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-5 rounded-2xl border shadow-sm">
                <p className="text-xs text-gray-500">Today&apos;s Orders</p>
                <h3 className="text-2xl font-bold">
                  {stats.todaysOrdersCount}
                </h3>
                <p className="text-[11px] text-gray-500 mt-1">
                  Out of {stats.totalOrders} total orders.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border shadow-sm">
                <p className="text-xs text-gray-500">Today&apos;s Revenue</p>
                <h3 className="text-2xl font-bold text-pink-600">
                  {formatMoney(stats.todaysRevenue)}
                </h3>
                <p className="text-[11px] text-gray-500 mt-1">
                  Based on paid orders only.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border shadow-sm">
                <p className="text-xs text-gray-500">Top Item</p>
                {stats.itemRevenue[0] ? (
                  <>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {stats.itemRevenue[0].name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Sold {stats.itemRevenue[0].qty} pcs •{" "}
                      {formatMoney(stats.itemRevenue[0].revenue)}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-500 mt-2">
                    No item data yet.
                  </p>
                )}
              </div>
            </div>

            {/* Two columns: Top orders today + Item revenue */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Orders Today */}
              <div className="bg-white p-5 rounded-2xl border shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Top Orders Today
                </h3>
                {stats.topTodayOrders.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No orders placed today yet.
                  </p>
                ) : (
                  <div className="space-y-3 text-sm">
                    {stats.topTodayOrders.map((o) => {
                      const amount =
                        typeof o.paidAmount === "number" && !isNaN(o.paidAmount)
                          ? o.paidAmount
                          : o.total || 0;
                      return (
                        <div
                          key={o._id}
                          className="flex justify-between items-center border-b border-gray-100 pb-2"
                        >
                          <div>
                            <p className="font-medium text-gray-800">
                              Order #{o._id.slice(-6)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDateTime(o.createdAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-pink-600">
                              {formatMoney(amount)}
                            </p>
                            <p className="text-[11px] text-gray-500">
                              {o.paymentStatus === "paid" ? "Paid" : "Pending"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Item-wise revenue */}
              <div className="bg-white p-5 rounded-2xl border shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Item-wise Revenue
                </h3>
                {stats.itemRevenue.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No item revenue data yet.
                  </p>
                ) : (
                  <div className="max-h-72 overflow-y-auto text-sm">
                    <table className="w-full text-left text-xs md:text-sm">
                      <thead>
                        <tr className="text-gray-500 border-b">
                          <th className="py-2 pr-2 font-medium">Item</th>
                          <th className="py-2 px-2 font-medium text-right">
                            Qty
                          </th>
                          <th className="py-2 pl-2 font-medium text-right">
                            Revenue
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.itemRevenue.map((row) => (
                          <tr
                            key={row.name}
                            className="border-b last:border-b-0"
                          >
                            <td className="py-2 pr-2">{row.name}</td>
                            <td className="py-2 px-2 text-right">{row.qty}</td>
                            <td className="py-2 pl-2 text-right">
                              {formatMoney(row.revenue)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ------------------ PAYOUTS ------------------ */}
        {active === "payouts" && (
          <div>
            <h2 className="text-3xl font-bold mb-2">Payouts</h2>
            <p className="text-sm text-gray-500 mb-6">
              View your payout history from completed orders.
            </p>

            {payouts.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border text-center text-gray-500">
                No payouts yet. Payouts will appear here after orders are completed and processed by admin.
              </div>
            ) : (
              <div className="space-y-4">
                {payouts.map((payout) => (
                  <div
                    key={payout._id}
                    className="bg-white p-5 rounded-2xl border shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">
                          Payout #{payout._id.slice(-6)}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {payout.orderIds?.length || 0} orders • Created:{" "}
                          {formatDateTime(payout.createdAt)}
                        </p>
                        {payout.processedAt && (
                          <p className="text-xs text-gray-400 mt-1">
                            Processed: {formatDateTime(payout.processedAt)}
                          </p>
                        )}
                        {payout.processedBy && (
                          <p className="text-xs text-gray-400 mt-1">
                            Processed by: {payout.processedBy?.name || "Admin"}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-pink-600">
                          {formatMoney(payout.payoutAmount)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Total: {formatMoney(payout.totalAmount)} • Fee:{" "}
                          {formatMoney(payout.platformFee)}
                        </div>
                        <span
                          className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                            payout.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : payout.status === "processing"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {payout.status?.toUpperCase() || "PENDING"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ------------------ SETTINGS ------------------ */}
        {active === "settings" && (
          <div>
            <h2 className="text-3xl font-bold mb-2">Settings</h2>
            <p className="text-sm text-gray-500 mb-6">
              Basic settings for your owner account & bakery.
            </p>

            <div className="bg-white p-6 rounded-2xl border shadow-sm text-sm text-gray-600">
              <h3 className="text-lg font-semibold mb-3">Bakery Image</h3>

              {/* Show Current Bakery Image */}
              {bakery?.imageUrl && (
                <img
                  src={
                    bakery.imageUrl.startsWith("http")
                      ? bakery.imageUrl
                      : `http://localhost:5000${bakery.imageUrl}`
                  }
                  alt="Bakery"
                  className="w-full h-48 object-cover rounded-xl border mb-4"
                />
              )}

              {/* Upload Input */}
              <label className="block mb-1 font-medium text-gray-700">
                Upload New Bakery Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={uploadBakeryImage}
                className="w-full border rounded-lg p-2 mb-4"
              />

              <p className="text-xs text-gray-500">
                This image will appear on Customer Browse and Menu pages.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* PRODUCT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editProduct._id ? "Edit Menu Item" : "Add Menu Item"}
            </h2>

            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-gray-700 mb-1">Name</label>
                <input
                  className="w-full border rounded-lg p-2"
                  value={editProduct.name}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full border rounded-lg p-2 h-20"
                  value={editProduct.description}
                  onChange={(e) =>
                    setEditProduct({
                      ...editProduct,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    className="w-full border rounded-lg p-2"
                    value={editProduct.price}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        price: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Category</label>
                  <select
                    className="w-full border rounded-lg p-2"
                    value={editProduct.category}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        category: e.target.value,
                      })
                    }
                  >
                    <option value="Cakes">Cakes</option>
                    <option value="Pastries">Pastries</option>
                    <option value="Breads">Breads</option>
                    <option value="Cookies">Cookies</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Uncategorized">Uncategorized</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Image URL</label>
                <input
                  className="w-full border rounded-lg p-2"
                  value={editProduct.imageUrl}
                  onChange={(e) =>
                    setEditProduct({
                      ...editProduct,
                      imageUrl: e.target.value,
                    })
                  }
                />
              </div>

              {/* ✅ NEW UPLOAD IMAGE FIELD ADDED WITHOUT CHANGING ANYTHING */}
              <div className="mt-2">
                <label className="block text-gray-700 mb-1">Upload Image</label>

                {/* Preview new selected image */}
                {imageFile ? (
                  <img
                    src={URL.createObjectURL(imageFile)}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg mb-2 border"
                  />
                ) : editProduct.imageUrl ? (
                  <img
                    src={
                      editProduct.imageUrl.startsWith("http")
                        ? editProduct.imageUrl
                        : `http://localhost:5000${editProduct.imageUrl}`
                    }
                    alt="Existing"
                    className="w-full h-32 object-cover rounded-lg mb-2 border"
                  />
                ) : null}

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  className="w-full border rounded-lg p-2"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setImageFile(file);
                  }}
                />
              </div>
              {/* END UPLOAD FIELD */}

              <div className="flex flex-col gap-2 mt-2">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editProduct.isSoldOut}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        isSoldOut: e.target.checked,
                      })
                    }
                  />
                  Mark as Sold Out
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editProduct.isVisible !== false}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        isVisible: e.target.checked,
                      })
                    }
                  />
                  Visible to Customers
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveProduct}
                className="px-4 py-2 text-sm rounded-lg bg-pink-600 text-white hover:bg-pink-700 shadow-sm"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
