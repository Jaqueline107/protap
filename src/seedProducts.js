"use strict";
const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");
// Seu cálculo de desconto igual no front
function calculateDiscount(fullPrice) {
    const numericPrice = parseFloat(fullPrice.replace("R$", "").replace(",", "."));
    const discountedPrice = (numericPrice * 0.7).toFixed(2);
    return `R$${discountedPrice.replace(".", ",")}`;
}
const serviceAccountPath = path.resolve(__dirname, "src/seu-service-account.json");
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
});
const db = admin.firestore();
const productsData = {
    Opala: {
        name: "Tapete Opala",
        fullPrice: "R$50,00",
        price: calculateDiscount("R$50,00"),
        description: "Tapetes projetados para proteger o assoalho do seu carro, Feito com materiais resistentes e design funcional.",
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
    // Continue com os outros produtos aqui...
};
async function seedProducts() {
    const collectionRef = db.collection("produtos");
    for (const key in productsData) {
        const product = productsData[key];
        await collectionRef.add(product);
        console.log(`Produto ${product.name} adicionado.`);
    }
    console.log("Todos os produtos foram adicionados!");
}
seedProducts().catch((error) => {
    console.error("Erro ao adicionar produtos:", error);
    process.exit(1);
});
