"use client";

import { useEffect } from "react";
import Link from "next/link";

type ModalProps = {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (product: string) => void;
};

export default function Modal({ isVisible, onClose, onSelect }: ModalProps) {
  // Adiciona evento para fechar o modal ao pressionar a tecla ESC
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose(); // Fecha o modal ao pressionar ESC
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown); // Limpa o evento ao desmontar
  }, [onClose]);

  if (!isVisible) return null; // Não renderiza o modal se não estiver visível

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      onClick={onClose} // Fecha ao clicar fora do modal
    >
      <div
        className="bg-white rounded-lg p-6 w-80 relative"
        onClick={(e) => e.stopPropagation()} // Impede que o clique no modal feche-o
      >
        {/* Ícone de fechar (Fix) */}
        <button
          onClick={onClose}
          className="absolute top-0 right-2 text-4xl text-gray-700 hover:text-black"
        >
          &times; {/* Ícone de fechar simples */}
        </button>

        <h2 className="text-2xl font-bold mb-4">Selecione o modelo</h2>
        <div className="flex flex-col gap-4">
          <Link href="/Produtos?produto=Opala">
            <button
              onClick={() => onSelect("Opala")}
              className="w-full bg-gray-200 hover:bg-lime-200 p-3 rounded-md text-xl text-left"
            >
              Tapete Opala
            </button>
          </Link>
          <Link href="/Produtos?produto=KombiMala">
            <button
              onClick={() => onSelect("KombiMala")}
              className="w-full bg-gray-200 hover:bg-lime-200 p-3 rounded-md text-xl text-left"
            >
              Tapete Kombi Mala
            </button>
          </Link>
          <Link href="/Produtos?produto=UnoStreet">
            <button
              onClick={() => onSelect("UnoStreet")}
              className="w-full bg-gray-200 hover:bg-lime-200 p-3 rounded-md text-xl text-left"
            >
              Tapete Uno Street
            </button>
          </Link>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full bg-red-600 text-white p-2 rounded-md hover:bg-red-700"
        >
          Não quero ver os beneficios
        </button>
      </div>
    </div>
  );
}
