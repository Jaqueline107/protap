import { NextResponse } from "next/server";
import { db } from "../../../db/admin";
import { criarEnvioEPagar } from "@/app/lib/melhorenvio";

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: "orderId ausente" }, { status: 400 });
    }

    const pedidoRef = db.collection("pedidos").doc(orderId);
    const pedidoSnap = await pedidoRef.get();

    if (!pedidoSnap.exists) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    const pedido = pedidoSnap.data();

    // ✅ Proteção contra undefined
    const cliente = pedido?.cliente ?? {};
    const endereco = pedido?.endereco ?? {};
    const frete = pedido?.frete ?? {};

    // ✅ CEP sempre formatado corretamente
    const cepLimpo = (endereco.cep || "").replace(/\D/g, "");

    const resp = await criarEnvioEPagar({
      nomeDestinatario: cliente.nome || cliente.email || "Cliente",
      cpfCnpj: cliente.cpf || "",
      telefone: null,
      endereco: {
        postal_code: cepLimpo,
        street: endereco.rua || "",
        number: endereco.numero || "",
        complement: endereco.complemento || "",
        district: endereco.bairro || "",
        city: endereco.cidade || "",
        state: endereco.estado || "",
      },
      volume: {
        weight: 2.5,
        length: 90,
        height: 2,
        width: 60,
      },
      servicoCodigo: frete.codigo || "04014", // ✅ SEDEX padrão
      order_id: orderId, // ✅ Corrigido
    });

    await pedidoRef.update({
      etiquetaStatus: "gerada",
      etiqueta: resp,
      updatedAt: new Date(),
    });

    return NextResponse.json({ ok: true, etiqueta: resp });

  } catch (err) {
    console.error("Erro ao gerar etiqueta manual:", err);
    return NextResponse.json({ error: "Erro ao gerar etiqueta" }, { status: 500 });
  }
}
