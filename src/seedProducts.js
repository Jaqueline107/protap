"use strict";

import admin from "firebase-admin";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Ajuste para __dirname em ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função de cálculo de desconto
function calculateDiscount(fullPrice) {
  const numericPrice = parseFloat(fullPrice.replace("R$", "").replace(",", "."));
  const discountedPrice = (numericPrice * 0.7).toFixed(2);
  return `R$${discountedPrice.replace(".", ",")}`;
}

// Caminho para o service account
const serviceAccountPath = path.resolve(__dirname, "src/seu-service-account.json");
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

// Inicializar Firebase Admin (somente uma vez!)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// Dados dos produtos
const productsData = {
  Opala: {
    name: "Tapete Opala",
    fullPrice: "R$50,00",
    price: calculateDiscount("R$50,00"),
    description:
      "Tapetes projetados para proteger o assoalho do seu carro, Feito com materiais resistentes e design funcional.",
    images: [
      "https://seusite.com/opala/opala.png",
      "https://seusite.com/opala/opala1.png",
      "https://seusite.com/opala/opala2.png",
      "https://seusite.com/opala/opala3.png",
      "https://seusite.com/opala/beneficio.png",
      "https://seusite.com/opala/beneficio1.png",
      "https://seusite.com/opala/beneficio2.png",
      "https://seusite.com/opala/beneficio3.png",
    ],
  },
  // Continue adicionando outros produtos aqui...
};

// Função de seed
async function seedProducts() {
  try {
    const collectionRef = db.collection("produtos");

    for (const key in productsData) {
      const product = productsData[key];
      await collectionRef.add(product);
      console.log(`Produto ${product.name} adicionado.`);
    }

    console.log("Todos os produtos foram adicionados!");
  } catch (error) {
    console.error("Erro ao adicionar produtos:", error);
    process.exit(1);
  }
}

seedProducts();
