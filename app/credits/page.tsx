'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Coins, Plus, Minus, Search, TrendingUp, Loader2 } from 'lucide-react';
import { adminApi, driversApi } from '@/lib/api';
import { DriverProfile } from '@/types';
import { GlassCard, StatCard, Avatar, SkeletonRows, Modal, Input, Textarea } from '@/components/ui';
import { formatRelative } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';

const schema = z.object({
  driver_id:     z.string().min(1, 'Requis'),
  credits_delta: z.coerce.number().int().refine(n => n !== 0, 'Doit être non nul'),
  note:          z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function CreditsPage() {
  const [drivers, setDrivers]     = useState<DriverProfile[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected]   = useState<DriverProfile | null>(null);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await driversApi.list({ per_page: 100 });
      setDrivers(Array.isArray(data) ? data : (data.items || []));
    } catch {
      setDrivers(Array.from({ length: 10 }, (_, i) => ({
        id: `drv-${i}`, user_id: `usr-${i}`, status: 'verified' as const,
        credits: Math.floor(Math.random() * 300),
        referral_code: `CODE${i}`, vehicle_description: null,
        is_online: i % 3 === 0, total_deliveries: Math.floor(Math.random()*200),
        average_rating: 4.0 + Math.random(), rating_count: 40,
        created_at: new Date().toISOString(),
        user: { id: `usr-${i}`, full_name: `Conducteur ${i+1}`, phone: `+2289${i.toString().padStart(7,'0')}`, email: null, avatar_url: null, role: 'driver', phone_verified: true, is_active: true, is_blocked: false, created_at: new Date().toISOString() },
      })));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openAdjust = (driver: DriverProfile, add: boolean) => {
    setSelected(driver);
    reset({ driver_id: driver.id, credits_delta: add ? 10 : -10, note: '' });
    setShowModal(true);
  };

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      await adminApi.adjustCredits(data.driver_id, data.credits_delta, data.note);
      toast.success(`Crédits ${data.credits_delta > 0 ? 'ajoutés' : 'retirés'} avec succès`);
      setShowModal(false); fetch();
    } catch (e: any) { toast.error(e?.response?.data?.detail || 'Erreur'); }
    finally { setSubmitting(false); }
  };

  const filtered = drivers.filter(d =>
    !search || d.user?.full_name?.toLowerCase().includes(search.toLowerCase()) || d.user?.phone?.includes(search)
  );

  const totalCredits = drivers.reduce((s, d) => s + d.credits, 0);
  const onlineWithCredits = drivers.filter(d => d.is_online && d.credits > 0).length;

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="font-display font-700 text-xl" style={{ color: 'var(--text-primary)' }}>Gestion des crédits</h2>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Ajustement manuel et suivi des soldes</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Crédits en circulation" value={totalCredits.toLocaleString()} icon={<Coins className="w-5 h-5 text-yellow-400" />} iconBg="rgba(234,179,8,0.15)" delay={0} />
        <StatCard label="Conducteurs actifs" value={onlineWithCredits} icon={<TrendingUp className="w-5 h-5 text-green-400" />} iconBg="rgba(34,197,94,0.15)" glowClass="stat-glow-green" delay={0.05} />
        <StatCard label="Conducteurs total" value={drivers.length} icon={<Search className="w-5 h-5" style={{ color: 'var(--accent-blue)' }} />} iconBg="rgba(37,99,235,0.15)" glowClass="stat-glow-blue" delay={0.1} />
      </div>

      <GlassCard className="rounded-2xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
          <input type="search" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un conducteur…" className="input-glass w-full rounded-xl pl-9 pr-4 py-2.5 text-sm" />
        </div>
      </GlassCard>

      <GlassCard className="rounded-2xl overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full table-glass text-sm">
            <thead>
              <tr>
                <th className="text-left px-4 py-3">Conducteur</th>
                <th className="text-right px-4 py-3">Solde crédits</th>
                <th className="text-left px-4 py-3">Livraisons</th>
                <th className="text-left px-4 py-3">Statut</th>
                <th className="text-center px-4 py-3">Ajuster</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <SkeletonRows count={8} cols={5} /> : filtered.map((driver, i) => (
                <motion.tr key={driver.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={driver.user?.full_name} size="sm" />
                      <div>
                        <p className="font-500 text-sm" style={{ color: 'var(--text-primary)' }}>{driver.user?.full_name}</p>
                        <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{driver.user?.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-display font-700 text-lg ${driver.credits < 5 ? 'text-red-400' : driver.credits < 20 ? 'text-yellow-400' : 'text-green-400'}`}>
                      {driver.credits}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{driver.total_deliveries}</td>
                  <td className="px-4 py-3">
                    {driver.is_online
                      ? <div className="flex items-center gap-1.5"><div className="online-dot" /><span className="text-xs text-green-500">Online</span></div>
                      : <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Offline</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openAdjust(driver, true)}
                        className="p-1.5 rounded-lg btn-glass" title="Ajouter crédits">
                        <Plus className="w-3.5 h-3.5 text-green-500" />
                      </button>
                      <button onClick={() => openAdjust(driver, false)}
                        className="p-1.5 rounded-lg btn-glass" title="Retirer crédits">
                        <Minus className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Ajustement de crédits" maxWidth="max-w-md">
        {selected && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-surface)' }}>
              <Avatar name={selected.user?.full_name} size="md" />
              <div>
                <p className="font-600 text-sm" style={{ color: 'var(--text-primary)' }}>{selected.user?.full_name}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Solde actuel : <span className="font-700 text-yellow-400">{selected.credits} crédits</span></p>
              </div>
            </div>
            <input type="hidden" {...register('driver_id')} />
            <Input label="Delta crédits (positif = ajout, négatif = retrait)" type="number"
              placeholder="ex: 50 ou -10" {...register('credits_delta')} error={errors.credits_delta?.message} />
            <Textarea label="Note (optionnel)" placeholder="Raison de l'ajustement…" rows={2}
              {...register('note')} />
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="btn-glass flex-1 py-2.5 rounded-xl text-sm">Annuler</button>
              <button type="submit" disabled={submitting} className="btn-primary flex-1 py-2.5 rounded-xl text-sm font-600 flex items-center justify-center gap-2">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />} Confirmer
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
