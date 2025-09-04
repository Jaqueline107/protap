"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import logo from "../../../public/logo.png";
import opala from "../../../public/opalaestrada.png";
import estrada from "../../../public/Chevrolet.png"; // imagem da estrada

export default function Banner() {
  const slides = [
    { id: 1, type: "image", img: opala },
    {
      id: 2,
      type: "text",
      title: "ProTap",
      subtitle: "Tapetes de carros",
      description: "Qualidade, durabilidade e estilo para o seu veículo.",
    },
  ];

  const [index, setIndex] = useState(0);

  const prevSlide = () => setIndex((prev) => (prev - 1 + slides.length) % slides.length);
  const nextSlide = () => setIndex((prev) => (prev + 1) % slides.length);

  useEffect(() => {
    const interval = setInterval(nextSlide, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  let touchStartX = 0;
  let touchEndX = 0;
  const handleTouchStart = (e: React.TouchEvent) =>
    (touchStartX = e.changedTouches[0].screenX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX = e.changedTouches[0].screenX;
    if (touchEndX < touchStartX - 50) nextSlide();
    if (touchEndX > touchStartX + 50) prevSlide();
  };

  return (
    <div
      className="-mt-24 w-full relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {slides.map(
        (slide, i) =>
          i === index && (
            <div key={slide.id} className="w-full relative">

              {/* Slide de imagem */}
              {slide.type === "image" && (
                <>
                  {/* Pequenas e médias (estrada) */}
                  <div className="flex lg:hidden relative w-full h-[400px] sm:h-[500px] md:h-[550px] justify-center items-center overflow-hidden">
                    <Image
                      src={estrada}
                      alt="Estrada"
                      className="object-contain w-full h-auto"
                      priority
                    />
                  </div>

                  {/* Grandes (Opala) */}
                  <div className="hidden lg:flex relative w-full h-[900px] justify-center items-center overflow-hidden">
                    <Image
                      src={opala}
                      alt="Opala na Estrada"
                      className="object-contain w-full h-auto"
                      priority
                    />
                  </div>
                </>
              )}

              {/* Slide de texto */}
              {slide.type === "text" && (
                <div
                  className="relative flex flex-col sm:flex-row items-center justify-center sm:justify-between
                  bg-black p-6 sm:p-8 h-auto sm:h-[450px] md:h-[500px]"
                >
                  {/* Texto apenas desktop */}
                  <div className="z-10 sm:w-1/2 text-center sm:text-left px-6 sm:px-8 hidden sm:flex flex-col">
                    <h1 className="text-4xl sm:text-6xl font-extrabold text-white drop-shadow-lg">
                      {slide.title}
                    </h1>
                    <h2 className="text-2xl sm:text-4xl font-light mt-2 text-gray-200">
                      {slide.subtitle}
                    </h2>
                    <p className="mt-4 text-gray-400 text-lg sm:text-xl">{slide.description}</p>
                  </div>

                  {/* Logo centralizado */}
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

              {/* Setas de navegação */}
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
