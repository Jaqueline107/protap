"use client";

import { useState, useEffect } from "react";
import { db } from "../../db/firebase";
import { collection, getDocs, setDoc, doc, deleteDoc } from "firebase/firestore";
import type { Produto } from "../types/produto";

type ProdutoFormData = Omit<Produto, "id" | "name">;

export default function AdminProdutosModal() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState<ProdutoFormData>({
    titulo: "",
    modelo: "",
    images: [],
    fullPrice: "",
    price: "",
    anoSelecionado: null,
    width: 0,
    height: 0,
    length: 0,
    weight: 0,
  });

  const [uploading, setUploading] = useState<boolean[]>([]);

  // 🔹 Buscar produtos
  useEffect(() => {
    const fetchProdutos = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, "produtos"));
        const lista: Produto[] = snapshot.docs.map((d) => {
          const data = d.data() as Produto;
          return {
            id: d.id,
            name: data.titulo,
            titulo: data.titulo || "",
            modelo: data.modelo || "",
            ano: data.ano || [],
            images: data.images || [],
            fullPrice: String(data.fullPrice || ""),
            price: String(data.price || ""),
            anoSelecionado: data.anoSelecionado || null,
            width: data.width || 0,
            height: data.height || 0,
            length: data.length || 0,
            weight: data.weight || 0,
          };
        });
        setProdutos(lista);
      } catch (err) {
        console.error(err);
        setMessage("❌ Erro ao buscar produtos");
      } finally {
        setLoading(false);
      }
    };
    fetchProdutos();
  }, []);

  // 🔹 Atualizar campos do formulário
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Adicionar campo de imagem
  const addImageField = () => {
    setFormData((prev) => ({ ...prev, images: [...prev.images, ""] }));
    setUploading((prev) => [...prev, false]);
  };

  // 🔹 Upload de imagem para Cloudinary
  const handleUploadImage = async (file: File, index: number) => {
    const tmpUploading = [...uploading];
    tmpUploading[index] = true;
    setUploading(tmpUploading);

    const formDataCloud = new FormData();
    formDataCloud.append("file", file);
    formDataCloud.append("upload_preset", "anuncio"); // seu preset unsigned

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dxylfznat/image/upload",
        { method: "POST", body: formDataCloud }
      );
      const data = await res.json();
      if (data.secure_url) {
        const newImages = [...formData.images];
        newImages[index] = data.secure_url;
        setFormData((prev) => ({ ...prev, images: newImages }));
      }
    } catch (err) {
      console.error("Erro ao enviar imagem:", err);
    } finally {
      const tmpUploading = [...uploading];
      tmpUploading[index] = false;
      setUploading(tmpUploading);
    }
  };

  // 🔹 Salvar produto
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!formData.titulo) {
      setMessage("⚠️ Preencha o campo título.");
      return;
    }

    if (uploading.some((u) => u)) {
      setMessage("⏳ Aguarde todas as imagens terminarem de subir.");
      return;
    }

    try {
      const id = editingId || formData.titulo.toLowerCase().replace(/\s+/g, "-");
      const produtoData: Produto = {
        ...formData,
        id,
        titulo: formData.titulo,
      };

      await setDoc(doc(db, "produtos", id), produtoData);
      setMessage(`✅ Produto ${editingId ? "editado" : "cadastrado"} com sucesso!`);
      setEditingId(null);
      setModalOpen(false);

      const snapshot = await getDocs(collection(db, "produtos"));
      setProdutos(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Produto[]);
    } catch (err) {
      console.error(err);
      setMessage("❌ Erro ao salvar produto");
    }
  };

  // 🔹 Editar produto
  const handleEdit = (produto: Produto) => {
    setEditingId(produto.id);
    setFormData({
      titulo: produto.titulo,
      modelo: produto.modelo || "",
      images: produto.images.length ? produto.images : [],
      fullPrice: produto.fullPrice,
      price: produto.price,
      anoSelecionado: produto.anoSelecionado || null,
      width: produto.width || 0,
      height: produto.height || 0,
      length: produto.length || 0,
      weight: produto.weight || 0,
    });
    setUploading(produto.images.map(() => false));
    setModalOpen(true);
  };

  // 🔹 Excluir produto
  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    try {
      await deleteDoc(doc(db, "produtos", id));
      setProdutos((prev) => prev.filter((p) => p.id !== id));
      setMessage("✅ Produto excluído com sucesso!");
    } catch (err) {
      console.error(err);
      setMessage("❌ Erro ao excluir produto");
    }
  };

  if (loading) return <p className="p-8 text-center">Carregando produtos...</p>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <button
        onClick={() => setModalOpen(true)}
        className="bg-green-600 text-white px-4 py-2 rounded mb-6"
      >
        ➕ Adicionar Produto
      </button>

      {message && (
        <p
          className={`mb-4 ${
            message.startsWith("✅") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}

      {produtos.length === 0 ? (
        <p>Nenhum produto cadastrado.</p>
      ) : (
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto border border-gray-300 rounded">
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-3">Título</th>
                <th className="border p-3">Preço</th>
                <th className="border p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((p) => (
                <tr key={p.id} className="text-center">
                  <td className="border p-3">{p.titulo}</td>
                  <td className="border p-3">
                    R$ {parseFloat(p.price || "0").toFixed(2)}
                  </td>
                  <td className="border p-3 flex gap-2 justify-center flex-wrap">
                    <button
                      onClick={() => handleEdit(p)}
                      className="bg-blue-600 text-white px-3 py-1 rounded-md"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded-md"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg relative max-h-[85vh] overflow-y-auto mt-32 shadow-lg">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? "Editar Produto" : "Adicionar Produto"}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                name="titulo"
                placeholder="Título"
                value={formData.titulo}
                onChange={handleChange}
                required
                className="border p-2 rounded"
              />
              <input
                name="modelo"
                placeholder="Modelo"
                value={formData.modelo}
                onChange={handleChange}
                className="border p-2 rounded"
              />
              <input
                name="fullPrice"
                placeholder="Preço original"
                type="text"
                value={formData.fullPrice}
                onChange={handleChange}
                className="border p-2 rounded"
              />
              <input
                name="price"
                placeholder="Preço promocional (opcional)"
                type="text"
                value={formData.price}
                onChange={handleChange}
                className="border p-2 rounded"
              />
              <textarea
                name="description"
                placeholder="Descrição"
                onChange={handleChange}
                className="border p-2 rounded"
              />

              {/* Upload de imagens */}
              <div className="flex flex-col gap-2">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        e.target.files &&
                        handleUploadImage(e.target.files[0], idx)
                      }
                      className="border p-2 rounded flex-1"
                    />
                    {img && (
                      <img
                        src={img}
                        alt={`Produto ${idx + 1}`}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    {uploading[idx] && <span className="text-sm text-gray-500">Enviando...</span>}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addImageField}
                  className="bg-gray-200 px-3 py-1 rounded"
                >
                  + Adicionar imagem
                </button>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="bg-gray-300 px-4 py-2 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploading.some((u) => u)}
                  className={`bg-green-600 text-white px-4 py-2 rounded ${
                    uploading.some((u) => u) ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
