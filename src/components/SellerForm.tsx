'use client';

import { useState } from 'react';
import {
  createSeller,
  updateSeller,
  uploadEvidenceImages,
  type SellerFormData,
} from '@/app/admin/sellers/actions';

interface SellerFormProps {
  seller?: SellerFormData;
  niches: Array<{ id: string; name: string }>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function SellerForm({
  seller,
  niches,
  onSuccess,
  onCancel,
}: SellerFormProps) {
  const [formData, setFormData] = useState<SellerFormData>({
    name: seller?.name || '',
    status: seller?.status || 'gold',
    niche_id: seller?.niche_id || '',
    notes: seller?.notes || '',
    rating: seller?.rating || '',
    affiliate_link: seller?.affiliate_link || '',
    blacklist_reason: seller?.blacklist_reason || '',
    evidence_images: seller?.evidence_images || [],
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleEvidenceUpload = async (files: FileList) => {
    setUploading(true);
    try {
      const fileArray = Array.from(files);
      const urls = await uploadEvidenceImages(fileArray);
      if (urls.length > 0) {
        setFormData((prev) => ({
          ...prev,
          evidence_images: [...(prev.evidence_images || []), ...urls],
        }));
      } else {
        alert('Erro ao fazer upload das imagens');
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
        <label className="block text-textMain mb-2">Nome do Vendedor *</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          className="w-full px-4 py-2 bg-surface border border-textSecondary/20 rounded-lg text-textMain focus:border-primary focus:outline-none"
        />
      </div>

      {/* Status */}
      <div>
        <label className="block text-textMain mb-2">Status *</label>
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
            <span className="text-primary font-bold">🥇 Lista Dourada</span>
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
            <span className="text-danger font-bold">❌ Blacklist</span>
          </label>
        </div>
      </div>

      {/* Nicho */}
      <div>
        <label className="block text-textMain mb-2">Nicho</label>
        <select
          value={formData.niche_id}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, niche_id: e.target.value }))
          }
          className="w-full px-4 py-2 bg-surface border border-textSecondary/20 rounded-lg text-textMain focus:border-primary focus:outline-none"
        >
          <option value="">Selecione um nicho</option>
          {niches.map((niche) => (
            <option key={niche.id} value={niche.id}>
              {niche.name}
            </option>
          ))}
        </select>
      </div>

      {/* Campos condicionais para GOLD */}
      {formData.status === 'gold' && (
        <>
          {/* Rating */}
          <div>
            <label className="block text-textMain mb-2">Rating</label>
            <input
              type="text"
              value={formData.rating}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, rating: e.target.value }))
              }
              placeholder="Ex: 5.0 ⭐"
              className="w-full px-4 py-2 bg-surface border border-textSecondary/20 rounded-lg text-textMain focus:border-primary focus:outline-none"
            />
          </div>

          {/* Link de Afiliado */}
          <div>
            <label className="block text-textMain mb-2">
              Link de Afiliado (opcional)
            </label>
            <input
              type="url"
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

          {/* Notas */}
          <div>
            <label className="block text-textMain mb-2">
              Notas / Observações
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={4}
              placeholder="Informações úteis sobre este vendedor..."
              className="w-full px-4 py-2 bg-surface border border-textSecondary/20 rounded-lg text-textMain focus:border-primary focus:outline-none"
            />
          </div>
        </>
      )}

      {/* Campos condicionais para BLACKLIST */}
      {formData.status === 'blacklist' && (
        <>
          {/* Motivo */}
          <div className="bg-danger/10 border border-danger/30 rounded-lg p-4">
            <label className="block text-danger mb-2 font-bold">
              ⚠️ Motivo da Blacklist *
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
              placeholder="Descreva o motivo pelo qual este vendedor está na blacklist..."
              className="w-full px-4 py-2 bg-surface border border-danger/50 rounded-lg text-textMain focus:border-danger focus:outline-none"
            />
          </div>

          {/* Upload de Provas */}
          <div>
            <label className="block text-textMain mb-2">
              Provas (Imagens) *
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
              className="w-full px-4 py-2 bg-surface border border-danger/50 rounded-lg text-textMain file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-danger file:text-white hover:file:bg-danger/90"
            />
          </div>
        </>
      )}

      {/* Botões */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={saving || uploading}
          className="flex-1 px-6 py-3 bg-primary text-background rounded-lg font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
            className="px-6 py-3 bg-surface border border-textSecondary/20 text-textMain rounded-lg hover:bg-surface/80 transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>

      {uploading && (
        <p className="text-primary text-center">
          Fazendo upload das imagens...
        </p>
      )}
    </form>
  );
}
