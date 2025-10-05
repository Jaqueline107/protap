"use client";

import { useState } from "react";
import InputMask from "react-input-mask";
import { Produto } from "./page";

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

  // --- Validação CPF e CEP ---
  const validarCPF = (value: string) => {
    const cleanCpf = value.replace(/\D/g, "");
    if (cleanCpf.length !== 11) return false;
    if (/^(\d)\1+$/.test(cleanCpf)) return false;
    return true;
  };

  const validarCEP = (value: string) => {
    const cleanCep = value.replace(/\D/g, "");
    return cleanCep.length === 8;
  };

  // --- Consultar frete ---
  const consultarFrete = async () => {
    if (!validarCEP(cep)) {
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
      } else {
        setFretes(data.Servicos || []);
      }
    } catch (err) {
      console.error("Erro ao consultar frete:", err);
      setFretes([]);
    } finally {
      setLoadingFrete(false);
    }
  };

  // --- Confirmar compra ---
  const handleConfirmarCompra = async () => {
    if (!nome || !email || !cpf || !shippingMethod) return;
    if (!validarCPF(cpf)) {
      setCpfErro(true);
      return;
    }

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

  const isButtonDisabled =
    !nome ||
    !email ||
    !cpf ||
    !validarCPF(cpf) ||
    !cep ||
    !validarCEP(cep) ||
    !shippingMethod;

  // --- Renderização ---
  return (
    <div className="flex flex-col w-full max-w-md bg-white rounded-lg shadow-md p-8 gap-4">
      <h2 className="text-2xl font-bold text-center">{produto.titulo}</h2>
      <p className="text-gray-600 text-center">Ano: {produto.anoSelecionado}</p>
      <p className="text-2xl font-semibold text-green-700 text-center">{produto.price}</p>

      {/* Campos de dados pessoais */}
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
      <InputMask
        mask="999.999.999-99"
        value={cpf}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setCpf(e.target.value);
          if (cpfErro) setCpfErro(false);
        }}
      >
        {(inputProps: React.InputHTMLAttributes<HTMLInputElement>) => (
          <input
            {...inputProps}
            type="text"
            placeholder="CPF"
            className={`border-b-2 p-2 outline-none w-full text-center ${
              cpfErro ? "border-red-600" : "border-gray-300 focus:border-green-500"
            }`}
          />
        )}
      </InputMask>
      {cpfErro && <p className="text-red-600 text-sm text-center">CPF inválido</p>}

      {/* CEP e frete */}
      <InputMask
        mask="99999-999"
        value={cep}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setCep(e.target.value);
          if (cepErro) setCepErro(false);
        }}
      >
        {(inputProps: React.InputHTMLAttributes<HTMLInputElement>) => (
          <input
            {...inputProps}
            type="text"
            placeholder="CEP"
            className={`border-b-2 p-2 outline-none w-full text-center ${
              cepErro ? "border-red-600" : "border-gray-300 focus:border-green-500"
            }`}
          />
        )}
      </InputMask>

      <button
        onClick={consultarFrete}
        disabled={!validarCEP(cep) || loadingFrete}
        className="bg-blue-600 text-white py-2 rounded mt-2 w-full disabled:opacity-50"
      >
        {loadingFrete ? "Consultando..." : "Calcular Frete"}
      </button>

      {/* Métodos de envio */}
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

      {/* Botão confirmar compra */}
      <button
        onClick={handleConfirmarCompra}
        disabled={isButtonDisabled}
        className="bg-green-600 text-white py-2 rounded mt-4 w-full disabled:opacity-50"
      >
        Confirmar Compra
      </button>
    </div>
  );
}
