import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [bakeryId, setBakeryId] = useState(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const savedCart = JSON.parse(localStorage.getItem("cart"));
      const savedBakery = localStorage.getItem("bakeryId");

      if (Array.isArray(savedCart)) setCart(savedCart);
      if (savedBakery) setBakeryId(savedBakery);
    } catch {
      setCart([]);
      setBakeryId(null);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
    if (bakeryId) localStorage.setItem("bakeryId", bakeryId);
  }, [cart, bakeryId]);

  // When adding item for FIRST time → set bakeryId
  const addToCart = (item, bakery) => {
    // If cart empty → set bakeryId
    if (cart.length === 0 && bakery) {
      setBakeryId(bakery);
    }

    // If adding from different bakery → reset cart
    if (bakery && bakeryId && bakeryId !== bakery) {
      if (
        !window.confirm(
          "Your cart contains items from another bakery. Clear cart?"
        )
      ) {
        return;
      }
      setCart([]);
      setBakeryId(bakery);
    }

    setCart((prev) => {
      const found = prev.find((p) => p._id === item._id);
      if (found) {
        return prev.map((p) =>
          p._id === item._id ? { ...p, qty: (p.qty || 1) + 1 } : p
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (id) => {
    const updated = cart.filter((i) => i._id !== id);
    setCart(updated);
    if (updated.length === 0) setBakeryId(null);
  };

  const updateQty = (id, qty) => {
    setCart((prev) =>
      prev.map((i) => (i._id === id ? { ...i, qty: Math.max(1, qty) } : i))
    );
  };

  const increaseQty = (id) => {
    setCart((prev) =>
      prev.map((i) => (i._id === id ? { ...i, qty: (i.qty || 1) + 1 } : i))
    );
  };

  const decreaseQty = (id) => {
    setCart((prev) =>
      prev.map((i) =>
        i._id === id ? { ...i, qty: Math.max(1, (i.qty || 1) - 1) } : i
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setBakeryId(null);
    localStorage.removeItem("bakeryId");
  };

  const total = useMemo(
    () =>
      cart.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0),
    [cart]
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQty,
        increaseQty,
        decreaseQty,
        clearCart,
        total,
        bakeryId,
        setBakeryId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
