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

// Representa os dados brutos que podem vir do Firestore
interface ProdutoRaw {
  modelo?: unknown;
  titulo?: unknown;
  fullPrice?: unknown;
  price?: unknown;
  description?: unknown;
  images?: unknown;
}

/**
 * Normaliza os dados vindos do Firestore para garantir tipos corretos.
 * Evita erros como "toFixed is not a function" ao renderizar preços.
 */
export function normalizeProduto(data: ProdutoRaw, id: string): Produto {
  return {
    id,
    modelo: typeof data.modelo === "string" ? data.modelo : "",
    titulo: typeof data.titulo === "string" ? data.titulo : "",
    fullPrice: typeof data.fullPrice === "number" ? data.fullPrice : Number(data.fullPrice || 0),
    price: typeof data.price === "number" ? data.price : Number(data.price || 0),
    description: typeof data.description === "string" ? data.description : "",
    images: Array.isArray(data.images) ? data.images.filter((img) => typeof img === "string") : [],
  };
}
