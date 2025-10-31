export interface CartProduct {
  id: string;          // id único do produto
  titulo: string;      // nome do produto
  price: string;       // preço com desconto
  fullPrice?: string;  // preço original (opcional)
  images: string[];    // imagens do produto
  quantity: number;    // quantidade no carrinho
  ano?: string | null; // ano do produto (opcional)
  weight?: number;     // peso para frete (opcional)
  width?: number;      // largura
  height?: number;     // altura
  length?: number;     // comprimento
}
