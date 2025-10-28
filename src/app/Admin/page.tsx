"use client";

import { useEffect, useState } from "react";
import { db } from "../../db/firebase";
import { collection, getDocs } from "firebase/firestore";
import Image from "next/image";
import type { Produto } from ".././types/produto";

export default function HomePage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProdutos = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, "produtos"));
        const lista: Produto[] = snapshot.docs.map((doc) => {
          const data = doc.data() as Produto;
          return {
            id: doc.id,
            name: data.titulo,
            titulo: data.titulo,
            modelo: data.modelo,
            ano: data.ano,
            images: data.images || [],
            fullPrice: data.fullPrice,
            price: data.price,
            anoSelecionado: data.anoSelecionado,
            width: data.width,
            height: data.height,
            length: data.length,
            weight: data.weight,
          };
        });
        setProdutos(lista);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProdutos();
  }, []);

  if (loading) return <p className="text-center mt-32">Carregando produtos...</p>;

  return (
    <div className="p-8 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {produtos.map((produto) => (
        <div key={produto.id} className="border p-4 rounded shadow">
          {produto.images[0] && (
            <Image
              src={produto.images[0]}
              alt={produto.titulo}
              width={300}
              height={300}
              className="object-cover rounded"
            />
          )}
          <h2 className="mt-2 font-bold">{produto.titulo}</h2>
          <p className="text-gray-600">
            R$ {parseFloat(produto.price || "0").toFixed(2)}
          </p>
        </div>
      ))}
    </div>
  );
}
