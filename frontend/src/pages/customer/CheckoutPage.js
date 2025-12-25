import React, { useState } from "react";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";

import { MapPin, Phone, CreditCard, Wallet, AlertCircle } from "lucide-react";

import PaymentPopup from "../../components/PaymentPopup";

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState({});
  const [showPayment, setShowPayment] = useState(false);

  // TOTALS
  const subtotal = cart.reduce((t, i) => t + i.price * i.qty, 0);
  const deliveryCharge = subtotal > 300 ? 0 : 29;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryCharge + tax;

  // -----------------------
  // VALIDATION
  // -----------------------
  const validate = () => {
    const e = {};

    if (address.trim().length < 10) {
      e.address = "Please enter full valid address";
    }
    if (!/^[6-9]\d{9}$/.test(phone)) {
      e.phone = "Enter valid 10-digit phone number";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // -----------------------
  // COD ORDER
  // -----------------------
  const placeCOD = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/orders",
        {
          items: cart.map((i) => ({
            ...i,
            bakeryId: i.bakeryId,
          })),
          total,
          address,
          phone,
          note,
          paymentMethod: "cod",
          paymentStatus: "pending",
          paidAmount: 0,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      clearCart();
      navigate("/success");
    } catch (err) {
      alert(JSON.stringify(err.response?.data || err.message));
    }
  };

  // -----------------------
  // ONLINE PAYMENT ORDER
  // -----------------------
  const placeOnlineOrder = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/orders",
        {
          items: cart.map((i) => ({
            ...i,
            bakeryId: i.bakeryId,
          })),
          total,
          address, // FIXED — always included
          phone, // FIXED — always included
          note,
          paymentMethod: "online",
          paymentStatus: "paid",
          paidAmount: total,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      clearCart();
      navigate("/success");
    } catch (err) {
      alert(JSON.stringify(err.response?.data || err.message));
    }
  };

  // -----------------------
  // PLACE ORDER HANDLER
  // -----------------------
 const handlePlaceOrder = () => {
  // Validate FIRST
  if (!validate()) return;

  // Then choose method
  if (paymentMethod === "online") {
    setShowPayment(true);
    return;
  }

  // Otherwise COD
  placeCOD();
};


  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white py-10 px-4 animate-fadeIn">
      {/* Progress Indicator */}
      <div className="max-w-4xl mx-auto flex justify-between mb-10">
        {["Cart", "Address", "Payment"].map((label, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-pink-600 text-white font-bold">
              {i + 1}
            </div>
            <p className="mt-2 text-sm text-gray-700">{label}</p>
          </div>
        ))}
      </div>

      {/* Layout */}
      <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-10">
        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-8">
          {/* Address */}
          <div className="bg-white p-7 rounded-2xl shadow-lg border border-pink-100">
            <h2 className="flex items-center gap-3 text-xl font-semibold mb-4">
              <MapPin className="text-pink-600" /> Delivery Address
            </h2>

            <textarea
              className={`w-full p-4 h-28 rounded-xl border text-gray-700 focus:ring-2 
                ${
                  errors.address
                    ? "border-red-400 focus:ring-red-300"
                    : "border-gray-300 focus:ring-pink-300"
                }`}
              placeholder="Flat / House No, Building, Area, Landmark..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            {errors.address && (
              <p className="text-red-500 flex items-center gap-1 text-sm mt-2">
                <AlertCircle size={16} /> {errors.address}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="bg-white p-7 rounded-2xl shadow-lg border border-pink-100">
            <h2 className="flex items-center gap-3 text-xl font-semibold mb-4">
              <Phone className="text-pink-600" /> Contact Number
            </h2>

            <input
              type="tel"
              maxLength={10}
              className={`w-full p-4 rounded-xl border text-gray-700 shadow-sm focus:ring-2
                ${
                  errors.phone
                    ? "border-red-400 focus:ring-red-300"
                    : "border-gray-300 focus:ring-pink-300"
                }`}
              placeholder="Enter 10-digit phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            {errors.phone && (
              <p className="text-red-500 flex items-center gap-1 text-sm mt-2">
                <AlertCircle size={16} /> {errors.phone}
              </p>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white p-7 rounded-2xl shadow-lg border border-pink-100">
            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>

            <div className="space-y-4">
              {/* COD */}
              <label
                className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer 
                ${
                  paymentMethod === "cod"
                    ? "border-pink-400 bg-pink-50"
                    : "border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                />
                <span className="flex items-center gap-2">
                  <Wallet className="text-pink-600" />
                  Cash on Delivery
                </span>
              </label>

              {/* Online Payment */}
              <label
                className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer 
                ${
                  paymentMethod === "online"
                    ? "border-pink-400 bg-pink-50"
                    : "border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "online"}
                  onChange={() => setPaymentMethod("online")}
                />
                <span className="flex items-center gap-2">
                  <CreditCard className="text-pink-600" />
                  Fake Online Payment
                </span>
              </label>
            </div>
          </div>

          {/* Note */}
          <div className="bg-white p-7 rounded-2xl shadow-lg border border-pink-100">
            <h2 className="text-xl font-semibold mb-3">Note for Bakery</h2>
            <textarea
              className="w-full p-4 h-24 rounded-xl border-gray-300 border text-gray-700 shadow-sm focus:ring-2 focus:ring-pink-300"
              placeholder="Any special instructions?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        {/* RIGHT SUMMARY */}
        <div className="bg-white p-7 rounded-3xl shadow-xl border border-pink-100 h-fit sticky top-10">
          <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

          <div className="max-h-60 overflow-y-auto pr-2 mb-4 space-y-3">
            {cart.map((item) => (
              <div
                key={item._id}
                className="flex justify-between text-gray-700"
              >
                <span>
                  {item.name} × {item.qty}
                </span>
                <span>₹{item.qty * item.price}</span>
              </div>
            ))}
          </div>

          <hr className="my-4" />

          <div className="space-y-2 text-gray-700">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>
                {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>GST (5%)</span>
              <span>₹{tax}</span>
            </div>

            <hr className="my-2" />

            <div className="flex justify-between text-xl font-bold">
              <span>Total</span>
              <span className="text-pink-600">₹{total}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            className="mt-6 w-full py-4 text-lg font-semibold text-white rounded-xl bg-pink-600 hover:bg-pink-700 transition"
          >
            Place Order →
          </button>
        </div>
      </div>

      {/* PAYMENT POPUP WITH ADDRESS + PHONE PASSED IN */}
      {showPayment && (
        <PaymentPopup
          amount={total}
          address={address}
          phone={phone}
          note={note}
          onConfirm={async () => {
            setShowPayment(false);
            await placeOnlineOrder();
          }}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  );
}
