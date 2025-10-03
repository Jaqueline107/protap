// src/app/Checkout/page.tsx
"use client";

import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../db/firebase";
import CheckoutForm from "./CheckoutForm";

export interface Produto {
  id: string;
  titulo: string;
  modelo?: string;
  ano?: string[];
  images: string[];
  fullPrice: string;
  price: string;
  anoSelecionado?: string | null;
}

interface CheckoutPageProps {
  searchParams: { [key: string]: string | undefined };
}

export default function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const productId = searchParams.productId;
  const ano = searchParams.ano;

  const [produto, setProduto] = useState<Produto | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || !productId) return;

    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "produtos", productId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as Omit<
            Produto,
            "id" | "price" | "anoSelecionado"
          >;

          const fullPrice = parseFloat(
            data.fullPrice.replace("R$", "").replace(",", ".")
          );
          const price = (fullPrice * 0.7).toFixed(2);

          setProduto({
            id: docSnap.id,
            ...data,
            price: `R$${price.replace(".", ",")}`,
            anoSelecionado: ano || (data.ano ? data.ano[0] : null),
          });
        } else {
          console.error("Produto não encontrado");
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchProduct();
  }, [mounted, productId, ano]);

  if (!mounted) return null;
  if (!produto) return <p className="p-8 text-center">Carregando produto...</p>;

  return <CheckoutForm produto={produto} />;
}
