'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
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
    // Validar tamanho do arquivo ANTES de converter
    const maxSizeMB = 5;
    const fileSizeMB = file.size / (1024 * 1024);

    if (fileSizeMB > maxSizeMB) {
      toast.error(
        `Imagem muito grande (${fileSizeMB.toFixed(1)}MB). Máximo: ${maxSizeMB}MB`,
        { duration: 5000 }
      );
      return;
    }

    setUploading(true);

    try {
      // Converter arquivo para base64
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = async () => {
        const base64Data = reader.result as string;

        // Validar tamanho do base64
        const base64SizeBytes = (base64Data.length * 3) / 4;
        const base64SizeMB = base64SizeBytes / (1024 * 1024);

        if (base64SizeMB > maxSizeMB) {
          toast.error(
            `Base64 muito grande (${base64SizeMB.toFixed(1)}MB). Máximo: ${maxSizeMB}MB`,
            { duration: 5000 }
          );
          setUploading(false);
          return;
        }

        console.log('Arquivo convertido para base64, enviando...');

        const result = await uploadImageToCloudinary(base64Data);

        if (result.success && result.url) {
          setFormData((prev) => ({ ...prev, [field]: result.url! }));
          toast.success('Imagem enviada com sucesso!', { duration: 3000 });
          console.log('Upload concluído com sucesso!');
        } else {
          console.error('Erro no upload:', result.error);
          toast.error(`Erro ao fazer upload: ${result.error || 'Erro desconhecido'}`, {
            duration: 5000,
          });
        }
        setUploading(false);
      };

      reader.onerror = () => {
        console.error('Erro ao ler arquivo');
        toast.error('Erro ao ler arquivo', { duration: 4000 });
        setUploading(false);
      };
    } catch (error: any) {
      console.error('Erro:', error);

      // Detectar erro 413 (Payload Too Large)
      if (error.message?.includes('413') || error.message?.includes('1 MB limit')) {
        toast.error(
          'Imagem muito grande! Reduza o tamanho e tente novamente.',
          { duration: 6000 }
        );
      } else {
        toast.error('Erro ao fazer upload da imagem', { duration: 5000 });
      }
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
        toast.success(
          product?.id ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!',
          { duration: 3000 }
        );
        onSuccess?.();
      } else {
        toast.error('Erro ao salvar produto: ' + result.error, { duration: 5000 });
      }
    } catch (error: any) {
      console.error('Erro:', error);

      // Detectar erro 413 (Payload Too Large)
      if (error.message?.includes('413') || error.message?.includes('1 MB limit')) {
        toast.error(
          'Dados muito grandes! Reduza o tamanho das imagens e tente novamente.',
          { duration: 6000 }
        );
      } else {
        toast.error('Erro ao salvar produto', { duration: 5000 });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Título */}
      <div>
        <label className="block text-sm font-medium text-textSecondary mb-2">
          Título *
        </label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
          className="w-full px-4 py-3 bg-[#2A2A2A] border border-zinc-700 rounded-lg text-textMain placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          placeholder="Digite o título do produto..."
        />
      </div>

      {/* Preço */}
      <div>
        <label className="block text-sm font-medium text-textSecondary mb-2">
          Preço (CNY) *
        </label>
        <input
          type="text"
          required
          value={formData.price_cny}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, price_cny: e.target.value }))
          }
          placeholder="Ex: ¥ 299"
          className="w-full px-4 py-3 bg-[#2A2A2A] border border-zinc-700 rounded-lg text-textMain placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
        />
      </div>

      {/* Categoria */}
      <div>
        <label className="block text-sm font-medium text-textSecondary mb-2">
          Categoria
        </label>
        <select
          value={formData.category_id}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, category_id: e.target.value }))
          }
          className="w-full px-4 py-3 bg-[#2A2A2A] border border-zinc-700 rounded-lg text-textMain focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
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
        <label className="block text-sm font-medium text-textSecondary mb-2">
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
          className="w-full px-4 py-3 bg-[#2A2A2A] border border-zinc-700 rounded-lg text-textMain placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
        />
      </div>

      {/* Link Original (Privado) */}
      <div className="bg-red-950/20 border border-red-800 rounded-lg p-4">
        <label className="block text-sm font-medium text-red-400 mb-2">
          Link Original Xianyu (PRIVADO - Admin Only) *
        </label>
        <input
          type="url"
          required
          value={formData.original_link}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, original_link: e.target.value }))
          }
          placeholder="https://..."
          className="w-full px-4 py-3 bg-[#2A2A2A] border border-red-700 rounded-lg text-textMain placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all"
        />
        <button
          type="button"
          onClick={() => window.open(formData.original_link, '_blank')}
          disabled={!formData.original_link}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Verificar Xianyu
        </button>
      </div>

      {/* Upload de Imagens */}
      <div className="grid grid-cols-2 gap-4">
        {/* Imagem Principal */}
        <div>
          <label className="block text-sm font-medium text-textSecondary mb-2">
            Imagem Principal <span className="text-xs text-zinc-500">(Máx: 5MB)</span>
          </label>
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
            className="w-full px-4 py-2 bg-[#2A2A2A] border border-zinc-700 rounded-lg text-textMain file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-background hover:file:bg-primary/90 cursor-pointer"
          />
        </div>

        {/* Imagem Hover */}
        <div>
          <label className="block text-sm font-medium text-textSecondary mb-2">
            Imagem Hover <span className="text-xs text-zinc-500">(Máx: 5MB)</span>
          </label>
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
            className="w-full px-4 py-2 bg-[#2A2A2A] border border-zinc-700 rounded-lg text-textMain file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-background hover:file:bg-primary/90 cursor-pointer"
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
          className="w-5 h-5 rounded accent-danger cursor-pointer"
        />
        <label
          htmlFor="sold_out"
          className="text-sm font-medium text-textSecondary cursor-pointer"
        >
          Marcar como esgotado
        </label>
      </div>

      {/* Botões */}
      <div className="flex gap-4 pt-4 border-t border-zinc-800">
        <button
          type="submit"
          disabled={saving || uploading}
          className="flex-1 px-6 py-3 bg-primary text-background rounded-lg font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20"
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
            className="px-6 py-3 bg-zinc-800 border border-zinc-700 text-textMain rounded-lg hover:bg-zinc-700 transition-all font-semibold"
          >
            Cancelar
          </button>
        )}
      </div>

      {uploading && (
        <p className="text-primary text-center text-sm font-medium">
          Fazendo upload da imagem...
        </p>
      )}
    </form>
  );
}
