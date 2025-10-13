"use client";

import { useState } from "react";
import type { Produto } from "../types/produto";

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
  const [fretes, setFretes] = useState<Frete[]>([]);
  const [shippingMethod, setShippingMethod] = useState("");
  const [loadingFrete, setLoadingFrete] = useState(false);
  const [errors, setErrors] = useState({
    nome: false,
    email: false,
    cpf: false,
    cep: false,
  });

  // ======================
  // 🔍 Funções de validação
  // ======================

  const validarEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validarCPF = (cpf: string) => {
    const clean = cpf.replace(/\D/g, "");
    if (clean.length !== 11 || /^(\d)\1+$/.test(clean)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(clean[i]) * (10 - i);
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(clean[9])) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(clean[i]) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    return resto === parseInt(clean[10]);
  };

  const validarCEP = (cep: string) => /^\d{5}-?\d{3}$/.test(cep);

  // ======================
  // 🚚 Consulta de Frete
  // ======================

  const consultarFrete = async () => {
    if (!validarCEP(cep)) {
      setErrors((e) => ({ ...e, cep: true }));
      return;
    }

    setLoadingFrete(true);
    setErrors((e) => ({ ...e, cep: false }));

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
      } else {
        setFretes(data.Servicos || []);
      }
    } catch (err) {
      console.error("Erro ao consultar frete:", err);
      alert("Erro ao consultar frete. Tente novamente.");
    } finally {
      setLoadingFrete(false);
    }
  };

  // ======================
  // 💳 Confirmação de Compra
  // ======================

  const handleConfirmarCompra = async () => {
    const novoErro = {
      nome: nome.trim() === "",
      email: !validarEmail(email),
      cpf: !validarCPF(cpf),
      cep: !validarCEP(cep),
    };
    setErrors(novoErro);

    if (Object.values(novoErro).some(Boolean)) {
      alert("Por favor, preencha os campos corretamente.");
      return;
    }

    if (!shippingMethod) {
      alert("Escolha um método de frete.");
      return;
    }

    const freteSelecionado =
      shippingMethod === "retirada"
        ? { Valor: "0,00" }
        : fretes.find((f) => f.Codigo === shippingMethod);

    if (!freteSelecionado) {
      alert("Frete inválido.");
      return;
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
            valor: freteSelecionado.Valor,
          },
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Erro ao criar sessão de pagamento.");
      }
    } catch (err) {
      console.error("Erro ao processar pagamento:", err);
      alert("Erro ao processar pagamento. Tente novamente.");
    }
  };

  const disabledButton =
    !nome ||
    !email ||
    !cpf ||
    !cep ||
    !shippingMethod ||
    loadingFrete ||
    fretes.length === 0;

  // ======================
  // 🧾 UI
  // ======================

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 p-4">
      <div className="flex flex-col w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 gap-5">
        <h2 className="text-3xl font-bold text-center text-gray-800">
          {produto.titulo}
        </h2>
        <p className="text-gray-600 text-center">
          Ano: {produto.anoSelecionado}
        </p>
        <p className="text-2xl font-semibold text-green-600 text-center">
          {produto.price}
        </p>

        {/* Campos de formulário */}
        <input
          type="text"
          placeholder="Nome completo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className={`border-b-2 p-2 text-center outline-none ${
            errors.nome
              ? "border-red-500"
              : "border-gray-300 focus:border-green-500"
          }`}
        />

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`border-b-2 p-2 text-center outline-none ${
            errors.email
              ? "border-red-500"
              : "border-gray-300 focus:border-green-500"
          }`}
        />

        <input
          type="text"
          placeholder="CPF"
          value={cpf}
          onChange={(e) =>
            setCpf(
              e.target.value
                .replace(/\D/g, "")
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
                .slice(0, 14)
            )
          }
          className={`border-b-2 p-2 text-center outline-none ${
            errors.cpf
              ? "border-red-500"
              : "border-gray-300 focus:border-green-500"
          }`}
        />

        <input
          type="text"
          placeholder="CEP"
          value={cep}
          onChange={(e) =>
            setCep(
              e.target.value
                .replace(/\D/g, "")
                .replace(/(\d{5})(\d)/, "$1-$2")
                .slice(0, 9)
            )
          }
          className={`border-b-2 p-2 text-center outline-none ${
            errors.cep
              ? "border-red-500"
              : "border-gray-300 focus:border-green-500"
          }`}
        />

        <button
          onClick={consultarFrete}
          disabled={loadingFrete}
          className="bg-blue-600 text-white py-2 rounded-md mt-2 w-full disabled:opacity-50 hover:bg-blue-700 transition-colors"
        >
          {loadingFrete ? "Consultando..." : "Calcular Frete"}
        </button>

        {/* Métodos de frete */}
        {fretes.length > 0 && (
          <div className="flex flex-col gap-2 mt-3">
            <label className="flex items-center gap-2 border p-2 rounded justify-center hover:shadow-sm">
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
                className="flex items-center gap-2 border p-2 rounded justify-center hover:shadow-sm"
              >
                <input
                  type="radio"
                  name="frete"
                  value={f.Codigo}
                  checked={shippingMethod === f.Codigo}
                  onChange={() => setShippingMethod(f.Codigo)}
                />
                {f.Codigo === "04014" ? "SEDEX" : "PAC"} — R${f.Valor} —{" "}
                {f.PrazoEntrega} dias úteis
              </label>
            ))}
          </div>
        )}

        <button
          onClick={handleConfirmarCompra}
          disabled={disabledButton}
          className="bg-green-600 text-white py-3 rounded-md mt-4 w-full font-semibold disabled:opacity-50 hover:bg-green-700 transition-colors"
        >
          Confirmar Compra
        </button>
      </div>
    </div>
  );
}
