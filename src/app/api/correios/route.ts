import { NextResponse } from "next/server";
import axios from "axios";
import { calcularPrecoPrazo } from "correios-brasil";

const api = axios.create({
  timeout: 30000, // 30 segundos
});

// Valores de fallback configuráveis
const fallbackFrete = {
  PAC: { prazo: "5-10 dias úteis", valor: "R$ 30,00" },
  SEDEX: { prazo: "2-5 dias úteis", valor: "R$ 60,00" },
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cepDestino, peso, comprimento, altura, largura } = body;

    const args = {
      sCepOrigem: "01001-000", // ajuste para seu CEP de origem
      sCepDestino: cepDestino,
      nVlPeso: peso || "1",
      nCdFormato: "1",
      nVlComprimento: comprimento || "20",
      nVlAltura: altura || "20",
      nVlLargura: largura || "20",
      nVlDiametro: "0",
      sCdMaoPropria: "N",
      nVlValorDeclarado: "0",
      sCdAvisoRecebimento: "N",
      nCdServico: ["04014", "04510"], // SEDEX e PAC
    };

    const resultado = await calcularPrecoPrazo(args);

    return NextResponse.json({ sucesso: true, dados: resultado });
  } catch (err: any) {
    console.error("Erro ao consultar Correios:", err?.code || err);

    return NextResponse.json(
      {
        sucesso: false,
        erro: "Serviço dos Correios indisponível. Usando valores estimados.",
        estimativa: fallbackFrete,
      },
      { status: 503 }
    );
  }
}
