"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  titulo?: string;
  marca?: string;
  modelo?: string;
  fullPrice?: string;
  price?: string | number;
  description?: string;
  images?: string[];
  width?: number;
  height?: number;
  length?: number;
  weight?: number;
}

export default function CarpetSelector() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedMarca, setSelectedMarca] = useState("");
  const [selectedModelo, setSelectedModelo] = useState("");

  // Carrega produtos (API ou rota que você tenha)
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        // Mantive fetch na rota /api/products como estava antes.
        // Se preferir buscar diretamente do firestore, altere essa rota ou substitua por getDocs.
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Falha ao buscar produtos");
        const data: Product[] = await res.json();
        setProducts(data || []);
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar produtos");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Computa marcas únicas (somente valores válidos)
  const marcas = useMemo(() => {
    const unique = Array.from(new Set(products.map((p) => (p.marca || "").trim()).filter(Boolean)));
    return unique.map((m) => ({ value: m, label: m }));
  }, [products]);

  // Computa modelos únicos da marca selecionada
  const modelos = useMemo(() => {
    if (!selectedMarca) return [];
    const unique = Array.from(
      new Set(products.filter((p) => (p.marca || "").trim() === selectedMarca).map((p) => (p.modelo || "").trim()).filter(Boolean))
    );
    return unique.map((m) => ({ value: m, label: m }));
  }, [products, selectedMarca]);

  const handleVerTapete = () => {
    if (!selectedMarca || !selectedModelo) {
      alert("Por favor, selecione marca e modelo.");
      return;
    }

    const produtoSelecionado = products.find(
      (p) => (p.marca || "").trim() === selectedMarca && (p.modelo || "").trim() === selectedModelo
    );

    if (!produtoSelecionado) {
      alert("Produto não encontrado!");
      return;
    }

    const query = new URLSearchParams({ id: produtoSelecionado.id });
    router.push(`/Produtos?${query.toString()}`);
  };

  return (
    <div className="w-full max-w-md bg-[#1C1C1C] shadow-xl rounded-2xl p-6 flex flex-col gap-4 border border-gray-800">
      <p className="text-white text-lg font-semibold">Encontre o tapete para o seu veículo</p>

      {error && <p className="text-red-500">{error}</p>}

      {/* Marca */}
      <select
        value={selectedMarca}
        onChange={(e) => {
          setSelectedMarca(e.target.value);
          setSelectedModelo("");
        }}
        disabled={loading || marcas.length === 0}
        className="bg-black border border-gray-700 rounded-lg p-3 text-gray-300 focus:ring-2 focus:ring-[#E30613] focus:outline-none"
      >
        <option value="">{loading ? "Carregando marcas..." : marcas.length ? "Selecione a marca" : "Nenhuma marca cadastrada"}</option>
        {marcas.map((marca) => (
          <option key={marca.value} value={marca.value}>
            {marca.label}
          </option>
        ))}
      </select>

      {/* Modelo */}
      <select
        value={selectedModelo}
        onChange={(e) => setSelectedModelo(e.target.value)}
        disabled={!selectedMarca || loading}
        className="bg-black border border-gray-700 rounded-lg p-3 text-gray-300 focus:ring-2 focus:ring-[#E30613] focus:outline-none"
      >
        <option value="">{loading ? "Carregando modelos..." : selectedMarca ? "Selecione o modelo" : "Selecione a marca primeiro"}</option>
        {modelos.map((modelo) => (
          <option key={modelo.value} value={modelo.value}>
            {modelo.label}
          </option>
        ))}
      </select>

      <button
        onClick={handleVerTapete}
        disabled={loading}
        className="bg-[#E30613] hover:bg-[#B50B10] text-white py-3 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-2"
      >
        Ver Tapete
      </button>
    </div>
  );
}
