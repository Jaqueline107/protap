"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../db/firebase";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");
  const ano = searchParams.get("ano");

  const [produto, setProduto] = useState<any>(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [cpfErro, setCpfErro] = useState(false);
  const [cep, setCep] = useState("");
  const [fretes, setFretes] = useState<any[]>([]);
  const [shippingMethod, setShippingMethod] = useState("");
  const [loadingFrete, setLoadingFrete] = useState(false);

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "produtos", productId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const fullPrice = parseFloat(data.fullPrice.replace("R$", "").replace(",", "."));
          const price = (fullPrice * 0.7).toFixed(2);

          setProduto({
            id: docSnap.id,
            ...data,
            price: `R$${price.replace(".", ",")}`,
            anoSelecionado: ano || data.ano?.[0] || null,
          });
        } else console.error("Produto não encontrado");
      } catch (err) {
        console.error(err);
      }
    };

    fetchProduct();
  }, [productId, ano]);

  const validarCPF = (cpf: string) => {
    const cleanCpf = cpf.replace(/\D/g, "");
    if (cleanCpf.length !== 11) return false;
    if (/^(\d)\1+$/.test(cleanCpf)) return false;
    return true;
  };

  const consultarFrete = async () => {
    if (!cep) return alert("Digite seu CEP");
    setLoadingFrete(true);

    try {
      const res = await fetch("/api/correios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cepDestino: cep }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        setFretes([]);
      } else setFretes(data.Servicos || []);
    } catch (err) {
      console.error("Erro ao consultar frete:", err);
      alert("Erro ao consultar frete");
      setFretes([]);
    } finally {
      setLoadingFrete(false);
    }
  };

  const handleConfirmarCompra = async () => {
    if (!nome || !email || !cpf) return alert("Preencha todos os campos");
    if (!validarCPF(cpf)) {
      setCpfErro(true);
      return;
    }
    if (!shippingMethod) return alert("Escolha o frete");
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
              name: produto.name,
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

  if (!produto) return <p className="p-8 text-center">Carregando produto...</p>;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-6">
      {/* Formulário Centralizado */}
      <div className="flex flex-col w-full max-w-md bg-white rounded-lg shadow-md p-8 gap-4">
        <h2 className="text-2xl font-bold text-center">{produto.name}</h2>
        <p className="text-gray-600 text-center">Ano: {produto.anoSelecionado}</p>
        <p className="text-gray-600 text-center">Modelo: {produto.modelo || "Não informado"}</p>
        <p className="text-2xl font-semibold text-green-700 text-center">{produto.price}</p>

        <input
          type="text"
          placeholder="Nome completo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="border-b-2 border-gray-300 focus:border-green-500 p-2 outline-none w-full text-center"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border-b-2 border-gray-300 focus:border-green-500 p-2 outline-none w-full text-center"
        />
        <input
          type="text"
          placeholder="CPF"
          value={cpf}
          onChange={(e) => {
            setCpf(e.target.value);
            if (cpfErro) setCpfErro(false);
          }}
          className={`border-b-2 p-2 outline-none w-full text-center ${
            cpfErro ? "border-red-600" : "border-gray-300 focus:border-green-500"
          }`}
        />
        {cpfErro && <p className="text-red-600 text-sm text-center">CPF inválido</p>}

        <input
          type="text"
          placeholder="CEP"
          value={cep}
          onChange={(e) => setCep(e.target.value)}
          className="border-b-2 border-gray-300 focus:border-green-500 p-2 outline-none w-full text-center"
        />
        <button
          onClick={consultarFrete}
          className="bg-blue-600 text-white py-2 rounded mt-2 w-full"
        >
          {loadingFrete ? "Consultando..." : "Calcular Frete"}
        </button>

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

          {fretes.map((f: any) => (
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

        <button
          onClick={handleConfirmarCompras}
          className="bg-green-600 text-white py-2 rounded mt-4 w-full"
        >
          Confirmar Compra
        </button>
      </div>
    </div>
  );
}
