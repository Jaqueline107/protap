// /lib/melhorEnvio.ts
const TOKEN = process.env.MELHOR_ENVIO_TOKEN;
const ORIGEM = {
  postal_code: "07400295",
  city: "Arujá",
  state: "SP",
  street: "Perfeita Liberdade",
  number: "312",
};

if (!TOKEN) {
  console.warn("MELHOR_ENVIO_TOKEN não definido — integração com Melhor Envio ficará inativa.");
}

// Ajuste os endpoints se o MelhorEnvio alterar; função escrita de forma genérica.
// const API = "https://api.melhorenvio.com.br"; real 
const API = process.env.MELHOR_ENVIO_ENDPOINT || "https://melhorenvio.com.br";


type CotacaoParams = {
  cepDestino: string; // apenas números
  pesoKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
};

export async function cotarPacSedex(params: CotacaoParams) {
  if (!TOKEN) return null;

  const body = {
    from: { postal_code: ORIGEM.postal_code },
    to: { postal_code: params.cepDestino },
    products: [
      {
        weight: params.pesoKg,
        length: params.lengthCm,
        height: params.heightCm,
        width: params.widthCm,
        quantity: 1,
      },
    ],
  };

  // Endpoint de cotação (padrão genérico). Se seu ambiente Melhor Envio usar outro path, ajuste aqui.
  const url = `${API}/api/v2/shipping/calculate`; // supondo v2. Pode precisar ajustar.
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    return json; // retorna a resposta (array de opções). O webhook/frete route fará o filtro PAC/SEDEX.
  } catch (err) {
    console.error("Erro ao cotar Melhor Envio:", err);
    throw err;
  }
}

type CriarEnvioParams = {
  nomeDestinatario: string;
  cpfCnpj: string;
  telefone: string | null;
  endereco: {
    postal_code: string;
    street: string;
    number: string;
    complement?: string;
    district?: string;
    city: string;
    state: string;
  };
  volume: {
    weight: number;
    length: number;
    height: number;
    width: number;
  };
  servicoCodigo: string; // código do serviço (ex: 04014, 04510) dependendo do resultado de cotação
  order_id: string;
};

export async function criarEnvioEPagar(params: CriarEnvioParams) {
  if (!TOKEN) throw new Error("MELHOR_ENVIO_TOKEN não definido");

  // Monta payload conforme Melhor Envio (exemplo genérico)
  const payload = {
    from: {
      name: "Loja ProTap",
      postal_code: ORIGEM.postal_code,
      street: ORIGEM.street,
      number: ORIGEM.number,
      city: ORIGEM.city,
      state: ORIGEM.state,
    },
    to: {
      name: params.nomeDestinatario,
      postal_code: params.endereco.postal_code,
      street: params.endereco.street,
      number: params.endereco.number,
      complement: params.endereco.complement,
      district: params.endereco.district,
      city: params.endereco.city,
      state: params.endereco.state,
    },
    volumes: [
      {
        weight: params.volume.weight,
        length: params.volume.length,
        height: params.volume.height,
        width: params.volume.width,
      },
    ],
    service: params.servicoCodigo, // usar código retornado pela cotação
    external_id: params.order_id,
    // Você pode adicionar payer, insurance, etc conforme a API suportar
  };

  // Endpoint de criação de envio (exemplo genérico). Ajuste se necessário.
  const url = `${API}/api/v2/me/shipment`; 

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();

  if (!res.ok) {
    console.error("Erro criando envio Melhor Envio:", json);
    throw new Error(json?.message || "Erro criar envio Melhor Envio");
  }

  // Normalmente a API retorna dados do envio, e um endpoint para pagamento.
  // Se for necessário chamar um endpoint de pagamento, faça aqui (algumas versões pagam direto com saldo).
  return json;
}
