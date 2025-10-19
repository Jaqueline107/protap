"use client";

import { useState } from "react";
import type { Produto } from "../types/produto";

interface Frete {
  codigo: string;
  nome: string;
  valor: string;
  prazo: number;
}

interface CheckoutFormProps {
  produto: Produto;
}

export default function CheckoutForm({ produto }: CheckoutFormProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [cep, setCep] = useState("");
  const [fretes, setFretes] = useState<Frete[]>([]);
  const [shippingMethod, setShippingMethod] = useState("");
  const [loadingFrete, setLoadingFrete] = useState(false);
  const [erro, setErro] = useState("");
  const [emailErro, setEmailErro] = useState(false);
  const [cpfErro, setCpfErro] = useState(false);
  const [cepErro, setCepErro] = useState(false);

  // ✅ Validações simples
  const validarCPF = (value: string) => {
    const clean = value.replace(/\D/g, "");
    return clean.length === 11 && !/^(\d)\1+$/.test(clean);
  };

  const validarCEP = (value: string) => value.replace(/\D/g, "").length === 8;
  const validarEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.toLowerCase());

  // ✅ Calcular frete com Melhor Envio
  const consultarFrete = async () => {
    if (!validarCEP(cep)) {
      setCepErro(true);
      return;
    }

    setCepErro(false);
    setErro("");
    setLoadingFrete(true);

    try {
      const res = await fetch("/api/melhor-envio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cepDestino: cep,
          produto: {
            peso: produto.weight,
            largura: produto.width,
            altura: produto.height,
            comprimento: produto.length,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.servicos) {
        throw new Error("Erro ao obter o frete");
      }

      setFretes(data.servicos);
    } catch (error) {
      setErro("Erro na conexão com o servidor.");
    } finally {
      setLoadingFrete(false);
    }
  };

  // ✅ Botão de compra só habilita se tudo estiver válido
  const isButtonDisabled =
    !nome ||
    !email ||
    !validarEmail(email) ||
    !cpf ||
    !validarCPF(cpf) ||
    !cep ||
    !validarCEP(cep) ||
    !shippingMethod;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="flex flex-col w-full max-w-lg bg-white rounded-xl shadow-xl p-6 gap-5">
        {/* Produto */}
        <h2 className="text-3xl font-bold text-center">{produto.titulo}</h2>
        <p className="text-2xl font-semibold text-green-600 text-center">
          {produto.price}
        </p>

        {/* Dados pessoais */}
        <input
          type="text"
          placeholder="Nome completo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="border-b-2 border-gray-300 p-2 outline-none w-full text-center"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailErro(false);
          }}
          onBlur={() => !validarEmail(email) && setEmailErro(true)}
          className={`border-b-2 p-2 outline-none w-full text-center ${
            emailErro ? "border-red-600" : "border-gray-300"
          }`}
        />
        {emailErro && (
          <p className="text-red-600 text-sm text-center">Email inválido</p>
        )}

        <input
          type="text"
          placeholder="CPF"
          value={cpf}
          onChange={(e) => {
            const v = e.target.value
              .replace(/\D/g, "")
              .replace(/(\d{3})(\d)/, "$1.$2")
              .replace(/(\d{3})(\d)/, "$1.$2")
              .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
            setCpf(v);
            setCpfErro(false);
          }}
          maxLength={14}
          className={`border-b-2 p-2 outline-none w-full text-center ${
            cpfErro ? "border-red-600" : "border-gray-300"
          }`}
        />
        {cpfErro && (
          <p className="text-red-600 text-sm text-center">CPF inválido</p>
        )}

        <input
          type="text"
          placeholder="CEP"
          value={cep}
          onChange={(e) => {
            const v = e.target.value
              .replace(/\D/g, "")
              .replace(/(\d{5})(\d)/, "$1-$2")
              .slice(0, 9);
            setCep(v);
            setCepErro(false);
          }}
          maxLength={9}
          className={`border-b-2 p-2 outline-none w-full text-center ${
            cepErro ? "border-red-600" : "border-gray-300"
          }`}
        />
        {cepErro && (
          <p className="text-red-600 text-sm text-center">CEP inválido</p>
        )}

        <button
          onClick={consultarFrete}
          disabled={!validarCEP(cep) || loadingFrete}
          className="bg-blue-600 text-white py-2 rounded mt-2 w-full disabled:opacity-50"
        >
          {loadingFrete ? "Consultando..." : "Calcular Frete"}
        </button>

        {erro && <p className="text-red-600 text-center">{erro}</p>}

        {/* Opções de frete */}
        <div className="flex flex-col gap-2 mt-3">
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

          {fretes.map((f) => (
            <label
              key={f.codigo}
              className="flex items-center gap-2 border p-2 rounded cursor-pointer"
            >
              <input
                type="radio"
                name="frete"
                value={f.codigo}
                checked={shippingMethod === f.codigo}
                onChange={() => setShippingMethod(f.codigo)}
              />
              {f.nome} - R$ {f.valor} - {f.prazo} dias úteis
            </label>
          ))}
        </div>

        <button
          disabled={isButtonDisabled}
          className="bg-green-600 text-white py-2 rounded mt-4 w-full disabled:opacity-50"
        >
          Confirmar Compra
        </button>
      </div>
    </div>
  );
}
