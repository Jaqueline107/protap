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
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [cpfCnpjErro, setCpfCnpjErro] = useState(false);
  const [cep, setCep] = useState("");
  const [cepErro, setCepErro] = useState(false);
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

  // Função para validar CPF ou CNPJ
  const validarCpfCnpj = (value: string) => {
    const clean = value.replace(/\D/g, "");
    if (clean.length === 11) {
      // CPF
      let sum = 0;
      let rest;
      if (/^(\d)\1+$/.test(clean)) return false;
      for (let i = 1; i <= 9; i++) sum += parseInt(clean.substring(i - 1, i)) * (11 - i);
      rest = (sum * 10) % 11;
      if (rest === 10 || rest === 11) rest = 0;
      if (rest !== parseInt(clean.substring(9, 10))) return false;
      sum = 0;
      for (let i = 1; i <= 10; i++) sum += parseInt(clean.substring(i - 1, i)) * (12 - i);
      rest = (sum * 10) % 11;
      if (rest === 10 || rest === 11) rest = 0;
      if (rest !== parseInt(clean.substring(10, 11))) return false;
      return true;
    } else if (clean.length === 14) {
      // CNPJ
      let tamanho = clean.length - 2;
      let numeros = clean.substring(0, tamanho);
      let digitos = clean.substring(tamanho);
      let soma = 0;
      let pos = tamanho - 7;
      for (let i = tamanho; i >= 1; i--) {
        soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
        if (pos < 2) pos = 9;
      }
      let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
      if (resultado !== parseInt(digitos.charAt(0))) return false;
      tamanho = tamanho + 1;
      numeros = clean.substring(0, tamanho);
      soma = 0;
      pos = tamanho - 7;
      for (let i = tamanho; i >= 1; i--) {
        soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
        if (pos < 2) pos = 9;
      }
      resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
      if (resultado !== parseInt(digitos.charAt(1))) return false;
      return true;
    }
    return false;
  };

  // Função para validar CEP
  const validarCep = (value: string) => /^\d{5}-?\d{3}$/.test(value);

  const consultarFrete = async () => {
    if (!validarCep(cep)) {
      setCepErro(true);
      return;
    }
    setCepErro(false);
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
    if (!nome || !email || !cpfCnpj) return alert("Preencha todos os campos");

    if (!validarCpfCnpj(cpfCnpj)) {
      setCpfCnpjErro(true);
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
          customer: { nome, email, cpfCnpj },
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
          shipping: { method: shippingMethod, valor: valorFrete },
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
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-center">{produto.name}</h2>
        <p className="text-gray-600 text-center">Ano: {produto.anoSelecionado}</p>
        <p className="text-2xl font-semibold text-green-700 text-center">{produto.price}</p>

        <div className="flex flex-col gap-2">
          <label className="font-semibold">Nome completo</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="border-b-2 border-gray-300 focus:border-green-500 p-2 outline-none w-full"
          />

          <label className="font-semibold">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-b-2 border-gray-300 focus:border-green-500 p-2 outline-none w-full"
          />

          <label className="font-semibold">CPF ou CNPJ</label>
          <input
            type="text"
            value={cpfCnpj}
            onChange={(e) => {
              setCpfCnpj(e.target.value);
              if (cpfCnpjErro) setCpfCnpjErro(false);
            }}
            onBlur={() => setCpfCnpjErro(!validarCpfCnpj(cpfCnpj))}
            className={`border-b-2 p-2 outline-none w-full ${
              cpfCnpjErro ? "border-red-600" : "border-gray-300 focus:border-green-500"
            }`}
          />
          {cpfCnpjErro && <p className="text-red-600 text-sm">CPF ou CNPJ inválido</p>}

          <label className="font-semibold">CEP</label>
          <input
            type="text"
            value={cep}
            onChange={(e) => {
              setCep(e.target.value);
              if (cepErro) setCepErro(false);
            }}
            onBlur={() => setCepErro(!validarCep(cep))}
            className={`border-b-2 p-2 outline-none w-full ${
              cepErro ? "border-red-600" : "border-gray-300 focus:border-green-500"
            }`}
          />
          {cepErro && <p className="text-red-600 text-sm">CEP inválido</p>}

          <button
            onClick={consultarFrete}
            className="bg-blue-600 text-white py-2 rounded mt-2 w-full"
          >
            {loadingFrete ? "Consultando..." : "Calcular Frete"}
          </button>

          <label className="font-semibold mt-2">Escolha o frete</label>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 border p-2 rounded cursor-pointer">
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
                className="flex items-center gap-2 border p-2 rounded cursor-pointer"
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
            onClick={handleConfirmarCompra}
            className="bg-green-600 text-white py-2 rounded mt-4 w-full"
          >
            Confirmar Compra
          </button>
        </div>
      </div>
    </div>
  );
}
