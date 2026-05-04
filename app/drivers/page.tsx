'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Truck, Search, Filter, Ban, CheckCircle2,
  Star, Package, Coins, Eye
} from 'lucide-react';
import { driversApi } from '@/lib/api';
import { DriverProfile, DriverStatus } from '@/types';
import {
  GlassCard, Badge, Avatar, EmptyState, SkeletonRows, Pagination, Modal, Input
} from '@/components/ui';
import { driverStatusBadge, formatDate, formatRelative } from '@/lib/utils';
import toast from 'react-hot-toast';

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: '',               label: 'Tous'         },
  { value: 'verified',       label: 'Vérifiés'     },
  { value: 'pending_review', label: 'En révision'  },
  { value: 'unverified',     label: 'Non vérifiés' },
  { value: 'suspended',      label: 'Suspendus'    },
];

export default function DriversPage() {
  const [drivers, setDrivers]   = useState<DriverProfile[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [status, setStatus]     = useState('');
  const [page, setPage]         = useState(1);
  const [total, setTotal]       = useState(0);
  const [blockTarget, setBlockTarget] = useState<DriverProfile | null>(null);
  const [submitting, setSubmitting]   = useState(false);
  const PER_PAGE = 20;

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await driversApi.list({ page, per_page: PER_PAGE, search, status });
      const items = Array.isArray(data) ? data : (data.items || []);
      setDrivers(items);
      setTotal(data.total || items.length);
    } catch {
      // Mock data
      const mock: DriverProfile[] = Array.from({ length: 12 }, (_, i) => ({
        id:               `drv-${i}`,
        user_id:          `usr-${i}`,
        status:           ['verified', 'pending_review', 'unverified', 'verified', 'verified'][i % 5] as DriverStatus,
        credits:          Math.floor(Math.random() * 200),
        referral_code:    `CODE${i.toString().padStart(4, '0')}`,
        vehicle_description: ['Moto Honda 2021', 'Tricycle 2020', 'Voiture Yaris 2019'][i % 3],
        is_online:        i % 3 === 0,
        total_deliveries: Math.floor(Math.random() * 300),
        average_rating:   3.5 + Math.random() * 1.5,
        rating_count:     Math.floor(Math.random() * 100),
        created_at:       new Date(Date.now() - i * 86400000 * 3).toISOString(),
        user: {
          id: `usr-${i}`, full_name: `Conducteur ${i + 1}`, phone: `+2289${i.toString().padStart(7,'0')}`,
          email: null, avatar_url: null, role: 'driver', phone_verified: true, is_active: true, is_blocked: i === 3,
          created_at: new Date().toISOString(),
        },
      }));
      setDrivers(mock);
      setTotal(mock.length);
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => { fetchDrivers(); }, [fetchDrivers]);

  const handleBlock = async (driver: DriverProfile, block: boolean) => {
    setSubmitting(true);
    try {
      await driversApi.block(driver.user_id, block);
      toast.success(block ? 'Compte bloqué' : 'Compte débloqué');
      setBlockTarget(null);
      fetchDrivers();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-700 text-xl" style={{ color: 'var(--text-primary)' }}>
            Conducteurs
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {total} conducteur(s) enregistré(s)
          </p>
        </div>
      </div>

      {/* Filters */}
      <GlassCard className="rounded-2xl">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            <input
              type="search"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Rechercher par nom, téléphone…"
              className="input-glass w-full rounded-xl pl-9 pr-4 py-2.5 text-sm"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => { setStatus(f.value); setPage(1); }}
                className={`px-3 py-2 rounded-xl text-xs font-600 transition-all ${
                  status === f.value ? 'btn-primary' : 'btn-glass'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Table */}
      <GlassCard className="rounded-2xl overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full table-glass text-sm">
            <thead>
              <tr>
                <th className="text-left px-4 py-3">Conducteur</th>
                <th className="text-left px-4 py-3">Statut</th>
                <th className="text-left px-4 py-3">En ligne</th>
                <th className="text-right px-4 py-3">Livraisons</th>
                <th className="text-right px-4 py-3">Note</th>
                <th className="text-right px-4 py-3">Crédits</th>
                <th className="text-left px-4 py-3">Inscription</th>
                <th className="text-center px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRows count={8} cols={8} />
              ) : drivers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16">
                    <EmptyState icon={<Truck className="w-5 h-5" />} title="Aucun conducteur trouvé" />
                  </td>
                </tr>
              ) : (
                drivers.map((driver, i) => {
                  const s = driverStatusBadge(driver.status);
                  const blocked = driver.user?.is_blocked;
                  return (
                    <motion.tr
                      key={driver.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={driver.user?.full_name} size="sm" />
                          <div>
                            <p className="font-500 text-sm" style={{ color: 'var(--text-primary)' }}>
                              {driver.user?.full_name ?? '—'}
                            </p>
                            <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                              {driver.user?.phone}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <Badge label={s.label} cls={s.cls} />
                          {blocked && <Badge label="Bloqué" cls="badge-red" />}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {driver.is_online
                          ? <div className="flex items-center gap-1.5"><div className="online-dot" /><span className="text-xs text-green-500">Online</span></div>
                          : <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Offline</span>
                        }
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="flex items-center justify-end gap-1 text-sm font-600" style={{ color: 'var(--text-primary)' }}>
                          <Package className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                          {driver.total_deliveries}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="flex items-center justify-end gap-1 text-sm" style={{ color: '#fbbf24' }}>
                          <Star className="w-3 h-3 fill-current" />
                          {driver.average_rating.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="flex items-center justify-end gap-1 text-sm font-600" style={{ color: 'var(--text-primary)' }}>
                          <Coins className="w-3 h-3" style={{ color: '#ca8a04' }} />
                          {driver.credits}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                        {formatRelative(driver.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            className="p-1.5 rounded-lg btn-glass"
                            title="Voir détail"
                          >
                            <Eye className="w-3.5 h-3.5" style={{ color: 'var(--accent-blue)' }} />
                          </button>
                          <button
                            onClick={() => setBlockTarget(driver)}
                            className="p-1.5 rounded-lg btn-glass"
                            title={blocked ? 'Débloquer' : 'Bloquer'}
                          >
                            {blocked
                              ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                              : <Ban className="w-3.5 h-3.5 text-red-400" />
                            }
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pages={Math.ceil(total / PER_PAGE)} onChange={setPage} />
      </GlassCard>

      {/* Block/Unblock Modal */}
      <Modal
        open={!!blockTarget}
        onClose={() => setBlockTarget(null)}
        title={blockTarget?.user?.is_blocked ? 'Débloquer ce compte' : 'Bloquer ce compte'}
        maxWidth="max-w-sm"
      >
        {blockTarget && (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {blockTarget.user?.is_blocked
                ? `Confirmer le déblocage du compte de ${blockTarget.user?.full_name} ?`
                : `Êtes-vous sûr de vouloir bloquer ${blockTarget.user?.full_name} ? Le conducteur ne pourra plus se connecter.`
              }
            </p>
            <div className="flex gap-2">
              <button onClick={() => setBlockTarget(null)} className="btn-glass flex-1 py-2.5 rounded-xl text-sm">
                Annuler
              </button>
              <button
                onClick={() => handleBlock(blockTarget, !blockTarget.user?.is_blocked)}
                disabled={submitting}
                className={`flex-1 py-2.5 rounded-xl text-sm font-600 ${
                  blockTarget.user?.is_blocked ? 'btn-primary' : 'btn-danger'
                }`}
              >
                {blockTarget.user?.is_blocked ? 'Débloquer' : 'Bloquer'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
