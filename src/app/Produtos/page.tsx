"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "../context/CartContext";
import { db } from "../../db/firebase";
import { doc, getDoc } from "firebase/firestore";

type Product = {
  id: string;
  titulo: string;
  fullPrice: string;
  price: string;
  description: string;
  images: string[];
  ano?: string[]; // 🔥 Importante — anos disponíveis
  modelo?: string;
};

// Converte preço string → number
const parsePrice = (value: string): number =>
  parseFloat(value.replace(/[^\d,]/g, "").replace(",", ".")) || 0;

const calculateDiscountPercentage = (fullPrice: string, price: string): number => {
  const numericFullPrice = parsePrice(fullPrice);
  const numericPrice = parsePrice(price);
  return Math.round(((numericFullPrice - numericPrice) / numericFullPrice) * 100);
};

function ProdutosContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");
  const anoSelecionadoQuery = searchParams.get("ano");

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState("");
  const [selectedAno, setSelectedAno] = useState<string | null>(anoSelecionadoQuery || null);
  const [showAnos, setShowAnos] = useState(false);
  const [showAnoError, setShowAnoError] = useState(false);

  const { addToCart } = useCart();
  const router = useRouter();

  // Busca produto
  const fetchProduct = async () => {
    if (!productId) return;

    try {
      const docRef = doc(db, "produtos", productId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as Product;

        const priceNumber = parsePrice(data.fullPrice);
        const discountPrice = (priceNumber * 0.7).toFixed(2).replace(".", ",");

        const updatedProduct = {
          ...data,
          id: docSnap.id,
          price: `R$${discountPrice}`,
          ano: Array.isArray(data.ano) ? data.ano : [], // 🔥 Garante que seja sempre array
        };

        setProduct(updatedProduct);
        setMainImage(updatedProduct.images?.[0] || "");
      } else {
        setProduct(null);
      }
    } catch (err) {
      console.error("Erro ao buscar produto:", err);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  if (loading) return <p>Carregando...</p>;
  if (!product) return <p>Produto não encontrado!</p>;

  const discountPercentage = calculateDiscountPercentage(product.fullPrice, product.price);

  const handleBuyNow = () => {
    if (product?.ano?.length && !selectedAno) {
      setShowAnoError(true);
      return;
    }

    if (!product?.id) {
      alert("Produto inválido. Tente novamente.");
      return;
    }

    router.push(`/Checkout?productId=${product.id}&ano=${selectedAno || ""}`);
  };

  const handleAnoClick = (ano: string) => {
    setSelectedAno(ano);
    setShowAnos(false);
    setShowAnoError(false);
  };

  return (
    <div className="flex flex-col items-center">
      <main className="w-5/6 mt-20 flex flex-col lg:flex-row gap-12">
        {/* 🖼️ Imagens */}
        <div className="flex flex-col items-center w-full lg:w-1/2">
          {mainImage && (
            <Image
              key={mainImage}
              src={mainImage}
              alt={product.titulo}
              width={500}
              height={500}
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="rounded-md"
            />
          )}

          <div className="flex h-32 gap-4 mt-8 justify-center">
            {product.images?.map((src, index) => (
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

        {/* 🧾 Informações */}
        <div className="w-full lg:w-1/2 flex flex-col justify-start mt-6 gap-3 lg:mt-0">
          <h1 className="text-3xl font-bold text-gray-900">{product.titulo}</h1>
          <h2 className="text-2xl font-bold text-gray-400 line-through">{product.fullPrice}</h2>

          <div className="flex gap-3">
            <p className="text-gray-700 text-4xl font-bold">{product.price}</p>
            {discountPercentage > 0 && (
              <p className="text-3xl font-bold text-lime-500">{discountPercentage}% OFF</p>
            )}
          </div>

          {/* ⚙️ Seleção de Ano */}
          {product.ano && product.ano.length > 0 && (
            <div className="relative mt-4">
              <button
                onClick={() => setShowAnos(!showAnos)}
                className={`px-4 py-2 border rounded-md font-semibold transition-all ${
                  selectedAno
                    ? "border-blue-500 text-blue-600"
                    : showAnoError
                    ? "border-red-500 bg-red-500 text-white"
                    : "border-gray-400 text-gray-500"
                }`}
              >
                {selectedAno || "Selecione o Ano"}
              </button>

              {showAnos && (
                <div className="absolute top-full left-0 mt-2 bg-white border rounded-md shadow-md z-50 p-2">
                  {product.ano
                    .filter((a) => a !== selectedAno)
                    .map((ano) => (
                      <button
                        key={ano}
                        onClick={() => handleAnoClick(ano)}
                        className="block w-full text-left px-3 py-1 rounded-md hover:bg-gray-100"
                      >
                        {ano}
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* 🛒 Botões */}
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={handleBuyNow}
              className="bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700 shadow-md"
            >
              Comprar Agora
            </button>

            <button
              onClick={() => addToCart({ ...product, quantity: 1, ano: selectedAno, name: "" })}
              className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 shadow-md"
            >
              Adicionar ao Carrinho
            </button>
          </div>

          {/* 📜 Descrição */}
          <div className="mt-6 p-4 bg-gray-100 rounded-lg shadow-inner max-h-60 overflow-y-auto">
            <h2 className="text-xl font-semibold mb-2">Descrição do Produto</h2>
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
