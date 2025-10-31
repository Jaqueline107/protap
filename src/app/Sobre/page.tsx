"use client";

import React from "react";

export default function SobreTapete() {
  return (
    <section className="w-full min-h-screen bg-gray-100 flex justify-center items-start py-16 px-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8">
        {/* Título */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 text-center mb-6">
          Benefícios e Características do Nosso Tapete HB20
        </h1>

        {/* Introdução */}
        <p className="text-gray-700 text-lg mb-6 text-center">
          Mantenha seu veículo impecável com nossos tapetes automotivos de alta qualidade, feitos para motoristas que valorizam durabilidade, conforto e praticidade.
        </p>

        {/* Benefícios */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">Benefícios:</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li><strong>Durabilidade:</strong> Resistente a viagens intensas e ao fluxo alto de passageiros, mais robusto que a borracha comum.</li>
            <li><strong>Prova d’água:</strong> Impermeabilizado, não absorve água.</li>
            <li><strong>Encaixe:</strong> Cortes precisos para proteger totalmente o assoalho do carro.</li>
            <li><strong>Fixação:</strong> Tecnologia que mantém o tapete firme no lugar, evitando movimentos indesejados.</li>
          </ul>
        </div>

        {/* Características Técnicas */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">Descrição Técnica:</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li><strong>Material:</strong> Emborrachado de PVC flexível</li>
            <li><strong>Dimensões:</strong> 
              <ul className="list-disc list-inside ml-5 space-y-1">
                <li>Motorista: 65 x 50 cm | Espessura 3-4 mm</li>
                <li>Passageiro: 69 x 48 cm | Espessura 3-4 mm</li>
                <li>Inteiriço Traseiro: 132 x 46 cm | Espessura 3-4 mm</li>
              </ul>
            </li>
            <li><strong>Cor:</strong> Preto</li>
            <li><strong>Textura:</strong> Frisado com serrilhado e base com travas</li>
            <li><strong>Personalização:</strong> Logo do carro em 3D, soldado por eletricidade</li>
            <li><strong>Compatibilidade:</strong> HB20 Hatch e Sedan 2012-2025, todas as versões</li>
            <li><strong>Peso:</strong> Aproximadamente 2,32kg</li>
          </ul>
        </div>

        {/* Cuidados e Garantia */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">Cuidados e Garantia:</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Limpeza: 1x por semana, utilizando produtos neutros.</li>
            <li>Garantia: Troca ou devolução em até 7 dias após o recebimento.</li>
            <li>Segurança: Pagamentos via Mercado Pago com garantia total.</li>
          </ul>
        </div>

        {/* Institucional */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">Sobre a ProTap:</h2>
          <p className="text-gray-700 text-lg">
            De forma profissional e ágil, buscamos oferecer produtos autênticos e de qualidade, sempre respeitando as necessidades de nossos clientes. Nosso objetivo é superar expectativas e proporcionar uma experiência de compra única.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <a
            href="#produtos"
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
          >
            Escolher Meu Tapete
          </a>
        </div>
      </div>
    </section>
  );
}
