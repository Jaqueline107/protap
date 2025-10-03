"use client";

import { useState, useEffect } from "react";

interface CheckoutFormProps {
  onConfirm: (data: {
    nome: string;
    email: string;
    cpf: string;
    cep: string;
  }) => void;
  onConsultarFrete: (cep: string) => void;
}

export default function CheckoutForm({ onConfirm, onConsultarFrete }: CheckoutFormProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [cpfErro, setCpfErro] = useState(false);
  const [cep, setCep] = useState("");
  const [cepErro, setCepErro] = useState(false);

  // Formatação simples de CPF
  const formatCPF = (value: string) => {
    const v = value.replace(/\D/g, "").slice(0, 11);
    return v
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  // Formatação simples de CEP
  const formatCEP = (value: string) => {
    const v = value.replace(/\D/g, "").slice(0, 8);
    return v.replace(/(\d{5})(\d)/, "$1-$2");
  };

  const validarCPF = (cpf: string) => {
    const cleanCpf = cpf.replace(/\D/g, "");
    if (cleanCpf.length !== 11) return false;
    if (/^(\d)\1+$/.test(cleanCpf)) return false;
    return true;
  };

  const validarCEP = (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");
    return cleanCep.length === 8;
  };

  const handleConfirm = () => {
    const cpfValido = validarCPF(cpf);
    const cepValido = validarCEP(cep);

    setCpfErro(!cpfValido);
    setCepErro(!cepValido);

    if (!cpfValido || !cepValido || !nome || !email) return;

    onConfirm({ nome, email, cpf, cep });
  };

  const handleConsultarFrete = () => {
    if (!validarCEP(cep)) {
      setCepErro(true);
      return;
    }
    setCepErro(false);
    onConsultarFrete(cep);
  };

  return (
    <div className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="Nome completo"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        className="border-b-2 border-gray-300 focus:border-green-500 p-2 outline-none w-full"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border-b-2 border-gray-300 focus:border-green-500 p-2 outline-none w-full"
      />
      <input
        type="text"
        placeholder="CPF"
        value={cpf}
        onChange={(e) => setCpf(formatCPF(e.target.value))}
        className={`border-b-2 p-2 outline-none w-full ${
          cpfErro ? "border-red-600" : "border-gray-300 focus:border-green-500"
        }`}
      />
      {cpfErro && <p className="text-red-600 text-sm">CPF inválido</p>}

      <input
        type="text"
        placeholder="CEP"
        value={cep}
        onChange={(e) => setCep(formatCEP(e.target.value))}
        className={`border-b-2 p-2 outline-none w-full ${
          cepErro ? "border-red-600" : "border-gray-300 focus:border-green-500"
        }`}
      />
      {cepErro && <p className="text-red-600 text-sm">CEP inválido</p>}

      <button
        onClick={handleConsultarFrete}
        className={`bg-blue-600 text-white py-2 rounded w-full`}
      >
        Consultar Frete
      </button>

      <button
        onClick={handleConfirm}
        className="bg-green-600 text-white py-2 rounded w-full"
      >
        Confirmar Compra
      </button>
    </div>
  );
}
