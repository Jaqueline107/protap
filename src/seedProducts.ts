import * as admin from "firebase-admin";
import { ServiceAccount } from "firebase-admin";
import serviceAccountJson from "../seu-service-account.json";

const serviceAccount = serviceAccountJson as ServiceAccount;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

type Product = {
  name: string;
  marca: string;
  modelo: string;
  ano: string[];
  fullPrice: string;
  price: string;
  description: string;
  images: string[];
  weight: number;
  width: number;
  height: number;
  length: number;
};

// Função para calcular desconto
function calculateDiscount(fullPrice: string): string {
  const numericPrice = parseFloat(fullPrice.replace("R$", "").replace(",", "."));
  const discountedPrice = (numericPrice * 0.7).toFixed(2);
  return `R$${discountedPrice.replace(".", ",")}`;
}

const BASE_URL = "https://protapcars.vercel.app";

const productsData: Record<string, Product> = {
  Opala: {
    name: "Tapete Opala",
    marca: "Chevrolet",
    modelo: "Opala",
    ano: ["1970", "1980", "1990"],
    fullPrice: "R$50,00",
    price: calculateDiscount("R$50,00"),
    description:
      "Tapetes projetados para proteger o assoalho do seu carro, feitos com materiais resistentes e design funcional.",
    images: [
      `${BASE_URL}/opala/opala.png`,
      `${BASE_URL}/opala/opala1.png`,
    ],
    weight: 1,
    width: 60,
    height: 5,
    length: 90,
  },
  UnoStreet: {
    name: "Tapete Uno Street",
    marca: "Fiat",
    modelo: "Uno",
    ano: ["2010", "2015", "2020"],
    fullPrice: "R$50,00",
    price: calculateDiscount("R$50,00"),
    description:
      "Tapetes projetados para proteger o assoalho do seu carro, feitos com materiais resistentes e design funcional.",
    images: [
      `${BASE_URL}/unos/unostreet.png`,
      `${BASE_URL}/unos/unostreet1.png`,
    ],
    weight: 1,
    width: 60,
    height: 5,
    length: 90,
  },
  KombiMala: {
    name: "Tapete Kombi Mala",
    marca: "Volkswagen",
    modelo: "Kombi",
    ano: ["1995", "2000", "2010"],
    fullPrice: "R$110,00",
    price: calculateDiscount("R$110,00"),
    description:
      "Tapetes projetados para o espaço de bagagem da Kombi. Feitos com materiais resistentes e design funcional.",
    images: [`${BASE_URL}/kombi/kombimala.png`],
    weight: 1,
    width: 60,
    height: 5,
    length: 90,
  },
  Hb20s: {
    name: "Tapete HB20s Street",
    marca: "Hyundai",
    modelo: "HB20",
    ano: ["2020", "2021", "2022", "2023", "2024", "2025"],
    fullPrice: "R$50,00",
    price: calculateDiscount("R$50,00"),
    description: "Tapetes para o espaço de bagagem do HB20.",
    images: [`${BASE_URL}/hb20/hb20.png`],
    weight: 1,
    width: 60,
    height: 5,
    length: 90,
  },
};

// Função para adicionar produtos ao Firestore
async function seedProducts() {
  const collectionRef = db.collection("produtos");

  for (const key in productsData) {
    const product = productsData[key];
    await collectionRef.doc(key).set(product);
    console.log(`Produto ${product.name} adicionado/atualizado.`);
  }

  console.log("Todos os produtos foram adicionados/atualizados!");
}

// Executa o seed
seedProducts().catch((error) => {
  console.error("Erro ao adicionar produtos:", error);
  process.exit(1);
});
