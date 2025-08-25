import React, { createContext, useContext, useState, ReactNode } from "react";

export type CartProduct = {
  name: string;
  price: string;
  fullPrice: string;
  description: string;
  images: string[];
  quantity: number;
};

type CartContextType = {
  cart: CartProduct[];
  addToCart: (product: CartProduct) => void;
  removeFromCart: (name: string) => void;
  clearCart: () => void;
  updateQuantity: (name: string, quantity: number) => void; // adiciona aqui
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartProduct[]>([]);

  const addToCart = (product: CartProduct) => {
    setCart((prevCart) => {
      const existingProductIndex = prevCart.findIndex((p) => p.name === product.name);
      if (existingProductIndex >= 0) {
        // Se já existe, aumenta a quantidade
        const updatedCart = [...prevCart];
        updatedCart[existingProductIndex].quantity += product.quantity;
        return updatedCart;
      }
      // Se não existe, adiciona novo
      return [...prevCart, product];
    });
  };

  const removeFromCart = (name: string) => {
    setCart((prevCart) => prevCart.filter((p) => p.name !== name));
  };

  const clearCart = () => setCart([]);

  // Função para atualizar a quantidade do produto no carrinho
  const updateQuantity = (name: string, quantity: number) => {
    setCart((prevCart) => {
      return prevCart.map((product) =>
        product.name === name ? { ...product, quantity: quantity > 0 ? quantity : 1 } : product
      );
    });
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
