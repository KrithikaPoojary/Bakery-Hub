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

  // Loading states
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

  // Backend duplicate checks
  const checkExistingEmail = async (email) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/check-email",
        { email }
      );
      return res.data.exists;
    } catch {
      return false;
    }
  };

  const checkExistingPhone = async (phone) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/check-phone",
        { phone }
      );
      return res.data.exists;
    } catch {
      return false;
    }
  };

  // ================= SEND OTP =================
  const handleSendOtp = async () => {
    setOtpError("");
    setOtpMessage("");
    setOtp("");
    setOtpVerified(false);

    if (!email.trim()) {
      setErrors((prev) => ({ ...prev, email: "Email is required" }));
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
      const msg = err.response?.data?.error || "Failed to send OTP";
      setOtpError(msg);
      setOtpSent(false); // ensure OTP section stays hidden
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
      const msg = err.response?.data?.error || "Invalid OTP";
      setOtpError(msg);
    } finally {
      setOtpVerifying(false);
    }
  };

  // ================= VALIDATION =================
  const validateFields = async () => {
    let temp = {};

    // Name
    if (!name.trim()) temp.name = "Full name is required";

    // Email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) temp.email = "Email is required";
    else if (!emailPattern.test(email)) temp.email = "Enter a valid email";
    else if (await checkExistingEmail(email))
      temp.email = "Email is already registered";

    // Phone
    const phonePattern = /^[6-9]\d{9}$/;
    if (!phone.trim()) temp.phone = "Phone number is required";
    else if (!phonePattern.test(phone))
      temp.phone = "Enter a valid 10-digit phone number";
    else if (await checkExistingPhone(phone))
      temp.phone = "Phone already registered";

    // Strong password
    const strongPass = /^(?=.*[0-9])(?=.*[!@#$%^&*]).{6,}$/;
    if (!password.trim()) temp.password = "Password is required";
    else if (!strongPass.test(password))
      temp.password = "Password must include a number and special character";

    if (role === "owner") {
      if (!bakeryName.trim()) temp.bakeryName = "Bakery name required";
      if (!address.trim()) temp.address = "Address required";
    }

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  // ================= REGISTER =================
  const handleRegister = async (e) => {
    e.preventDefault();
    setGeneralError("");

    if (!otpVerified) {
      setGeneralError("Please verify your email with OTP before registering.");
      return;
    }

    const isValid = await validateFields();
    if (!isValid) return;

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-pink-50 to-slate-100">
      <div className="w-full max-w-lg bg-white border rounded-2xl shadow-lg px-8 py-10">
        <h1 className="text-2xl font-bold text-center mb-6">
          Register as {role === "customer" ? "Customer" : "Bakery Owner"}
        </h1>

        {generalError && (
          <p className="text-red-600 text-center mb-4">{generalError}</p>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* FULL NAME */}
          <div>
            <label className="text-sm font-medium">Full Name</label>
            <input
              type="text"
              className="w-full mt-1 px-3 py-2 border rounded-lg"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="text-red-600 text-xs">{errors.name}</p>
            )}
          </div>

          {/* EMAIL + SEND OTP */}
          <div>
            <label className="text-sm font-medium">Email</label>
            <div className="flex gap-2 mt-1">
              <input
                type="email"
                className="w-full px-3 py-2 border rounded-lg"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setOtpSent(false);
                  setOtpVerified(false);
                  setOtp("");
                  setOtpError("");
                }}
                placeholder="you@example.com"
              />

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={otpSending}
                className="px-3 py-2 bg-pink-600 text-white rounded-lg text-sm"
              >
                {otpSending ? "Sending..." : "Send OTP"}
              </button>
            </div>

            {/* EMAIL ERRORS */}
            {errors.email && (
              <p className="text-xs text-red-600">{errors.email}</p>
            )}

            {/* NEW: SHOW OTP ERRORS HERE OUTSIDE OTP BOX */}
            {otpError && (
              <p className="text-xs text-red-600 mt-1">{otpError}</p>
            )}

            {/* OTP INPUT */}
            {otpSent && (
              <div className="mt-3">
                <label className="text-xs font-medium">Enter OTP</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="6-digit OTP"
                  />

                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={otpVerifying}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm"
                  >
                    {otpVerifying ? "Verifying..." : "Verify"}
                  </button>
                </div>

                {otpMessage && (
                  <p className="text-green-600 text-xs">{otpMessage}</p>
                )}
                {otpError && <p className="text-red-600 text-xs">{otpError}</p>}
              </div>
            )}
          </div>

          {/* PHONE */}
          <div>
            <label className="text-sm font-medium">Phone Number</label>
            <input
              type="text"
              className="w-full mt-1 px-3 py-2 border rounded-lg"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9876543210"
            />
            {errors.phone && (
              <p className="text-xs text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-sm font-medium">Password</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-3 py-2 border rounded-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
              />

              <span
                className="absolute right-3 top-3 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
            {errors.password && (
              <p className="text-xs text-red-600">{errors.password}</p>
            )}
          </div>

          {/* OWNER FIELDS */}
          {role === "owner" && (
            <>
              <div>
                <label className="text-sm font-medium">Bakery Name</label>
                <input
                  type="text"
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                  value={bakeryName}
                  onChange={(e) => setBakeryName(e.target.value)}
                  placeholder="Sweet Treats Bakery"
                />
                {errors.bakeryName && (
                  <p className="text-xs text-red-600">{errors.bakeryName}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Bakery Address</label>
                <textarea
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  placeholder="Full bakery address"
                />
                {errors.address && (
                  <p className="text-xs text-red-600">{errors.address}</p>
                )}
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-600 text-white py-2.5 rounded-lg text-sm font-semibold"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-xs text-center mt-6">
          Already have an account?{" "}
          <span
            className="text-pink-600 cursor-pointer underline"
            onClick={() => navigate(`/login?role=${role}`)}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
