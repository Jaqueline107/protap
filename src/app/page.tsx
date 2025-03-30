"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Banner from "./Components/banner";
import Modal from "../app/Components/modal"; // Importa o componente Modal

// Array de produtos
const products = [
  {
    id: 1,
    name: "Tapete Opala",
    price: "R$39,00",
    image: "/opala/opala.png",
    href: "/Produtos?produto=Opala",
  },
  {
    id: 2,
    name: "Tapete Kombi Mala",
    price: "R$45,00",
    image: "/kombi/kombimala.png",
    href: "/Produtos?produto=KombiMala",
  },
  {
    id: 3,
    name: "Tapete Uno Street",
    price: "R$35,00",
    image: "/unos/unostreet.png",
    href: "/Produtos?produto=UnoStreet",
  },
  {
    id: 4,
    name: "Tapete Hb20s Street",
    price: "R$35,00",
    image: "/hb20/hb20.png",
    href: "/Produtos?produto=Hb20s",
  },
  {
    id: 5,
    name: "Tapete Tcross",
    price: "R$109,80",
    image: "/tcross.png",
    href: "/Produtos?produto=Tcross",
  },
  {
    id: 6,
    name: "Tapete Hilux",
    price: "R$109,80",
    image: "/hilux/hiluxfrente.png",
    href: "/Produtos?produto=Hilux",
  },
  {
    id: 7,
    name: "Tapete Toro",
    price: "R$ 91,00",
    image: "/toro/toro.png",
    href: "/Produtos?produto=Toro",
  },
];

export default function Home() {
  const [showModal, setShowModal] = useState(false); // Estado do modal
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null); // Produto selecionado

  const handleViewBenefits = () => {
    setShowModal(true); // Exibe o modal
  };

  const handleProductSelection = (product: string) => {
    setSelectedProduct(product); // Define o produto selecionado
    setShowModal(false); // Fecha o modal
  };

  return (
    <div className="flex flex-col items-center">
      <Banner />

      {/* Conteúdo Principal */}
      <main className="w-5/6 mt-12">
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
              className="w-full md:w-80 p-5 h-auto bg-white rounded-lg"
            >
              <Link href={product.href}>
                <button className="rounded-md p-3 text-black font-semibold text-left w-full h-full">
                  <Image
                    src={product.image}
                    width={450}
                    height={200}
                    alt={product.name}
                  />
                  <p className="mt-5 text-2xl">{product.name}</p>
                  <p className="text-green-500 text-2xl font-semibold">
                    {product.price}
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
        onClose={() => setShowModal(false)} // Fecha o modal
        onSelect={handleProductSelection} // Seleciona o produto
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
