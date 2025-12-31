import mongoose from "mongoose";
import crypto from "crypto";

const passwordResetTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// static helper to create a token string (not stored): returns { token, tokenHash }
passwordResetTokenSchema.statics.createTokenPair = function () {
  const token = crypto.randomBytes(32).toString("hex"); // raw token to send in email
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  return { token, tokenHash };
};

export default mongoose.model("PasswordResetToken", passwordResetTokenSchema);
