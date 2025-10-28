// src/utils/normalizeProduto.ts

export interface Produto {
  id: string;
  modelo: string;
  titulo: string;
  fullPrice: number;
  price: number;
  description: string;
  images: string[];
}

/**
 * Normaliza os dados vindos do Firestore para garantir tipos corretos.
 * Evita erros como "toFixed is not a function" ao renderizar preços.
 */
export function normalizeProduto(data: any, id: string): Produto {
  return {
    id,
    modelo: typeof data.modelo === "string" ? data.modelo : "",
    titulo: typeof data.titulo === "string" ? data.titulo : "",
    fullPrice: Number(data.fullPrice || 0),
    price: Number(data.price || 0),
    description: typeof data.description === "string" ? data.description : "",
    images: Array.isArray(data.images) ? data.images : [],
  };
}
