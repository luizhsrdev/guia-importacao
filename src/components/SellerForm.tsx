'use client';

import { useState } from 'react';
import {
  createSeller,
  updateSeller,
  uploadEvidenceImages,
  type SellerFormData,
} from '@/app/admin/sellers/actions';
import { uploadImageToCloudinary } from '@/app/admin/products/actions';

interface SellerFormProps {
  seller?: SellerFormData;
  categories: Array<{ id: string; name: string }>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function SellerForm({
  seller,
  categories,
  onSuccess,
  onCancel,
}: SellerFormProps) {
  const [formData, setFormData] = useState<SellerFormData>({
    name: seller?.name || '',
    status: seller?.status || 'gold',
    category_id: seller?.category_id || '',
    notes: seller?.notes || '',
    affiliate_link: seller?.affiliate_link || '',
    profile_link: seller?.profile_link || '',
    feedback_link: seller?.feedback_link || '',
    image_url: seller?.image_url || '',
    blacklist_reason: seller?.blacklist_reason || '',
    proof_link: seller?.proof_link || '',
    evidence_images: seller?.evidence_images || [],
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Upload de imagem única (para Gold)
  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = async () => {
        const base64Data = reader.result as string;
        console.log('Arquivo convertido para base64, enviando...');

        const result = await uploadImageToCloudinary(base64Data);

        if (result.success && result.url) {
          setFormData((prev) => ({ ...prev, image_url: result.url! }));
          console.log('Upload concluído com sucesso!');
        } else {
          console.error('Erro no upload:', result.error);
          alert(`Erro ao fazer upload: ${result.error || 'Erro desconhecido'}`);
        }
        setUploading(false);
      };

      reader.onerror = () => {
        console.error('Erro ao ler arquivo');
        alert('Erro ao ler arquivo');
        setUploading(false);
      };
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao fazer upload da imagem');
      setUploading(false);
    }
  };

  const handleEvidenceUpload = async (files: FileList) => {
    setUploading(true);
    try {
      const fileArray = Array.from(files);
      console.log(`Convertendo ${fileArray.length} arquivos para base64...`);

      // Converter todos os arquivos para base64
      const base64Promises = fileArray.map((file) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
        });
      });

      const base64Array = await Promise.all(base64Promises);
      console.log('Arquivos convertidos, enviando...');

      const result = await uploadEvidenceImages(base64Array);

