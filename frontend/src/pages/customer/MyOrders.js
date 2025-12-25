// FIXED MyOrders.js

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Clock,
  CheckCircle,
  Truck,
  Package,
  ChevronRight,
  RefreshCcw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/orders/my-orders",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // ✅ FIX — backend returns an array, not an object
        setOrders(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  // ---------------- LOADING ----------------
  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-purple-400 text-xl">
        Loading orders...
      </div>
    );

  // ---------------- EMPTY ----------------
  if (!orders.length)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 text-center px-6">
        <div className="bg-gray-800 p-10 rounded-3xl shadow-xl border border-gray-700 animate-fadeIn">
          <Package className="w-20 h-20 text-purple-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-800">No Orders Yet</h2>
          <p className="text-gray-500 mt-2">
            Browse delicious bakeries and place your first order!
          </p>
        </div>
      </div>
    );

  const getStatus = (status) => {
    switch (status) {
      case "pending":
        return {
          text: "Pending Confirmation",
          icon: <Clock className="text-yellow-600" size={16} />,
          class: "bg-yellow-100 text-yellow-700",
        };
      case "confirmed":
        return {
          text: "Confirmed • Baking Started",
          icon: <Truck className="text-blue-600" size={16} />,
          class: "bg-blue-100 text-blue-700",
        };
      case "ready":
        return {
          text: "Ready For Pickup",
          icon: <Truck className="text-purple-600" size={16} />,
          class: "bg-purple-100 text-purple-700",
        };
      case "completed":
        return {
          text: "Delivered Successfully",
          icon: <CheckCircle className="text-green-600" size={16} />,
          class: "bg-green-100 text-green-700",
        };
      default:
        return {
          text: status,
          icon: <Package size={16} />,
          class: "bg-gray-100 text-gray-700",
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12 px-5">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-extrabold text-purple-400 mb-10">
          My Orders
        </h1>

        <div className="space-y-10">
          {orders.map((order, i) => {
            const statusInfo = getStatus(order.status);

            return (
              <div
                key={order._id}
                className="bg-gray-800 rounded-3xl shadow-xl border border-gray-700 p-8 hover:shadow-2xl transition-all animate-slideUp"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex justify-between flex-wrap gap-4 mb-5">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      Order #{order._id.slice(-6)}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Placed on{" "}
                      {new Date(order.createdAt).toLocaleString("en-IN", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        hour: "numeric",
                        minute: "numeric",
                      })}
                    </p>
                  </div>

                  <span
                    className={`${statusInfo.class} px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium`}
                  >
                    {statusInfo.icon} {statusInfo.text}
                  </span>
                </div>

                <div className="bg-gray-700/50 rounded-2xl p-5">
                  <h3 className="font-semibold text-gray-800 mb-4">
                    Order Items
                  </h3>

                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center border-b border-pink-100 pb-3"
                      >
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium text-gray-800">
                              {item.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              Qty: {item.qty}
                            </p>
                          </div>
                        </div>

                        <p className="font-semibold text-gray-900">
                          ₹{item.qty * item.price}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-6 gap-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    Total:{" "}
                    <span className="text-purple-400 font-extrabold">
                      ₹{order.total}
                    </span>
                  </h3>

                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/track/${order._id}`)}
                      className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 text-sm md:text-base rounded-xl shadow-lg hover:bg-purple-700 transition active:scale-95"
                    >
                      Track Order <ChevronRight size={18} />
                    </button>

                    <button
                      onClick={() => navigate(`/invoice/${order._id}`)}
                      className="flex items-center gap-2 bg-gray-800 border border-gray-600 px-5 py-2 rounded-xl hover:bg-gray-700 transition text-white"
                    >
                      View Invoice
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
