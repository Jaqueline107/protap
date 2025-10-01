"use client";

import { useEffect, useState } from "react";
import { db } from "../../db/firebase";
import { collection, getDocs, setDoc, doc, deleteDoc } from "firebase/firestore";

interface Produto {
  id: string;
  modelo: string;
  titulo: string;
  fullPrice: string;
  price: string;
  description: string;
  images: string[];
  ano?: string; // tratado como string no form
}

export default function AdminProdutosModal() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<Produto, "id">>({
    modelo: "",
    titulo: "",
    fullPrice: "",
    price: "",
    description: "",
    images: [""],
    ano: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [autorizado, setAutorizado] = useState(false);

  // Proteção por senha
  useEffect(() => {
    const senha = prompt("Digite a senha para acessar a página:");
    if (senha === "minhaSenhaSegura") {
      setAutorizado(true);
    } else {
      alert("❌ Você não tem acesso!");
      window.location.href = "/";
    }
  }, []);

  if (!autorizado) return null;

  const slugify = (text: string) =>
    text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");

  const fetchProdutos = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "produtos"));
      const lista = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Produto, "id">),
      })) as Produto[];
      setProdutos(lista);
    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData((prev) => ({ ...prev, images: newImages }));
  };

  const addImageField = () => {
    setFormData((prev) => ({ ...prev, images: [...prev.images, ""] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      const id = editingId || slugify(formData.modelo);
      await setDoc(doc(db, "produtos", id), {
        ...formData,
        images: formData.images.filter((img) => img.trim() !== ""),
        ano: formData.ano
          ? formData.ano.split(",").map((a) => a.trim())
          : [], // transforma string em array
      });
      setMessage(`✅ Produto ${editingId ? "editado" : "cadastrado"} com sucesso!`);
      setFormData({
        modelo: "",
        titulo: "",
        fullPrice: "",
        price: "",
        description: "",
        images: [""],
        ano: "",
      });
      setEditingId(null);
      setModalOpen(false);
      fetchProdutos();
    } catch (err) {
      console.error(err);
      setMessage("❌ Erro ao salvar produto");
    }
  };

  const handleEdit = (produto: Produto) => {
    setEditingId(produto.id);
    setFormData({
      modelo: produto.modelo,
      titulo: produto.titulo,
      fullPrice: produto.fullPrice,
      price: produto.price,
      description: produto.description,
      images: produto.images,
      ano: Array.isArray(produto.ano) ? produto.ano.join(",") : (produto.ano || ""),
    });
    setModalOpen(true);
  };

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
      <h1 className="text-2xl font-bold mb-6">Admin Produtos</h1>

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

      {/* Lista de produtos */}
      {produtos.length === 0 ? (
        <p>Nenhum produto cadastrado.</p>
      ) : (
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto border border-gray-300 rounded">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Modelo</th>
                <th className="border p-2">Título</th>
                <th className="border p-2">Preço</th>
                <th className="border p-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((p) => (
                <tr key={p.id} className="text-center">
                  <td className="border p-2">{p.modelo}</td>
                  <td className="border p-2">{p.titulo}</td>
                  <td className="border p-2">{p.price}</td>
                  <td className="border p-2 flex gap-2 justify-center">
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg relative max-h-[85vh] overflow-y-auto mt-32 shadow-lg">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? "Editar Produto" : "Adicionar Produto"}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                name="modelo"
                placeholder="Modelo"
                value={formData.modelo}
                onChange={handleChange}
                required
                className="border p-2 rounded"
              />
              <input
                type="text"
                name="titulo"
                placeholder="Título do anúncio"
                value={formData.titulo}
                onChange={handleChange}
                required
                className="border p-2 rounded"
              />
              <input
                type="text"
                name="fullPrice"
                placeholder="Preço original"
                value={formData.fullPrice}
                onChange={handleChange}
                required
                className="border p-2 rounded"
              />
              <input
                type="text"
                name="price"
                placeholder="Preço promocional"
                value={formData.price}
                onChange={handleChange}
                required
                className="border p-2 rounded"
              />
              <textarea
                name="description"
                placeholder="Descrição"
                value={formData.description}
                onChange={handleChange}
                required
                className="border p-2 rounded h-24"
              />
              <div>
                <label className="font-medium">Imagens (URLs)</label>
                {formData.images.map((img, index) => (
                  <input
                    key={index}
                    type="text"
                    placeholder={`Imagem ${index + 1}`}
                    value={img}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    className="border p-2 rounded w-full mt-2"
                  />
                ))}
                <button
                  type="button"
                  onClick={addImageField}
                  className="mt-2 px-4 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  + Adicionar Imagem
                </button>
              </div>
              <input
                type="text"
                name="ano"
                placeholder="Anos (ex: 2020,2021)"
                value={formData.ano}
                onChange={handleChange}
                className="border p-2 rounded"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setEditingId(null);
                  }}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  {editingId ? "Salvar Alterações" : "Cadastrar Produto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
