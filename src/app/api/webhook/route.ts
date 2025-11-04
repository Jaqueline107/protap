import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature")!;
  const body = await req.text();

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("⚠️ Webhook signature verification failed.", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // ✅ QUANDO O PAGAMENTO É CONFIRMADO
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;

    console.log("✅ Pagamento confirmado!");
    console.log("Email do cliente:", session.customer_details.email);
    console.log("Valor:", session.amount_total);

    // TODO: Enviar email ao cliente
    // TODO: Enviar email ao admin
  }

  return NextResponse.json({ received: true });
}
