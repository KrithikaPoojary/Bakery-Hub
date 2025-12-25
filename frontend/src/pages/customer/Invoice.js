import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Invoice() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const token = localStorage.getItem("token");

  // ------------------ FETCH ORDER ------------------
  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setOrder(res.data))
      .catch((err) => console.log(err));
  }, [orderId, token]);

  // ------------------ PROFESSIONAL PDF GENERATOR ------------------
  const generatePDF = () => {
    const doc = new jsPDF();

    // ---------------- HEADER ----------------
    doc.setFillColor(255, 230, 240); // light pink header
    doc.rect(0, 0, 210, 30, "F");

    doc.setFontSize(22);
    doc.setTextColor(255, 90, 120);
    doc.text("BakeHub Invoice", 14, 20);

    // ---------------- ORDER DETAILS ----------------
    doc.setFontSize(14);
    doc.setTextColor(255, 90, 120);
    doc.text("Order Details", 14, 40);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Invoice No: ${order._id}`, 14, 48);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`, 14, 55);

    // ---------------- CUSTOMER DETAILS ----------------
    doc.setFontSize(14);
    doc.setTextColor(255, 90, 120);
    doc.text("Customer Information", 14, 70);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Address: ${order.address}`, 14, 78);
    doc.text(`Phone: ${order.phone}`, 14, 86);

    // ---------------- ITEMS TABLE ----------------
    const itemRows = order.items.map((item) => [
      item.name,
      item.qty,
      `₹${item.price}`,
      `₹${item.price * item.qty}`,
    ]);

    autoTable(doc, {
      startY: 100,
      head: [["Item", "Qty", "Price", "Total"]],
      body: itemRows,
      theme: "striped",
      headStyles: {
        fillColor: [255, 90, 120],
        textColor: 255,
        fontSize: 13,
      },
      bodyStyles: {
        fontSize: 11,
      },
    });

    // ---------------- SUMMARY ----------------
    const finalY = doc.lastAutoTable.finalY + 15;

    doc.setFontSize(14);
    doc.setTextColor(255, 90, 120);
    doc.text("Payment Summary", 14, finalY);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Grand Total: ₹${order.total}`, 14, finalY + 10);
    doc.text(`Payment Method: ${order.paymentMethod}`, 14, finalY + 17);
    doc.text(`Payment Status: ${order.paymentStatus}`, 14, finalY + 24);

    // ---------------- FOOTER ----------------
    doc.setFontSize(11);
    doc.setTextColor(120);
    doc.text("Thank you for ordering from BakeHub!", 14, finalY + 40);

    doc.save(`invoice_${order._id}.pdf`);
  };

  // ------------------ LOADING ------------------
  if (!order)
    return (
      <div className="text-center mt-16 text-xl text-pink-600">
        Loading Invoice...
      </div>
    );

  // ------------------ INVOICE UI ------------------
  return (
    <div className="max-w-3xl mx-auto p-8 bg-white shadow-xl mt-10 rounded-2xl border border-pink-200">
      <h1 className="text-3xl font-extrabold text-center text-pink-600 mb-4">
        Invoice
      </h1>
      <hr />

      {/* Invoice Header */}
      <div className="flex justify-between mt-6">
        <div>
          <p className="font-semibold">Invoice No:</p>
          <p>#{order._id.slice(-6)}</p>

          <p className="font-semibold mt-3">Date:</p>
          <p>{new Date(order.createdAt).toLocaleString()}</p>
        </div>

        <div>
          <p className="font-semibold">Customer Address:</p>
          <p>{order.address}</p>
          <p>{order.phone}</p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mt-8 border">
        <thead className="bg-pink-100">
          <tr>
            <th className="p-2 border">Item</th>
            <th className="p-2 border">Qty</th>
            <th className="p-2 border">Price</th>
            <th className="p-2 border">Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, idx) => (
            <tr key={idx}>
              <td className="p-2 border">{item.name}</td>
              <td className="p-2 border text-center">{item.qty}</td>
              <td className="p-2 border">₹{item.price}</td>
              <td className="p-2 border">₹{item.price * item.qty}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div className="text-right mt-6">
        <h3 className="text-xl font-bold text-gray-900">
          Grand Total: <span className="text-pink-600">₹{order.total}</span>
        </h3>

        <p className="mt-2">
          Payment Method:{" "}
          <span className="font-semibold uppercase">{order.paymentMethod}</span>
        </p>

        <p>
          Payment Status:{" "}
          <span
            className={`font-semibold ${
              order.paymentStatus === "paid" ? "text-green-600" : "text-red-600"
            }`}
          >
            {order.paymentStatus}
          </span>
        </p>
      </div>

      {/* Buttons */}
      <button
        onClick={() => window.print()}
        className="mt-6 bg-black text-white px-5 py-2 rounded-lg w-full"
      >
        Print Invoice
      </button>

      <button
        onClick={generatePDF}
        className="mt-3 bg-pink-600 text-white px-5 py-2 rounded-lg w-full"
      >
        Download PDF
      </button>
    </div>
  );
}
