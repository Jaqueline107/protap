// /app/api/criarpedidoteste/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db/admin";

export async function POST() {
  try {

    const pedido = {
      cliente: {
        nome: "Teste Automático",
        email: "teste@teste.com",
        cpf: "00000000000",
      },
      endereco: {
        cep: "01001000",
        rua: "Rua Teste",
        numero: "123",
        bairro: "Centro",
        cidade: "São Paulo",
        estado: "SP",
      },
      frete: {
        codigo: "04014",
      },
      etiquetaStatus: "pendente",
      criadoEm: new Date(),
    };

    const ref = await db.collection("pedidos").add(pedido);

    return NextResponse.json({
      ok: true,
      id: ref.id,
      pedido,
    });

  } catch (err) {
    console.error("Erro ao criar pedido de teste:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
