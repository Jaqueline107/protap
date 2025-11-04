import { NextResponse } from "next/server";
import Stripe from "stripe";
import nodemailer from "nodemailer";
import { emailCliente, emailAdmin } from "@/app/lib/emails";
import { sendEmail } from "@/app/lib/sendEmail";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature")!;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event;

  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err: any) {
    console.error("⚠️ Erro ao validar webhook:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;

    const customerEmail = session.customer_details.email;
    const orderId = session.id;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // ✅ E-MAIL PARA O CLIENTE
    await transporter.sendMail({
      from: `Protapcar <${process.env.SMTP_USER}>`,
      to: customerEmail,
      subject: "Confirmação de Pagamento - Protapcar",
      html: `
        <div style="font-family: Arial; color: #222;">
          <h2>Pagamento Confirmado ✅</h2>
          <p>Olá, tudo bem?</p>
          <p>Informamos que seu pedido <strong>${orderId}</strong> foi confirmado com sucesso.</p>
          <p>Agora ele está sendo separado e enviado para a transportadora.</p>
          <p>Você receberá atualizações assim que o pedido for despachado.</p>
          <br>
          <p>Agradecemos sua confiança em nossa loja.</p>
          <p>Atenciosamente,<br><strong>Equipe Protapcar</strong></p>
        </div>
      `,
    });

    // ✅ E-MAIL PARA VOCÊ (ADMIN)
    await transporter.sendMail({
      from: `Protapcar <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `Novo Pedido Confirmado - ${orderId}`,
      html: `
        <div style="font-family: Arial; color: #222;">
          <h2>Nova Venda Recebida 📦</h2>
          <p><strong>ID do Pedido:</strong> ${orderId}</p>
          <p><strong>Email do Comprador:</strong> ${customerEmail}</p>
          <br>
          <p>Verifique os detalhes no painel Stripe.</p>
          <p>Atenciosamente,<br><strong>Sistema Automático Protapcar</strong></p>
        </div>
      `,
    });

    if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;

    const nome = session.customer_details?.name || "Cliente";
    const email = session.customer_details?.email || "";
    const pedidoId = session.id;
    const cep = session.customer_details?.address?.postal_code || "";

    console.log("✅ E-mails enviados com sucesso.");


    // Email para cliente
    await sendEmail(email, "✅ Pedido Confirmado - Protap Car", emailCliente(nome, pedidoId));

    // Email para admin
    await sendEmail(process.env.ADMIN_EMAIL!, "🛒 Nova Venda Recebida", emailAdmin(pedidoId, nome, cep));
  }

  }

  return NextResponse.json({ received: true });
}

export const dynamic = "force-dynamic";
