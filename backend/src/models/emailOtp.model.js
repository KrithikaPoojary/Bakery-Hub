import mongoose from "mongoose";

const emailOtpSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otpHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  isVerified: { type: Boolean, default: false },
});

const EmailOtp = mongoose.model("EmailOtp", emailOtpSchema);

export default EmailOtp;
