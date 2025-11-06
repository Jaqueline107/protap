"use client";

import { useState, useEffect, useMemo, Fragment } from "react";
import { db } from "../../db/firebase";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import type { Produto } from "../types/produto";
import Link from "next/link";

/**
 * Modelo esperado do Produto no firestore (ajuste seu types/produto se necessário)
 *
 * export interface Produto {
 *   id: string;
 *   name?: string;
 *   titulo: string;
 *   marca?: string;
 *   modelo?: string;
 *   images: string[];
 *   fullPrice?: string;
 *   price?: number;
 *   description?: string;
 *   ano?: string[]; // removido uso
 *   anoSelecionado?: string | null; // não usado
 *   width?: number;
 *   height?: number;
 *   length?: number;
 *   weight?: number;
 *   pesoCubico?: number;
 *   pesoFrete?: number;
 * }
 */

// util slug
const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/\-+/g, "-")
    .replace(/^\-+|\-+$/g, "");

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
    marca: "",
    images: [],
    fullPrice: "",
    price: 0,
    description: "",
    anoSelecionado: null,
    width: 0,
    height: 0,
    length: 0,
    weight: 0,
  });

  const [uploading, setUploading] = useState<boolean[]>([]);
  const [marcaQuery, setMarcaQuery] = useState(""); // para combobox marca
  const [modeloQuery, setModeloQuery] = useState(""); // para combobox modelo
  const [showMarcaList, setShowMarcaList] = useState(false);
  const [showModeloList, setShowModeloList] = useState(false);

  // buscar produtos
  useEffect(() => {
    const fetchProdutos = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "produtos"), orderBy("titulo", "asc"));
        const snapshot = await getDocs(q);
        const lista = snapshot.docs.map((d) => {
          return { id: d.id, ...(d.data() as any) } as Produto;
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

  // gerar listas de marcas e modelos a partir dos produtos cadastrados
  const marcas = useMemo(() => {
    const setMar = Array.from(new Set(produtos.map((p) => (p.marca || "").trim()).filter(Boolean)));
    return setMar;
  }, [produtos]);

  const modelosDaMarca = useMemo(() => {
    if (!formData.marca && !marcaQuery) return [];
    const marca = (formData.marca || marcaQuery || "").trim();
    if (!marca) return [];
    const setMod = Array.from(
      new Set(produtos.filter((p) => (p.marca || "").trim() === marca).map((p) => (p.modelo || "").trim()).filter(Boolean))
    );
    return setMod;
  }, [produtos, formData.marca, marcaQuery]);

  // handle change (text and numeric)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // campos numéricos:
    if (["width", "height", "length", "weight", "price"].includes(name)) {
      const num = value === "" ? 0 : Number(value);
      setFormData((prev) => ({ ...prev, [name]: num }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // imagens
  const addImageField = () => {
    setFormData((prev) => ({ ...prev, images: [...(prev.images || []), ""] }));
    setUploading((prev) => [...prev, false]);
  };

  const handleUploadImage = async (file: File, index: number) => {
    const tmp = [...uploading];
    tmp[index] = true;
    setUploading(tmp);

    const f = new FormData();
    f.append("file", file);
    f.append("upload_preset", "anuncio");

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/dxylfznat/image/upload", {
        method: "POST",
        body: f,
      });
      const data = await res.json();
      if (data.secure_url) {
        const newImages = [...(formData.images || [])];
        newImages[index] = data.secure_url;
        setFormData((prev) => ({ ...prev, images: newImages }));
      }
    } catch (err) {
      console.error("Erro ao enviar imagem:", err);
      setMessage("❌ Erro ao enviar imagem");
    } finally {
      const tmp2 = [...uploading];
      tmp2[index] = false;
      setUploading(tmp2);
    }
  };

  // salvar produto
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    // validações mínimas
    if (!formData.marca || !formData.modelo) {
      setMessage("⚠️ Preencha Marca e Modelo.");
      return;
    }

    if (!formData.titulo) {
      // se título não foi definido manualmente, gera a partir de marca+modelo
      setFormData((prev) => ({ ...prev, titulo: `Tapete ${prev.marca} ${prev.modelo}` }));
    }

    if (uploading.some((u) => u)) {
      setMessage("⏳ Aguarde todas as imagens terminarem de subir.");
      return;
    }

    try {
      // garantir números corretos
      const width = Number(formData.width || 0);
      const height = Number(formData.height || 0);
      const length = Number(formData.length || 0);
      const weight = Number(formData.weight || 0);
      const price = Number(formData.price || 0);

      // calcular peso cúbico (opcional)
      const pesoCubico = (length * width * height) / 6000;
      const pesoFrete = Math.max(weight || 0, pesoCubico || 0);

      // id gerado automático: tapete-marca-modelo
      const id = editingId || `tapete-${slugify(`${formData.marca}-${formData.modelo}`)}`;

      const produtoData: Produto = {
        id,
        titulo: (formData.titulo || `Tapete ${formData.marca} ${formData.modelo}`) as any,
        marca: formData.marca as any,
        modelo: formData.modelo as any,
        images: formData.images || [],
        fullPrice: formData.fullPrice || "",
        price: price as any,
        description: formData.description || "",
        width,
        height,
        length,
        weight,
        // campos auxiliares
        // @ts-ignore
        pesoCubico,
        // @ts-ignore
        pesoFrete,
      } as Produto;

      await setDoc(doc(db, "produtos", id), produtoData);

      setMessage(`✅ Produto ${editingId ? "editado" : "cadastrado"} com sucesso!`);
      setEditingId(null);
      setModalOpen(false);

      // atualizar lista local
      const snapshot = await getDocs(collection(db, "produtos"));
      setProdutos(snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Produto[]);
    } catch (err) {
      console.error(err);
      setMessage("❌ Erro ao salvar produto");
    }
  };

  // EDITAR
const handleEdit = (produto: Produto) => {
  setEditingId(produto.id);

  setFormData({
    titulo: produto.titulo || `Tapete ${produto.marca} ${produto.modelo}`,
    marca: produto.marca || "",
    modelo: produto.modelo || "",
    images: produto.images || [],
    fullPrice: produto.fullPrice || "",
    price: Number(produto.price) || 0,
    description: produto.description || "",
    anoSelecionado: null,
    width: produto.width || 60,
    height: produto.height || 2,
    length: produto.length || 90,
    weight: produto.weight || 2.5,
  });

  setMarcaQuery(produto.marca || "");
  setModeloQuery(produto.modelo || "");

  setUploading(produto.images?.map(() => false) || []);

  setModalOpen(true);
};

  // deletar
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

  // UI helpers para marca/modelo combobox
  const filteredMarcas = marcas
    .filter((m) => m.toLowerCase().includes((marcaQuery || formData.marca || "").toLowerCase()))
    .slice(0, 20);

  const filteredModelos = modelosDaMarca
    .filter((m) => m.toLowerCase().includes((modeloQuery || formData.modelo || "").toLowerCase()))
    .slice(0, 50);

  if (loading) return <p className="p-8 text-center">Carregando produtos...</p>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
     <div className="flex">
       <button
        onClick={() => {
          setModalOpen(true);
          setEditingId(null);
          setFormData({
            titulo: "",
            modelo: "",
            marca: "",
            images: [],
            fullPrice: "",
            price: 0,
            description: "",
            anoSelecionado: null,
            width: 0,
            height: 0,
            length: 0,
            weight: 0,
          });
          setMarcaQuery("");
          setModeloQuery("");
          setUploading([]);
        }}
        className="bg-green-600 text-white px-4 py-2 rounded mb-6"
      >
        ➕ Adicionar Produto
      </button>
       <button className="ml-8 bg-blue-500 text-white px-4 py-2 rounded mb-6"> 
        <Link href="/Admin/pedidos" className="btn-admin">
        🏷️ Pedidos & Etiquetas
      </Link>
      </button>
     </div>

      {message && (
        <p className={`mb-4 ${message.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
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
                  <td className="border p-3">R$ {(Number(p.price) || 0).toFixed(2)}</td>
                  <td className="border p-3 flex gap-2 justify-center flex-wrap">
                    <button onClick={() => handleEdit(p)} className="bg-blue-600 text-white px-3 py-1 rounded-md">
                      Editar
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="bg-red-600 text-white px-3 py-1 rounded-md">
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
              {/* Título (gerado automaticamente se vazio) */}
              <input
                name="titulo"
                placeholder="Título (opcional - será gerado automaticamente)"
                value={formData.titulo}
                onChange={handleChange}
                className="border p-2 rounded"
              />

              {/* Marca - combobox/autocomplete */}
              <div className="relative">
                <input
                  name="marca"
                  placeholder="Marca (digite para filtrar ou criar)"
                  value={formData.marca || marcaQuery}
                  onChange={(e) => {
                    setMarcaQuery(e.target.value);
                    setFormData((prev) => ({ ...prev, marca: e.target.value }));
                    setShowMarcaList(true);
                  }}
                  onFocus={() => setShowMarcaList(true)}
                  onBlur={() => setTimeout(() => setShowMarcaList(false), 150)}
                  className="border p-2 rounded w-full"
                />
                {showMarcaList && filteredMarcas.length > 0 && (
                  <ul className="absolute left-0 right-0 bg-white border mt-1 max-h-40 overflow-y-auto z-30">
                    {filteredMarcas.map((m) => (
                      <li
                        key={m}
                        onMouseDown={() => {
                          setFormData((prev) => ({ ...prev, marca: m }));
                          setMarcaQuery(m);
                          setShowMarcaList(false);
                        }}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                      >
                        {m}
                      </li>
                    ))}
                    <li
                      onMouseDown={() => {
                        // criar nova marca com o texto atual
                        const novo = (marcaQuery || formData.marca || "").trim();
                        if (!novo) return;
                        setFormData((prev) => ({ ...prev, marca: novo }));
                        setMarcaQuery(novo);
                        setShowMarcaList(false);
                      }}
                      className="p-2 text-sm text-blue-600 hover:bg-gray-100 cursor-pointer"
                    >
                      Criar nova marca “{marcaQuery || formData.marca}”
                    </li>
                  </ul>
                )}
              </div>

              {/* Modelo - combobox/autocomplete (filtra por marca) */}
              <div className="relative">
                <input
                  name="modelo"
                  placeholder="Modelo (digite para filtrar ou criar)"
                  value={formData.modelo || modeloQuery}
                  onChange={(e) => {
                    setModeloQuery(e.target.value);
                    setFormData((prev) => ({ ...prev, modelo: e.target.value }));
                    setShowModeloList(true);
                  }}
                  onFocus={() => setShowModeloList(true)}
                  onBlur={() => setTimeout(() => setShowModeloList(false), 150)}
                  className="border p-2 rounded w-full"
                />
                {showModeloList && filteredModelos.length > 0 && (
                  <ul className="absolute left-0 right-0 bg-white border mt-1 max-h-40 overflow-y-auto z-30">
                    {filteredModelos.map((m) => (
                      <li
                        key={m}
                        onMouseDown={() => {
                          setFormData((prev) => ({ ...prev, modelo: m }));
                          setModeloQuery(m);
                          setShowModeloList(false);
                        }}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                      >
                        {m}
                      </li>
                    ))}
                    <li
                      onMouseDown={() => {
                        const novo = (modeloQuery || formData.modelo || "").trim();
                        if (!novo) return;
                        setFormData((prev) => ({ ...prev, modelo: novo }));
                        setModeloQuery(novo);
                        setShowModeloList(false);
                      }}
                      className="p-2 text-sm text-blue-600 hover:bg-gray-100 cursor-pointer"
                    >
                      Criar novo modelo “{modeloQuery || formData.modelo}”
                    </li>
                  </ul>
                )}
              </div>

              {/* Outros campos existentes */}
              <input name="fullPrice" placeholder="Preço original" type="text" value={formData.fullPrice} onChange={handleChange} className="border p-2 rounded" />
              <input name="price" placeholder="Preço promocional (opcional)" type="number" value={formData.price as any} onChange={handleChange} className="border p-2 rounded" />
              <textarea name="description" placeholder="Descrição" value={formData.description} onChange={handleChange} className="border p-2 rounded" />

              {/* Upload de imagens */}
              <div className="flex flex-col gap-2">
                {(formData.images || []).map((img, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files && handleUploadImage(e.target.files[0], idx)}
                      className="border p-2 rounded flex-1"
                    />
                    {img && <img src={img} alt={`Produto ${idx + 1}`} className="w-16 h-16 object-cover rounded" />}
                    {uploading[idx] && <span className="text-sm text-gray-500">Enviando...</span>}
                  </div>
                ))}
                <button type="button" onClick={addImageField} className="bg-gray-200 px-3 py-1 rounded">
                  + Adicionar imagem
                </button>
              </div>

              {/* Dimensões e peso (cm / kg) */}
              <div className="grid grid-cols-2 gap-3">
                <p>Comprimento</p>
                <input type="number" name="length" placeholder="Comprimento (cm)" value={formData.length as any} onChange={handleChange} className="border p-2 rounded" />
                <p>Largura</p>
                <input type="number" name="width" placeholder="Largura (cm)" value={formData.width as any} onChange={handleChange} className="border p-2 rounded" />
                <p>Altura</p>
                <input type="number" name="height" placeholder="Altura (cm)" value={formData.height as any} onChange={handleChange} className="border p-2 rounded" />
                <p>Peso Kg"</p>
                <input type="number" name="weight" placeholder="Peso (kg)" step="0.01" value={formData.weight as any} onChange={handleChange} className="border p-2 rounded" />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="bg-gray-300 px-4 py-2 rounded">
                  Cancelar
                </button>
                <button type="submit" disabled={uploading.some((u) => u)} className={`bg-green-600 text-white px-4 py-2 rounded ${uploading.some((u) => u) ? "opacity-50 cursor-not-allowed" : ""}`}>
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
