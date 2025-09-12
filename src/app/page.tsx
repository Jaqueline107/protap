"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Banner from "./Components/banner";
import Modal from "../app/Components/modal"; // Importa o componente Modal

// Função para calcular desconto
const calculateDiscount = (fullPrice: string): string => {
  const numericPrice = parseFloat(
    fullPrice.replace("R$", "").replace(",", ".")
  );
  const discountedPrice = (numericPrice * 0.7).toFixed(2); // Aplica 30% de desconto
  return `R$${discountedPrice.replace(".", ",")}`;
};

// Função para calcular percentagem de desconto
const calculateDiscountPercentage = (
  fullPrice: string,
  price: string
): number => {
  const numericFullPrice = parseFloat(
    fullPrice.replace("R$", "").replace(",", ".")
  );
  const numericPrice = parseFloat(price.replace("R$", "").replace(",", "."));
  const discountPercentage =
    ((numericFullPrice - numericPrice) / numericFullPrice) * 100;
  return Math.round(discountPercentage); // Retorna valor arredondado
};

// Array de produtos
const products = [
  {
    id: 1,
    name: "Tapete Opala",
    fullPrice: "R$50,00",
    price: calculateDiscount("R$50,00"),
    discount: calculateDiscountPercentage(
      "R$50,00",
      calculateDiscount("R$50,00")
    ),
    image: "/opala/opala.png",
    href: "/Produtos?produto=Opala",
  },
  {
    id: 2,
    name: "Tapete Kombi Mala",
    fullPrice: "R$100,00",
    price: calculateDiscount("R$100,00"),
    discount: calculateDiscountPercentage(
      "R$100,00",
      calculateDiscount("R$100,00")
    ),
    image: "/kombi/kombimala.png",
    href: "/Produtos?produto=KombiMala",
  },
  {
    id: 3,
    name: "Tapete Uno Street",
    fullPrice: "R$50,00",
    price: calculateDiscount("R$50,00"),
    discount: calculateDiscountPercentage(
      "R$50,00",
      calculateDiscount("R$50,00")
    ),
    image: "/unos/unostreet.png",
    href: "/Produtos?produto=UnoStreet",
  },
  {
    id: 4,
    name: "Tapete Hb20s Street",
    fullPrice: "R$50,00",
    price: calculateDiscount("R$50,00"),
    discount: calculateDiscountPercentage(
      "R$50,00",
      calculateDiscount("R$50,00")
    ),
    image: "/hb20/hb20.png",
    href: "/Produtos?produto=Hb20s",
  },
  {
    id: 5,
    name: "Tapete Tcross",
    fullPrice: "R$120,00",
    price: calculateDiscount("R$120,00"),
    discount: calculateDiscountPercentage(
      "R$120,00",
      calculateDiscount("R$120,00")
    ),
    image: "/tcross.png",
    href: "/Produtos?produto=Tcross",
  },
  {
    id: 6,
    name: "Tapete Hilux",
    fullPrice: "R$140,00",
    price: calculateDiscount("R$140,00"),
    discount: calculateDiscountPercentage(
      "R$140,00",
      calculateDiscount("R$140,00")
    ),
    image: "/hilux/hiluxfrente.png",
    href: "/Produtos?produto=Hilux",
  },
  {
    id: 7,
    name: "Tapete Toro",
    fullPrice: "R$130,00",
    price: calculateDiscount("R$130,00"),
    discount: calculateDiscountPercentage(
      "R$130,00",
      calculateDiscount("R$130,00")
    ),
    image: "/toro/toro.png",
    href: "/Produtos?produto=Toro",
  },
  {
    id: 8,
    name: "Tapete Polo",
    fullPrice: "R$115,00",
    price: calculateDiscount("R$115,00"),
    discount: calculateDiscountPercentage(
      "R$115,00",
      calculateDiscount("R$115,00")
    ),
    image: "/polo/polo.png",
    href: "/Produtos?produto=Polo",
  },
];

export default function Home() {
  const [showModal, setShowModal] = useState(false); 
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null); 

  const handleViewBenefits = () => {
    setShowModal(true);
  };

  const handleProductSelection = (product: string) => {
    setSelectedProduct(product);
    setShowModal(false);
  };

  return (
    <div className="flex flex-col items-center">
      <Banner />

      {/* Conteúdo Principal */}
      <main className="w-5/6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card de "Ver benefícios" */}
          <div className="w-full md:w-80 p-5 h-auto bg-white rounded-lg">
            <p className="text-black font-semibold text-2xl mb-5">
              Tapetes de altissma qualidade, feitos especialmente para você.
            </p>

            <p className="text-gray-500 text-2xl font-light mb-5">
              Melhores Ofertas
            </p>
            <p className="text-gray-500 text-md font-light mb-5">
              Caso o seu modelo não estiver listado, entre em contato conosco
              pelo WhatsApp
              <a
                href="https://wa.me/5511991861237"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline font-semibold ml-"
              >
                (11) 99186-1237
              </a>
              .
            </p>

            <button
              onClick={handleViewBenefits}
              className="rounded-md bg-red-600 hover:bg-opacity-85 p-3 text-white font-semibold text-xl"
            >
              Ver benefícios
            </button>
          </div>

          {/* Iteração dos produtos */}
          {products.map((product) => (
            <div
              key={product.id}
              className="w-full md:w-80 p-5 h-auto bg-white rounded-lg border border-transparent 
                         hover:border-green-600 hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <Link href={product.href}>
                <button className="rounded-md p-3 text-black -mt-5 font-semibold text-left w-full h-full">
                  <Image
                    src={product.image}
                    width={450}
                    height={200}
                    alt={product.name}
                  />
                  <p className="mt-5 text-2xl">{product.name}</p>
                  <p className="text-gray-400 line-through text-xl">
                    {product.fullPrice}
                  </p>
                  <p className="text-gray-800 text-2xl font-semibold">
                    {product.price}
                  </p>
                  <p className="text-green-600 text-lg font-semibold">
                    {product.discount}% OFF
                  </p>
                </button>
              </Link>
            </div>
          ))}
        </div>
      </main>

      {/* Modal */}
      <Modal
        isVisible={showModal}
        onClose={() => setShowModal(false)}
        onSelect={handleProductSelection}
      />

      {/* Redirecionamento */}
      {selectedProduct && (
        <Link href={`/Produtos?produto=${selectedProduct}`}>
          <div className="hidden" />
        </Link>
      )}
    </div>
  );
}
