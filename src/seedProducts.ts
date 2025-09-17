"use client";

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
    description: "Tapetes projetados para proteger o assoalho do seu carro, feitos com materiais resistentes e design funcional.",
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
    marca: "Fiat",
    modelo: "Uno",
    ano: ["2010", "2015", "2020"],
    fullPrice: "R$50,00",
    price: calculateDiscount("R$50,00"),
    description: "Tapetes projetados para proteger o assoalho do seu carro, feitos com materiais resistentes e design funcional.",
    images: [
      `${BASE_URL}/unos/unostreet.png`,
      `${BASE_URL}/unos/unostreet1.png`,
      `${BASE_URL}/unos/unostreet2.png`,
    ],
  },
  KombiMala: {
    name: "Tapete Kombi Mala",
    marca: "Volkswagen",
    modelo: "Kombi",
    ano: ["1995", "2000", "2010"],
    fullPrice: "R$110,00",
    price: calculateDiscount("R$110,00"),
    description: "Tapetes projetados para o espaço de bagagem da Kombi. Feitos com materiais resistentes e design funcional, ideais para transporte seguro.",
    images: [
      `${BASE_URL}/kombi/kombimala.png`,
      `${BASE_URL}/kombi/kombimala1.png`,
    ],
  },
  Hb20s: {
    name: "Tapete HB20s Street",
    marca: "Hyundai",
    modelo: "HB20",
    ano: ["2020", "2021", "2022", "2023", "2024", "2025"],
    fullPrice: "R$50,00",
    price: calculateDiscount("R$50,00"),
    description: "Tapetes projetados para o espaço de bagagem do HB20. Feitos com materiais resistentes e design funcional, ideais para transporte seguro.",
    images: [
      `${BASE_URL}/hb20/hb20.png`,
      `${BASE_URL}/hb20/hb201.png`,
    ],
  },
  Tcross: {
    name: "Tapete Tcross",
    marca: "Volkswagen",
    modelo: "T-Cross",
    ano: ["2020", "2021", "2022", "2023"],
    fullPrice: "R$115,00",
    price: calculateDiscount("R$120,00"),
    description: "Tapetes exclusivos para o T-Cross, com bordado elegante e base pinada para maior aderência. Oferecem proteção, estilo e segurança ao interior do veículo.",
    images: [
      `${BASE_URL}/Tcross.png`,
      `${BASE_URL}/Tcross.png`,
    ],
  },
  Polo: {
    name: "Tapete Polo",
    marca: "Volkswagen",
    modelo: "Polo",
    ano: ["2018", "2019", "2020", "2021"],
    fullPrice: "R$115,00",
    price: calculateDiscount("R$115,00"),
    description: "Tapetes sob medida para o Polo, combinando bordado exclusivo e base pinada para maior aderência. Proporcionam elegância, proteção e segurança ao interior do veículo.",
    images: [
      `${BASE_URL}/polo/polo.png`,
      `${BASE_URL}/beneficio/polo.png`,
    ],
  },
  Hilux: {
    name: "Tapete Caçamba Hilux",
    marca: "Toyota",
    modelo: "Hilux",
    ano: ["2015", "2016", "2017", "2018", "2019", "2020"],
    fullPrice: "R$140,00",
    price: calculateDiscount("R$140,00"),
    description: "Tapetes sob medida para a Hilux, desenvolvidos com bordado exclusivo e base pinada para garantir aderência e segurança. Proporcionam estilo, proteção e durabilidade ao interior do veículo, alinhando conforto e sofisticação.",
    images: [
      `${BASE_URL}/hilux/hiluxfrente.png`,
      `${BASE_URL}/hilux/hilux.png`,
    ],
  },
  Toro: {
    name: "Tapete Caçamba Toro",
    marca: "Fiat",
    modelo: "Toro",
    ano: ["2016", "2017", "2018", "2019", "2020"],
    fullPrice: "R$130,00",
    price: calculateDiscount("R$130,00"),
    description: "Tapetes sob medida para a caçamba do Toro, desenvolvidos com materiais resistentes e design funcional. Garantem máxima proteção contra impactos e sujeira, alinhando durabilidade, segurança e estilo ao seu veículo.",
    images: [
      `${BASE_URL}/toro/toro.png`,
      `${BASE_URL}/toro/toro.png`,
    ],
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

// Roda o seed
seedProducts().catch((error) => {
  console.error("Erro ao adicionar produtos:", error);
  process.exit(1);
});
