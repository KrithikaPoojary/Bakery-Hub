import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

export default function Register() {
  const location = useLocation();
  const navigate = useNavigate();

  const [role, setRole] = useState("customer");

  // Common Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // Owner Fields
  const [bakeryName, setBakeryName] = useState("");
  const [address, setAddress] = useState("");

  // Validation
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");

  // UI states
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // OTP States
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const [otpError, setOtpError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const r = params.get("role");
    if (r === "customer" || r === "owner") setRole(r);
  }, [location]);

  // ================= SEND OTP =================
  const handleSendOtp = async () => {
    setOtpError("");
    setOtpMessage("");
    setOtp("");
    setOtpVerified(false);

    if (!email.trim()) {
      setErrors((p) => ({ ...p, email: "Email is required" }));
      return;
    }

    try {
      setOtpSending(true);
      const res = await axios.post(
        "http://localhost:5000/api/auth/send-register-otp",
        { email }
      );
      setOtpSent(true);
      setOtpMessage(res.data.message);
    } catch (err) {
      setOtpError(err.response?.data?.error || "Failed to send OTP");
      setOtpSent(false);
    } finally {
      setOtpSending(false);
    }
  };

  // ================= VERIFY OTP =================
  const handleVerifyOtp = async () => {
    setOtpError("");
    setOtpMessage("");

    if (!otp.trim()) {
      setOtpError("Please enter OTP");
      return;
    }

    try {
      setOtpVerifying(true);
      const res = await axios.post(
        "http://localhost:5000/api/auth/verify-register-otp",
        { email, otp }
      );
      if (res.data.verified) {
        setOtpVerified(true);
        setOtpMessage("Email verified successfully!");
      }
    } catch (err) {
      setOtpError(err.response?.data?.error || "Invalid OTP");
    } finally {
      setOtpVerifying(false);
    }
  };

  // ================= REGISTER =================
  const handleRegister = async (e) => {
    e.preventDefault();
    setGeneralError("");

    if (!otpVerified) {
      setGeneralError("Please verify your email with OTP before registering.");
      return;
    }

    try {
      setLoading(true);

      const payload =
        role === "customer"
          ? { name, email, phone, password }
          : { name, email, phone, password, bakeryName, address };

      const endpoint =
        role === "customer"
          ? "http://localhost:5000/api/auth/register-customer"
          : "http://localhost:5000/api/auth/register-owner";

      await axios.post(endpoint, payload);
      navigate(`/login?role=${role}`);
    } catch (err) {
      setGeneralError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    // ✅ SAME GLOBAL BACKGROUND AS LOGIN
    <div className="min-h-screen flex items-center justify-center bg-transparent px-4">
      {/* ✅ DARK GLASS CARD */}
      <div
        className="w-full max-w-lg
                   bg-gray-900/85 backdrop-blur-md
                   border border-white/10
                   rounded-2xl shadow-2xl
                   px-8 py-10 text-white"
      >
        <h1 className="text-3xl font-extrabold text-center mb-6">
          Register as {role === "customer" ? "Customer" : "Bakery Owner"}
        </h1>

        {generalError && (
          <p className="text-red-400 text-center mb-4">{generalError}</p>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* NAME */}
          <input
            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 placeholder-gray-400"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* EMAIL + OTP */}
          <div>
            <div className="flex gap-2">
              <input
                className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 placeholder-gray-400"
                placeholder="Email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setOtpSent(false);
                  setOtpVerified(false);
                }}
              />
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={otpSending}
                className="px-4 rounded-lg bg-pink-600 hover:bg-pink-700"
              >
                {otpSending ? "Sending…" : "Send OTP"}
              </button>
            </div>

            {otpSent && (
              <div className="flex gap-2 mt-2">
                <input
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  className="px-4 rounded-lg bg-green-600 hover:bg-green-700"
                >
                  Verify
                </button>
              </div>
            )}

            {otpMessage && (
              <p className="text-green-400 text-xs mt-1">{otpMessage}</p>
            )}
            {otpError && (
              <p className="text-red-400 text-xs mt-1">{otpError}</p>
            )}
          </div>

          {/* PHONE */}
          <input
            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 placeholder-gray-400"
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          {/* PASSWORD */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 placeholder-gray-400"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="absolute right-3 top-3 cursor-pointer text-gray-400"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>

          {/* OWNER ONLY */}
          {role === "owner" && (
            <>
              <input
                className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 placeholder-gray-400"
                placeholder="Bakery Name"
                value={bakeryName}
                onChange={(e) => setBakeryName(e.target.value)}
              />
              <textarea
                className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 placeholder-gray-400"
                rows={3}
                placeholder="Bakery Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </>
          )}

          <button
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-purple-600 to-pink-600 py-2.5 rounded-lg font-semibold"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-xs text-center text-gray-400 mt-6">
          Already have an account?{" "}
          <span
            onClick={() => navigate(`/login?role=${role}`)}
            className="text-purple-400 cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
