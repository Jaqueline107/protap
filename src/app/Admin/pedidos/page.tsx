"use client"
import { useState, useEffect } from "react";
import { dbClient } from "../../../db/client";
import { collection, onSnapshot } from "firebase/firestore";

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(dbClient, "pedidos"), (snap) => {
      const list: any[] = [];
      snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      setPedidos(list);
    });
    return () => unsub();
  }, []);

  const gerarEtiqueta = async (id: string) => {
    const resp = await fetch("/api/gerar-etiqueta", {
      method: "POST",
      body: JSON.stringify({ orderId: id }),
      headers: { "Content-Type": "application/json" }
    });
    const data = await resp.json();
    console.log(data);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Pedidos</h1>

      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Cliente</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Etiqueta</th>
            <th className="p-2 border">Ações</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((p) => (
            <tr key={p.id}>
              <td className="border p-2">{p.id}</td>
              <td className="border p-2">{p?.cliente?.nome || "Sem nome"}</td>
              <td className="border p-2">{p.status}</td>
              <td className="border p-2">{p.etiquetaStatus}</td>
              <td className="border p-2">
                <button onClick={() => gerarEtiqueta(p.id)} className="px-3 py-1 border">
                  Gerar Etiqueta
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
