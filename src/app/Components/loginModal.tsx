'use client';

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registerMode, setRegisterMode] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (registerMode) await registerWithEmail(email, password);
      else await loginWithEmail(email, password);
      onClose();
    } catch (err: unknown) {
  if (err instanceof Error) {
    alert(err.message);
  } else {
    alert("Erro inesperado");
  }
  }
}


  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative shadow-lg">
        <h2 className="text-xl font-bold mb-4">{registerMode ? "Registrar" : "Login"}</h2>

        {/* Google Login */}
        <button
          onClick={loginWithGoogle}
          className="w-full bg-white text-gray-800 border border-gray-300 py-2 rounded flex items-center justify-center gap-3 mb-4 hover:bg-gray-100 transition"
        >
          {/* Ícone Google moderno */}
          <img src="/google-icon.svg" alt="Google" className="w-6 h-6" />
          <span className="font-medium">Entrar com Google</span>
        </button>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <button type="submit" className="bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">
            {registerMode ? "Registrar" : "Login"}
          </button>
        </form>

        <p className="mt-3 text-sm text-gray-500">
          {registerMode ? "Já tem conta?" : "Não tem conta?"}{" "}
          <button onClick={() => setRegisterMode(!registerMode)} className="text-blue-600 underline">
            {registerMode ? "Login" : "Registrar"}
          </button>
        </p>

        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 text-lg">×</button>
      </div>
    </div>
  );
}
