import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";

import { Search, Loader2, ShoppingBag } from "lucide-react";

export default function CustomerMenu() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (!user) navigate("/login", { state: { from: `/customer/menu/${id}` } });
  }, []);

  const [bakery, setBakery] = useState(null);
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState(["All"]);
  const [activeCategory, setActiveCategory] = useState("All");

  const { addToCart } = useCart();

  useEffect(() => {
    const loadMenu = async () => {
      try {
        setLoading(true);

        const bakeryRes = await axios.get(
          `http://localhost:5000/api/bakeries/${id}`
        );
        setBakery(bakeryRes.data);

        const productRes = await axios.get(
          `http://localhost:5000/api/products/${id}`
        );

        const normalized = (productRes.data || []).map((p) => ({
          ...p,
          category: p.category || "Bakery",
          imageUrl: p.imageUrl || p.image || "",
        }));

        setProducts(normalized);
        setFiltered(normalized);

        const dynamicCats = Array.from(
          new Set(normalized.map((p) => p.category))
        );

        setCategories(["All", ...dynamicCats]);
      } catch (err) {
        console.log(err);
        setError("Unable to load menu.");
      } finally {
        setLoading(false);
      }
    };

    loadMenu();
  }, [id]);

  useEffect(() => {
    let data = [...products];

    if (activeCategory !== "All") {
      data = data.filter((p) => p.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q)
      );
    }

    setFiltered(data);
  }, [products, activeCategory, searchQuery]);

  if (loading)
    return (
      <div className="h-screen flex justify-center items-center">
        <Loader2 className="text-purple-400 w-10 h-10 animate-spin" />
      </div>
    );

  if (error)
    return (
      <div className="h-screen flex justify-center items-center text-red-600 text-lg">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Hero Banner */}
      <div className="relative w-full h-64 md:h-72 lg:h-80 rounded-b-[40px] overflow-hidden shadow-lg">
        <img
          src={
            bakery?.imageUrl
              ? bakery.imageUrl.startsWith("http")
                ? bakery.imageUrl
                : `http://localhost:5000${bakery.imageUrl}`
              : "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000"
          }
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/60" />

        <div className="absolute bottom-8 left-8 text-white drop-shadow-xl">
          <h1 className="text-4xl font-extrabold tracking-wide">
            {bakery?.name}
          </h1>
          <p className="text-sm opacity-90 mt-1">{bakery?.address}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-3xl mx-auto -mt-10 px-4 relative z-20">
        <div className="bg-gray-800 flex items-center gap-3 p-4 rounded-3xl shadow-lg border border-gray-700">
          <Search className="text-purple-400 w-5 h-5" />

          <input
            type="text"
            placeholder="Search cakes, pastries, cookies…"
            className="w-full bg-transparent outline-none text-gray-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-4xl mx-auto px-4 mt-7 flex items-center gap-3 overflow-x-auto pb-3 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 text-sm rounded-full font-medium whitespace-nowrap 
              ${
                activeCategory === cat
                  ? "bg-purple-600 text-white"
                  : "bg-gray-800 border border-gray-700 text-gray-300"
              }
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products */}
      <div className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
        {filtered.length === 0 && (
          <p className="col-span-full text-center text-gray-500 text-lg">
            No items found.
          </p>
        )}

        {filtered.map((item) => (
          <div
            key={item._id}
            className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-0"
          >
            {/* IMAGE WITH SOLD OUT OVERLAY */}
            <div className="relative">
              <img
                src={
                  item.imageUrl
                    ? item.imageUrl.startsWith("http")
                      ? item.imageUrl
                      : `http://localhost:5000${item.imageUrl}`
                    : "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000"
                }
                className="w-full h-48 object-cover rounded-t-2xl"
                alt={item.name}
              />

              {/* SOLD OUT BADGE */}
              {item.isSoldOut && (
                <div className="absolute inset-0 bg-black/50 flex justify-center items-center rounded-t-2xl">
                  <span className="bg-red-600 text-white px-4 py-1 rounded-full text-lg font-bold shadow">
                    SOLD OUT
                  </span>
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {item.name}
              </h3>

              {item.description && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {item.description}
                </p>
              )}

              <div className="flex justify-between items-center mt-4">
                <span className="text-xl font-bold text-purple-400">
                  ₹{item.price}
                </span>

                {/* SOLD OUT → DISABLE ADD BUTTON */}
                {item.isSoldOut ? (
                  <button
                    disabled
                    className="px-4 py-2 bg-gray-400 text-white rounded-full cursor-not-allowed"
                  >
                    Sold Out
                  </button>
                ) : (
                  <button
                    onClick={() => addToCart(item)}
                    className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-full"
                  >
                    <ShoppingBag size={18} /> Add
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
