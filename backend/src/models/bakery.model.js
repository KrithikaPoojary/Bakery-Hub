import mongoose from "mongoose";

const bakerySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    description: String,
    status: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending",
    },
    imageUrl: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1542831371-d531d36971e6?auto=format&fit=crop&w=800&q=80",
    },

    // ⭐ ADD THESE
    lat: { type: Number },
    lng: { type: Number },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);


export default mongoose.model("Bakery", bakerySchema);
