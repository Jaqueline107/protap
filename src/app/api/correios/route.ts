import { NextResponse } from "next/server";

const MAX_RETRIES = 3; // número máximo de tentativas

async function fetchCorreios(cepDestino: string) {
  const params = new URLSearchParams({
    nCdEmpresa: "",
    sDsSenha: "",
    nCdServico: "04014,04510", // SEDEX e PAC
    sCepOrigem: "07400-295",   // CEP de origem
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
    StrRetorno: "xml",
  });

  const url = `https://ws.correios.com.br/calculador/CalcPrecoPrazo.asmx/CalcPrecoPrazo?${params}`;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Status HTTP ${res.status}`);
      const text = await res.text();

      const servicos = [];
      const regexServico = /<cServico>([\s\S]*?)<\/cServico>/g;
      let match;
      while ((match = regexServico.exec(text)) !== null) {
        const bloco = match[1];
        const valor = bloco.match(/<Valor>(.*?)<\/Valor>/)?.[1] || "0,00";
        const prazo = bloco.match(/<PrazoEntrega>(.*?)<\/PrazoEntrega>/)?.[1] || "0";
        const codigo = bloco.match(/<Codigo>(.*?)<\/Codigo>/)?.[1] || "";
        servicos.push({ Codigo: codigo, Valor: valor, PrazoEntrega: prazo });
      }

      return servicos;
    } catch (err) {
      console.warn(`Tentativa ${attempt} falhou: ${err}`);
      if (attempt === MAX_RETRIES) throw err;
      await new Promise((r) => setTimeout(r, 1000)); // espera 1s antes de tentar de novo
    }
  }

  return [];
}

export async function POST(req: Request) {
  try {
    const { cepDestino } = await req.json();
    if (!cepDestino) {
      return NextResponse.json({ error: "CEP de destino é obrigatório" }, { status: 400 });
    }

    const servicos = await fetchCorreios(cepDestino);

    if (servicos.length === 0) throw new Error("Nenhum serviço retornado");

    return NextResponse.json({ Servicos: servicos });
  } catch (err) {
    console.error("Erro ao consultar Correios:", err);

    // Fallback estático
    const fallback = [
      { Codigo: "04014", Valor: "60,00", PrazoEntrega: "5" },
      { Codigo: "04510", Valor: "30,00", PrazoEntrega: "10" },
    ];

    return NextResponse.json({
      Servicos: fallback,
      error: "Serviço dos Correios indisponível — exibindo valores estimados.",
    });
  }
}
