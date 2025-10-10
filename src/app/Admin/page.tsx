"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  User,
} from "firebase/auth";
import { db } from "../../db/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

import AdminProdutosModal from "./AdminModal";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showLinkGoogle, setShowLinkGoogle] = useState(false);

  // --- Verifica login e permissões admin ---
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const adminDoc = await getDoc(doc(db, "admins", currentUser.uid));
          if (!adminDoc.exists()) {
            alert("❌ Você não tem permissão de administrador!");
            await signOut(auth);
            router.push("/");
          }
        } catch (err: unknown) {
          console.error(err);
          await signOut(auth);
          router.push("/");
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  // --- Login Google ---
  const handleLoginGoogle = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: unknown) {
      if (err instanceof Error) console.error(err.message);
      else console.error(err);
      alert("Erro ao fazer login com Google");
    }
  };

  // --- Linkar conta Google ao email existente ---
  const handleLinkGoogle = async () => {
    if (!user) return;
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    try {
      await user.linkWithPopup(provider);
      alert("✅ Conta Google vinculada com sucesso!");
      setShowLinkGoogle(false);
    } catch (err: unknown) {
      if (err instanceof Error) console.error(err.message);
      else console.error(err);
      alert("Erro ao vincular Google");
    }
  };

  // --- Logout ---
  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
    setUser(null);
    setShowAddAdmin(false);
    setShowLinkGoogle(false);
  };

  // --- Criar novo admin ---
  const handleAddAdmin = async () => {
    if (!newAdminEmail || !newAdminPassword) {
      alert("Preencha email e senha do novo admin");
      return;
    }
    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newAdminEmail,
        newAdminPassword
      );
      const newUser = userCredential.user;

      await setDoc(doc(db, "admins", newUser.uid), {
        email: newAdminEmail,
        role: "admin",
      });

      alert(`✅ Novo admin criado: ${newAdminEmail}`);
      setNewAdminEmail("");
      setNewAdminPassword("");
      setShowAddAdmin(false);
    } catch (err: unknown) {
      if (err instanceof Error) setMessage(err.message);
      else setMessage("Erro desconhecido ao criar novo admin");
    }
  };

  if (loading) return <p className="text-center mt-32">Carregando...</p>;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Login de Administrador</h1>
        <button
          onClick={handleLoginGoogle}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Login com Google
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Painel de Controle</h1>

        <div className="relative">
          <img
            src={user.photoURL || "/default-avatar.png"}
            alt="Avatar"
            className="w-10 h-10 rounded-full cursor-pointer"
            onClick={() => setShowAddAdmin((prev) => !prev)}
          />
          {showAddAdmin && (
            <div className="absolute right-0 mt-2 bg-white border rounded shadow-lg p-4 flex flex-col gap-2">
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Sair
              </button>
              {showLinkGoogle && (
                <button
                  onClick={handleLinkGoogle}
                  className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 mt-2"
                >
                  Vincular Google
                </button>
              )}
              {message && <p className="text-red-500 text-sm mt-2">{message}</p>}
            </div>
          )}
        </div>
      </div>

      <AdminProdutosModal />
    </div>
  );
}
