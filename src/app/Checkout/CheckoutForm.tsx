"use client";

import { useState } from "react";
import type { Produto } from "../types/produto";
import { Truck, Package } from "lucide-react";
import { Frete } from "../api/frete/route";

interface CheckoutFormProps {
  produto?: Produto;      // caso venha da página de produto
  produtos?: Produto[];   // caso venha do carrinho
}

export default function CheckoutForm({ produto, produtos }: CheckoutFormProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [cep, setCep] = useState("");
  const [fretes, setFretes] = useState<Frete[]>([]);
  const [shippingMethod, setShippingMethod] = useState("");
  const [valorFrete, setValorFrete] = useState<number>(0);
  const [loadingFrete, setLoadingFrete] = useState(false);
  const [erro, setErro] = useState("");
  const [emailErro, setEmailErro] = useState(false);
  const [cpfErro, setCpfErro] = useState(false);
  const [cepErro, setCepErro] = useState(false);

  // normaliza sempre produtos[] internamente
  const produtosLista = produtos || (produto ? [produto] : []);

  const parseCurrency = (v: string | number | undefined): number => {
    if (v === undefined || v === null) return 0;
    if (typeof v === "number") return v;
    let s = String(v).trim();
    s = s.replace(/[^\d.,-]/g, "");
    if (!s) return 0;
    if (s.includes(",") && s.includes(".")) s = s.replace(/\./g, "").replace(/,/g, ".");
    else if (s.includes(",")) s = s.replace(/,/g, ".");
    const n = parseFloat(s);
    return isNaN(n) ? 0 : n;
  };

  const formatarPreco = (valor: string | number) =>
    parseCurrency(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const validarCPF = (value: string) => {
    const clean = value.replace(/\D/g, "");
    return clean.length === 11 && !/^(\d)\1+$/.test(clean);
  };
  const validarCEP = (value: string) => value.replace(/\D/g, "").length === 8;
  const validarEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.toLowerCase());

  const consultarFrete = async () => {
    if (!validarCEP(cep)) return setCepErro(true);

    setCepErro(false);
    setErro("");
    setLoadingFrete(true);

    try {
      const res = await fetch("/api/frete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cepDestino: cep.replace(/\D/g, ""),
          peso: produtosLista.reduce((t, p) => t + (p.weight || 0), 0),
          largura: produtosLista.reduce((t, p) => t + (p.width || 0), 0),
          altura: produtosLista.reduce((t, p) => t + (p.height || 0), 0),
          comprimento: produtosLista.reduce((t, p) => t + (p.length || 0), 0),
        }),
      });

      const data = await res.json();
      if (!data.success) return setErro(data.error || "Erro no frete");

      const servicosValidos = data.servicos?.filter(
        (f: Frete) => f.codigo === "04510" || f.codigo === "04014"
      );

      setFretes(servicosValidos || []);
      setShippingMethod("");
      setValorFrete(0);
    } catch {
      setErro("Erro ao consultar frete.");
    } finally {
      setLoadingFrete(false);
    }
  };

  const valorProdutos = produtosLista.reduce((s, p) => s + parseCurrency(p.price), 0);
  const valorTotal = valorProdutos + valorFrete;

  const isButtonDisabled =
    !nome || !validarEmail(email) || !validarCPF(cpf) || !validarCEP(cep) || !shippingMethod;

  const handleSelectFrete = (f: Frete | { codigo: string; valor: string | number }) => {
    setShippingMethod(f.codigo);
    setValorFrete(parseCurrency((f as any).valor));
  };

  const iniciarCheckout = async () => {
    if (isButtonDisabled) return;

    try {
      const res = await fetch("/api/checkout_sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: produtosLista.map((p) => ({
            name: p.titulo,
            price: p.price,
            images: [p.images[0]],
            quantity: 1,
          })),
          shipping:
            shippingMethod === "retirada"
              ? { method: "retirada", valor: "0,00" }
              : fretes
                  .filter((f) => f.codigo === shippingMethod)
                  .map((f) => ({ method: f.codigo, valor: f.valor.toString() }))[0],
          meta: {
            nome,
            email,
            cpf,
            cep,
            valorProduto: valorProdutos.toFixed(2),
            valorFrete: valorFrete.toFixed(2),
            valorTotal: valorTotal.toFixed(2),
          },
        }),
      });

      const data: { url?: string } = await res.json();
      if (data.url) window.location.href = data.url;
      else alert("Erro ao iniciar checkout");
    } catch (err) {
      console.error(err);
      alert("Erro ao iniciar checkout");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-6">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-1">Finalizar Compra</h2>

        {produtosLista.map((p) => (
          <div key={p.id} className="flex items-center gap-3 p-2 border-b">
            <img src={p.images[0]} alt={p.titulo} className="w-16 h-16 rounded object-cover" />
            <div className="flex-1">
              <p className="font-semibold">{p.titulo}</p>
              <p className="text-green-700">{formatarPreco(p.price)}</p>
            </div>
          </div>
        ))}

        {/* Formulário e frete */}
        <div className="grid grid-cols-1 gap-3 mt-4">
          <input
            type="text"
            placeholder="Nome completo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="border rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-200"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailErro(false);
            }}
            onBlur={() => !validarEmail(email) && setEmailErro(true)}
            className={`border rounded-lg p-3 outline-none focus:ring-2 ${
              emailErro ? "ring-red-200" : "focus:ring-green-200"
            }`}
          />
          {emailErro && <p className="text-red-600 text-sm">Email inválido</p>}

          <input
            type="text"
            placeholder="CPF"
            value={cpf}
            onChange={(e) => {
              const v = e.target.value
                .replace(/\D/g, "")
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
              setCpf(v);
              setCpfErro(false);
            }}
            maxLength={14}
            className={`border rounded-lg p-3 outline-none focus:ring-2 ${
              cpfErro ? "ring-red-200" : "focus:ring-green-200"
            }`}
          />
          {cpfErro && <p className="text-red-600 text-sm">CPF inválido</p>}

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="CEP"
              value={cep}
              onChange={(e) => {
                const v = e.target.value
                  .replace(/\D/g, "")
                  .replace(/(\d{5})(\d)/, "$1-$2")
                  .slice(0, 9);
                setCep(v);
                setCepErro(false);
              }}
              maxLength={9}
              className={`flex-1 border rounded-lg p-3 outline-none focus:ring-2 ${
                cepErro ? "ring-red-200" : "focus:ring-green-200"
              }`}
            />
            <button
              onClick={consultarFrete}
              disabled={!validarCEP(cep) || loadingFrete}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
            >
              {loadingFrete ? "Consultando..." : "Calcular Frete"}
            </button>
          </div>
          {cepErro && <p className="text-red-600 text-sm">CEP inválido</p>}
          {erro && <p className="text-red-600 text-sm">{erro}</p>}

          <div className="mt-2 space-y-2">
            <label className="flex items-center gap-3 p-2 border rounded-lg cursor-pointer">
              <input
                type="radio"
                name="frete"
                value="retirada"
                checked={shippingMethod === "retirada"}
                onChange={() => {
                  setShippingMethod("retirada");
                  setValorFrete(0);
                }}
              />
              <Package className="w-5 h-5 text-gray-600" />
              <div>
                <div className="font-medium">Retirada na Loja</div>
                <div className="text-sm text-gray-500">Grátis</div>
              </div>
            </label>

            {fretes.map((f) => (
              <label
                key={f.codigo}
                className="flex items-center gap-3 p-2 border rounded-lg cursor-pointer"
              >
                <input
                  type="radio"
                  name="frete"
                  value={f.codigo}
                  checked={shippingMethod === f.codigo}
                  onChange={() => handleSelectFrete(f)}
                />
                <Truck className="w-5 h-5 text-gray-600" />
                <div className="flex-1">
                  <div className="font-medium">{f.nome}</div>
                  <div className="text-sm text-gray-500">{f.prazo} dias úteis</div>
                </div>
                <div className="font-semibold">{formatarPreco(f.valor)}</div>
              </label>
            ))}
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <div className="flex justify-between">
              <span className="text-gray-600">Produtos</span>
              <span className="font-semibold">{formatarPreco(valorProdutos)}</span>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-gray-600">Frete</span>
              <span className="font-semibold">{formatarPreco(valorFrete)}</span>
            </div>
            <div className="border-t mt-3 pt-3 flex justify-between items-center">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-2xl font-bold text-green-600">{formatarPreco(valorTotal)}</span>
            </div>
          </div>

          <button
            disabled={isButtonDisabled}
            onClick={iniciarCheckout}
            className="w-full mt-3 bg-green-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
          >
            Confirmar Compra
          </button>
        </div>
      </div>
    </div>
  );
}
