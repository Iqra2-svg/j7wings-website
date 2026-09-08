import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  // product = { id, name, cp, itemNo, price, icon }
  const addToCart = (product, qty = 1) => {
    setCartItems((items) => {
      const existing = items.find((item) => item.id === product.id);
      if (existing) {
        return items.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + qty } : item
        );
      }
      return [...items, { ...product, qty }];
    });
  };

  const updateQty = (id, delta) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  const clearCart = () => setCartItems([]);

  const totalItems = cartItems.length;
  const totalCases = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const totalUnits = cartItems.reduce((sum, item) => sum + item.qty * item.cp, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.qty * item.price * item.cp, 0);

  const value = {
    cartItems,
    addToCart,
    updateQty,
    removeItem,
    clearCart,
    totalItems,
    totalCases,
    totalUnits,
    subtotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Custom hook — use this in any component instead of importing CartContext directly.
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
