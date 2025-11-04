import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const publicUrl = process.env.NEXT_PUBLIC_URL;

if (!stripeSecretKey) throw new Error("STRIPE_SECRET_KEY não está definido");
if (!publicUrl) throw new Error("NEXT_PUBLIC_URL não está definido");

const stripe = new Stripe(stripeSecretKey, { apiVersion: "2025-08-27.basil" });

interface CartItem {
  name: string;
  price: number; // ✅ já como número
  images: string[];
  quantity: number;
  ano?: string | null;
}

interface ShippingInfo {
  method: string;
  valor: string; // ainda vem do correio como string tipo "25,40"
}

interface CheckoutRequestBody {
  items: CartItem[];
  shipping?: ShippingInfo;
}

export async function POST(req: Request) {
  try {
    const body: CheckoutRequestBody = await req.json();
    const { items, shipping } = body;

    if (!items || items.length === 0) {
      return new Response(JSON.stringify({ error: "Carrinho vazio" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const lineItems = items.map((item) => {
      const amount = Math.round(item.price * 100); // ✅ sem replace()

      return {
        price_data: {
          currency: "brl",
          product_data: {
            name: item.ano ? `${item.name} (${item.ano})` : item.name,
            images: item.images.map((img) =>
              img.startsWith("http") ? img : `${publicUrl}${img}`
            ),
          },
          unit_amount: amount,
        },
        quantity: item.quantity,
      };
    });

    // ✅ Adiciona frete se existir
    if (shipping?.valor) {
      const freteAmount = Math.round(
        parseFloat(shipping.valor.replace(",", ".")) * 100
      );

      lineItems.push({
        price_data: {
          currency: "brl",
          product_data: {
            name: "Frete",
            images: []
          },
          unit_amount: freteAmount,
        },
        quantity: 1,
      });
    }

    // ✅ Cria sessão Stripe
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${publicUrl}/success`,
      cancel_url: `${publicUrl}/`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Erro no checkout:", err);
    return new Response(
      JSON.stringify({ error: "Falha ao criar sessão de pagamento" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
