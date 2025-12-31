import Payout from "../models/payout.model.js";
import Order from "../models/order.model.js";
import Bakery from "../models/bakery.model.js";
import User from "../models/user.model.js";

// ADMIN: Get all pending payouts
export const getPendingPayouts = async (req, res) => {
  try {
    const payouts = await Payout.find({ status: "pending" })
      .populate("bakeryId", "name")
      .populate("ownerId", "name email")
      .populate("orderIds")
      .sort({ createdAt: -1 });

    res.json(payouts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN: Get all payouts (with filters)
export const getAllPayouts = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const payouts = await Payout.find(filter)
      .populate("bakeryId", "name")
      .populate("ownerId", "name email")
      .populate("orderIds")
      .populate("processedBy", "name")
      .sort({ createdAt: -1 });

    res.json(payouts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN: Create payout for completed orders
export const createPayout = async (req, res) => {
  try {
    const { bakeryId, orderIds, platformFee = 0, paymentDetails, notes } =
      req.body;

    // Validate bakery exists
    const bakery = await Bakery.findById(bakeryId);
    if (!bakery) {
      return res.status(404).json({ message: "Bakery not found" });
    }

    // Validate orders exist and are completed
    const orders = await Order.find({
      _id: { $in: orderIds },
      bakeryId,
      status: "completed",
      paymentStatus: "paid",
    });

    if (orders.length !== orderIds.length) {
      return res.status(400).json({
        message: "Some orders are not completed or not paid",
      });
    }

    // Check if orders already have payouts
    const existingPayouts = await Payout.find({
      orderIds: { $in: orderIds },
    });

    if (existingPayouts.length > 0) {
      return res.status(400).json({
        message: "Some orders already have payouts",
      });
    }

    // Calculate totals
    const totalAmount = orders.reduce((sum, order) => sum + order.total, 0);
    const payoutAmount = totalAmount - platformFee;

    // Create payout
    const payout = await Payout.create({
      bakeryId,
      ownerId: bakery.ownerId,
      orderIds,
      totalAmount,
      platformFee,
      payoutAmount,
      paymentDetails,
      notes,
      status: "pending",
    });

    res.status(201).json(payout);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN: Process payout (mark as completed)
export const processPayout = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod, paymentDetails, notes } = req.body;

    const payout = await Payout.findById(id);
    if (!payout) {
      return res.status(404).json({ message: "Payout not found" });
    }

    if (payout.status !== "pending") {
      return res.status(400).json({
        message: "Payout already processed",
      });
    }

    payout.status = "completed";
    payout.processedAt = new Date();
    payout.processedBy = req.user.id;
    if (paymentMethod) payout.paymentMethod = paymentMethod;
    if (paymentDetails) payout.paymentDetails = paymentDetails;
    if (notes) payout.notes = notes;

    await payout.save();

    res.json(payout);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// OWNER: Get my payouts
export const getMyPayouts = async (req, res) => {
  try {
    const bakery = await Bakery.findOne({ ownerId: req.user.id });
    if (!bakery) {
      return res.status(404).json({ message: "Bakery not found" });
    }

    const payouts = await Payout.find({ bakeryId: bakery._id })
      .populate("orderIds")
      .populate("processedBy", "name")
      .sort({ createdAt: -1 });

    res.json(payouts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN: Get completed orders ready for payout (by bakery)
export const getCompletedOrdersForPayout = async (req, res) => {
  try {
    const { bakeryId } = req.query;

    const filter = {
      status: "completed",
      paymentStatus: "paid",
    };

    if (bakeryId) {
      filter.bakeryId = bakeryId;
    }

    const orders = await Order.find(filter)
      .populate("customerId", "name")
      .populate("bakeryId", "name")
      .sort({ createdAt: -1 });

    // Check which orders already have payouts
    const allPayouts = await Payout.find({});
    const paidOrderIds = new Set();
    allPayouts.forEach((payout) => {
      payout.orderIds.forEach((oid) => paidOrderIds.add(oid.toString()));
    });

    const ordersWithPayoutStatus = orders.map((order) => ({
      ...order.toObject(),
      hasPayout: paidOrderIds.has(order._id.toString()),
    }));

    res.json(ordersWithPayoutStatus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

