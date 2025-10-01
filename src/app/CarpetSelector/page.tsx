"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  marca: string;
  modelo: string;
  ano: string[];
  fullPrice: string;
  price: string;
  description: string;
  images: string[];
}

interface Option {
  value: string;
  label: string;
}

export default function CarpetSelector() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [marcas, setMarcas] = useState<Option[]>([]);
  const [modelos, setModelos] = useState<Option[]>([]);
  const [anos, setAnos] = useState<Option[]>([]);

  const [selectedMarca, setSelectedMarca] = useState("");
  const [selectedModelo, setSelectedModelo] = useState("");
  const [selectedAno, setSelectedAno] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Carrega todos os produtos do Firebase ao iniciar
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/products"); // sua API que retorna produtos do Firebase
        if (!res.ok) throw new Error("Falha ao buscar produtos");
        const data: Product[] = await res.json();
        setProducts(data);

        const marcasUnicas = Array.from(new Set(data.map((p) => p.marca))).map(
          (m) => ({ value: m, label: m })
        );
        setMarcas(marcasUnicas);
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar produtos");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Atualiza os modelos quando a marca muda
  useEffect(() => {
    if (!selectedMarca) {
      setModelos([]);
      setSelectedModelo("");
      return;
    }

    const modelosUnicos = Array.from(
      new Set(
        products
          .filter((p) => p.marca === selectedMarca)
          .map((p) => p.modelo)
      )
    ).map((m) => ({ value: m, label: m }));

    setModelos(modelosUnicos);
    setSelectedModelo("");
  }, [selectedMarca, products]);

  // Atualiza os anos quando o modelo muda
  useEffect(() => {
    if (!selectedModelo) {
      setAnos([]);
      setSelectedAno("");
      return;
    }

    const anosUnicos = Array.from(
      new Set(
        products
          .filter(
            (p) => p.marca === selectedMarca && p.modelo === selectedModelo
          )
          .flatMap((p) => p.ano)
      )
    ).map((a) => ({ value: a, label: a }));

    setAnos(anosUnicos);
    if (!anosUnicos.find((a) => a.value === selectedAno)) setSelectedAno("");
  }, [selectedMarca, selectedModelo, products, selectedAno]); // adicionado selectedAno

  const handleVerTapete = () => {
    if (!selectedMarca || !selectedModelo) {
      alert("Por favor, selecione marca e modelo.");
      return;
    }

    const produtoSelecionado = products.find(
      (p) => p.marca === selectedMarca && p.modelo === selectedModelo
    );

    if (!produtoSelecionado) {
      alert("Produto não encontrado!");
      return;
    }

    const query = new URLSearchParams({ id: produtoSelecionado.id });
    if (selectedAno) query.set("ano", selectedAno);

    router.push(`/Produtos?${query.toString()}`);
  };

  return (
    <div className="w-full max-w-md bg-[#1C1C1C] shadow-xl rounded-2xl p-6 flex flex-col gap-4 border border-gray-800">
      <p className="text-white text-lg font-semibold">
        Encontre o tapete para o seu veículo
      </p>

      {error && <p className="text-red-500">{error}</p>}

      {/* Marca */}
      <select
        value={selectedMarca}
        onChange={(e) => setSelectedMarca(e.target.value)}
        disabled={loading}
        className="bg-black border border-gray-700 rounded-lg p-3 text-gray-300 focus:ring-2 focus:ring-[#E30613] focus:outline-none"
      >
        <option value="">
          {loading ? "Carregando marcas..." : "Selecione a marca"}
        </option>
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
        <option value="">
          {loading
            ? "Carregando modelos..."
            : selectedMarca
            ? "Selecione o modelo"
            : "Selecione a marca primeiro"}
        </option>
        {modelos.map((modelo) => (
          <option key={modelo.value} value={modelo.value}>
            {modelo.label}
          </option>
        ))}
      </select>

      {/* Ano */}
      {anos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {anos.map((ano) => (
            <button
              key={ano.value}
              onClick={() => setSelectedAno(ano.value)}
              className={`px-4 py-2 border rounded-lg font-semibold transition-all ${
                selectedAno === ano.value
                  ? "text-white border-green-600"
                  : "bg-transparent text-gray-300 border-gray-400 hover:bg-gray-700"
              }`}
            >
              {ano.label}
            </button>
          ))}
        </div>
      )}

      {/* Botão Ver Tapete */}
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
