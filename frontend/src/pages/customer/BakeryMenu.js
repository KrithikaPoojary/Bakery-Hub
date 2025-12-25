import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Star, MapPin } from "lucide-react";

export default function BakeryMenu() {
  const { id } = useParams(); // Bakery ID from URL
  const [bakery, setBakery] = useState(null);
  const [menu, setMenu] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/bakeries/${id}`);
        setBakery(res.data);
        const menuRes = await axios.get(
          `http://localhost:5000/api/menus/${id}`
        );
        setMenu(menuRes.data);
      } catch (error) {
        console.error("Error loading bakery:", error);
      }
    };
    fetchData();
  }, [id]);

  if (!bakery)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF3F6] text-[#E75480] font-semibold">
        Loading bakery details...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF3F6] to-[#FDEEF3] text-[#2D2D2D] font-[Poppins]">
      {/* 🍰 Bakery Header */}
      <div className="relative bg-white shadow-lg rounded-b-3xl p-10 mx-auto max-w-5xl mt-8 border border-[#F7A8B8]/40">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold text-[#E75480] mb-2">
              {bakery.name}
            </h1>
            <p className="flex items-center gap-2 text-[#6B6B6B]">
              <MapPin className="w-4 h-4 text-[#E75480]" /> {bakery.address}
            </p>
            <div className="flex items-center mt-2">
              <Star className="w-5 h-5 text-[#F7A8B8]" />
              <span className="ml-2 text-[#6B6B6B] text-sm">
                {bakery.rating || "4.8"} / 5
              </span>
            </div>
          </div>
          <img
            src={
              bakery.image ||
              "https://images.unsplash.com/photo-1555507036-ab1f4038808a"
            }
            alt={bakery.name}
            className="w-40 h-40 object-cover rounded-full border-4 border-[#F7A8B8]"
          />
        </div>
      </div>

      {/* 🧁 Menu Section */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-[#E75480] mb-10">
          Menu Highlights
        </h2>

        {menu.length === 0 ? (
          <p className="text-center text-gray-600">
            No menu items available yet.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {menu.map((item) => (
              <div
                key={item._id}
                className="bg-white/80 border border-[#F7A8B8]/50 rounded-3xl shadow-[0_8px_30px_rgba(231,84,128,0.15)] hover:shadow-[0_10px_40px_rgba(231,84,128,0.25)] transition transform hover:-translate-y-1"
              >
                <img
                  src={
                    item.image ||
                    "https://images.unsplash.com/photo-1605475128023-389d47a23403"
                  }
                  alt={item.name}
                  className="w-full h-48 object-cover rounded-t-3xl"
                />
                <div className="p-5 text-left">
                  <h3 className="text-xl font-semibold text-[#2D2D2D]">
                    {item.name}
                  </h3>
                  <p className="text-[#6B6B6B] text-sm mt-1">
                    {item.description}
                  </p>
                  <p className="mt-3 font-bold text-[#E75480] text-lg">
                    ₹{item.price}
                  </p>
                  <button
                    className="mt-4 w-full bg-[#E75480] text-white py-2 rounded-full font-medium hover:bg-[#d74470] transition"
                    onClick={() => alert(`Added ${item.name} to cart!`)}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
