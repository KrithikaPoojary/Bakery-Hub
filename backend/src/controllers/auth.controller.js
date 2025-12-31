import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import PasswordResetToken from "../models/passwordResetToken.model.js";
import { sendMail } from "../utils/mailer.js";
import Bakery from "../models/bakery.model.js";
import EmailOtp from "../models/emailOtp.model.js";


// ------------------ REGISTER CUSTOMER ------------------
export const registerCustomer = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already exists" });

        const otpRecord = await EmailOtp.findOne({ email });
    if (!otpRecord || !otpRecord.isVerified || otpRecord.expiresAt < new Date()) {
      return res
        .status(400)
        .json({ error: "Please verify your email with OTP before registering." });
    }


    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: "customer",
    });

        await EmailOtp.deleteOne({ email });


    res.json({ message: "Customer registered successfully", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ------------------ REGISTER OWNER ------------------
export const registerOwner = async (req, res) => {
  try {
    const { name, email, password, phone, bakeryName, address } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already exists" });

        const otpRecord = await EmailOtp.findOne({ email });
    if (!otpRecord || !otpRecord.isVerified || otpRecord.expiresAt < new Date()) {
      return res
        .status(400)
        .json({ error: "Please verify your email with OTP before registering." });
    }


    // Create owner user with phone
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: "owner",
    });

    // Create bakery with actual values
    await Bakery.create({
      name: bakeryName || `${name}'s Bakery`,
      address: address || "",
      phone: phone || "",
      ownerId: user._id,
      status: "pending",
    });

        await EmailOtp.deleteOne({ email });


    res.json({
      message: "Owner registered successfully. Bakery pending approval.",
      user,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------ REGISTER ADMIN ------------------
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already exists" });

    const user = await User.create({
      name,
      email,
      password,
      role: "admin",
    });

    res.json({ message: "Admin registered successfully", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------ LOGIN (STRICT ROLE VALIDATION) ------------------
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!role) {
      return res.status(400).json({ error: "Role is required" });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) return res.status(404).json({ error: "User not found" });

    // ❗ Block wrong role login
    if (user.role !== role) {
      return res.status(403).json({
        error: `This account is registered as a ${user.role.toUpperCase()}, not ${role.toUpperCase()}`,
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES }
    );

    // Get bakery status if owner
    let bakeryStatus = null;
    if (user.role === "owner") {
      const bakery = await Bakery.findOne({ ownerId: user._id });
      bakeryStatus = bakery?.status ?? "pending";
    }

    res.json({
      message: "Login success",
      token,
      role: user.role,
      bakeryStatus,
      name: user.name,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------ SEND REGISTER OTP ------------------
export const sendRegisterOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    // If user already exists, no OTP
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 5); // 5 minutes

    await EmailOtp.findOneAndUpdate(
      { email },
      { otpHash, expiresAt, isVerified: false },
      { upsert: true, new: true }
    );

    const html = `
      <p>Your BakeHub email verification code is:</p>
      <h2>${otp}</h2>
      <p>This code will expire in 5 minutes.</p>
    `;

    await sendMail({
      to: email,
      subject: "BakeHub — Email verification code",
      html,
    });

    res.json({ message: "OTP sent to your email." });
  } catch (err) {
    console.error("sendRegisterOtp:", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

// ------------------ VERIFY REGISTER OTP ------------------
export const verifyRegisterOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const record = await EmailOtp.findOne({ email });
    if (!record) {
      return res
        .status(400)
        .json({ error: "OTP not found. Please request a new one." });
    }

    if (record.expiresAt < new Date()) {
      return res.status(400).json({ error: "OTP expired. Please request again." });
    }

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    if (otpHash !== record.otpHash) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    record.isVerified = true;
    await record.save();

    res.json({ message: "OTP verified successfully.", verified: true });
  } catch (err) {
    console.error("verifyRegisterOtp:", err);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
};


// ------------------ FORGOT PASSWORD ------------------
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        message: "If that email exists, a reset link has been sent.",
      });
    }

    const { token, tokenHash } = PasswordResetToken.createTokenPair();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

    await PasswordResetToken.findOneAndUpdate(
      { userId: user._id },
      { tokenHash, expiresAt },
      { upsert: true, new: true }
    );

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    const html = `
      <p>Hello ${user.name || ""},</p>
      <p>Click the link below to reset your password (valid 1 hour):</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
    `;

    await sendMail({
      to: user.email,
      subject: "BakeHub — Reset your Password",
      html,
    });

    res.json({
      message: "If that email exists, a reset link has been sent.",
    });
  } catch (err) {
    console.error("forgotPassword:", err);
    res.status(500).json({ error: err.message });
  }
};

// ------------------ RESET PASSWORD ------------------
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password)
      return res.status(400).json({ error: "Token and password required" });

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const record = await PasswordResetToken.findOne({ tokenHash });

    if (!record || record.expiresAt < new Date())
      return res.status(400).json({ error: "Token invalid or expired" });

    const user = await User.findById(record.userId).select("+password");
    if (!user) return res.status(404).json({ error: "User not found" });

    user.password = password;
    await user.save();

    await PasswordResetToken.deleteOne({ _id: record._id });

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("resetPassword:", err);
    res.status(500).json({ error: err.message });
  }
};

// ------------------ ADMIN: GET ALL USERS ------------------
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    return res.json({ exists: !!user });
  } catch (error) {
    return res.status(500).json({ error: "Server error while checking email" });
  }
};

export const checkPhone = async (req, res) => {
  try {
    const { phone } = req.body;
    const user = await User.findOne({ phone });

    return res.json({ exists: !!user });
  } catch (error) {
    return res.status(500).json({ error: "Server error while checking phone" });
  }
};
