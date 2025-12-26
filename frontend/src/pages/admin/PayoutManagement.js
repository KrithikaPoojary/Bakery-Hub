import React, { useEffect, useState } from "react";
import axios from "axios";
import { DollarSign, CheckCircle, Clock, AlertCircle, ArrowLeft } from "lucide-react";

export default function PayoutManagement() {
  const [section, setSection] = useState("orders"); // orders | payouts
  const [completedOrders, setCompletedOrders] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [platformFee, setPlatformFee] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState({
    accountNumber: "",
    ifscCode: "",
    upiId: "",
    bankName: "",
  });
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    loadCompletedOrders();
    loadPayouts();
  }, []);

  const loadCompletedOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:5000/api/payouts/completed-orders",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCompletedOrders(res.data);
    } catch (err) {
      console.error("Failed to load orders", err);
      alert("Failed to load completed orders");
    } finally {
      setLoading(false);
    }
  };

  const loadPayouts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/payouts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPayouts(res.data);
    } catch (err) {
      console.error("Failed to load payouts", err);
      alert("Failed to load payouts");
    }
  };

  const handleCreatePayout = async () => {
    if (selectedOrders.length === 0) {
      alert("Please select at least one order");
      return;
    }

    const bakeryId = completedOrders.find(
      (o) => o._id === selectedOrders[0]
    )?.bakeryId?._id || completedOrders.find(
      (o) => o._id === selectedOrders[0]
    )?.bakeryId;

    if (!bakeryId) {
      alert("Invalid bakery");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/payouts",
        {
          bakeryId,
          orderIds: selectedOrders,
          platformFee: Number(platformFee) || 0,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Payout created successfully");
      setShowCreateModal(false);
      setSelectedOrders([]);
      setPlatformFee(0);
      loadCompletedOrders();
      loadPayouts();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create payout");
    }
  };

  const handleProcessPayout = async () => {
    if (!selectedPayout) return;

    if (!paymentDetails.accountNumber || !paymentDetails.ifscCode) {
      alert("Please fill in payment details");
      return;
    }

    try {
      await axios.put(
        `http://localhost:5000/api/payouts/${selectedPayout._id}/process`,
        {
          paymentMethod: "bank_transfer",
          paymentDetails,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Payout processed successfully");
      setShowProcessModal(false);
      setSelectedPayout(null);
      setPaymentDetails({
        accountNumber: "",
        ifscCode: "",
        upiId: "",
        bankName: "",
      });
      loadPayouts();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to process payout");
    }
  };

  // Group orders by bakery
  const ordersByBakery = {};
  completedOrders.forEach((order) => {
    if (!order.hasPayout) {
      const bakeryId = order.bakeryId?._id || order.bakeryId || "unknown";
      if (!ordersByBakery[bakeryId]) {
        ordersByBakery[bakeryId] = {
          bakery: order.bakeryId,
          orders: [],
          total: 0,
        };
      }
      ordersByBakery[bakeryId].orders.push(order);
      ordersByBakery[bakeryId].total += order.total || 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Payout Management</h2>
          <p className="text-sm text-gray-500 mt-1">
            Process payments to bakery owners after orders are completed
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSection("orders")}
            className={`px-4 py-2 rounded-lg transition ${
              section === "orders"
                ? "bg-pink-600 text-white"
                : "bg-white border hover:bg-gray-50"
            }`}
          >
            Completed Orders
          </button>
          <button
            onClick={() => setSection("payouts")}
            className={`px-4 py-2 rounded-lg transition ${
              section === "payouts"
                ? "bg-pink-600 text-white"
                : "bg-white border hover:bg-gray-50"
            }`}
          >
            All Payouts ({payouts.length})
          </button>
        </div>
      </div>

      {section === "orders" && (
        <div>
          <h3 className="text-xl font-semibold mb-4">
            Orders Ready for Payout
          </h3>
          {Object.keys(ordersByBakery).length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border text-center text-gray-500">
              No completed orders ready for payout
            </div>
          ) : (
            <div className="space-y-6">
              {Object.values(ordersByBakery).map((group) => (
                <div
                  key={group.bakery?._id || group.bakery}
                  className="bg-white p-6 rounded-2xl border shadow-sm"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-semibold">
                        {group.bakery?.name || "Unknown Bakery"}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {group.orders.length} orders • Total: ₹{group.total.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedOrders(group.orders.map((o) => o._id));
                        setShowCreateModal(true);
                      }}
                      className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
                    >
                      Create Payout
                    </button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {group.orders.map((order) => (
                      <div
                        key={order._id}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <span className="font-medium">
                            Order #{order._id.slice(-6)}
                          </span>
                          <span className="text-sm text-gray-500 ml-2">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <span className="font-semibold">₹{order.total?.toFixed(2) || "0.00"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {section === "payouts" && (
        <div>
          <h3 className="text-xl font-semibold mb-4">All Payouts</h3>
          {payouts.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border text-center text-gray-500">
              No payouts yet
            </div>
          ) : (
            <div className="space-y-4">
              {payouts.map((payout) => (
                <div
                  key={payout._id}
                  className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-semibold">
                        {payout.bakeryId?.name || "Unknown Bakery"}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Owner: {payout.ownerId?.name} ({payout.ownerId?.email})
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {payout.orderIds?.length || 0} orders
                      </p>
                      {payout.processedAt && (
                        <p className="text-xs text-gray-400 mt-1">
                          Processed: {new Date(payout.processedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-pink-600">
                        ₹{payout.payoutAmount?.toFixed(2) || "0.00"}
                      </div>
                      <div className="text-sm text-gray-500">
                        Total: ₹{payout.totalAmount?.toFixed(2) || "0.00"} • Fee: ₹{payout.platformFee?.toFixed(2) || "0.00"}
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
                  {payout.status === "pending" && (
                    <button
                      onClick={() => {
                        setSelectedPayout(payout);
                        setShowProcessModal(true);
                      }}
                      className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      Process Payout
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Payout Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Create Payout</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Platform Fee (₹)
                </label>
                <input
                  type="number"
                  value={platformFee}
                  onChange={(e) => setPlatformFee(e.target.value)}
                  className="w-full border rounded-lg p-2"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                Selected Orders: {selectedOrders.length}
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setPlatformFee(0);
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePayout}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Process Payout Modal */}
      {showProcessModal && selectedPayout && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Process Payout</h3>
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium">Payout Amount</p>
                <p className="text-2xl font-bold text-pink-600">
                  ₹{selectedPayout.payoutAmount?.toFixed(2) || "0.00"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Account Number *
                </label>
                <input
                  type="text"
                  value={paymentDetails.accountNumber}
                  onChange={(e) =>
                    setPaymentDetails({
                      ...paymentDetails,
                      accountNumber: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  IFSC Code *
                </label>
                <input
                  type="text"
                  value={paymentDetails.ifscCode}
                  onChange={(e) =>
                    setPaymentDetails({
                      ...paymentDetails,
                      ifscCode: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={paymentDetails.bankName}
                  onChange={(e) =>
                    setPaymentDetails({
                      ...paymentDetails,
                      bankName: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  UPI ID (Optional)
                </label>
                <input
                  type="text"
                  value={paymentDetails.upiId}
                  onChange={(e) =>
                    setPaymentDetails({
                      ...paymentDetails,
                      upiId: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg p-2"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowProcessModal(false);
                  setSelectedPayout(null);
                  setPaymentDetails({
                    accountNumber: "",
                    ifscCode: "",
                    upiId: "",
                    bankName: "",
                  });
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessPayout}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Process
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

