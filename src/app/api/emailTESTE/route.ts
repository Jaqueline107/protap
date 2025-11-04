import { emailCliente, emailAdmin } from "@/app/lib/emails";
import { sendEmail } from "@/app/lib/sendEmail";

export async function GET() {
  try {
    const nome = "Jaqueline";
    const pedidoId = "12345";
    const cep = "12345678";

    // Enviar email para cliente
    await sendEmail("jaqueelinemouraoliveiraproenca@gmail.com", "✅ Pedido Confirmado - Teste", emailCliente(nome, pedidoId));

    // Enviar email para admin
    await sendEmail("jaquelinemoliveiraproenca01@gmail.com", "🛒 Nova Compra Recebida - Teste", emailAdmin(pedidoId, nome, cep));

    return new Response(JSON.stringify({ message: "Emails enviados com sucesso!" }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Falha ao enviar emails" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
