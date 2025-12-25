import React from "react";
import { X, CreditCard, CheckCircle } from "lucide-react";

export default function PaymentPopup({
  amount,
  address,
  phone,
  note,
  onConfirm,
  onClose,
}) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl animate-fadeIn relative">
        <button
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <X size={22} />
        </button>

        <div className="text-center">
          <CreditCard size={50} className="mx-auto text-pink-600" />
          <h2 className="text-2xl font-bold mt-4">Fake Online Payment</h2>

          <div className="mt-5 bg-pink-50 text-pink-700 font-semibold text-lg py-3 rounded-xl shadow-sm">
            Pay ₹{amount}
          </div>

          <div className="text-left text-sm mt-4 text-gray-600">
            <p>
              <b>Address:</b> {address}
            </p>
            <p>
              <b>Phone:</b> {phone}
            </p>
            {note && (
              <p>
                <b>Note:</b> {note}
              </p>
            )}
          </div>

          <div className="flex gap-4 mt-6 justify-center">
            <button
              onClick={onConfirm}
              className="px-5 py-2.5 bg-green-600 text-white rounded-xl shadow hover:bg-green-700 transition flex items-center gap-2"
            >
              <CheckCircle size={18} />
              Pay Now
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-300 rounded-xl shadow hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
