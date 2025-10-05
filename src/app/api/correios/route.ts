import { NextResponse } from "next/server";
import { calcularPrecoPrazo } from "correios-brasil";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cepDestino } = body;

    if (!cepDestino) {
      return NextResponse.json(
        { error: "CEP de destino é obrigatório" },
        { status: 400 }
      );
    }

    // Configurações padrão do pacote
    const args = {
      sCepOrigem: "01001-000", // 👉 Altere para o CEP da sua loja
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

    // Consulta oficial dos Correios
    const resultado = await calcularPrecoPrazo(args);

    // Padroniza saída para o CheckoutForm
    return NextResponse.json({
      Servicos: resultado.map((servico: any) => ({
        Codigo: servico.Codigo,
        Valor: servico.Valor,
        PrazoEntrega: servico.PrazoEntrega,
      })),
    });
  } catch (err: unknown) {
    console.error("Erro ao consultar Correios:", err);

    // Fallback em caso de erro (mantém loja funcional)
    return NextResponse.json({
      Servicos: [
        { Codigo: "04014", Valor: "60,00", PrazoEntrega: "5" }, // SEDEX
        { Codigo: "04510", Valor: "30,00", PrazoEntrega: "10" }, // PAC
      ],
      error: "Serviço dos Correios indisponível — exibindo valores estimados.",
    });
  }
}
