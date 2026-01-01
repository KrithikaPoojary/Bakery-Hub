import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function Login() {
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [remember, setRemember] = useState(false);
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

    const savedEmail = localStorage.getItem("remember_email");
    const savedRole = localStorage.getItem("remember_role");

    if (savedEmail) setEmail(savedEmail);
    if (savedRole) setRole(savedRole);
  }, [location]);

  const handleEmail = (value) => {
    setEmail(value);
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailError(pattern.test(value) ? "" : "Enter a valid email address");
  };

  const handlePassword = (value) => {
    setPassword(value);
    setPasswordError(
      value.length < 6 ? "Password must be at least 6 characters" : ""
    );
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

      localStorage.clear();
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("name", res.data.name);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      if (remember) {
        localStorage.setItem("remember_email", email);
        localStorage.setItem("remember_role", role);
      } else {
        localStorage.removeItem("remember_email");
        localStorage.removeItem("remember_role");
      }

      if (role === "admin") navigate("/admin");
      else if (role === "owner") {
        res.data.bakeryStatus === "approved"
          ? navigate("/owner")
          : navigate("/owner/pending");
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
    <div className="min-h-screen flex items-center justify-center bg-transparent px-4">
      <div
        className="w-full max-w-md
                   bg-gray-900/85 backdrop-blur-md
                   border border-white/10
                   rounded-2xl shadow-2xl
                   px-8 py-10 text-white"
      >
        {/* TITLE */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold">
            Login as {role.toUpperCase()}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Welcome back! Please enter your credentials.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-4 text-sm text-red-400 bg-red-900/30 border border-red-700/40 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* EMAIL */}
          <div>
            <label className="text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              type="email"
              className="w-full mt-1 px-3 py-2 rounded-lg
                         bg-gray-800 border border-gray-700
                         text-white placeholder-gray-400
                         focus:ring-2 focus:ring-purple-500 outline-none"
              value={email}
              onChange={(e) => handleEmail(e.target.value)}
            />
            {emailError && (
              <p className="text-xs text-red-400 mt-1">{emailError}</p>
            )}
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-sm font-medium text-gray-300">
              Password
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-3 py-2 rounded-lg
                           bg-gray-800 border border-gray-700
                           text-white placeholder-gray-400
                           focus:ring-2 focus:ring-purple-500 outline-none"
                value={password}
                onChange={(e) => handlePassword(e.target.value)}
              />
              <span
                className="absolute right-3 top-2.5 cursor-pointer text-gray-400 hover:text-purple-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
            {passwordError && (
              <p className="text-xs text-red-400 mt-1">{passwordError}</p>
            )}
          </div>

          {/* REMEMBER ME */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={remember}
              onChange={() => setRemember(!remember)}
              className="accent-purple-500"
            />
            <label className="text-sm text-gray-300">
              Remember me
            </label>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600
                       text-white py-2.5 rounded-lg font-semibold
                       flex items-center justify-center gap-2
                       hover:from-purple-700 hover:to-pink-700
                       transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Signing in…
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* FOOTER */}
        {role !== "admin" && (
          <p className="text-xs text-center text-gray-400 mt-6">
            Don’t have an account?{" "}
            <Link
              to={`/register?role=${role}`}
              className="text-purple-400 hover:underline"
            >
              Register
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
