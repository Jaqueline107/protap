"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { CartProvider, useCart } from "./context/CartContext";
import "../app/globals.css";
import { AuthProvider } from "./context/AuthContext";

// Botão Voltar
function BackButton() {
  const router = useRouter();
  const pathname = usePathname();
  if (pathname === "/") return null;
  return (
    <button
      onClick={() => router.back()}
      aria-label="Voltar"
      className="menu-icon cursor-pointer p-2 rounded-md hover:bg-black/15 transition"
    >
      <ArrowLeft color="white" size={26} />
    </button>
  );
}

// Carrinho centralizado na navbar
function CartIcon() {
  const { cart } = useCart();
  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Link
      href="/Carrinho"
      aria-label="Ver carrinho"
      className="relative flex items-center justify-center hover:bg-lime-50 w-14 h-14 bg-white rounded-full shadow-md hover:shadow-xl transition cursor-pointer"
    >
      <ShoppingCart size={28} color="#111" />
      {totalQuantity > 0 && (
        <span
          className="absolute -top-1 -right-1 w-6 h-6 flex items-center justify-center text-xs font-semibold text-white rounded-full"
          style={{
            backgroundColor: "#ff3b3b",
            boxShadow: "0 0 6px #ff7f7f",
          }}
        >
          {totalQuantity}
        </span>
      )}
    </Link>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-50">
        <AuthProvider>
          <CartProvider>
            {/* Navbar moderna */}
            <header className="fixed w-full top-0 left-0 z-30 flex justify-center bg-black/85 backdrop-blur-sm shadow-md">
              <div className="flex items-center justify-between max-w-[1400px] w-full px-6 sm:px-12 lg:px-24 py-5">
                {/* Logo */}
                <Link href={"/"}>
                  <p className="text-white text-3xl font-bold cursor-pointer hover:text-red-600 transition-colors">
                    ProTap
                  </p>
                </Link>

                {/* Navegação */}
                <nav className="hidden md:flex gap-12 items-center">
                   <Link
                    href="/Sobre"
                    className="text-gray-200 hover:text-red-600 transition-colors font-medium"
                  >
                    Produtos
                  </Link>
                  <Link
                    href="/Sobre"
                    className="text-gray-200 hover:text-red-600 transition-colors font-medium"
                  >
                    Sobre
                  </Link>
                  <Link
                    href="/Contato"
                    className="text-gray-200 hover:text-red-600 transition-colors font-medium"
                  >
                    Contato
                  </Link>
                </nav>

                {/* Botão Voltar + Carrinho */}
                <div className="flex items-center gap-4">
                  <BackButton />
                  <CartIcon />
                </div>
              </div>
            </header>

            <main className="pt-24 relative z-0">{children}</main>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
