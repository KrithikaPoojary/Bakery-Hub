import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import { useCart } from "../../context/CartContext";

export default function Menu() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [bakery, setBakery] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBakery = async () => {
      try {
        const res = await api.get(`/bakeries/${id}`);
        setBakery(res.data);
      } catch (err) {
        console.error("Failed to load bakery", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBakery();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-pink-600 text-xl">
        Loading menu...
      </div>
    );

  if (!bakery)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 text-lg">
        Bakery not found 😢
      </div>
    );

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-6 border border-pink-100">
        <h1 className="text-3xl font-bold text-pink-600 mb-3">{bakery.name}</h1>
        <p className="text-gray-600 mb-6">{bakery.description}</p>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          🍪 Menu Items
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bakery.menu?.length > 0 ? (
            bakery.menu.map((item) => (
              <div
                key={item._id}
                className="bg-pink-100 p-4 rounded-xl shadow hover:shadow-md transition"
              >
                <h3 className="font-semibold text-lg text-pink-700">
                  {item.name}
                </h3>
                <p className="text-gray-600 text-sm">{item.category}</p>
                <p className="font-medium text-pink-600 mt-2">₹{item.price}</p>
                <button
                  onClick={() => addToCart(item)}
                  disabled={item.isSoldOut}
                  className={`mt-3 w-full py-2 rounded-full transition ${
                    item.isSoldOut
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-pink-500 hover:bg-pink-600 text-white"
                  }`}
                >
                  {item.isSoldOut ? "Sold Out" : "Add to Cart"}
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No menu items available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
