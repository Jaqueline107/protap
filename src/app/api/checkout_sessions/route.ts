import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

// Tipagem do item do carrinho
interface CartItem {
  name: string;
  price: string; // Ex: "R$50,00"
  images: string[];
  quantity: number;
  ano?: string | null;
}

interface CheckoutRequestBody {
  items: CartItem[];
}

export async function POST(req: Request) {
  try {
    const body: CheckoutRequestBody = await req.json();
    const { items } = body;

    const lineItems = items.map((item) => ({
      price_data: {
        currency: "brl",
        product_data: {
          name: item.name,
          images: item.images.map((img) =>
            img.startsWith("http") ? img : `${process.env.NEXT_PUBLIC_URL}${img}`
          ),
          metadata: {
            ano: item.ano || "", // ✅ adiciona o ano como metadata
          },
        },
        unit_amount: Math.round(
          parseFloat(item.price.replace("R$", "").replace(",", ".")) * 100
        ),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: `${process.env.NEXT_PUBLIC_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "Falha ao criar sessão de pagamento" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