      if (result.success && result.urls) {
        setFormData((prev) => ({
          ...prev,
          evidence_images: [...(prev.evidence_images || []), ...result.urls!],
        }));
        console.log(`Upload concluído: ${result.urls.length} imagens`);
      } else {
        console.error('Erro no upload:', result.error);
        alert(`Erro ao fazer upload: ${result.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao fazer upload das imagens');
    } finally {
      setUploading(false);
    }
  };

  const removeEvidence = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      evidence_images: prev.evidence_images?.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const result = seller?.id
        ? await updateSeller({ ...formData, id: seller.id })
        : await createSeller(formData);

      if (result.success) {
        alert('Vendedor salvo com sucesso!');
        onSuccess?.();
      } else {
        alert('Erro ao salvar vendedor: ' + result.error);
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar vendedor');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nome */}
      <div>
        <label className="block text-sm font-medium text-textSecondary mb-2">Nome do Vendedor *</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          className="w-full px-4 py-3 bg-[#2A2A2A] border border-zinc-700 rounded-lg text-textMain placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
        />
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-textSecondary mb-2">Status *</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="gold"
              checked={formData.status === 'gold'}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  status: e.target.value as 'gold' | 'blacklist',
                }))
              }
              className="accent-primary"
            />
            <span className="text-primary font-bold">Lista Dourada</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="blacklist"
              checked={formData.status === 'blacklist'}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  status: e.target.value as 'gold' | 'blacklist',
                }))
              }
              className="accent-danger"
            />
            <span className="text-danger font-bold">Blacklist</span>
          </label>
        </div>
      </div>

      {/* Categoria */}
      <div>
        <label className="block text-sm font-medium text-textSecondary mb-2">Categoria</label>
        <select
          value={formData.category_id}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, category_id: e.target.value }))
          }
          className="w-full px-4 py-3 bg-[#2A2A2A] border border-zinc-700 rounded-lg text-textMain placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
        >
          <option value="">Selecione uma categoria</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Link do Perfil (AMBOS) */}
      <div
        className={
          formData.status === 'blacklist'
            ? 'bg-red-950/20 border border-red-800 rounded-lg p-4'
            : ''
        }
      >
        <label
          className={`block text-sm font-medium mb-2 ${
            formData.status === 'blacklist'
              ? 'text-red-400'
              : 'text-textSecondary'
          }`}
        >
          Link do Perfil (Xianyu)
          {formData.status === 'blacklist' && ' *'}
        </label>
        <input
          type="url"
          value={formData.profile_link}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              profile_link: e.target.value,
            }))
          }
          placeholder="https://..."
          className={`w-full px-4 py-3 bg-[#2A2A2A] rounded-lg text-textMain placeholder:text-zinc-500 focus:outline-none transition-all ${
            formData.status === 'blacklist'
              ? 'border border-red-700 focus:ring-1 focus:ring-red-500 focus:border-red-500'
              : 'border border-zinc-700 focus:ring-1 focus:ring-primary focus:border-primary'
          }`}
        />
        <p className="text-textSecondary text-sm mt-1">
          {formData.status === 'gold'
            ? 'Link do perfil do vendedor no Xianyu'
            : 'Link do perfil do vendedor golpista (usuários premium poderão ver)'}
        </p>
      </div>

      {/* Campos específicos GOLD */}
      {formData.status === 'gold' && (
        <>
          {/* Upload de Imagem */}
          <div>
            <label className="block text-sm font-medium text-textSecondary mb-2">
              Imagem do Vendedor
            </label>
            {formData.image_url && (
              <img
                src={formData.image_url}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg mb-2"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
              disabled={uploading}
              className="w-full px-4 py-2 bg-[#2A2A2A] border border-zinc-700 rounded-lg text-textMain file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-background hover:file:bg-primary/90 cursor-pointer"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-textSecondary mb-2">
              Descrição / Observações
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={4}
              placeholder="Informações úteis sobre este vendedor confiável..."
              className="w-full px-4 py-3 bg-[#2A2A2A] border border-zinc-700 rounded-lg text-textMain placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
          </div>

          {/* Link de Feedback */}
          <div>
            <label className="block text-sm font-medium text-textSecondary mb-2">
              Link de Feedback
            </label>
            <input
              type="url"
              value={formData.feedback_link}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  feedback_link: e.target.value,
                }))
              }
              placeholder="https://... (link para avaliações, feedback, etc)"
              className="w-full px-4 py-3 bg-[#2A2A2A] border border-zinc-700 rounded-lg text-textMain placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
            <p className="text-textSecondary text-sm mt-1">
              Link para página com feedbacks positivos sobre o vendedor
            </p>
          </div>
        </>
      )}

      {/* Campos específicos BLACKLIST */}
      {formData.status === 'blacklist' && (
        <>
          {/* Motivo da Blacklist */}
          <div className="bg-red-950/20 border border-red-800 rounded-lg p-4">
            <label className="block text-red-400 mb-2 font-medium">
              Motivo da Blacklist *
            </label>
            <textarea
              required
              value={formData.blacklist_reason}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  blacklist_reason: e.target.value,
                }))
              }
              rows={4}
              placeholder="Descreva detalhadamente o motivo pelo qual este vendedor está na blacklist..."
              className="w-full px-4 py-3 bg-[#2A2A2A] border border-red-700 rounded-lg text-textMain placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all"
            />
          </div>

          {/* Link de Prova/Discussão */}
          <div>
            <label className="block text-sm font-medium text-textSecondary mb-2">
              Link de Prova/Discussão
            </label>
            <input
              type="url"
              value={formData.proof_link}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  proof_link: e.target.value,
                }))
              }
              placeholder="https://... (link para discussão, post, reclamação, etc)"
              className="w-full px-4 py-3 bg-[#2A2A2A] border border-zinc-700 rounded-lg text-textMain placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
            <p className="text-textSecondary text-sm mt-1">
              Link adicional para discussões, posts ou outras provas online
            </p>
          </div>

          {/* Upload de Imagens de Evidência */}
          <div>
            <label className="block text-sm font-medium text-textSecondary mb-2">
              Imagens de Evidência
            </label>
            <p className="text-textSecondary text-sm mb-2">
              Faça upload de prints/fotos que comprovem o motivo da blacklist
            </p>

            {/* Preview das imagens */}
            {formData.evidence_images &&
              formData.evidence_images.length > 0 && (
                <div className="grid grid-cols-4 gap-4 mb-4">
                  {formData.evidence_images.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Evidence ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeEvidence(index)}
                        className="absolute top-2 right-2 bg-danger text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = e.target.files;
                if (files && files.length > 0) handleEvidenceUpload(files);
              }}
              disabled={uploading}
              className="w-full px-4 py-2 bg-[#2A2A2A] border border-red-700 rounded-lg text-textMain file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-600 file:text-white hover:file:bg-red-700 cursor-pointer"
            />
          </div>
        </>
      )}

      {/* Botões */}
      <div className="flex gap-4 pt-4 border-t border-zinc-800">
        <button
          type="submit"
          disabled={saving || uploading}
          className={`flex-1 px-6 py-3 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
            formData.status === 'blacklist'
              ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20'
              : 'bg-primary text-background hover:bg-primary/90 shadow-lg shadow-primary/20'
          }`}
        >
          {saving
            ? 'Salvando...'
            : seller?.id
            ? 'Atualizar Vendedor'
            : 'Criar Vendedor'}
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
          Fazendo upload das imagens...
        </p>
      )}
    </form>
  );
}
