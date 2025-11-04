"use client";

import React from "react";
import { useCart } from "../context/CartContext";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CarrinhoPage() {
  const { cart, removeFromCart, clearCart, updateQuantity } = useCart();
  const router = useRouter();

  const calcularTotal = () =>
    cart
      .reduce(
        (total, item) =>
          total +
          parseFloat(String(item.price).replace("R$", "").replace(",", ".")) *
            item.quantity,
        0
      )
      .toFixed(2);

  const handleCheckout = () => {
    const params = new URLSearchParams();
    params.append("items", JSON.stringify(cart));
    router.push(`/Checkout?${params.toString()}`);
  };

  if (cart.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold">Seu carrinho está vazio</h2>
        <Link
          href="/"
          className="mt-6 inline-block bg-red-600 text-white px-6 py-3 rounded-md"
        >
          Ver Produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Seu Carrinho</h1>

      {cart.map((item, idx) => (
        <div
          key={idx}
          className="flex items-center gap-6 p-4 bg-white rounded-lg shadow mb-4"
        >
          <Image
            src={item.images[0]}
            width={120}
            height={120}
            alt={item.titulo}
            className="rounded-lg"
          />

          <div className="flex-1">
            <h2 className="font-semibold text-lg">{item.titulo}</h2>
            <p className="text-green-600 font-bold">{item.price}</p>

            <div className="mt-3 flex items-center gap-3">
              <button
                className="px-3 py-1 border rounded-md text-lg"
                onClick={() =>
                  updateQuantity(item.titulo, Math.max(1, item.quantity - 1))
                }
              >
                -
              </button>

              <span className="px-4 py-1 border rounded-md bg-gray-50">
                {item.quantity}
              </span>

              <button
                className="px-3 py-1 border rounded-md text-lg"
                onClick={() => updateQuantity(item.titulo, item.quantity + 1)}
              >
                +
              </button>
            </div>

            <button
              className="text-red-600 mt-2 underline"
              onClick={() => removeFromCart(item.titulo)}
            >
              Remover
            </button>
          </div>
        </div>
      ))}

      <div className="bg-gray-100 p-6 rounded-lg shadow-md mt-6">
        <p className="text-lg font-bold">
          Subtotal: R$ {calcularTotal().replace(".", ",")}
        </p>

        <button
          onClick={handleCheckout}
          className="w-full bg-green-600 text-white py-3 rounded-md mt-4 font-semibold"
        >
          Finalizar Compra
        </button>

        <button
          onClick={clearCart}
          className="w-full bg-white border py-3 rounded-md mt-2 font-semibold"
        >
          Limpar Carrinho
        </button>
      </div>
    </div>
  );
}
