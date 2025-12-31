import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";

import Invoice from "./pages/customer/Invoice";

// Pages
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import CustomerBrowse from "./pages/customer/CustomerBrowse";

import Settings from "./pages/customer/Settings";
import OwnerPending from "./pages/owner/OwnerPending";

import CustomerMenu from "./pages/customer/CustomerMenu";
import CartPage from "./pages/customer/CartPage";
import CheckoutPage from "./pages/customer/CheckoutPage";
import OrderSuccess from "./pages/customer/OrderSuccess";
import MyOrders from "./pages/customer/MyOrders";
import OrderTracking from "./pages/customer/OrderTracking";

import About from "./pages/About";
import Contact from "./pages/Contact";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import OwnerSettings from "./pages/owner/OwnerSettings";
import AdminSettings from "./pages/admin/AdminSettings";

import MyProfile from "./pages/common/MyProfile";

import { CartProvider } from "./context/CartContext";

export default function App() {
  return (
    <CartProvider>
      <Router>
        <div className="font-[Poppins] bg-gray-900 min-h-screen flex flex-col">
          <Header />

          <main className="flex-1">
            <Routes>
              {/* Home Page */}
              <Route path="/" element={<HomePage />} />

              <Route path="/invoice/:orderId" element={<Invoice />} />

              {/* Auth */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              <Route path="/settings" element={<Settings />} />

              {/* COMMON PROFILE PAGE FOR ALL ROLES */}
              <Route path="/profile" element={<MyProfile />} />
              <Route path="/owner/profile" element={<MyProfile />} />
              <Route path="/admin/profile" element={<MyProfile />} />

              <Route
                path="/reset-password/:token"
                element={<ResetPassword />}
              />

              {/* Basic Pages */}
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />

              {/* Customer */}
              <Route path="/customer" element={<CustomerBrowse />} />
              <Route path="/customer/menu/:id" element={<CustomerMenu />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/success" element={<OrderSuccess />} />
              <Route path="/orders" element={<MyOrders />} />
              <Route path="/track/:orderId" element={<OrderTracking />} />

              <Route path="/owner/settings" element={<OwnerSettings />} />
              <Route path="/admin/settings" element={<AdminSettings />} />

              {/* Owner */}
              <Route path="/owner" element={<OwnerDashboard />} />
              <Route path="/owner/pending" element={<OwnerPending />} />

              {/* Admin */}
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </CartProvider>
  );
}
