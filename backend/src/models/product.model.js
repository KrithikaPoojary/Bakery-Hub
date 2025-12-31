import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    bakeryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bakery",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      required: true,
    },

    imageUrl: {
      type: String,
      default: "",
    },

    isSoldOut: {
      type: Boolean,
      default: false,
    },

    // ⭐ NEW FIELD – hide unavailable items from customers
    isVisible: {
      type: Boolean,
      default: true, // Products are visible by default
    },

    // ⭐ NEW FIELD – required for category filtering
    category: {
      type: String,
      default: "Uncategorized",
      enum: [
        "Cakes",
        "Pastries",
        "Breads",
        "Cookies",
        "Snacks",
        "Beverages",
        "Uncategorized",
      ],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
