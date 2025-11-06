import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const publicUrl = process.env.NEXT_PUBLIC_URL;

if (!stripeSecretKey) throw new Error("STRIPE_SECRET_KEY não está definido");
if (!publicUrl) throw new Error("NEXT_PUBLIC_URL não está definido");

// ✅ Usar versão estável da API (evita erro de import e validação)
const stripe = new Stripe(stripeSecretKey, { apiVersion: "2025-08-27.basil" });

interface CartItem {
  name: string;
  price: number;
  images: string[];
  quantity: number;
  ano?: string | null;
}

interface CheckoutMeta {
  nome: string;
  email: string;
  cpf: string;
  endereco: {
    cep: string;
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
  valorProdutos: string;
  valorFrete: string;
  valorTotal: string;
}

interface ShippingInfo {
  method: string;
  valor: string;
  codigo?: string; // ✅ para Melhor Envio depois
}

interface CheckoutRequestBody {
  items: CartItem[];
  shipping?: ShippingInfo;
  meta: CheckoutMeta; // ✅ agora obrigatório
}

export async function POST(req: Request) {
  try {
    const body: CheckoutRequestBody = await req.json();
    const { items, shipping, meta } = body;

    if (!items || items.length === 0) {
      return new Response(JSON.stringify({ error: "Carrinho vazio" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const lineItems = items.map((item) => {
      const amount = Math.round(item.price * 100);

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

    if (shipping?.valor) {
    const freteValor = typeof shipping.valor === "number"
      ? shipping.valor
      : parseFloat(shipping.valor.replace(",", "."));

    const freteAmount = Math.round(freteValor * 100);


      lineItems.push({
        price_data: {
          currency: "brl",
          product_data: {
            name: shipping.method || "Frete",
            images: []
          },
          unit_amount: freteAmount,
        },
        quantity: 1,
      });
    }

    // ✅ Metadados essenciais para salvar pedido no webhook e gerar etiqueta
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${publicUrl}/success`,
      cancel_url: `${publicUrl}/`,
      metadata: {
        items: JSON.stringify(items),
        shipping: shipping ? JSON.stringify(shipping) : "",
        meta: meta ? JSON.stringify(meta) : "",
        nome: meta?.nome || "",
        email: meta?.email || "",
        cpf: meta?.cpf || "",
        cep: meta?.endereco?.cep || "",
        rua: meta?.endereco?.rua || "",
        numero: meta?.endereco?.numero || "",
        complemento: meta?.endereco?.complemento || "",
        bairro: meta?.endereco?.bairro || "",
        cidade: meta?.endereco?.cidade || "",
        estado: meta?.endereco?.estado || "",
        valorProdutos: meta?.valorProdutos || "",
        valorFrete: meta?.valorFrete || "",
        valorTotal: meta?.valorTotal || "",
      },
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
