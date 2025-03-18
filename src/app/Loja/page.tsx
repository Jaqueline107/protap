"use client";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { FaWhatsapp } from "react-icons/fa";

export default function Loja() {
  const vestidos = [
    { src: "/dress1.jpg", alt: "Dress 1", price: "R$ 299,99", available: true },
    {
      src: "/dress2.jpg",
      alt: "Dress 2",
      price: "R$ 249,99",
      available: false,
    },
    { src: "/dress3.jpg", alt: "Dress 3", price: "R$ 199,99", available: true },
    { src: "/dress4.jpg", alt: "Dress 4", price: "R$ 349,99", available: true },
    {
      src: "/dress5.jpg",
      alt: "Dress 5",
      price: "R$ 279,99",
      available: false,
    },
    { src: "/dress7.jpg", alt: "Dress 7", price: "R$ 349,99", available: true },

    // Adicione mais vestidos aqui
  ];

  // Função para agrupar vestidos de 3 em 3
  const groupedVestidos = [];
  for (let i = 0; i < vestidos.length; i += 3) {
    groupedVestidos.push(vestidos.slice(i, i + 3));
  }

  const handleClick = async () => {
    // Check if WhatApp installed, if yes open whatsapp else open whatsapp web

    if (navigator.userAgent.includes("WhatsApp")) {
      // WhatsApp is installed
      window.open(`whatsapp://send?phone=8879xxxxxx`);
    } else {
      // WhatsApp is not installed, open WhatsApp Web
      window.open("https://web.whatsapp.com/send?phone=8879xxxxxx", "_blank");
    }
  };

  return (
    <>
      <main className="flex flex-col gap-8 mt-20 pt-20 items-center bg-gray-50">
        <h1 className="text-orange-800 text-3xl font-bold mt-5">Loja</h1>
        {groupedVestidos.map((group, index) => (
          <div
            key={index}
            className="flex justify-center self-center w-full max-w-6xl mb-10"
          >
            <Carousel className="w-full">
              <CarouselContent className="flex justify-center">
                {group.map((vestido, idx) => (
                  <CarouselItem
                    key={idx}
                    className="relative basis-4/12 p-2 flex flex-col items-center"
                  >
                    <div className="relative w-full h-96">
                      <Image
                        src={vestido.src}
                        alt={vestido.alt}
                        layout="fill"
                        objectFit="cover"
                        priority
                        className="rounded-lg shadow-lg"
                      />
                      <button
                        className={`absolute top-4 left-4 px-1 py-1 rounded-md ${
                          vestido.available ? "bg-green-600" : "bg-red-600"
                        } text-white`}
                      >
                        {vestido.available ? "Disponível" : "Indisponível"}
                      </button>
                    </div>
                    <div className="bg-white text-gray-800 px-4 py-2 mt-4 rounded-md shadow-lg">
                      {vestido.price}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-0 z-10" />
              <CarouselNext className="absolute right-0 z-10" />
            </Carousel>
          </div>
        ))}
      </main>
      <div
        className="bg-green-600 w-min p-2 rounded-full fixed 
    bottom-10 right-4 cursor-pointer md:right-8"
        onClick={handleClick}
      >
        <FaWhatsapp color="white" className="w-7 h-7 md:w-10 md:h-10" />
      </div>
    </>
  );
}
