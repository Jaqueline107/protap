import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT as string)
    ),
  });
}

const db = admin.firestore();

// Tipagem de produto (ajuste conforme os campos do seu Firestore)
interface Product {
  id: string;
  marca: string;
  modelo: string;
  ano: string[]; // array de anos disponíveis
  name: string;
  description: string;
  images: string[];
  price: string;
  fullPrice: string;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const marca = searchParams.get("marca");
    const modelo = searchParams.get("modelo");
    const ano = searchParams.get("ano");

    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> =
      db.collection("produtos");

    if (marca) query = query.where("marca", "==", marca);
    if (modelo) query = query.where("modelo", "==", modelo);
    if (ano) query = query.where("ano", "array-contains", ano);

    const snapshot = await query.get();

    const products: Product[] = snapshot.docs.map((doc) => {
      const data = doc.data() as Omit<Product, "id">;
      return { id: doc.id, ...data };
    });

    return new Response(JSON.stringify(products), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: "Erro ao buscar produtos" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}