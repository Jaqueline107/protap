"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import logo from "../../../public/logo.png";
import opala from "../../../public/opalaestrada.png";

export default function Banner() {
  const slides = [
    { id: 1, type: "image", img: opala, title: "", subtitle: "" },
    {
      id: 2,
      type: "text",
      img: null,
      title: "ProTap",
      subtitle: "Tapetes de carros",
      description: "Qualidade, durabilidade e estilo para o seu veículo.",
    },
  ];

  const [index, setIndex] = useState(0);

  const prevSlide = () => setIndex((prev) => (prev - 1 + slides.length) % slides.length);
  const nextSlide = () => setIndex((prev) => (prev + 1) % slides.length);

  // Auto play
  useEffect(() => {
    const interval = setInterval(nextSlide, 10000);
    return () => clearInterval(interval);
  }, []);

  // Navegação com teclado
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Swipe para mobile
  let touchStartX = 0;
  let touchEndX = 0;
  const handleTouchStart = (e: React.TouchEvent) => (touchStartX = e.changedTouches[0].screenX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX = e.changedTouches[0].screenX;
    if (touchEndX < touchStartX - 50) nextSlide();
    if (touchEndX > touchStartX + 50) prevSlide();
  };

  return (
    <div
      className="w-full -mt-24 5mx-auto relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {slides.map(
        (slide, i) =>
          i === index && (
            <div
              key={slide.id}
              className="w-full shadow-md mb-6 relative"
              style={{ minHeight: "400px" }} // altura do banner
            >
              {slide.type === "image" && (
                <div className="relative w-full h-80s sm:h-[450px] md:h-[640px] overflow-hidden">
                  <Image
                    src={slide.img}
                    alt="Opala na Estrada"
                    fill
                    className="object-cover w-full h-full rounded-sm"
                  />
                  <div className="absolute w-full h-full bg-black/20 rounded-sm" />
                </div>
              )}

              {slide.type === "text" && (
                <div
                  className="relative flex flex-col sm:flex-row items-center justify-center sm:justify-between
                  bg-gradient-to-r from-black via-gray-900 to-black p-6 sm:p-8 h-80 sm:h-[450px] md:h-[500px] rounded-sm"
                >
                  {/* Texto oculto no celular */}
                  <div className="z-10 sm:w-1/2 text-center sm:text-left px-6 sm:px-8 hidden sm:block">
                    <h1 className="text-4xl sm:text-6xl font-extrabold text-white drop-shadow-lg">
                      {slide.title}
                    </h1>
                    <h2 className="text-2xl sm:text-4xl font-light mt-2 text-gray-200">
                      {slide.subtitle}
                    </h2>
                    <p className="mt-4 text-gray-400 text-lg sm:text-xl">{slide.description}</p>
                  </div>

                  {/* Logo centralizado no celular */}
                  <div className="z-10 flex justify-center items-center w-full sm:w-1/2 mt-4 sm:mt-0">
                    <Image
                      src={logo}
                      width={250}
                      height={120}
                      alt="ProTap"
                      className="opacity-95 drop-shadow-xl"
                    />
                  </div>
                </div>
              )}

              {/* Setas de navegação escondidas no celular */}
              <button
                onClick={prevSlide}
                className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full z-20"
              >
                <FaChevronLeft size={20} />
              </button>
              <button
                onClick={nextSlide}
                className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full z-20"
              >
                <FaChevronRight size={20} />
              </button>
            </div>
          )
      )}
    </div>
  );
}
