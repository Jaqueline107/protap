"use client";

import React from "react";

export default function Banner() {
  return (
    <section className="w-full bg-gradient-to-r from-black via-gray-900 to-black text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 md:py-20 flex flex-col md:flex-row items-center justify-between gap-10">
        
        {/* Texto do Banner */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left md:w-1/2">
          <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight drop-shadow-lg">
            ProTap
          </h1>
          <h2 className="text-lg sm:text-2xl font-light mt-2 text-gray-300">
            Tapetes de Carros Premium
          </h2>
          <p className="mt-4 text-gray-400 text-base sm:text-lg max-w-md">
            Qualidade, durabilidade e estilo para o seu veículo. Conheça nossa
            linha exclusiva de tapetes automotivos.
          </p>

          {/* Botão CTA */}
          <div className="mt-6">
            <a
              href="#produtos"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition"
            >
              Ver Produtos
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
