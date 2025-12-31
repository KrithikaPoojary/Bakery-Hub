import Menu from "../models/menu.model.js"; // adjust file name if needed

export const getMenuByBakery = async (req, res) => {
  try {
    const bakeryId = req.params.id;
    const items = await Menu.find({ bakeryId })
      .select("-__v")
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error("getMenuByBakery error:", err);
    res.status(500).json({ error: err.message });
  }
};
