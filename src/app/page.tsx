'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Banner from "./Components/banner";
import Modal from "../app/Components/modal";
import { db } from "../db/firebase";
import { collection, getDocs } from "firebase/firestore";

interface FirestoreProduct {
  titulo: string;
  fullPrice: string;
  images: string[];
}

interface Product extends FirestoreProduct {
  id: string;
  name: string;
  price: string;
  discount: number;
  href: string;
}

const calculateDiscount = (fullPrice: string) => {
  const numericPrice = parseFloat(fullPrice.replace("R$", "").replace(",", "."));
  const discountedPrice = (numericPrice * 0.7).toFixed(2);
  return `R$${discountedPrice.replace(".", ",")}`;
};

const calculateDiscountPercentage = (fullPrice: string, price: string) => {
  const numericFullPrice = parseFloat(fullPrice.replace("R$", "").replace(",", "."));
  const numericPrice = parseFloat(price.replace("R$", "").replace(",", "."));
  return Math.round(((numericFullPrice - numericPrice) / numericFullPrice) * 100);
};

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snapshot = await getDocs(collection(db, "produtos"));
        const produtosData: Product[] = snapshot.docs.map((doc) => {
          const data = doc.data() as FirestoreProduct;
          const price = calculateDiscount(data.fullPrice);
          return {
            id: doc.id,
            name: data.titulo,
            titulo: data.titulo,
            fullPrice: data.fullPrice,
            images: data.images,
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

  return (
    <div className="flex flex-col items-center">
      <Banner />

      <main id="produtos" className="w-5/6 mt-5 sm:mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card de "Ver Benefícios" */}
          <div className="hidden md:flex w-full md:w-80 p-6 bg-gradient-to-br from-gray-100 to-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex-col">
            <h2 className="text-2xl md:text-3xl font-bold text-black mb-4">
              Tapetes de altíssima qualidade
            </h2>
            <p className="text-gray-700 text-lg font-light mb-4">
              Feitos especialmente para você.
            </p>
            <p className="text-gray-600 text-base mb-3">
              Conheça nossa linha exclusiva de tapetes automotivos.
            </p>
            <p className="text-gray-600 text-base mb-5">
              Se o seu modelo não estiver listado, entre em contato pelo WhatsApp:{" "}
              <a
                href="https://wa.me/5511991861237"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-600 underline font-semibold"
              >
                (11) 99186-1237
              </a>
            </p>
            <div>
              <Link href={'../Sobre'}>
                <button className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  Ver Benefícios
                </button>
              </Link>
            </div>
          </div>

          {/* Produtos dinâmicos */}
          {loading ? (
            <p>Carregando produtos...</p>
          ) : (
            products.map((product, index) => (
              <div
                key={product.id}
                className={`w-full md:w-80 p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer
                  ${index === 0 ? 'mt-8 sm:mt-12 md:mt-0' : ''}`} // espaçamento maior no topo em mobile
              >
                <Link href={product.href}>
                  <button className="rounded-md p-1 text-black font-semibold text-left w-full h-full">
                    <Image
                      src={product.images[0]}
                      width={425}
                      height={200}
                      alt={product.name}
                      className="object-cover rounded-md"
                    />
                    <p className="mt-5 text-xl">{product.name}</p>
                    <p className="text-gray-500 line-through text-xl">R$ {product.fullPrice}</p>
                    <p className="text-gray-800 text-2xl font-bold">{product.price}</p>
                    <p className="text-green-600 text-lg font-semibold">{product.discount}% OFF</p>
                  </button>
                </Link>
              </div>
            ))
          )}
        </div>
      </main>

      <Modal
        isVisible={showModal}
        onClose={() => setShowModal(false)}
        onSelect={(product) => setSelectedProduct(product)}
      />

      {selectedProduct && (
        <Link href={`/Produtos?id=${selectedProduct}`}>
          <div className="hidden" />
        </Link>
      )}
    </div>
  );
}
