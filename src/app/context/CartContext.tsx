"use client";

import { createContext, useContext, useEffect, useState } from "react";

export interface CartProduct {
  id: any;
  name: string; 
  price: string;
  quantity: number;
  images: string[];
}

interface CartContextType {
  cart: CartProduct[];
  addToCart: (product: CartProduct) => void;
  removeFromCart: (name: string) => void;
  updateQuantity: (name: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartProduct[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) setCart(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: CartProduct) => {
    setCart(prev => {
      const exists = prev.find(p => p.name === product.name);
      if (exists) {
        return prev.map(p =>
          p.name === product.name ? { ...p, quantity: p.quantity + product.quantity } : p
        );
      }
      return [...prev, product];
    });
  };

  const removeFromCart = (name: string) => {
    setCart(prev => prev.filter(p => p.name !== name));
  };

  const updateQuantity = (name: string, quantity: number) => {
    setCart(prev =>
      prev.map(p => (p.name === name ? { ...p, quantity } : p))
    );
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro do CartProvider");
  return ctx;
};
