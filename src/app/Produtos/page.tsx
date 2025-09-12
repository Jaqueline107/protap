"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { useCart } from "../context/CartContext";
import { db } from "../../db/firebase";
import { doc, getDoc } from "firebase/firestore";

type Product = {
  name: string;
  price: string;
  fullPrice: string;
  description: string;
  images: string[];
};

const calculateDiscountPercentage = (fullPrice: string, price: string): number => {
  const numericFullPrice = parseFloat(fullPrice.replace("R$", "").replace(",", "."));
  const numericPrice = parseFloat(price.replace("R$", "").replace(",", "."));
  const discountPercentage = ((numericFullPrice - numericPrice) / numericFullPrice) * 100;
  return Math.round(discountPercentage);
};

function ProdutosContent() {
  const searchParams = useSearchParams();
  const produto = searchParams.get("produto");

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState("");
  const { addToCart } = useCart();

  useEffect(() => {
    if (!produto) return;

    const fetchProduct = async () => {
      const docRef = doc(db, "produtos", produto);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as Product;
        setProduct(data);
        setMainImage(data.images[0]);
      } else {
        setProduct(null);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [produto]);

  useEffect(() => {
    if (!product) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        setMainImage((prev) => {
          const currentIndex = product.images.indexOf(prev);
          return product.images[(currentIndex - 1 + product.images.length) % product.images.length];
        });
      } else if (event.key === "ArrowRight") {
        setMainImage((prev) => {
          const currentIndex = product.images.indexOf(prev);
          return product.images[(currentIndex + 1) % product.images.length];
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [product]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!product) return;
    const touchStart = e.touches[0].clientX;

    const handleTouchMove = (e: TouchEvent) => {
      const touchEnd = e.touches[0].clientX;
      if (touchStart - touchEnd > 100) {
        setMainImage((prev) => {
          const currentIndex = product.images.indexOf(prev);
          return product.images[(currentIndex + 1) % product.images.length];
        });
      } else if (touchEnd - touchStart > 100) {
        setMainImage((prev) => {
          const currentIndex = product.images.indexOf(prev);
          return product.images[(currentIndex - 1 + product.images.length) % product.images.length];
        });
      }
    };

    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", () => {
      window.removeEventListener("touchmove", handleTouchMove);
    });
  };

  if (loading) return <p>Carregando...</p>;
  if (!product) return <p>Produto não encontrado!</p>;

  const discountPercentage = calculateDiscountPercentage(product.fullPrice, product.price);

  return (
    <div className="flex flex-col items-center">
      {/* <Banner /> */}

      <main className="w-5/6 mt-20 flex flex-col lg:flex-row gap-12">
        {/* Seção de Imagens */}
        <div className="flex flex-col items-center w-full lg:w-1/2">
          <Image
            key={mainImage}
            src={mainImage}
            alt={product.name}
            width={500}
            height={500}
            priority
            className="rounded-sm"
            onTouchStart={handleTouchStart}
          />
          <div className="flex h-32 gap-4 mt-8 justify-center">
            {product.images.map((src, index) => (
              <button key={index} onClick={() => setMainImage(src)} className="focus:outline-none">
                <Image
                  src={src}
                  alt={`Miniatura ${index}`}
                  width={110}
                  height={70}
                  className={`cursor-pointer rounded-md border transition-all ${
                    mainImage === src ? "border-green-500 scale-105" : "border-gray-300"
                  } hover:border-green-500`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Seção de Informações */}
        <div className="w-full lg:w-1/2 flex flex-col justify-start mt-6 gap-1 lg:mt-0">
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <h1 className="text-2xl font-bold text-gray-400 line-through">{product.fullPrice}</h1>
          <div className="flex gap-3">
            <p className="text-gray-700 text-4xl font-bold -mt-1">{product.price}</p>
            {discountPercentage === 30 && <p className="text-3xl font-bold text-lime-500">30% OFF</p>}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full max-w-md">
            <button
              onClick={() => {
                const message = `Olá, gostaria de comprar o ${product.name} pelo preço de ${product.price}.`;
                const phoneNumber = "5511991861237";
                const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, "_blank");
              }}
              className="bg-green-600 text-white font-semibold text-md py-3 md:w-2/6 sm:w-6/6 px-6 rounded-lg hover:bg-green-700 shadow-md transition-all mt-4"
            >
              Comprar Agora
            </button>
            <button
              onClick={() => {
                addToCart({ ...product, quantity: 1 });
              }}
              className="bg-blue-600 text-white font-semibold text-md py-3 md:w-2/6 sm:w-6/6 px-6 rounded-lg hover:bg-blue-700 shadow-md transition-all mt-4"
            >
              Adicionar ao Carrinho
            </button>
          </div>

          <div className="mt-6 p-4 h-52 bg-gray-100 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Descrição do Produto</h2>
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
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
