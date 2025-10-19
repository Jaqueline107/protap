export interface Produto {
  id: string;
  titulo: string;
  modelo?: string;
  ano?: string[];
  images: string[];
  fullPrice: string;
  price: string;
  anoSelecionado?: string | null;

  // Campos para cálculo de frete
  width?: number;    // largura em cm
  height?: number;   // altura em cm
  length?: number;   // comprimento em cm
  weight?: number;   // peso em kg
}
