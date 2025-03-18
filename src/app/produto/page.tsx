"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const AddProduto = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    available: false,
  });

  if (!isLoaded) {
    return <p>Carregando...</p>;
  }

  if (!user) {
    return <p>Você não tem permissão para acessar esta página.</p>;
  }

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    try {
      const response = await fetch("/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      console.log(response);
      if (response && response.status === 200) {
        router.push("/");
        console.log(response, "chegou aqui");
      } else {
        alert(response);
        console.error("Erro ao adicionar produto");
      }
    } catch (error) {
      console.error("Erro ao adicionar produto", error);
    }
  };

  return (
    <div className="mt-32">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 p-4 max-w-lg mx-auto"
      >
        <input
          type="text"
          placeholder="Nome do Produto"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          className="border p-2"
        />
        <input
          type="text"
          placeholder="Descrição do Produto"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
          className="border p-2"
        />
        <input
          type="text"
          placeholder="Preço"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
          className="border p-2"
        />
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={form.available}
            onChange={(e) => setForm({ ...form, available: e.target.checked })}
            className="mr-2"
          />
          Disponível
        </label>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Adicionar Produto
        </button>
      </form>
    </div>
  );
};

export default AddProduto;
