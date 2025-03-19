"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Banner from "../Components/banner";

type Product = {
  name: string;
  price: string;
  description: string;
  images: string[];
};

// Dados dos produtos
const productsData: Record<string, Product> = {
  KombiMala: {
    name: "Tapete Kombi Mala",
    price: "R$45,00",
    description:
      "Tapetes projetados para o espaço de bagagem da Kombi. Feito com materiais resistentes e design funcional, ideal para transporte seguro.",
    images: ["/kombimala.png", "/kombimala1.png", "/kombimala2.png"],
  },
};

function ProdutosContent() {
  const searchParams = useSearchParams();
  const produto = searchParams.get("produto");

  const product = productsData[produto as string];

  if (!product) {
    return <p>Produto não encontrado!</p>;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [mainImage, setMainImage] = useState(product.images[0]);

  return (
    <div className="flex flex-col items-center">
      <Banner />

      <main className="w-5/6 mt-20 flex flex-row gap-12">
        {/* Seção de Imagens */}
        <div className="flex flex-col items-center w-1/2">
          <Image
            key={mainImage}
            src={mainImage}
            alt={product.name}
            width={500}
            height={500}
            priority
            className="rounded-lg shadow-md"
          />

          <div className="flex gap-4 mt-4">
            {product.images.map((src, index) => (
              <button
                key={index}
                onClick={() => setMainImage(src)}
                className="focus:outline-none"
              >
                <Image
                  src={src}
                  alt={`Miniatura ${index}`}
                  width={70}
                  height={50}
                  className={`cursor-pointer rounded-md border transition-all ${
                    mainImage === src
                      ? "border-green-500 scale-105"
                      : "border-gray-300"
                  } hover:border-green-500`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Seção de Informações */}
        <div className="w-1/2 flex flex-col justify-start">
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-green-600 text-4xl font-bold mt-2">
            {product.price}
          </p>

          <button className="bg-green-600 text-white font-semibold text-xl py-3 w-2/6 px-6 rounded-lg hover:bg-green-700 shadow-md transition-all mt-4">
            Comprar Agora
          </button>

          <div className="mt-6 p-4 h-52 bg-gray-100 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Descrição do Produto
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {product.description}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Produtos() {
  return (
    <Suspense fallback={<p>Carregando...</p>}>
      <ProdutosContent />
    </Suspense>
  );
}
