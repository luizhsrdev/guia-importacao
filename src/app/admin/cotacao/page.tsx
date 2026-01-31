'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Save, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface ExchangeRateData {
  officialRate: number;
  manualAdjustment: number;
  effectiveRate: number;
  updatedAt: string;
  notes?: string;
}

export default function AdminCotacaoPage() {
  const router = useRouter();
  const [rateData, setRateData] = useState<ExchangeRateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const [adjustment, setAdjustment] = useState(95);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    checkAdmin();
    fetchRate();
  }, []);

  const checkAdmin = async () => {
    try {
      const res = await fetch('/api/check-admin');
      const data = await res.json();
      if (!data.isAdmin) {
        router.push('/');
        return;
      }
      setIsAdmin(true);
    } catch {
      router.push('/');
    }
  };

  const fetchRate = async () => {
    try {
      const res = await fetch('/api/exchange-rate');
      if (res.ok) {
        const data = await res.json();
        setRateData(data);
        setAdjustment(Math.round(data.manualAdjustment * 100));
        setNotes(data.notes || '');
      }
    } catch (error) {
      console.error('Error fetching rate:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAdjustment = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/exchange-rate/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adjustment: adjustment / 100,
          notes,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRateData({
          officialRate: data.officialRate,
          manualAdjustment: data.manualAdjustment,
          effectiveRate: data.effectiveRate,
          updatedAt: data.updatedAt,
          notes,
        });
        toast.success('Ajuste salvo com sucesso!');
      } else {
        const error = await res.json();
        toast.error(error.error || 'Erro ao salvar ajuste');
      }
    } catch {
      toast.error('Erro ao salvar ajuste');
    } finally {
      setSaving(false);
    }
  };

  const handleRefreshAPI = async () => {
    setRefreshing(true);
    try {
      const cronSecret = prompt('Digite o CRON_SECRET:');
      if (!cronSecret) return;

      const res = await fetch('/api/exchange-rate/update', {
        method: 'POST',
        headers: { Authorization: `Bearer ${cronSecret}` },
      });

      if (res.ok) {
        await fetchRate();
        toast.success('Cotação atualizada via API!');
      } else {
        const error = await res.json();
        toast.error(error.error || 'Erro ao atualizar via API');
      }
    } catch {
      toast.error('Erro ao atualizar via API');
    } finally {
      setRefreshing(false);
    }
  };

  const previewEffectiveRate = rateData
    ? rateData.officialRate * (adjustment / 100)
    : 0;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isAdmin === null || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Gerenciar Cotação
        </h1>
        <p className="text-text-secondary text-sm mb-8">
          Ajuste manual da taxa de câmbio BRL → CNY
        </p>

        {/* Current Status */}
        <div className="card p-6 mb-6">
          <h2 className="text-text-primary font-semibold mb-4">Status Atual</h2>

          {rateData ? (
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-surface-elevated rounded-xl p-4">
                <p className="text-text-secondary text-xs mb-1">Oficial (API)</p>
                <p className="text-text-primary font-bold text-xl">
                  ¥ {rateData.officialRate.toFixed(3)}
                </p>
              </div>
              <div className="bg-surface-elevated rounded-xl p-4">
                <p className="text-text-secondary text-xs mb-1">Ajuste</p>
                <p className="text-text-primary font-bold text-xl">
                  {(rateData.manualAdjustment * 100).toFixed(0)}%
                </p>
              </div>
              <div className="bg-primary/10 rounded-xl p-4 border border-primary/30">
                <p className="text-primary text-xs mb-1 font-medium">Efetiva</p>
                <p className="text-primary font-bold text-xl">
                  ¥ {rateData.effectiveRate.toFixed(3)}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-text-secondary">Nenhuma cotação encontrada</p>
          )}

          {rateData && (
            <p className="text-text-tertiary text-xs mt-4 text-center">
              Última atualização: {formatDate(rateData.updatedAt)}
            </p>
          )}
        </div>

        {/* Adjustment Controls */}
        <div className="card p-6 mb-6">
          <h2 className="text-text-primary font-semibold mb-4">Ajustar Taxa</h2>

          <div className="space-y-6">
            {/* Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-text-secondary text-sm">
                  Ajuste Manual
                </label>
                <span className="text-primary font-bold text-lg">{adjustment}%</span>
              </div>
              <input
                type="range"
                min="80"
                max="100"
                value={adjustment}
                onChange={(e) => setAdjustment(parseInt(e.target.value))}
                className="w-full h-2 bg-surface-elevated rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-text-tertiary text-xs mt-1">
                <span>80%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-text-secondary text-sm mb-2">
                Notas (opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Ajuste para compensar volatilidade"
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text-primary text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                rows={3}
              />
            </div>

            {/* Preview */}
            {rateData && (
              <div className="bg-surface-elevated rounded-xl p-4 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-blue-500" />
                  <span className="text-text-secondary text-sm">Preview</span>
                </div>
                <p className="text-text-primary">
                  Taxa Efetiva:{' '}
                  <span className="text-primary font-bold">
                    ¥ {previewEffectiveRate.toFixed(3)}
                  </span>{' '}
                  por R$ 1
                </p>
                <p className="text-text-tertiary text-xs mt-1">
                  Fórmula: {rateData.officialRate.toFixed(3)} × {adjustment}% ={' '}
                  {previewEffectiveRate.toFixed(3)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSaveAdjustment}
            disabled={saving}
            className="flex-1 btn-primary py-3 flex items-center justify-center gap-2"
          >
            {saving ? (
              <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Salvar Ajuste
          </button>

          <button
            onClick={handleRefreshAPI}
            disabled={refreshing}
            className="flex-1 btn-secondary py-3 flex items-center justify-center gap-2"
          >
            {refreshing ? (
              <span className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
            ) : (
              <RefreshCw className="w-5 h-5" />
            )}
            Atualizar via API
          </button>
        </div>
      </div>
    </div>
  );
}
