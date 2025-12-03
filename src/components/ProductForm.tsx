'use client';

import { useState, useEffect } from 'react';
import {
  createProduct,
  updateProduct,
  uploadImageToCloudinary,
  type ProductFormData,
} from '@/app/admin/products/actions';

interface ProductFormProps {
  product?: ProductFormData;
  categories: Array<{ id: string; name: string }>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ProductForm({
  product,
  categories,
  onSuccess,
  onCancel,
}: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    title: product?.title || '',
    price_cny: product?.price_cny || '',
    affiliate_link: product?.affiliate_link || '',
    original_link: product?.original_link || '',
    category_id: product?.category_id || '',
    is_sold_out: product?.is_sold_out || false,
    image_main: product?.image_main || '',
    image_hover: product?.image_hover || '',
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleImageUpload = async (
    file: File,
    field: 'image_main' | 'image_hover'
  ) => {
    setUploading(true);
    try {
      const url = await uploadImageToCloudinary(file);
      if (url) {
        setFormData((prev) => ({ ...prev, [field]: url }));
      } else {
        alert('Erro ao fazer upload da imagem');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao fazer upload da imagem');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const result = product?.id
        ? await updateProduct({ ...formData, id: product.id })
        : await createProduct(formData);

      if (result.success) {
        alert('Produto salvo com sucesso!');
        onSuccess?.();
      } else {
        alert('Erro ao salvar produto: ' + result.error);
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar produto');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Título */}
      <div>
        <label className="block text-textMain mb-2">Título *</label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
          className="w-full px-4 py-2 bg-surface border border-textSecondary/20 rounded-lg text-textMain focus:border-primary focus:outline-none"
        />
      </div>

      {/* Preço */}
      <div>
        <label className="block text-textMain mb-2">Preço (CNY) *</label>
        <input
          type="text"
          required
          value={formData.price_cny}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, price_cny: e.target.value }))
          }
          placeholder="Ex: ¥ 299"
          className="w-full px-4 py-2 bg-surface border border-textSecondary/20 rounded-lg text-textMain focus:border-primary focus:outline-none"
        />
      </div>

      {/* Categoria */}
      <div>
        <label className="block text-textMain mb-2">Categoria</label>
        <select
          value={formData.category_id}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, category_id: e.target.value }))
          }
          className="w-full px-4 py-2 bg-surface border border-textSecondary/20 rounded-lg text-textMain focus:border-primary focus:outline-none"
        >
          <option value="">Selecione uma categoria</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Link de Afiliado */}
      <div>
        <label className="block text-textMain mb-2">
          Link de Afiliado (CSSBuy) *
        </label>
        <input
          type="url"
          required
          value={formData.affiliate_link}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              affiliate_link: e.target.value,
            }))
          }
          placeholder="https://..."
          className="w-full px-4 py-2 bg-surface border border-textSecondary/20 rounded-lg text-textMain focus:border-primary focus:outline-none"
        />
      </div>

      {/* Link Original (Privado) */}
      <div className="bg-danger/10 border border-danger/30 rounded-lg p-4">
        <label className="block text-danger mb-2 font-bold">
          🔒 Link Original Xianyu (PRIVADO - Admin Only) *
        </label>
        <input
          type="url"
          required
          value={formData.original_link}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, original_link: e.target.value }))
          }
          placeholder="https://..."
          className="w-full px-4 py-2 bg-surface border border-danger/50 rounded-lg text-textMain focus:border-danger focus:outline-none"
        />
        <button
          type="button"
          onClick={() => window.open(formData.original_link, '_blank')}
          disabled={!formData.original_link}
          className="mt-2 px-4 py-2 bg-danger text-white rounded-lg hover:bg-danger/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          🔗 Verificar Xianyu
        </button>
      </div>

      {/* Upload de Imagens */}
      <div className="grid grid-cols-2 gap-4">
        {/* Imagem Principal */}
        <div>
          <label className="block text-textMain mb-2">Imagem Principal</label>
          {formData.image_main && (
            <img
              src={formData.image_main}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg mb-2"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file, 'image_main');
            }}
            disabled={uploading}
            className="w-full px-4 py-2 bg-surface border border-textSecondary/20 rounded-lg text-textMain file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-background hover:file:bg-primary/90"
          />
        </div>

        {/* Imagem Hover */}
        <div>
          <label className="block text-textMain mb-2">Imagem Hover</label>
          {formData.image_hover && (
            <img
              src={formData.image_hover}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg mb-2"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file, 'image_hover');
            }}
            disabled={uploading}
            className="w-full px-4 py-2 bg-surface border border-textSecondary/20 rounded-lg text-textMain file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-background hover:file:bg-primary/90"
          />
        </div>
      </div>

      {/* Sold Out Toggle */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="sold_out"
          checked={formData.is_sold_out}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, is_sold_out: e.target.checked }))
          }
          className="w-5 h-5 accent-danger"
        />
        <label htmlFor="sold_out" className="text-textMain">
          Marcar como esgotado
        </label>
      </div>

      {/* Botões */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={saving || uploading}
          className="flex-1 px-6 py-3 bg-primary text-background rounded-lg font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving
            ? 'Salvando...'
            : product?.id
            ? 'Atualizar Produto'
            : 'Criar Produto'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-surface border border-textSecondary/20 text-textMain rounded-lg hover:bg-surface/80 transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>

      {uploading && (
        <p className="text-primary text-center">Fazendo upload da imagem...</p>
      )}
    </form>
  );
}
