// /app/api/webhook/stripe/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import nodemailer from "nodemailer";
import { emailCliente, emailAdmin } from "@/app/lib/emails";
import { sendEmail } from "@/app/lib/sendEmail";
import { db } from "../../../db/admin";
import { criarEnvioEPagar } from "../../lib/melhorenvio";

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

    // --- seus e-mails (mantidos) ---
    const customerEmail = session.customer_details?.email || session.metadata?.email;
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

    // E-mail cliente (mantido)
    try {
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
    } catch (err) {
      console.error("Erro ao enviar email para cliente:", err);
    }

    // E-mail admin (mantido)
    try {
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
    } catch (err) {
      console.error("Erro ao enviar email para admin:", err);
    }

    // --- preparar dados do pedido ---
    const nome = session.metadata?.nome || session.customer_details?.name || "";
    const email = session.metadata?.email || session.customer_details?.email || "";
    const cpf = session.metadata?.cpf || "";
    const endereco = {
      cep: session.metadata?.cep || "",
      rua: session.metadata?.rua || "",
      numero: session.metadata?.numero || "",
      complemento: session.metadata?.complemento || "",
      bairro: session.metadata?.bairro || "",
      cidade: session.metadata?.cidade || "",
      estado: session.metadata?.estado || "",
    };

    let items = [];
    try {
      items = session.metadata?.items ? JSON.parse(session.metadata.items) : [];
    } catch {
      items = [];
    }

    const frete = session.metadata?.shipping ? JSON.parse(session.metadata.shipping) : null;

    const pedidoDoc = {
      id: session.id,
      status: "pago",
      criadoEm: new Date(),
      cliente: { nome, email, cpf },
      endereco,
      itens: items,
      frete,
      valores: {
        produtos: session.metadata?.valorProdutos || 0,
        frete: session.metadata?.valorFrete || 0,
        total: session.metadata?.valorTotal || 0,
      },
      etiquetaStatus: "pendente",
      etiqueta: null,
    };

    // salva pedido
    try {
      await db.collection("pedidos").doc(session.id).set(pedidoDoc);
      console.log("✅ Pedido salvo no Firestore:", session.id);
    } catch (err) {
      console.error("Erro salvando pedido no Firestore:", err);
    }

    // --- tenta criar/gerar etiqueta com Melhor Envio (se token presente) ---
    if (process.env.MELHOR_ENVIO_TOKEN) {
      try {
        // escolhe serviço: usar frete.codigo se vier, senão preferir SEDEX(04014) se disponível
        const servicoCodigo = frete?.codigo || "04014";

        // usar dimensões/peso padrao (2.5kg, 90x60x2) ou calcular a partir dos itens
        const peso = items.reduce((t: number, it: any) => t + (it.weight || 2.5) * (it.quantity || 1), 0) || 2.5;
        const length = 90;
        const width = 60;
        const height = 2;

        const resp = await criarEnvioEPagar({
          nomeDestinatario: nome || email || "Cliente",
          cpfCnpj: cpf || "",
          telefone: null,
          endereco: {
            postal_code: (endereco.cep || "").replace(/\D/g, ""),
            street: endereco.rua || "",
            number: endereco.numero || "",
            complement: endereco.complemento || "",
            district: endereco.bairro || "",
            city: endereco.cidade || "",
            state: endereco.estado || "",
          },
          volume: {
            weight: peso,
            length,
            height,
            width,
          },
          servicoCodigo,
          order_id: session.id,
        });

        // Resp deve conter info da etiqueta (depende da API)
        await db.collection("pedidos").doc(session.id).update({
          etiquetaStatus: "gerada",
          etiqueta: resp || null,
        });

        console.log("✅ Etiqueta criada no Melhor Envio:", session.id);
      } catch (err) {
        console.error("Erro ao criar etiqueta Melhor Envio:", err);
        // atualiza o pedido marcando que houve problema
        await db.collection("pedidos").doc(session.id).update({
          etiquetaStatus: "erro",
          // etiquetaError: String(err?.message || err),
        });
      }
    } else {
      console.log("MELHOR_ENVIO_TOKEN não definido — etiqueta ficará pendente.");
    }

    // também envia os emails via seu helper (se quiser manter)
    try {
      await sendEmail(email, "✅ Pedido Confirmado - Protap Car", emailCliente(nome || "Cliente", session.id));
      await sendEmail(process.env.ADMIN_EMAIL!, "🛒 Nova Venda Recebida", emailAdmin(session.id, nome || "Cliente", endereco.cep || ""));
    } catch (err) {
      console.error("Erro ao enviar e-mails via sendEmail:", err);
    }
  }

  return NextResponse.json({ received: true });
}

export const dynamic = "force-dynamic";
