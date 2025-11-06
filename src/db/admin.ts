// /app/db/admin.ts
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  const sa = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!sa) {
    console.warn("FIREBASE_SERVICE_ACCOUNT não está definido. Alguns endpoints do servidor podem falhar em ambiente local.");
  } else {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(sa)),
      });
    } catch (err) {
      console.error("Erro ao inicializar Firebase Admin:", err);
    }
  }
}

export const db = admin.firestore();
export default admin;
