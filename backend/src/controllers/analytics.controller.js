import Order from "../models/order.model.js";
import Menu from "../models/menu.model.js";

export const getOwnerAnalytics = async (req, res) => {
  try {
    const ownerId = req.user.id;

    // 1️⃣ Orders belonging to bakeries owned by this owner
    const orders = await Order.find({ ownerId: ownerId });

    // If no orders yet
    if (!orders.length) {
      return res.json({
        totalOrders: 0,
        totalRevenue: 0,
        topItems: [],
        dailySales: [],
        recentOrders: [],
      });
    }

    // 2️⃣ Total Revenue
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

    // 3️⃣ Most sold items
    const itemCount = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        itemCount[item.name] = (itemCount[item.name] || 0) + item.qty;
      });
    });

    const topItems = Object.entries(itemCount)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    // 4️⃣ Daily sales data (for graph)
    const dailySales = {};
    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split("T")[0];
      dailySales[date] = (dailySales[date] || 0) + order.total;
    });

    const dailySalesArray = Object.entries(dailySales).map(
      ([date, revenue]) => ({ date, revenue })
    );

    // 5️⃣ Recent orders
    const recentOrders = orders.slice(-5).reverse();

    res.json({
      totalOrders: orders.length,
      totalRevenue,
      topItems,
      dailySales: dailySalesArray,
      recentOrders,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
