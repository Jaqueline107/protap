"use client";

import { useState, useEffect } from "react";
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
  ano: string[];
  weight: number;
  width: number;
  height: number;
  length: number;
}

type ProdutoFormData = Omit<Produto, "id">;

export default function AdminProdutosModal() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState<ProdutoFormData>({
    modelo: "",
    titulo: "",
    fullPrice: "",
    price: "",
    description: "",
    images: [""],
    ano: [],
    weight: 1,
    width: 60,
    height: 5,
    length: 90,
  });

  useEffect(() => {
    const fetchProdutos = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, "produtos"));
        const lista: Produto[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            modelo: data.modelo ?? "",
            titulo: data.titulo ?? "",
            fullPrice: data.fullPrice ?? "",
            price: data.price ?? "",
            description: data.description ?? "",
            images: Array.isArray(data.images) ? data.images : [""],
            ano: Array.isArray(data.ano) ? data.ano : [],
            weight: data.weight ?? 1,
            width: data.width ?? 60,
            height: data.height ?? 5,
            length: data.length ?? 90,
          };
        });
        setProdutos(lista);
      } catch (err) {
        console.error("Erro ao buscar produtos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProdutos();
  }, []);

  const slugify = (text: string) =>
    text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: Number(value) }));
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
      });

      setMessage(`✅ Produto ${editingId ? "editado" : "cadastrado"} com sucesso!`);
      setFormData({
        modelo: "",
        titulo: "",
        fullPrice: "",
        price: "",
        description: "",
        images: [""],
        ano: [],
        weight: 1,
        width: 60,
        height: 5,
        length: 90,
      });
      setEditingId(null);
      setModalOpen(false);

      const snapshot = await getDocs(collection(db, "produtos"));
      const lista: Produto[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          modelo: data.modelo ?? "",
          titulo: data.titulo ?? "",
          fullPrice: data.fullPrice ?? "",
          price: data.price ?? "",
          description: data.description ?? "",
          images: Array.isArray(data.images) ? data.images : [""],
          ano: Array.isArray(data.ano) ? data.ano : [],
          weight: data.weight ?? 1,
          width: data.width ?? 60,
          height: data.height ?? 5,
          length: data.length ?? 90,
        };
      });
      setProdutos(lista);
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
      images: produto.images.length ? produto.images : [""],
      ano: produto.ano ?? [],
      weight: produto.weight,
      width: produto.width,
      height: produto.height,
      length: produto.length,
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
      <button
        onClick={() => setModalOpen(true)}
        className="bg-green-600 text-white px-4 py-2 rounded mb-6"
      >
        ➕ Adicionar Produto
      </button>

      {message && (
        <p className={`mb-4 ${message.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>
      )}

      {produtos.length === 0 ? (
        <p>Nenhum produto cadastrado.</p>
      ) : (
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto border border-gray-300 rounded mx-[5px]">
          <table className="w-[calc(100%-10px)] min-w-[500px] border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-3">Modelo</th>
                <th className="border p-3">Título</th>
                <th className="border p-3">Preço</th>
                <th className="border p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((p) => (
                <tr key={p.id} className="text-center">
                  <td className="border p-3">{p.modelo}</td>
                  <td className="border p-3">{p.titulo}</td>
                  <td className="border p-3">{p.price}</td>
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
            <h2 className="text-xl font-bold mb-4">{editingId ? "Editar Produto" : "Adicionar Produto"}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input type="text" name="modelo" placeholder="Modelo" value={formData.modelo} onChange={handleChange} required className="border p-2 rounded" />
              <input type="text" name="titulo" placeholder="Título" value={formData.titulo} onChange={handleChange} required className="border p-2 rounded" />
              <input type="text" name="fullPrice" placeholder="Preço original" value={formData.fullPrice} onChange={handleChange} required className="border p-2 rounded" />
              <input type="text" name="price" placeholder="Preço promocional" value={formData.price} onChange={handleChange} required className="border p-2 rounded" />
              <textarea name="description" placeholder="Descrição" value={formData.description} onChange={handleChange} className="border p-2 rounded" />

              {/* Campos numéricos com placeholders claros */}
              <input type="number" name="weight" placeholder="Peso (kg)" value={formData.weight} onChange={handleNumberChange} required className="border p-2 rounded" />
              <input type="number" name="width" placeholder="Largura (cm)" value={formData.width} onChange={handleNumberChange} required className="border p-2 rounded" />
              <input type="number" name="length" placeholder="Comprimento (cm)" value={formData.length} onChange={handleNumberChange} required className="border p-2 rounded" />
              <input type="number" name="height" placeholder="Altura (cm)" value={formData.height} onChange={handleNumberChange} required className="border p-2 rounded" />

              {/* Imagens */}
              <div className="flex flex-col gap-2">
                {formData.images.map((img, idx) => (
                  <input key={idx} type="text" placeholder={`URL imagem ${idx + 1}`} value={img} onChange={(e) => handleImageChange(idx, e.target.value)} className="border p-2 rounded" />
                ))}
                <button type="button" onClick={addImageField} className="bg-gray-200 px-3 py-1 rounded">+ Adicionar imagem</button>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="bg-gray-300 px-4 py-2 rounded">Cancelar</button>
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
