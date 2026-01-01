import React from "react";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const { cart, increaseQty, decreaseQty, removeFromCart } = useCart();
  const navigate = useNavigate();

  // Totals
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * (item.qty || 1),
    0
  );
  const deliveryCharge = subtotal > 300 ? 0 : 30;
  const tax = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + deliveryCharge + tax;

  // EMPTY CART
  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent px-6">
        <div className="text-center bg-white p-10 rounded-3xl shadow-xl border border-pink-100 animate-fadeIn">
          <div className="flex justify-center mb-4">
            <ShoppingBag className="w-16 h-16 text-pink-500 opacity-80" />
          </div>
          <h2 className="text-3xl font-bold text-gray-700">
            Your cart is empty
          </h2>
          <p className="mt-3 text-gray-500 text-sm">
            Browse a bakery and add some delicious treats! 🍰
          </p>
        </div>
      </div>
    );
  }

  return (
    // ✅ PAGE BACKGROUND REMOVED
    <div className="min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-10">
        {/* LEFT SIDE */}
        <div className="md:col-span-2 animate-fadeIn">
          <h1 className="text-4xl font-extrabold text-purple-400 mb-6">
            🛒 Your Cart
          </h1>

          <div className="space-y-6">
            {cart.map((item, index) => (
              <div
                key={item._id}
                className="bg-gray-800/90 backdrop-blur p-5 rounded-2xl shadow-lg border border-gray-700
                           flex gap-5 hover:shadow-xl hover:-translate-y-1 transition transform animate-slideUp"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <img
                  src={
                    item.imageUrl
                      ? item.imageUrl.startsWith("http")
                        ? item.imageUrl
                        : `http://localhost:5000${item.imageUrl}`
                      : "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800"
                  }
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-xl border border-gray-700 shadow-sm"
                />

                {/* DETAILS */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      {item.name}
                    </h2>
                    <p className="text-gray-400 text-sm">₹{item.price}</p>
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={() => decreaseQty(item._id)}
                      className="bg-gray-700 text-gray-200 p-2 rounded-full hover:bg-gray-600 transition"
                    >
                      <Minus size={18} />
                    </button>

                    <span className="text-lg font-semibold text-white">
                      {item.qty || 1}
                    </span>

                    <button
                      onClick={() => increaseQty(item._id)}
                      className="bg-pink-500 text-white p-2 rounded-full hover:bg-pink-600 transition shadow"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                {/* PRICE */}
                <div className="flex flex-col justify-between items-end">
                  <p className="text-lg font-bold text-pink-400">
                    ₹{(item.price * (item.qty || 1)).toFixed(2)}
                  </p>

                  <button
                    className="flex items-center gap-1 text-red-400 text-sm hover:text-red-500 transition"
                    onClick={() => removeFromCart(item._id)}
                  >
                    <Trash2 size={16} /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SUMMARY */}
        <div className="bg-white shadow-xl rounded-3xl p-6 border border-pink-100 sticky top-5 h-fit animate-fadeIn">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Bill Summary
          </h2>

          <div className="space-y-3 text-gray-700">
            <div className="flex justify-between text-lg">
              <span>Subtotal</span>
              <span className="font-semibold">₹{subtotal}</span>
            </div>

            <div className="flex justify-between text-lg">
              <span>Delivery</span>
              <span className="font-semibold">
                {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
              </span>
            </div>

            <div className="flex justify-between text-lg">
              <span>GST (5%)</span>
              <span className="font-semibold">₹{tax}</span>
            </div>

            <hr className="my-4" />

            <div className="flex justify-between text-2xl font-extrabold text-gray-900">
              <span>Total</span>
              <span className="text-pink-600">₹{grandTotal}</span>
            </div>
          </div>

          <button
            onClick={() => navigate("/checkout")}
            className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 to-pink-500
                       text-white text-lg font-semibold shadow-lg hover:shadow-2xl transition transform active:scale-95"
          >
            Proceed to Checkout →
          </button>
        </div>
      </div>
    </div>
  );
}
