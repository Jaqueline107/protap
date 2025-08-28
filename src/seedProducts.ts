import * as admin from "firebase-admin";
import serviceAccount from "./seu-service-account.json" assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

const db = admin.firestore();

type Product = {
  name: string;
  fullPrice: string;
  price: string;
  description: string;
  images: string[];
};

// Cálculo de desconto igual no front
function calculateDiscount(fullPrice: string): string {
  const numericPrice = parseFloat(fullPrice.replace("R$", "").replace(",", "."));
  const discountedPrice = (numericPrice * 0.7).toFixed(2);
  return `R$${discountedPrice.replace(".", ",")}`;
}

// Base URL do site
const BASE_URL = "https://protapcars.vercel.app";

// Produtos
const productsData: Record<string, Product> = {
  Opala: {
    name: "Tapete Opala",
    fullPrice: "R$50,00",
    price: calculateDiscount("R$50,00"),
    description:
      "Tapetes projetados para proteger o assoalho do seu carro, feitos com materiais resistentes e design funcional.",
    images: [
      `${BASE_URL}/opala/opala.png`,
      `${BASE_URL}/opala/opala1.png`,
      `${BASE_URL}/opala/opala2.png`,
      `${BASE_URL}/opala/opala3.png`,
      `${BASE_URL}/opala/beneficio.png`,
      `${BASE_URL}/opala/beneficio1.png`,
      `${BASE_URL}/opala/beneficio2.png`,
      `${BASE_URL}/opala/beneficio3.png`,
    ],
  },
  UnoStreet: {
    name: "Tapete Uno Street",
    fullPrice: "R$50,00",
    price: calculateDiscount("R$50,00"),
    description:
      "Tapetes projetados para proteger o assoalho do seu carro, feitos com materiais resistentes e design funcional.",
    images: [
      `${BASE_URL}/unos/unostreet.png`,
      `${BASE_URL}/unos/unostreet1.png`,
      `${BASE_URL}/unos/unostreet2.png`,
    ],
  },
  KombiMala: {
    name: "Tapete Kombi Mala",
    fullPrice: "R$110,00",
    price: calculateDiscount("R$110,00"),
    description:
      "Tapetes projetados para o espaço de bagagem da Kombi. Feitos com materiais resistentes e design funcional, ideais para transporte seguro.",
    images: [
      `${BASE_URL}/kombi/kombimala.png`,
      `${BASE_URL}/kombi/kombimala1.png`,
    ],
  },
  Hb20s: {
    name: "Tapete HB20s Street",
    fullPrice: "R$50,00",
    price: calculateDiscount("R$50,00"),
    description:
      "Tapetes projetados para o espaço de bagagem da Kombi. Feitos com materiais resistentes e design funcional, ideais para transporte seguro.",
    images: [
      `${BASE_URL}/hb20/hb20.png`,
      `${BASE_URL}/hb20/hb201.png`,
    ],
  },
  Tcross: {
    name: "Tapete Tcross",
    fullPrice: "R$115,00",
    price: calculateDiscount("R$120,00"),
    description:
      "Tapetes exclusivos para o T-Cross, com bordado elegante e base pinada para maior aderência. Oferecem proteção, estilo e segurança ao interior do veículo.",
    images: [
      `${BASE_URL}/Tcross.png`,
      `${BASE_URL}/Tcross.png`,
    ],
  },
  Polo: {
    name: "Tapete Polo",
    fullPrice: "R$115,00",
    price: calculateDiscount("R$115,00"),
    description:
      "Tapetes sob medida para o Polo, combinando bordado exclusivo e base pinada para maior aderência. Proporcionam elegância, proteção e segurança ao interior do veículo.",
    images: [
      `${BASE_URL}/polo/polo.png`,
      `${BASE_URL}/beneficio/polo.png`,
    ],
  },
  Hilux: {
    name: "Tapete Caçamba Hilux",
    fullPrice: "R$140,00",
    price: calculateDiscount("R$140,00"),
    description:
      "Tapetes sob medida para a Hilux, desenvolvidos com bordado exclusivo e base pinada para garantir aderência e segurança. Proporcionam estilo, proteção e durabilidade ao interior do veículo, alinhando conforto e sofisticação.",
    images: [
      `${BASE_URL}/hilux/hiluxfrente.png`,
      `${BASE_URL}/hilux/hilux.png`,
    ],
  },
  Toro: {
    name: "Tapete Caçamba Toro",
    fullPrice: "R$130,00",
    price: calculateDiscount("R$130,00"),
    description:
      "Tapetes sob medida para a caçamba do Toro, desenvolvidos com materiais resistentes e design funcional. Garantem máxima proteção contra impactos e sujeira, alinhando durabilidade, segurança e estilo ao seu veículo.",
    images: [
      `${BASE_URL}/toro/toro.png`,
      `${BASE_URL}/toro/toro.png`,
    ],
  },
};

async function seedProducts() {
  const collectionRef = db.collection("produtos");

  for (const key in productsData) {
    const product = productsData[key];
    // Usando doc(key).set() para evitar duplicação
    await collectionRef.doc(key).set(product);
    console.log(`Produto ${product.name} adicionado/atualizado.`);
  }

  console.log("Todos os produtos foram adicionados/atualizados!");
}

seedProducts().catch((error) => {
  console.error("Erro ao adicionar produtos:", error);
  process.exit(1);
});
