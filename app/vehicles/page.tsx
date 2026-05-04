'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Car, Plus, Edit2, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import { vehiclesApi } from '@/lib/api';
import { VehicleType } from '@/types';
import { GlassCard, EmptyState, Modal, Input, Textarea } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(2, 'Requis'),
  description: z.string().optional(),
  price_per_km: z.coerce.number().positive('Prix invalide'),
});
type FormData = z.infer<typeof schema>;

const VEHICLE_EMOJIS: Record<string, string> = {
  moto: '🏍️', voiture: '🚗', camion: '🚛', tricycle: '🛺', vélo: '🚲', taxi: '🚕',
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<VehicleType[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState<VehicleType | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await vehiclesApi.list();
      setVehicles(Array.isArray(data) ? data : []);
    } catch {
      setVehicles([
        { id: 'vt-1', name: 'Moto',     description: 'Livraison rapide en moto',  icon_url: null, price_per_km: 150, is_active: true },
        { id: 'vt-2', name: 'Voiture',  description: 'Confort et capacité',       icon_url: null, price_per_km: 300, is_active: true },
        { id: 'vt-3', name: 'Camion',   description: 'Gros volumes et déménagement', icon_url: null, price_per_km: 600, is_active: true },
        { id: 'vt-4', name: 'Tricycle', description: 'Transport local économique', icon_url: null, price_per_km: 120, is_active: false },
      ]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setEditing(null); reset({ name: '', description: '', price_per_km: 150 }); setShowModal(true); };
  const openEdit   = (v: VehicleType) => { setEditing(v); reset({ name: v.name, description: v.description || '', price_per_km: v.price_per_km }); setShowModal(true); };

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      if (editing) { await vehiclesApi.update(editing.id, data); toast.success('Véhicule mis à jour'); }
      else          { await vehiclesApi.create(data);             toast.success('Véhicule créé');       }
      setShowModal(false); fetch();
    } catch (e: any) { toast.error(e?.response?.data?.detail || 'Erreur'); }
    finally { setSubmitting(false); }
  };

  const toggleActive = async (v: VehicleType) => {
    try {
      await vehiclesApi.update(v.id, { is_active: !v.is_active });
      toast.success(v.is_active ? 'Désactivé' : 'Activé');
      fetch();
    } catch { toast.error('Erreur'); }
  };

  const emoji = (name: string) => VEHICLE_EMOJIS[name.toLowerCase()] || '🚗';

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-700 text-xl" style={{ color: 'var(--text-primary)' }}>Types de véhicules</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{vehicles.length} véhicule(s) configuré(s)</p>
        </div>
        <button onClick={openCreate} className="btn-primary px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="skeleton h-48 rounded-2xl" />)}
        </div>
      ) : vehicles.length === 0 ? (
        <GlassCard className="rounded-2xl"><EmptyState icon={<Car className="w-5 h-5" />} title="Aucun véhicule configuré" /></GlassCard>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((v, i) => (
            <motion.div key={v.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <GlassCard className="rounded-2xl" hover>
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{emoji(v.name)}</div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(v)} className="p-1.5 rounded-lg btn-glass">
                      <Edit2 className="w-3.5 h-3.5" style={{ color: 'var(--accent-blue)' }} />
                    </button>
                    <button onClick={() => toggleActive(v)} className="p-1.5 rounded-lg btn-glass">
                      {v.is_active
                        ? <ToggleRight className="w-4 h-4 text-green-500" />
                        : <ToggleLeft className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                      }
                    </button>
                  </div>
                </div>
                <h3 className="font-display font-700 text-lg mb-1" style={{ color: 'var(--text-primary)' }}>{v.name}</h3>
                {v.description && <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>{v.description}</p>}
                <div className="flex items-center justify-between">
                  <div className="px-3 py-1.5 rounded-xl text-xs font-700" style={{ background: 'rgba(37,99,235,0.12)', color: 'var(--accent-blue)' }}>
                    {formatCurrency(v.price_per_km)} / km
                  </div>
                  <span className={`badge ${v.is_active ? 'badge-green' : 'badge-gray'}`}>
                    {v.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)}
        title={editing ? 'Modifier le véhicule' : 'Nouveau véhicule'} maxWidth="max-w-md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Nom *" placeholder="Moto, Voiture…" {...register('name')} error={errors.name?.message} />
          <Input label="Description" placeholder="Description courte" {...register('description')} />
          <Input label="Tarif / km (FCFA) *" type="number" placeholder="150" {...register('price_per_km')} error={errors.price_per_km?.message} />
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-glass flex-1 py-2.5 rounded-xl text-sm">Annuler</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 py-2.5 rounded-xl text-sm font-600 flex items-center justify-center gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {editing ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
