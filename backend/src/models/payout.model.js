import mongoose from "mongoose";

const payoutSchema = new mongoose.Schema(
  {
    bakeryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bakery",
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    totalAmount: {
      type: Number,
      required: true, // Total from completed orders
    },
    platformFee: {
      type: Number,
      default: 0, // Platform service fee (optional)
    },
    payoutAmount: {
      type: Number,
      required: true, // totalAmount - platformFee
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["bank_transfer", "upi", "other"],
      default: "bank_transfer",
    },
    paymentDetails: {
      accountNumber: String,
      ifscCode: String,
      upiId: String,
      bankName: String,
    },
    processedAt: Date,
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Admin who processed it
    },
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.model("Payout", payoutSchema);

