import { createContext, useContext, ReactNode, useState, useEffect } from "react";

export type CartProduct = {
  name: string;
  price: string;
  quantity: number;
};

type CartContextType = {
  cart: CartProduct[];
  addToCart: (product: CartProduct) => void;
  removeFromCart: (name: string) => void;
  clearCart: () => void;
  updateQuantity: (name: string, quantity: number) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartProduct[]>([]);

  // 🔹 Carregar carrinho do localStorage na primeira renderização
  useEffect(() => {
    const localCart = localStorage.getItem("cart");
    if (localCart) {
      setCart(JSON.parse(localCart));
    }
  }, []);

  // 🔹 Sempre que o carrinho mudar, salvar no localStorage
  const persistCart = (updatedCart: CartProduct[]) => {
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const addToCart = (product: CartProduct) => {
    const index = cart.findIndex(p => p.name === product.name);
    const updatedCart = [...cart];
    if (index >= 0) {
      updatedCart[index].quantity += product.quantity;
    } else {
      updatedCart.push(product);
    }
    persistCart(updatedCart);
  };

  const removeFromCart = (name: string) => {
    const updatedCart = cart.filter(p => p.name !== name);
    persistCart(updatedCart);
  };

  const clearCart = () => {
    persistCart([]);
  };

  const updateQuantity = (name: string, quantity: number) => {
    const updatedCart = cart.map(p =>
      p.name === name ? { ...p, quantity } : p
    );
    persistCart(updatedCart);
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart, updateQuantity }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
