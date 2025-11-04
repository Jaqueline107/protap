// /src/lib/emails.ts

export const emailCliente = (nome: string, pedidoId: string) => `
<div style="font-family: Arial; background: #111; padding: 20px; color: #fff;">
  <h2 style="color: #00b050;">✅ Pedido Confirmado!</h2>
  <p>Olá <b>${nome}</b>, obrigado por comprar com a <b>Protap Car</b>!</p>

  <p>Seu pedido <b>#${pedidoId}</b> foi confirmado e está sendo preparado.</p>

  <p style="margin-top: 20px;">Você receberá novas atualizações em breve.</p>

  <p style="color: #999; font-size: 12px; margin-top: 25px;">
    Protap Car • Qualidade e confiança sempre.
  </p>
</div>
`;

export const emailAdmin = (pedidoId: string, nome: string, cep: string) => `
<div style="font-family: Arial; background: #111; padding: 20px; color: #fff;">
  <h2 style="color: #e40000;">🛒 Nova Compra Recebida</h2>
  <p><b>Pedido:</b> #${pedidoId}</p>
  <p><b>Cliente:</b> ${nome}</p>
  <p><b>CEP:</b> ${cep}</p>

  <p style="margin-top: 15px;">Verifique o painel para detalhes.</p>

  <p style="color: #999; font-size: 12px; margin-top: 25px;">
    Protap Car - Painel Administrativo
  </p>
</div>
`;
