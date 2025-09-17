"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Banner from "./Components/banner";
import Modal from "../app/Components/modal";
import { db } from "../db/firebase";
import { collection, getDocs } from "firebase/firestore";

// Função para calcular desconto
const calculateDiscount = (fullPrice: string): string => {
  const numericPrice = parseFloat(fullPrice.replace("R$", "").replace(",", "."));
  const discountedPrice = (numericPrice * 0.7).toFixed(2); // 30% OFF
  return `R$${discountedPrice.replace(".", ",")}`;
};

// Função para calcular % de desconto
const calculateDiscountPercentage = (fullPrice: string, price: string): number => {
  const numericFullPrice = parseFloat(fullPrice.replace("R$", "").replace(",", "."));
  const numericPrice = parseFloat(price.replace("R$", "").replace(",", "."));
  const discountPercentage = ((numericFullPrice - numericPrice) / numericFullPrice) * 100;
  return Math.round(discountPercentage);
};

// Tipo do produto no Firestore
interface FirestoreProduct {
  name: string;
  fullPrice: string;
  images: string[];
}

// Tipo do produto final renderizado
interface Product extends FirestoreProduct {
  id: string;
  price: string;
  discount: number;
  href: string;
}

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Busca produtos do Firebase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snapshot = await getDocs(collection(db, "produtos"));
        const produtosData: Product[] = snapshot.docs.map((doc) => {
          const data = doc.data() as FirestoreProduct;
          const price = calculateDiscount(data.fullPrice);

          return {
            id: doc.id,
            ...data,
            price,
            discount: calculateDiscountPercentage(data.fullPrice, price),
            href: `/Produtos?id=${doc.id}`,
          };
        });

        setProducts(produtosData);
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

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
              Tapetes de altíssima qualidade, feitos especialmente para você.
            </p>

            <p className="text-gray-500 text-2xl font-light mb-5">Melhores Ofertas</p>
            <p className="text-gray-500 text-md font-light mb-5">
              Caso o seu modelo não estiver listado, entre em contato conosco pelo WhatsApp
              <a
                href="https://wa.me/5511991861237"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline font-semibold ml-1"
              >
                (11) 99186-1237
              </a>.
            </p>

            <button
              onClick={handleViewBenefits}
              className="rounded-md bg-red-600 hover:bg-opacity-85 p-3 text-white font-semibold text-xl"
            >
              Ver benefícios
            </button>
          </div>

          {/* Produtos dinâmicos */}
          {loading ? (
            <p>Carregando produtos...</p>
          ) : (
            products.map((product) => (
              <div
                key={product.id}
                className="w-full md:w-80 p-5 h-auto bg-white rounded-lg border border-transparent 
                           hover:border-green-600 hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <Link href={product.href}>
                  <button className="rounded-md p-3 text-black -mt-5 font-semibold text-left w-full h-full">
                    <Image
                      src={product.images[0]}
                      width={450}
                      height={200}
                      alt={product.name}
                    />
                    <p className="mt-5 text-2xl">{product.name}</p>
                    <p className="text-gray-400 line-through text-xl">{product.fullPrice}</p>
                    <p className="text-gray-800 text-2xl font-semibold">{product.price}</p>
                    <p className="text-green-600 text-lg font-semibold">{product.discount}% OFF</p>
                  </button>
                </Link>
              </div>
            ))
          )}
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
        <Link href={`/Produtos?id=${selectedProduct}`}>
          <div className="hidden" />
        </Link>
      )}
    </div>
  );
}
