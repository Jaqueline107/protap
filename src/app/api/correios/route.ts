import { NextRequest, NextResponse } from "next/server";
import { calcularPrecoPrazo, PrecoPrazoRequest } from "correios-brasil";

export async function POST(req: NextRequest) {
  try {
    const { cepDestino } = await req.json();

    if (!cepDestino) {
      return NextResponse.json({ error: "cepDestino é obrigatório" });
    }

    // Dados padrão do produto/frete
    const dadosPadrao: PrecoPrazoRequest = {
      nCdEmpresa: "",
      sDsSenha: "",
      nCdServico: ["04014", "04510"], // Sedex e PAC
      sCepOrigem: "01001000", // CEP de origem da loja
      sCepDestino: cepDestino,
      nVlPeso: "1", // peso padrão em kg (string)
      nCdFormato: "1", // 1 = caixa/pacote
      nVlComprimento: "20", // cm
      nVlAltura: "10", // cm
      nVlLargura: "15", // cm
      nVlDiametro: "0", // cm
      nVlValorDeclarado: "0", // R$
      sCdMaoPropria: "n",
      sCdAvisoRecebimento: "n",
    };

    const servicos = await calcularPrecoPrazo(dadosPadrao);

    // Retorna um array de serviços (PAC e Sedex)
    return NextResponse.json({ Servicos: servicos });
  } catch (err) {
    console.error("Erro ao chamar Correios:", err);
    return NextResponse.json({ error: "Erro interno ao consultar frete" });
  }
}
