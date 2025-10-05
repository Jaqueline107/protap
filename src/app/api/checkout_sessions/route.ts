import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const publicUrl = process.env.NEXT_PUBLIC_URL;

if (!stripeSecretKey) throw new Error("STRIPE_SECRET_KEY não está definido");
if (!publicUrl) throw new Error("NEXT_PUBLIC_URL não está definido");

// ✅ Use sempre uma versão estável e suportada
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-08-27.basil",
});

// Tipos das estruturas do carrinho e do body
interface CartItem {
  name: string;
  price: string; // Ex: "R$50,00"
  images: string[];
  quantity: number;
  ano?: string | null;
}

interface ShippingInfo {
  method: "04014" | "04510" | "retirada";
  valor: string; // Ex: "25,30" ou "0,00"
}

interface CheckoutRequestBody {
  items: CartItem[];
  shipping?: ShippingInfo;
}

export async function POST(req: Request): Promise<Response> {
  try {
    const body: CheckoutRequestBody = await req.json();
    const { items, shipping } = body;

    if (!items || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Carrinho vazio" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
      (item) => ({
        price_data: {
          currency: "brl",
          product_data: {
            name: item.ano ? `${item.name} (${item.ano})` : item.name,
            images: item.images.map((img) =>
              img.startsWith("http") ? img : `${publicUrl}${img}`
            ),
          },
          unit_amount: Math.round(
            parseFloat(item.price.replace("R$", "").replace(",", ".")) * 100
          ),
        },
        quantity: item.quantity,
      })
    );

    // Adiciona o frete se houver
    if (shipping && shipping.valor) {
      const freteNome =
        shipping.method === "04014"
          ? "Frete (Sedex)"
          : shipping.method === "04510"
          ? "Frete (PAC)"
          : "Retirada na Loja";

      lineItems.push({
        price_data: {
          currency: "brl",
          product_data: { name: freteNome },
          unit_amount: Math.round(
            parseFloat(shipping.valor.replace(",", ".")) * 100
          ),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${publicUrl}/success`,
      cancel_url: `${publicUrl}/`,
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Erro no checkout:", err);
    return new Response(
      JSON.stringify({ error: "Falha ao criar sessão de pagamento" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
