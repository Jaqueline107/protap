"use client";

import { Suspense, useState, useEffect } from "react";
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
  Opala: {
    name: "Tapete Opala",
    price: "R$39,90",
    description:
      "Tapetes projetados para proteger o assoalho do seu carro, Feito com materiais resistentes e design funcional.",
    images: [
      "/opala/opala.png",
      "/opala/opala1.png",
      "/opala/opala2.png",
      "/opala/opala3.png",
      "/opala/beneficio.png",
      "/opala/beneficio1.png",
      "/opala/beneficio2.png",
      "/opala/beneficio3.png",
    ],
  },
  UnoStreet: {
    name: "Tapete Uno Street",
    price: "R$39,00",
    description:
      "Tapetes projetados para proteger o assoalho do seu carro, Feito com materiais resistentes e design funcional.",
    images: [
      "/unos/unostreet.png",
      "/unos/unostreet1.png",
      "/unos/unostreet2.png",
    ],
  },
  KombiMala: {
    name: "Tapete Kombi Mala",
    price: "R$81,99",
    description:
      "Tapetes projetados para o espaço de bagagem da Kombi. Feito com materiais resistentes e design funcional, ideal para transporte seguro.",
    images: ["/kombi/kombimala.png", "/kombi/kombimala1.png"],
  },
  Hb20s: {
    name: "Tapete HB20s street",
    price: "R$39,00",
    description:
      "Tapetes projetados para o espaço de bagagem da Kombi. Feito com materiais resistentes e design funcional, ideal para transporte seguro.",
    images: ["/hb20/hb20.png", "/hb20/hb201.png"],
  },
  Tcross: {
    name: "Tapete Tcross",
    price: "R$109,91",
    description:
      "Tapetes exclusivos para o T-Cross, com bordado elegante e base pinada para maior aderência. Oferecem proteção, estilo e segurança ao interior do veículo.",
    images: ["/Tcross.png", "/Tcross.png"],
  },
  Polo: {
    name: "Tapete Polo",
    price: "R$112,50",
    description:
      "Tapetes sob medida para o Polo, combinando bordado exclusivo e base pinada para maior aderência. Proporcionam elegância, proteção e segurança ao interior do veículo.",
    images: ["/polo/polo.png", "/beneficio/polo.png"],
  },
  Hilux: {
    name: "Tapete Hilux",
    price: "R$112,50",
    description:
      "Tapetes sob medida para a Hilux, desenvolvidos com bordado exclusivo e base pinada para garantir aderência e segurança. Proporcionam estilo, proteção e durabilidade ao interior do veículo, alinhando conforto e sofisticação.",
    images: ["/hilux/hilux.png", "/hilux/hilux.png"],
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

  // Função para mudar a imagem ao pressionar as setas do teclado
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        // Mudar para a imagem anterior
        setMainImage((prev) => {
          const currentIndex = product.images.indexOf(prev);
          return product.images[
            (currentIndex - 1 + product.images.length) % product.images.length
          ];
        });
      } else if (event.key === "ArrowRight") {
        // Mudar para a próxima imagem
        setMainImage((prev) => {
          const currentIndex = product.images.indexOf(prev);
          return product.images[(currentIndex + 1) % product.images.length];
        });
      }
    };

    // Adicionar evento de teclado
    window.addEventListener("keydown", handleKeyDown);

    // Limpar evento de teclado quando o componente for desmontado
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [product.images]);

  // Função para mudar a imagem ao deslizar no celular
  const handleTouchStart = (e: React.TouchEvent) => {
    const touchStart = e.touches[0].clientX;

    // Função para capturar o movimento do toque
    const handleTouchMove = (e: TouchEvent) => {
      // Corrigido o tipo aqui
      const touchEnd = e.touches[0].clientX;

      // Verificar direção do toque
      if (touchStart - touchEnd > 100) {
        // Deslizou para a esquerda (trocar para próxima imagem)
        setMainImage((prev) => {
          const currentIndex = product.images.indexOf(prev);
          return product.images[(currentIndex + 1) % product.images.length];
        });
      } else if (touchEnd - touchStart > 100) {
        // Deslizou para a direita (trocar para imagem anterior)
        setMainImage((prev) => {
          const currentIndex = product.images.indexOf(prev);
          return product.images[
            (currentIndex - 1 + product.images.length) % product.images.length
          ];
        });
      }
    };

    // Adicionar o evento de touchmove
    window.addEventListener("touchmove", handleTouchMove);

    // Remover o evento touchmove após o toque ser finalizado
    window.addEventListener("touchend", () => {
      window.removeEventListener("touchmove", handleTouchMove);
    });
  };

  return (
    <div className="flex flex-col items-center">
      <Banner />

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

          {/* Aqui removi a rolagem horizontal e adicionei uma classe para alinhamento das miniaturas */}
          <div className="flex h-32 gap-4 mt-8 justify-center">
            {product.images.map((src, index) => (
              <button
                key={index}
                onClick={() => setMainImage(src)}
                className="focus:outline-none"
              >
                <Image
                  src={src}
                  alt={`Miniatura ${index}`}
                  width={110} // Tamanho maior para desktop
                  height={70}
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
        <div className="w-full lg:w-1/2 flex flex-col justify-start mt-6 lg:mt-0">
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-green-600 text-4xl font-bold mt-2">
            {product.price}
          </p>

          <button
            onClick={() => {
              // Mensagem para o WhatsApp
              const message = `Olá, gostaria de comprar o ${product.name} pelo preço de ${product.price}.`;

              // Número de telefone do WhatsApp com DDD
              const phoneNumber = "5511991861237";

              // URL formatado para abrir no WhatsApp com a mensagem e número
              const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
                message
              )}`;

              // Abrir o link no WhatsApp (web ou mobile)
              window.open(whatsappUrl, "_blank");
            }}
            className="bg-green-600 text-white font-semibold text-xl py-3 md:w-2/6 sm:w-6/6 px-6 rounded-lg hover:bg-green-700 shadow-md transition-all mt-4"
          >
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
