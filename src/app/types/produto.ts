export interface Produto {
  id: string;
  titulo: string;
  price: string;
  fullPrice?: string;
  description?: string;
  images: string[];

  // variações (se existir)
  ano?: string | null;
  anoSelecionado?: string | null; // ✅ Adicione isto


  // quantidade do carrinho
  quantity?: number;

  // dimensões - opcionais
  weight?: number;
  width?: number;
  height?: number;
  length?: number;
}
