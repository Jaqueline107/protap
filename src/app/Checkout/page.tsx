"use client";

import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../db/firebase";
import CheckoutForm from "./CheckoutClient";

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

export default function CheckoutPage({ searchParams }: { searchParams: URLSearchParams }) {
  const productId = searchParams.get("productId") || undefined;
  const ano = searchParams.get("ano") || undefined;

  const [produto, setProduto] = useState<Produto | null>(null);
  const [fretes, setFretes] = useState<Frete[]>([]);
  const [shippingMethod, setShippingMethod] = useState("");

  useEffect(() => {
    if (!productId) return;
    const fetchProduct = async () => {
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
      }
    };
    fetchProduct();
  }, [productId, ano]);

  const consultarFrete = async (cep: string) => {
    try {
      const res = await fetch("/api/correios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cepDestino: cep }),
      });
      const data = await res.json();
      setFretes(data.Servicos || []);
    } catch (err) {
      console.error(err);
      setFretes([]);
    }
  };

  const confirmarCompra = async ({ nome, email, cpf, cep }: any) => {
    if (!produto) return;

    let valorFrete = "0,00";
    if (shippingMethod !== "retirada") {
      const freteSelecionado = fretes.find((f) => f.Codigo === shippingMethod);
      if (!freteSelecionado) return alert("Frete inválido");
      valorFrete = freteSelecionado.Valor;
    }

    try {
      const res = await fetch("/api/checkout_sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { nome, email, cpf },
          items: [
            {
              id: produto.id,
              name: produto.titulo,
              price: produto.price,
              quantity: 1,
              ano: produto.anoSelecionado,
              images: produto.images,
            },
          ],
          shipping: {
            method: shippingMethod,
            valor: valorFrete,
          },
        }),
      });

      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert("Erro ao criar sessão de pagamento");
    } catch (err) {
      console.error(err);
      alert("Erro ao processar pagamento");
    }
  };

  if (!produto) return <p>Carregando...</p>;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-6">
      <div className="flex flex-col w-full max-w-md bg-white rounded-lg shadow-md p-8 gap-4">
        <h2 className="text-2xl font-bold text-center">{produto.titulo}</h2>
        <p className="text-gray-600 text-center">Ano: {produto.anoSelecionado}</p>
        <p className="text-gray-600 text-center">Modelo: {produto.modelo || "Não informado"}</p>
        <p className="text-2xl font-semibold text-green-700 text-center">{produto.price}</p>

        <CheckoutForm onConfirm={confirmarCompra} onConsultarFrete={consultarFrete} />

        <div className="flex flex-col gap-2 mt-2 w-full">
          <label className="flex items-center gap-2 border p-2 rounded cursor-pointer justify-center">
            <input
              type="radio"
              name="frete"
              value="retirada"
              checked={shippingMethod === "retirada"}
              onChange={() => setShippingMethod("retirada")}
            />
            Retirada na Loja (Grátis)
          </label>

          {fretes.map((f: Frete) => (
            <label
              key={f.Codigo}
              className="flex items-center gap-2 border p-2 rounded cursor-pointer justify-center"
            >
              <input
                type="radio"
                name="frete"
                value={f.Codigo}
                checked={shippingMethod === f.Codigo}
                onChange={() => setShippingMethod(f.Codigo)}
              />
              {f.Codigo === "04014" ? "Sedex" : "PAC"} - R${f.Valor} - {f.PrazoEntrega} dias
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
