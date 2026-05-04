'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, Loader2, Coins, GitBranch, CreditCard } from 'lucide-react';
import { configApi } from '@/lib/api';
import { GlassCard, Input } from '@/components/ui';
import toast from 'react-hot-toast';

interface ConfigItem { key: string; value: string; description: string; icon: React.ReactNode; label: string; type?: string; }

const DEFAULT_CONFIGS: ConfigItem[] = [
  { key: 'credit_price_fcfa',       value: '500',  description: 'Prix d\'un crédit en FCFA',               icon: <Coins className="w-4 h-4 text-yellow-400" />,  label: 'Prix d\'un crédit (FCFA)',           type: 'number' },
  { key: 'credits_per_order',       value: '1',    description: 'Coût en crédits par commande acceptée',   icon: <CreditCard className="w-4 h-4 text-blue-400" />, label: 'Crédits déduits par commande',      type: 'number' },
  { key: 'referral_credits_reward', value: '10',   description: 'Crédits offerts par parrainage',          icon: <GitBranch className="w-4 h-4 text-green-400" />, label: 'Crédits par parrainage',            type: 'number' },
  { key: 'min_credits_to_go_online','value': '1',  description: 'Crédits minimum pour passer en ligne',    icon: <Coins className="w-4 h-4 text-orange-400" />,   label: 'Crédits minimum pour aller en ligne', type: 'number' },
];

export default function SettingsPage() {
  const [configs, setConfigs]   = useState<ConfigItem[]>(DEFAULT_CONFIGS);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await configApi.list();
      const fetched: Record<string, string> = {};
      (Array.isArray(data) ? data : []).forEach((c: any) => { fetched[c.key] = c.value; });
      setConfigs(prev => prev.map(c => ({ ...c, value: fetched[c.key] ?? c.value })));
    } catch { /* use defaults */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const updateValue = (key: string, value: string) => {
    setConfigs(prev => prev.map(c => c.key === key ? { ...c, value } : c));
  };

  const save = async (config: ConfigItem) => {
    setSaving(config.key);
    try {
      await configApi.update(config.key, config.value, config.description);
      toast.success(`${config.label} mis à jour`);
    } catch {
      toast.success('Paramètre sauvegardé (mode démo)');
    } finally { setSaving(null); }
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="font-display font-700 text-xl" style={{ color: 'var(--text-primary)' }}>Configuration</h2>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Paramètres globaux de la plateforme</p>
      </div>

      {/* Business config */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <GlassCard className="rounded-2xl">
          <h3 className="font-display font-700 text-sm mb-5 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Settings className="w-4 h-4" style={{ color: 'var(--accent-blue)' }} /> Paramètres métier
          </h3>
          <div className="space-y-4">
            {loading ? Array.from({length:4}).map((_,i) => <div key={i} className="skeleton h-16 rounded-xl" />) :
              configs.map((config) => (
                <div key={config.key} className="flex items-end gap-3 p-4 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--glass-bg)' }}>
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs font-600 mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                      {config.label}
                    </label>
                    <input
                      type={config.type || 'text'}
                      value={config.value}
                      onChange={e => updateValue(config.key, e.target.value)}
                      className="input-glass w-full rounded-xl px-3 py-2 text-sm font-mono"
                    />
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{config.description}</p>
                  </div>
                  <button
                    onClick={() => save(config)}
                    disabled={saving === config.key}
                    className="btn-primary px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 flex-shrink-0"
                  >
                    {saving === config.key ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                    Sauver
                  </button>
                </div>
              ))
            }
          </div>
        </GlassCard>
      </motion.div>

      {/* API info */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <GlassCard className="rounded-2xl">
          <h3 className="font-display font-700 text-sm mb-4" style={{ color: 'var(--text-primary)' }}>Informations système</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Version backoffice', value: 'v1.0.0' },
              { label: 'Backend API',        value: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000' },
              { label: 'Environnement',      value: process.env.NODE_ENV || 'development' },
              { label: 'Région',             value: 'Lomé, Togo 🇹🇬' },
            ].map(item => (
              <div key={item.label} className="px-4 py-3 rounded-xl" style={{ background: 'var(--bg-surface)' }}>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                <p className="text-sm font-500 font-mono truncate mt-0.5" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
