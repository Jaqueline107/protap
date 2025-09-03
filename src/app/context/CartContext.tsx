import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../db/firebase";

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
  const { user } = useAuth();
  const [cart, setCart] = useState<CartProduct[]>([]);

  // Carrega o carrinho do Firebase
  useEffect(() => {
    if (!user) return;
    const fetchCart = async () => {
      const docRef = doc(db, "carrinhos", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setCart(docSnap.data().items || []);
    };
    fetchCart();
  }, [user]);

  const persistCart = async (updatedCart: CartProduct[]) => {
    if (!user) return;
    await setDoc(doc(db, "carrinhos", user.uid), { items: updatedCart });
  };

  const addToCart = (product: CartProduct) => {
    const index = cart.findIndex(p => p.name === product.name);
    const updatedCart = [...cart];
    if (index >= 0) {
      updatedCart[index].quantity += product.quantity;
    } else {
      updatedCart.push(product);
    }
    setCart(updatedCart);
    persistCart(updatedCart);
  };

  const removeFromCart = (name: string) => {
    const updatedCart = cart.filter(p => p.name !== name);
    setCart(updatedCart);
    persistCart(updatedCart);
  };

  const clearCart = () => {
    setCart([]);
    persistCart([]);
  };

  const updateQuantity = (name: string, quantity: number) => {
    const updatedCart = cart.map(p => p.name === name ? { ...p, quantity } : p);
    setCart(updatedCart);
    persistCart(updatedCart);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
