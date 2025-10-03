"use client";

import { useState } from "react";

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

interface CheckoutFormProps {
  produto: Produto;
}

export default function CheckoutForm({ produto }: CheckoutFormProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [cep, setCep] = useState("");
  const [cpfErro, setCpfErro] = useState(false);
  const [cepErro, setCepErro] = useState(false);

  const [fretes, setFretes] = useState<Frete[]>([]);
  const [shippingMethod, setShippingMethod] = useState("");
  const [loadingFrete, setLoadingFrete] = useState(false);

  // Máscara de CPF
  const handleCpfChange = (value: string) => {
    let v = value.replace(/\D/g, "").slice(0, 11);
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    setCpf(v);
    if (cpfErro) setCpfErro(false);
  };

  // Máscara de CEP
  const handleCepChange = (value: string) => {
    let v = value.replace(/\D/g, "").slice(0, 8);
    v = v.replace(/(\d{5})(\d)/, "$1-$2");
    setCep(v);
    if (cepErro) setCepErro(false);
  };

  // Validação CPF
  const validarCPF = (cpf: string) => {
    const cleanCpf = cpf.replace(/\D/g, "");
    if (cleanCpf.length !== 11 || /^(\d)\1+$/.test(cleanCpf)) return false;

    let sum = 0;
    let rest;

    for (let i = 1; i <= 9; i++) sum += parseInt(cleanCpf.substring(i - 1, i)) * (11 - i);
    rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;
    if (rest !== parseInt(cleanCpf.substring(9, 10))) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) sum += parseInt(cleanCpf.substring(i - 1, i)) * (12 - i);
    rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;
    if (rest !== parseInt(cleanCpf.substring(10, 11))) return false;

    return true;
  };

  const validarCEP = (cep: string) => /^\d{5}-?\d{3}$/.test(cep);

  // Consulta frete via API
  const consultarFrete = async () => {
    if (!validarCEP(cep)) {
      setCepErro(true);
      alert("CEP inválido");
      return;
    }

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
      console.error(err);
      alert("Erro ao consultar frete");
      setFretes([]);
    } finally {
      setLoadingFrete(false);
    }
  };

  const handleConfirmarCompra = () => {
    if (!nome || !email || !cpf || !shippingMethod) {
      alert("Preencha todos os campos e escolha o frete");
      return;
    }

    if (!validarCPF(cpf)) {
      setCpfErro(true);
      return;
    }

    if (shippingMethod !== "retirada" && !validarCEP(cep)) {
      setCepErro(true);
      return;
    }

    alert("Tudo certo! Pode prosseguir com a compra.");
    // Aqui você chamaria a API do Stripe
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-6">
      <div className="flex flex-col w-full max-w-md bg-white rounded-lg shadow-md p-8 gap-4">
        <h2 className="text-2xl font-bold text-center">{produto.titulo}</h2>
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
          onChange={(e) => handleCpfChange(e.target.value)}
          className={`border-b-2 p-2 outline-none w-full text-center ${
            cpfErro ? "border-red-600" : "border-gray-300 focus:border-green-500"
          }`}
        />
        {cpfErro && <p className="text-red-600 text-sm text-center">CPF inválido</p>}

        <input
          type="text"
          placeholder="CEP"
          value={cep}
          onChange={(e) => handleCepChange(e.target.value)}
          className={`border-b-2 p-2 outline-none w-full text-center ${
            cepErro ? "border-red-600" : "border-gray-300 focus:border-green-500"
          }`}
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

          {fretes.map((f) => (
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
          onClick={handleConfirmarCompra}
          className="bg-green-600 text-white py-2 rounded mt-4 w-full"
        >
          Confirmar Compra
        </button>
      </div>
    </div>
  );
}
