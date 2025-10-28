// src/app/api/frete/route.ts
import { NextResponse } from "next/server";
import axios from "axios";

// --- Tipos internos ---
interface Frete {
  codigo: "04014" | "04510"; // SEDEX ou PAC
  nome: string;
  valor: number;
  prazo: number;
}

// Tipagem do retorno da API do Melhor Envio
interface MelhorEnvioServico {
  name: "PAC" | "SEDEX" | string;
  price: string; // preço como string
  delivery_time: number;
  error?: string | null;
}

// Tipagem do corpo recebido
interface FreteRequestBody {
  cepDestino: string;
  peso: number;
  largura: number;
  altura: number;
  comprimento: number;
}

export async function POST(req: Request) {
  try {
    const body: FreteRequestBody = await req.json();
    const { cepDestino, peso, largura, altura, comprimento } = body;

    if (!cepDestino || !peso || !largura || !altura || !comprimento) {
      return NextResponse.json(
        { success: false, error: "Dados de frete incompletos." },
        { status: 400 }
      );
    }

    const apiKey = process.env.MELHOR_ENVIO_TOKEN;
    if (!apiKey) throw new Error("Chave MELHOR_ENVIO_TOKEN não definida");

    const res = await axios.post<MelhorEnvioServico[]>(
      "https://www.melhorenvio.com.br/api/v2/me/shipment/calculate",
      {
        from: { postal_code: "01001000" },
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
        shipping_company: "correios",
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = res.data;

    const servicos: Frete[] = data
      .filter((s) => (s.name === "PAC" || s.name === "SEDEX") && !s.error)
      .map((s) => ({
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    console.error("Erro ao calcular frete:", message);
    return NextResponse.json(
      { success: false, error: "Erro ao calcular frete. Tente novamente." },
      { status: 500 }
    );
  }
}
