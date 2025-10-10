"use client";

import { useState } from "react";
import { auth, db } from "../../db/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// Tipagem das props
interface AdminLoginProps {
  onSuccess: () => void;
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [senhaMaster, setSenhaMaster] = useState("");
  const [step, setStep] = useState(0); // 0 = senha master, 1 = login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const verificarSenhaMaster = () => {
    if (senhaMaster === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setStep(1);
      setError("");
    } else {
      setError("Senha incorreta!");
    }
  };

  const handleLogin = async () => {
    try {
      setError("");
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Verifica se é Admin no Firestore
      const docRef = doc(db, "admins", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        onSuccess();
      } else {
        setError("Usuário não autorizado como Admin!");
      }
    } catch (err: unknown) {
      // Tratamento seguro do erro
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocorreu um erro desconhecido ao logar.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        {step === 0 ? (
          <>
            <h2 className="text-xl font-bold mb-4">Senha Master</h2>
            <input
              type="password"
              value={senhaMaster}
              onChange={(e) => setSenhaMaster(e.target.value)}
              placeholder="Digite a senha"
              className="border p-2 rounded w-full mb-4"
            />
            <button
              onClick={verificarSenhaMaster}
              className="w-full bg-blue-600 text-white py-2 rounded"
            >
              Continuar
            </button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-4">Login Admin</h2>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="border p-2 rounded w-full mb-4"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              className="border p-2 rounded w-full mb-4"
            />
            <button
              onClick={handleLogin}
              className="w-full bg-green-600 text-white py-2 rounded"
            >
              Entrar
            </button>
          </>
        )}
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>
    </div>
  );
}
