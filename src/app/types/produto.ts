export interface Produto {
  id: string;
  titulo: string;
  price: number;
  modelo: string;
  fullPrice?: string;
  description?: string;
  images: string[];

  // variações (se existir)
  ano?: string[] | null;        // ✅ Aceita lista
  anoSelecionado?: string | null; // ✅ Adicione isto


  // quantidade do carrinho
  quantity?: number;

  // dimensões - opcionais
  weight?: number;
  width?: number;
  height?: number;
  length?: number;
}
