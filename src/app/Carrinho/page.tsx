'use client';

import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import LoginModal from '../Components/loginModal';

type Product = {
  name: string;
  price: string;
  fullPrice: string;
  description: string;
  images: string[];
};

// Função para aplicar desconto
const calculateDiscount = (fullPrice: string) =>
  `R$${(parseFloat(fullPrice.replace("R$", "").replace(",", ".")) * 0.7)
    .toFixed(2)
    .replace(".", ",")}`;

// Lista completa de produtos
const productsData: Record<string, Product> = {
  Opala: { name: 'Tapete Opala', fullPrice: 'R$50,00', price: calculateDiscount('R$50,00'), description: 'Tapetes...', images: ['/opala/opala.png', '/opala/opala1.png'] },
  UnoStreet: { name: 'Tapete Uno Street', fullPrice: 'R$50,00', price: calculateDiscount('R$50,00'), description: 'Tapetes...', images: ['/unos/unostreet.png', '/unos/unostreet1.png'] },
  KombiMala: { name: 'Tapete Kombi Mala', fullPrice: 'R$110,00', price: calculateDiscount('R$110,00'), description: 'Tapetes...', images: ['/kombi/kombimala.png', '/kombi/kombimala1.png'] },
  Hb20s: { name: 'Tapete HB20s Street', fullPrice: 'R$50,00', price: calculateDiscount('R$50,00'), description: 'Tapetes...', images: ['/hb20/hb20.png', '/hb20/hb201.png'] },
  Tcross: { name: 'Tapete Tcross', fullPrice: 'R$120,00', price: calculateDiscount('R$120,00'), description: 'Tapetes...', images: ['/Tcross.png'] },
  Polo: { name: 'Tapete Polo', fullPrice: 'R$115,00', price: calculateDiscount('R$115,00'), description: 'Tapetes...', images: ['/polo/polo.png', '/beneficio/polo.png'] },
  Hilux: { name: 'Tapete Caçamba Hilux', fullPrice: 'R$140,00', price: calculateDiscount('R$140,00'), description: 'Tapetes...', images: ['/hilux/hiluxfrente.png', '/hilux/hilux.png'] },
  Toro: { name: 'Tapete Caçamba Toro', fullPrice: 'R$130,00', price: calculateDiscount('R$130,00'), description: 'Tapetes...', images: ['/toro/toro.png'] },
};

// Sugestões quando carrinho vazio
const sugestoes = Object.values(productsData).slice(0, 4);

export default function CarrinhoPage() {
  const { cart, removeFromCart, clearCart, updateQuantity } = useCart();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const calcularTotal = () =>
    cart
      .reduce((total, item) => {
        const product = Object.values(productsData).find(p => p.name === item.name);
        if (!product) return total;
        return total + parseFloat(product.price.replace("R$", "").replace(",", ".")) * item.quantity;
      }, 0)
      .toFixed(2);

  // Função de checkout Stripe
  const handleStripeCheckout = async () => {
    try {
      const res = await fetch('/api/checkout_sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // Redireciona para o Stripe
      } else {
        console.error('Erro ao criar sessão', data.error);
      }
    } catch (err) {
      console.error('Erro ao criar sessão:', err);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center text-gray-600 space-y-6 py-20">
        <p className="text-xl font-semibold">Seu carrinho está vazio</p>
        <p className="max-w-sm text-gray-500 mb-8">Não se preocupe, explore nossos produtos e encontre o que você ama!</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl px-4">
          {sugestoes.map((produto, idx) => (
            <Link
              key={idx}
              href={`/Produtos?produto=${encodeURIComponent(produto.name.replace('Tapete ', '').replace(/\s/g, ''))}`}
              className="block bg-white rounded-lg shadow-md hover:shadow-lg transition p-4 flex flex-col items-center"
            >
              <Image src={produto.images[0]} alt={produto.name} width={250} height={250} className="rounded-md object-cover"/>
              <h3 className="mt-3 text-lg font-semibold text-gray-800">{produto.name}</h3>
              <p className="mt-1 text-red-600 font-bold">{produto.price}</p>
            </Link>
          ))}
        </div>

        <Link href="/" className="inline-block mt-10 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-semibold shadow-md transition">
          Ver Todos os Produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Seu Carrinho</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item, index) => {
            const product = Object.values(productsData).find(p => p.name === item.name);
            if (!product) return null;
            return (
              <div key={index} className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-white rounded-lg shadow-sm border">
                <Image src={product.images[0]} alt={product.name} width={120} height={120} className="rounded-lg object-cover"/>
                <div className="flex-1 w-full">
                  <h2 className="text-xl font-semibold text-gray-800">{product.name}</h2>
                  <p className="line-through text-gray-500">{product.fullPrice}</p>
                  <p className="text-green-600 font-bold text-lg">{product.price}</p>

                  <div className="mt-3 flex items-center gap-3 flex-wrap">
                    <span className="text-sm font-medium text-gray-600">Quantidade:</span>
                    <div className="flex items-center border rounded overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.name, Math.max(1, item.quantity-1))}
                        className={`px-3 py-1 text-lg ${item.quantity===1 ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-700'}`}
                        disabled={item.quantity===1}
                      >–</button>
                      <span className="px-4 py-1 text-md text-gray-800 bg-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.name, item.quantity+1)}
                        className="px-3 py-1 text-lg text-green-600 hover:text-green-700"
                      >+</button>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.name)}
                    className="text-red-600 hover:text-red-700 text-sm mt-2 underline"
                  >Remover</button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-gray-100 p-6 rounded-lg shadow-md h-fit space-y-4">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">Resumo da Compra</h3>
          <div className="flex justify-between mb-4">
            <span className="text-gray-700 font-medium">Subtotal</span>
            <span className="text-gray-800 font-bold">R$ {calcularTotal().replace('.', ',')}</span>
          </div>

          {/* Botão de pagamento */}
          <button
            onClick={handleStripeCheckout}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md text-lg font-semibold transition shadow-md"
          >
            Comprar Agora
          </button>

          <button
            onClick={() => {
              const message = encodeURIComponent("Olá! Gostaria de tirar uma dúvida sobre os produtos.");
              const whatsappURL = `https://wa.me/5511991861237?text=${message}`;
              window.open(whatsappURL, "_blank");
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md text-lg font-semibold transition shadow-md mt-2"
          >
            Tirar Dúvida
          </button>

          <button
            onClick={clearCart}
            className="w-full bg-white shadow hover:bg-gray-50 text-black font-semibold py-3 px-4 rounded-md text-base transition mt-4"
          >
            Limpar Carrinho
          </button>
        </div>
      </div>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}
