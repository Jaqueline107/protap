"use client";

import { use, useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../db/firebase";
import CheckoutForm from "./CheckoutForm";
import type { Produto } from "../types/produto";

interface CheckoutPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const [produto, setProduto] = useState<Produto | null>(null);
  const [produtos, setProdutos] = useState<Produto[] | null>(null);
  const [mounted, setMounted] = useState(false);

  const params = use(searchParams);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;

    const fetchData = async () => {
      try {
        // ✅ Veio do carrinho
        if (params.items) {
          const parsedItems: Produto[] = JSON.parse(params.items).map((item: any) => ({
            id: item.id,
            titulo: item.titulo,
            price: item.price,
            fullPrice: item.fullPrice,
            images: item.images,
            quantity: item.quantity || 1,
            weight: item.weight || 0,
            width: item.width || 0,
            height: item.height || 0,
            length: item.length || 0,
            ano: Array.isArray(item.ano) ? item.ano : item.ano ? [item.ano] : null,
            anoSelecionado: item.ano || null,
          }));
          setProdutos(parsedItems);
          return;
        }

        // ✅ Veio da página do produto
        if (params.productId) {
          const docRef = doc(db, "produtos", params.productId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data() as Omit<Produto, "id" | "price" | "anoSelecionado">;
            const fullPriceValue = data.fullPrice
              ? parseFloat(data.fullPrice.replace("R$", "").replace(",", "."))
              : 0;
            const priceValue = fullPriceValue * 0.7;

            setProduto({
              id: docSnap.id,
              ...data,
              price: `R$${priceValue.toFixed(2).replace(".", ",")}`,
              anoSelecionado: params.ano || (data.ano ? data.ano[0] : null),
            });
          } else {
            console.error("Produto não encontrado");
          }
        }
      } catch (err) {
        console.error("Erro ao carregar checkout:", err);
      }
    };

    fetchData();
  }, [mounted, params]);

  if (!mounted) return null;

  if (!produto && !produtos) {
    return <p className="p-8 text-center">Carregando produtos para checkout...</p>;
  }

  return (
    <CheckoutForm
      produto={produto ?? undefined}
      produtos={produtos ?? undefined}
    />
  );
}
