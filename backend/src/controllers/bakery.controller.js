import Bakery from "../models/bakery.model.js";

// OWNER: Get bakery of logged-in owner
export const getMyBakery = async (req, res) => {
  try {
    const bakery = await Bakery.findOne({ ownerId: req.user.id });

    if (!bakery) {
      return res
        .status(404)
        .json({ message: "No bakery found for this owner." });
    }

    res.json(bakery);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN: Get all bakeries (pending + approved + rejected)
export const getAllBakeries = async (req, res) => {
  try {
    const bakeries = await Bakery.find().populate("ownerId", "name email");
    res.json(bakeries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUBLIC: Get bakery by ID
export const getBakeryById = async (req, res) => {
  try {
    const bakery = await Bakery.findById(req.params.id);

    if (!bakery) {
      return res.status(404).json({ message: "Bakery not found" });
    }

    res.json(bakery);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN: Approve bakery
export const approveBakery = async (req, res) => {
  try {
    const bakery = await Bakery.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );
    res.json(bakery);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUBLIC: Get ONLY approved bakeries for customers
export const getApprovedBakeries = async (req, res) => {
  try {
    const bakeries = await Bakery.find({ status: "approved" });
    res.json(bakeries);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch approved bakeries" });
  }
};

// ADMIN: Reject bakery
export const rejectBakery = async (req, res) => {
  try {
    const bakery = await Bakery.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );

    res.json(bakery);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const uploadBakeryImage = async (req, res) => {
  try {
    const bakery = await Bakery.findOne({ ownerId: req.user.id });
    if (!bakery) return res.status(404).json({ error: "Bakery not found" });

    bakery.imageUrl = `/uploads/${req.file.filename}`;
    await bakery.save();

    res.json({ success: true, imageUrl: bakery.imageUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to upload bakery image" });
  }
};
