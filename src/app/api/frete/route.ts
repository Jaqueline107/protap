// src/app/api/frete/route.ts
import { NextResponse } from "next/server";
import axios from "axios";

interface Frete {
  codigo: "04014" | "04510"; // SEDEX ou PAC
  nome: string;
  valor: number;
  prazo: number;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cepDestino, peso, largura, altura, comprimento } = body;

    console.log("Recebido no backend:", { cepDestino, peso, largura, altura, comprimento });

    // Chamada ao Melhor Envio
    const apiKey = process.env.MELHOR_ENVIO_TOKEN;
    if (!apiKey) throw new Error("Chave MELHOR_ENVIO_TOKEN não definida");

    const res = await axios.post(
      "https://www.melhorenvio.com.br/api/v2/me/shipment/calculate",
      {
        from: { postal_code: "01001000" }, // CEP da sua loja
        to: { postal_code: cepDestino },
        products: [
          {
            weight: peso,
            length: comprimento,
            height: altura,
            width: largura,
            quantity: 1,
          },
        ],
        shipping_company: "correios", // Correios apenas
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = res.data;
    console.log("Resposta do Melhor Envio:", JSON.stringify(data, null, 2));

    // Filtrar apenas PAC e SEDEX que estejam disponíveis
    const servicos: Frete[] = data
      .filter((s: any) =>
        (s.name === "PAC" || s.name === "SEDEX") && !s.error
      )
      .map((s: any) => ({
        codigo: s.name === "PAC" ? "04510" : "04014",
        nome: s.name,
        valor: parseFloat(s.price),
        prazo: s.delivery_time,
      }));

    if (servicos.length === 0) {
      return NextResponse.json(
        { success: false, error: "Nenhum serviço de frete disponível para este CEP." },
        { status: 200 }
      );
    }

    return NextResponse.json({ success: true, servicos }, { status: 200 });
  } catch (err: any) {
    console.error("Erro ao calcular frete:", err.message || err);
    return NextResponse.json(
      { success: false, error: "Erro ao calcular frete. Tente novamente." },
      { status: 500 }
    );
  }
}
