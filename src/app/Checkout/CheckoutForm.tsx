"use client";

import { useState } from "react";
import { useCart } from "../context/CartContext";
import { Truck } from "lucide-react";
import type { Frete } from "../api/frete/route";
import type { Produto } from "../types/produto";
import type { CartProduct } from "../types/cartproduct";

interface CheckoutFormProps {
  produto?: Produto | null;
  produtos?: Produto[] | null;
}

export default function CheckoutForm({ produto, produtos }: CheckoutFormProps) {
  const { cart, clearCart } = useCart();

  const produtosLista: (Produto | CartProduct)[] =
    produtos ?? (produto ? [produto] : cart);

  const parseCurrency = (v: string | number | undefined): number => {
    if (!v) return 0;
    let s = String(v).replace(/[^\d.,]/g, "");
    s = s.includes(",") ? s.replace(".", "").replace(",", ".") : s;
    return parseFloat(s) || 0;
  };

  const formatarPreco = (n: number) =>
    n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const valorProdutos = produtosLista.reduce(
    (sum, p: any) => sum + parseCurrency(p.price) * (p.quantity ?? 1),
    0
  );

  // CAMPOS DO CLIENTE
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");

  // ENDEREÇO COMPLETO
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");

  const [fretes, setFretes] = useState<Frete[]>([]);
  const [shippingMethod, setShippingMethod] = useState("");
  const [valorFrete, setValorFrete] = useState(0);

  const [loadingFrete, setLoadingFrete] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  const valorTotal = valorProdutos + valorFrete;

  // AUTOCOMPLETE VIA CEP
  const buscarEndereco = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;

    const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = await res.json();

    if (!data.erro) {
      setRua(data.logradouro);
      setBairro(data.bairro);
      setCidade(data.localidade);
      setEstado(data.uf);
    }
  };

  const consultarFrete = async () => {
    if (cep.replace(/\D/g, "").length !== 8) return alert("CEP inválido!");

    setLoadingFrete(true);

    try {
      const res = await fetch("/api/frete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cepDestino: cep.replace(/\D/g, ""),
          peso: produtosLista.reduce((t: any, p: any) => t + (p.weight || 0), 0),
          largura: produtosLista.reduce((t: any, p: any) => t + (p.width || 0), 0),
          altura: produtosLista.reduce((t: any, p: any) => t + (p.height || 0), 0),
          comprimento: produtosLista.reduce((t: any, p: any) => t + (p.length || 0), 0),
        }),
      });

      const data = await res.json();
      setFretes(data.servicos || []);
    } finally {
      setLoadingFrete(false);
    }
  };

  const iniciarCheckout = async () => {
    if (!nome || !email || !cpf || !rua || !numero || !bairro || !cidade || !estado) {
      return alert("Preencha todos os campos do endereço.");
    }

    setLoadingCheckout(true);

    try {
      const res = await fetch("/api/checkout_sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_method_types: ["pix", "card"],
          items: produtosLista.map((p: any) => ({
            name: p.titulo,
            price: parseCurrency(p.price),
            images: p.images,
            quantity: p.quantity ?? 1,
          })),
          shipping:
            shippingMethod === "retirada"
              ? { method: "retirada", valor: "0,00" }
              : fretes.find((f) => f.codigo === shippingMethod),

          meta: {
            nome, email, cpf,
            endereco: {
              cep, rua, numero, complemento, bairro, cidade, estado
            },
            valorProdutos,
            valorFrete,
            valorTotal,
          },
        }),
      });

      const data = await res.json();
      if (data.url) {
        clearCart();
        window.location.href = data.url;
      } else {
        alert("Erro ao iniciar pagamento.");
      }
    } finally {
      setLoadingCheckout(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Finalizar Compra</h1>

      {/* LISTA DE PRODUTOS */}
      {produtosLista.map((p: any) => (
        <div key={p.id} className="flex items-center gap-3 border-b py-3">
          <img src={p.images?.[0]} className="w-16 h-16 rounded" alt={p.titulo} />
          <div className="flex-1">
            <p className="font-semibold">{p.titulo}</p>
            <p className="text-green-600 font-bold">
              {formatarPreco(parseCurrency(p.price) * (p.quantity ?? 1))}
            </p>
          </div>
        </div>
      ))}

      {/* CAMPOS */}
      <div className="mt-6 space-y-3">
        <input className="w-full p-3 border rounded" placeholder="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} />
        <input className="w-full p-3 border rounded" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full p-3 border rounded" placeholder="CPF" value={cpf} onChange={(e) => setCpf(e.target.value)} />

        <div className="flex gap-2">
          <input className="flex-1 p-3 border rounded" placeholder="CEP" value={cep} onChange={(e) => { setCep(e.target.value); buscarEndereco(e.target.value); }} />
          <button onClick={consultarFrete} disabled={loadingFrete} className="px-3 py-2 bg-blue-600 text-white rounded disabled:bg-blue-300">
            {loadingFrete ? "..." : "Calcular Frete"}
          </button>
        </div>

        <input className="w-full p-3 border rounded" placeholder="Rua" value={rua} onChange={(e) => setRua(e.target.value)} />
        <input className="w-full p-3 border rounded" placeholder="Número" value={numero} onChange={(e) => setNumero(e.target.value)} />
        <input className="w-full p-3 border rounded" placeholder="Complemento (opcional)" value={complemento} onChange={(e) => setComplemento(e.target.value)} />
        <input className="w-full p-3 border rounded" placeholder="Bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} />
        <input className="w-full p-3 border rounded" placeholder="Cidade" value={cidade} readOnly />
        <input className="w-full p-3 border rounded" placeholder="Estado" value={estado} readOnly />

        {fretes.map((f) => (
          <label key={f.codigo} className="flex items-center gap-2 border p-3 rounded cursor-pointer">
            <input type="radio" name="frete" onChange={() => { setShippingMethod(f.codigo); setValorFrete(parseCurrency(f.valor)); }} />
            <Truck size={18} />
            {f.nome} — {formatarPreco(parseCurrency(f.valor))}
          </label>
        ))}

        <div className="border-t pt-4 mt-4">
          <p className="text-2xl font-bold text-green-700">
            Total: {formatarPreco(valorTotal)}
          </p>
        </div>

        <button
          onClick={iniciarCheckout}
          disabled={loadingCheckout || !shippingMethod}
          className={`mt-4 w-full py-3 rounded-lg font-semibold text-white 
            ${!shippingMethod ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}
          `}
        >
          {loadingCheckout ? "Processando..." : "Finalizar Compra"}
        </button>
      </div>
    </div>
  );
}
