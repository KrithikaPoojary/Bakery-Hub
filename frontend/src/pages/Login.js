import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function Login() {
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Remember Me
  const [remember, setRemember] = useState(false);

  // Validation States
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Detect role from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const r = params.get("role");

    if (r === "customer" || r === "owner" || r === "admin") {
      setRole(r);
    } else {
      setRole("customer");
    }

    // Auto-fill if Remember Me was used
    const savedEmail = localStorage.getItem("remember_email");
    const savedRole = localStorage.getItem("remember_role");

    if (savedEmail) setEmail(savedEmail);
    if (savedRole) setRole(savedRole);
  }, [location]);

  // Email Validation
  const handleEmail = (value) => {
    setEmail(value);

    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!pattern.test(value)) {
      setEmailError("Enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  // Password Validation
  const handlePassword = (value) => {
    setPassword(value);

    if (value.length < 6) {
      setPasswordError("Password must be at least 6 characters");
    } else {
      setPasswordError("");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("All fields are required");
      return;
    }

    if (emailError || passwordError) {
      setError("Fix all errors before submitting");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
        role,
      });

      // Clear storage & save new data
      localStorage.clear();
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("name", res.data.name);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Save Remember Me
      if (remember) {
        localStorage.setItem("remember_email", email);
        localStorage.setItem("remember_role", role);
      } else {
        localStorage.removeItem("remember_email");
        localStorage.removeItem("remember_role");
      }

      // Redirection Logic
      if (role === "admin") {
        navigate("/admin");
      } else if (role === "owner") {
        if (res.data.bakeryStatus === "approved") navigate("/owner");
        else navigate("/owner/pending");
      } else {
        navigate("/customer");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-pink-50 to-slate-100">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm border rounded-2xl shadow-md px-8 py-10">
        {/* TITLE */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Login as {role.toUpperCase()}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome back! Please enter your credentials.
          </p>
        </div>

        {/* ERROR BOX */}
        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 animate-fadeIn">
            {error}
          </div>
        )}

        {/* LOGIN FORM */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* EMAIL */}
          <div className="transition-all duration-300">
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-400 text-sm transition-all"
              value={email}
              onChange={(e) => handleEmail(e.target.value)}
            />
            {emailError && (
              <p className="text-xs text-red-600 mt-1">{emailError}</p>
            )}
          </div>

          {/* PASSWORD */}
          <div className="transition-all duration-300">
            <label className="text-sm font-medium text-slate-700">
              Password
            </label>

            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-400 text-sm transition-all"
                value={password}
                onChange={(e) => handlePassword(e.target.value)}
              />
              <span
                className="absolute right-3 top-2.5 cursor-pointer text-slate-500 hover:text-pink-600 transition"
                onClick={() => setShowPassword(!showPassword)}
              >
                {/* Password Animation */}
                {showPassword ? (
                  <EyeOff size={18} className="animate-fadeIn" />
                ) : (
                  <Eye size={18} className="animate-fadeIn" />
                )}
              </span>
            </div>

            {passwordError && (
              <p className="text-xs text-red-600 mt-1">{passwordError}</p>
            )}

            {/* FORGOT PASSWORD */}
            {role !== "admin" && (
              <p className="text-xs text-right mt-1">
                <span
                  className="text-pink-600 cursor-pointer hover:underline"
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot Password?
                </span>
              </p>
            )}
          </div>

          {/* REMEMBER ME */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={remember}
              onChange={() => setRemember(!remember)}
              className="w-4 h-4 accent-pink-600 cursor-pointer"
            />
            <label className="text-sm text-slate-700 cursor-pointer">
              Remember me
            </label>
          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-600 text-white py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-pink-700 transition shadow disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* FOOTER */}
        {role !== "admin" && (
          <p className="text-xs text-center text-slate-500 mt-6">
            Don’t have an account?{" "}
            <Link
              to={`/register?role=${role}`}
              className="text-pink-600 font-medium hover:underline"
            >
              Register
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
