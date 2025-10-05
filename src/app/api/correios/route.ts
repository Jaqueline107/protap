import { NextResponse } from "next/server";
import { calcularPrecoPrazo } from "correios-brasil";

// Tipagem da estrutura esperada pelo correios-brasil
interface CorreiosArgs {
  sCepOrigem: string;
  sCepDestino: string;
  nVlPeso: string;
  nCdFormato: string;
  nVlComprimento: string;
  nVlAltura: string;
  nVlLargura: string;
  nVlDiametro: string;
  sCdMaoPropria: string;
  nVlValorDeclarado: string;
  sCdAvisoRecebimento: string;
  nCdServico: string[];
}

interface CorreiosResultado {
  Codigo: string;
  Valor: string;
  PrazoEntrega: string;
}

export async function POST(req: Request) {
  try {
    const body: { cepDestino?: string } = await req.json();
    const { cepDestino } = body;

    if (!cepDestino) {
      return NextResponse.json(
        { error: "CEP de destino é obrigatório" },
        { status: 400 }
      );
    }

    const args: CorreiosArgs = {
      sCepOrigem: "01001-000", // altere para o CEP da loja
      sCepDestino: cepDestino,
      nVlPeso: "1",
      nCdFormato: "1",
      nVlComprimento: "20",
      nVlAltura: "20",
      nVlLargura: "20",
      nVlDiametro: "0",
      sCdMaoPropria: "N",
      nVlValorDeclarado: "0",
      sCdAvisoRecebimento: "N",
      nCdServico: ["04014", "04510"], // SEDEX e PAC
    };

    const resultado = await calcularPrecoPrazo(args);

    const servicos: CorreiosResultado[] = resultado.map((servico) => ({
      Codigo: servico.Codigo,
      Valor: servico.Valor,
      PrazoEntrega: servico.PrazoEntrega,
    }));

    return NextResponse.json({ Servicos: servicos });
  } catch (err) {
    console.error("Erro ao consultar Correios:", err);

    const fallback: CorreiosResultado[] = [
      { Codigo: "04014", Valor: "60,00", PrazoEntrega: "5" },
      { Codigo: "04510", Valor: "30,00", PrazoEntrega: "10" },
    ];

    return NextResponse.json({
      Servicos: fallback,
      error:
        "Serviço dos Correios indisponível — exibindo valores estimados.",
    });
  }
}
