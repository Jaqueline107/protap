import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { cepOrigem, cepDestino, peso, largura, altura, comprimento } = await req.json();

    const response = await fetch("https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`, // token no .env.local
      },
      body: JSON.stringify({
        from: { postal_code: cepOrigem },
        to: { postal_code: cepDestino },
        products: [
          {
            id: "1",
            weight: Number(peso),
            width: Number(largura),
            height: Number(altura),
            length: Number(comprimento),
            insurance_value: 100,
            quantity: 1,
          },
        ],
        services: "1,2", // PAC e SEDEX
        options: { receipt: false, own_hand: false, collect: false },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro Melhor Envio:", data);
      return NextResponse.json({ success: false, error: data });
    }

    const servicos = (data || []).map((f: any) => ({
      codigo: f.service.id,
      nome: f.service.name,
      valor: f.price,
      prazo: f.delivery_time,
    }));

    return NextResponse.json({ success: true, servicos });
  } catch (err) {
    console.error("Erro geral:", err);
    return NextResponse.json({ success: false, error: "Erro na conexão com o servidor." });
  }
}
