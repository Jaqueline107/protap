"use client";

import React from "react";
import CarpetSelector from "../CarpetSelector/page";

export default function Banner() {
  return (
    <section className="w-full md:h-auto h-80 bg-gradient-to-r from-black via-[#1C1C1C] to-black text-white">
      <div className="max-w-6xl -mt-14 mx-auto px-6 lg:px-12 py-12 md:py-20 flex flex-col md:flex-row items-center justify-between gap-10">
        {/* Texto do Banner */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left md:w-1/2">
          {/* Logo/Nome (oculto no mobile) */}
          <h1 className="hidden md:block text-3xl sm:text-5xl font-extrabold leading-tight drop-shadow-lg text-white">
            ProTap
          </h1>

          {/* Subtítulo (desktop) */}
          <h2 className="hidden md:block text-lg sm:text-2xl font-light mt-2 text-gray-300">
            Tapetes de Carros Premium
          </h2>

          {/* Descrição (desktop) */}
          <p className="hidden md:block mt-4 text-gray-200 text-base sm:text-lg max-w-md">
            Qualidade, durabilidade e estilo para o seu veículo.
          </p>

          {/* Botão CTA (apenas desktop) */}
          <div className="mt-6 hidden md:block">
            <a
              href="#produtos"
              className="bg-[#E30613] hover:bg-[#B50B10] text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-300"
            >
              Escolher meu Tapete
            </a>
          </div>
        </div>
          <h1 className="md:hidden text-3xl -mt-10 sm:text-5xl font-bold leading-tight drop-shadow-lg text-white">
           Tapetes Automotivos
          </h1>
        <p className="md:hidden -mt-10 -mb-3 text-[#B3B3B3] text-center">
          Melhor do Brasil
        </p>
        <CarpetSelector />

      </div>
    </section>
  );
}
