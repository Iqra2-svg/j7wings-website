import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

// Business rule: a customer can order a maximum of 2 different products per order.
// Adding more of an existing item (quantity) is still allowed — this limit only
// applies to the number of distinct products in the cart.
const MAX_PRODUCTS = 2;

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  // product = { id, name, cp, itemNo, price, icon }
  // Returns true if the item was added, false if it was blocked by the product limit.
  const addToCart = (product, qty = 1) => {
    let added = true;
    setCartItems((items) => {
      const existing = items.find((item) => item.id === product.id);
      if (existing) {
        return items.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + qty } : item
        );
      }
      if (items.length >= MAX_PRODUCTS) {
        added = false;
        return items;
      }
      return [...items, { ...product, qty }];
    });
    if (!added) {
      alert(`You can order a maximum of ${MAX_PRODUCTS} different products per order. Please remove an item from your cart to add a new one.`);
    }
    return added;
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
    maxProducts: MAX_PRODUCTS,
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
