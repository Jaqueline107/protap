"use client";
import React, { useEffect } from "react";
import Link from "next/link";

export default function Modal({ isVisible, onClose, onSelect }) {
  // Fecha o modal ao pressionar ESC
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      onClick={onClose} // Fecha ao clicar fora do modal
    >
      <div
        className="bg-white rounded-lg p-6 w-80 relative"
        onClick={(e) => e.stopPropagation()} // Evita fechar ao clicar dentro
      >
        {/* Botão de fechar */}
        <button
          onClick={onClose}
          className="absolute top-0 right-2 text-4xl text-gray-700 hover:text-black"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-4">Selecione o modelo</h2>
        <div className="flex flex-col gap-4">
          <Link href="/Produtos?produto=Opala">
            <button
              onClick={() => onSelect("Opala")}
              className="w-full bg-gray-200 hover:bg-green-400 p-3 rounded-md text-xl text-left"
            >
              Tapete Opala
            </button>
          </Link>
          <Link href="/Produtos?produto=KombiMala">
            <button
              onClick={() => onSelect("KombiMala")}
              className="w-full bg-gray-200 hover:bg-green-400 p-3 rounded-md text-xl text-left"
            >
              Tapete Kombi Mala
            </button>
          </Link>
          <Link href="/Produtos?produto=UnoStreet">
            <button
              onClick={() => onSelect("UnoStreet")}
              className="w-full bg-gray-200 hover:bg-green-400 p-3 rounded-md text-xl text-left"
            >
              Tapete Uno Street
            </button>
          </Link>
          <Link href="/Produtos?produto=Hb20s">
            <button
              onClick={() => onSelect("Hb20s")}
              className="w-full bg-gray-200 hover:bg-green-400 p-3 rounded-md text-xl text-left"
            >
              Tapete HB20s Street
            </button>
          </Link>
          <Link href="/Produtos?produto=Tcross">
            <button
              onClick={() => onSelect("Tcross")}
              className="w-full bg-gray-200 hover:bg-green-400 p-3 rounded-md text-xl text-left"
            >
              Tapete T-Cross
            </button>
          </Link>
          <Link href="/Produtos?produto=Polo">
            <button
              onClick={() => onSelect("Polo")}
              className="w-full bg-gray-200 hover:bg-green-400 p-3 rounded-md text-xl text-left"
            >
              Tapete Polo
            </button>
          </Link>
        </div>

        {/* Alerta de contato */}
        <div className="mt-4 bg-yellow-200 text-yellow-800 p-3 rounded-md text-center">
          <p>
            Não encontrou o modelo desejado? Entre em contato conosco pelo
            WhatsApp:{" "}
            <span className="font-semibold">+55 11 99186-1237</span>.
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full bg-red-600 text-white p-2 rounded-md hover:bg-red-700"
        >
          Não quero ver os benefícios
        </button>
      </div>
    </div>
  );
}
