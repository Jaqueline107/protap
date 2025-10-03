"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../db/firebase";

interface Produto {
  id: string;
  titulo: string;
  modelo?: string;
  ano?: string[];
  images: string[];
  fullPrice: string;
  price: string;
  anoSelecionado?: string | null;
}

interface Frete {
  Codigo: string;
  Valor: string;
  PrazoEntrega: string | number;
}

export default function CheckoutClient() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");
  const ano = searchParams.get("ano");

  const [mounted, setMounted] = useState(false);
  const [produto, setProduto] = useState<Produto | null>(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [cpfErro, setCpfErro] = useState(false);
  const [cep, setCep] = useState("");
  const [fretes, setFretes] = useState<Frete[]>([]);
  const [shippingMethod, setShippingMethod] = useState("");
  const [loadingFrete, setLoadingFrete] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || !productId) return;

    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "produtos", productId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as Omit<Produto, "id" | "price" | "anoSelecionado">;

          const fullPrice = parseFloat(data.fullPrice.replace("R$", "").replace(",", "."));
          const price = (fullPrice * 0.7).toFixed(2);

          setProduto({
            id: docSnap.id,
            ...data,
            price: `R$${price.replace(".", ",")}`,
            anoSelecionado: ano || (data.ano ? data.ano[0] : null),
          });
        } else console.error("Produto não encontrado");
      } catch (err) {
        console.error(err);
      }
    };

    fetchProduct();
  }, [mounted, productId, ano]);

  // Funções de validação e checkout permanecem iguais...
  // validarCPF, consultarFrete, handleConfirmarCompra

  if (!mounted) return null;
  if (!produto) return <p className="p-8 text-center">Carregando produto...</p>;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-6">
      {/* ...restante do JSX do Checkout */}
    </div>
  );
}
