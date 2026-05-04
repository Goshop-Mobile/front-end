'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Search, XCircle, Eye, MapPin } from 'lucide-react';
import { ordersApi } from '@/lib/api';
import { Order, OrderStatus } from '@/types';
import { GlassCard, Badge, EmptyState, SkeletonRows, Pagination, Modal, Textarea } from '@/components/ui';
import { orderStatusBadge, formatCurrency, formatRelative, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

const STATUS_FILTERS = [
  { value: '', label: 'Toutes' },
  { value: 'pending', label: 'En attente' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'completed', label: 'Terminées' },
  { value: 'cancelled', label: 'Annulées' },
];

const MOCK: Order[] = Array.from({ length: 15 }, (_, i) => ({
  id: `ord-${i.toString().padStart(3,'0')}`,
  order_type: i % 3 === 0 ? 'courses' : 'delivery',
  status: (['pending','accepted','in_progress','completed','completed','cancelled'] as OrderStatus[])[i % 6],
  client_id: `usr-${i}`,
  driver_id: i % 4 !== 0 ? `drv-${i}` : null,
  vehicle_type_id: 'vt-1',
  pickup_latitude: 6.13 + Math.random()*0.05, pickup_longitude: 1.22 + Math.random()*0.05,
  pickup_address: `Rue ${i+1}, Lomé`,
  dropoff_latitude: 6.15 + Math.random()*0.05, dropoff_longitude: 1.24 + Math.random()*0.05,
  dropoff_address: `Quartier ${i+1}, Lomé`,
  distance_km: parseFloat((1 + Math.random()*10).toFixed(1)),
  total_price: Math.floor((1 + Math.random()*10) * 150),
  created_at: new Date(Date.now() - i * 3600000).toISOString(),
  client: { id: `usr-${i}`, full_name: `Client ${i+1}`, phone: `+2289${i.toString().padStart(7,'0')}`, email: null, avatar_url: null, role: 'client', phone_verified: true, is_active: true, is_blocked: false, created_at: new Date().toISOString() },
}));

export default function OrdersPage() {
  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [status, setStatus]   = useState('');
  const [page, setPage]       = useState(1);
  const [total, setTotal]     = useState(0);
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [submitting, setSubmitting]     = useState(false);
  const PER_PAGE = 20;

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await ordersApi.list({ page, per_page: PER_PAGE, search, status });
      const items = Array.isArray(data) ? data : (data.items || []);
      setOrders(items); setTotal(data.total || items.length);
    } catch {
      const filtered = status ? MOCK.filter(o => o.status === status) : MOCK;
      setOrders(filtered); setTotal(filtered.length);
    } finally { setLoading(false); }
  }, [page, search, status]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleCancel = async () => {
    if (!cancelTarget || !cancelReason.trim()) { toast.error('Motif requis'); return; }
    setSubmitting(true);
    try {
      await ordersApi.cancel(cancelTarget.id, cancelReason);
      toast.success('Commande annulée');
      setCancelTarget(null); setCancelReason(''); fetch();
    } catch (e: any) { toast.error(e?.response?.data?.detail || 'Erreur'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="font-display font-700 text-xl" style={{ color: 'var(--text-primary)' }}>Commandes</h2>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{total} commande(s)</p>
      </div>

      <GlassCard className="rounded-2xl">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            <input type="search" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Rechercher par ID, client…" className="input-glass w-full rounded-xl pl-9 pr-4 py-2.5 text-sm" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTERS.map(f => (
              <button key={f.value} onClick={() => { setStatus(f.value); setPage(1); }}
                className={`px-3 py-2 rounded-xl text-xs font-600 transition-all ${status === f.value ? 'btn-primary' : 'btn-glass'}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      <GlassCard className="rounded-2xl overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full table-glass text-sm">
            <thead>
              <tr>
                <th className="text-left px-4 py-3">ID</th>
                <th className="text-left px-4 py-3">Client</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Trajet</th>
                <th className="text-left px-4 py-3">Statut</th>
                <th className="text-right px-4 py-3">Prix</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-center px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <SkeletonRows count={8} cols={8} /> : orders.length === 0 ? (
                <tr><td colSpan={8} className="py-16"><EmptyState icon={<ShoppingCart className="w-5 h-5" />} title="Aucune commande" /></td></tr>
              ) : orders.map((order, i) => {
                const s = orderStatusBadge(order.status);
                const active = !['completed','cancelled'].includes(order.status);
                return (
                  <motion.tr key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>#{order.id.slice(-6)}</td>
                    <td className="px-4 py-3 font-500" style={{ color: 'var(--text-primary)' }}>{order.client?.full_name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${order.order_type === 'courses' ? 'badge-purple' : 'badge-blue'}`}>
                        {order.order_type === 'courses' ? 'Courses' : 'Livraison'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        {order.distance_km ? `${order.distance_km} km` : '—'}
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge label={s.label} cls={s.cls} /></td>
                    <td className="px-4 py-3 text-right font-mono text-xs font-600" style={{ color: 'var(--text-primary)' }}>
                      {order.total_price ? formatCurrency(order.total_price) : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{formatRelative(order.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button className="p-1.5 rounded-lg btn-glass"><Eye className="w-3.5 h-3.5" style={{ color: 'var(--accent-blue)' }} /></button>
                        {active && (
                          <button onClick={() => setCancelTarget(order)} className="p-1.5 rounded-lg btn-glass">
                            <XCircle className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pages={Math.ceil(total / PER_PAGE)} onChange={setPage} />
      </GlassCard>

      <Modal open={!!cancelTarget} onClose={() => { setCancelTarget(null); setCancelReason(''); }}
        title="Annuler la commande" maxWidth="max-w-sm">
        <div className="space-y-4">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Annuler la commande <span className="font-mono font-600">#{cancelTarget?.id.slice(-6)}</span> ?
          </p>
          <Textarea label="Motif *" placeholder="Raison de l'annulation…" rows={3}
            value={cancelReason} onChange={e => setCancelReason(e.target.value)} />
          <div className="flex gap-2">
            <button onClick={() => { setCancelTarget(null); setCancelReason(''); }} className="btn-glass flex-1 py-2.5 rounded-xl text-sm">Retour</button>
            <button onClick={handleCancel} disabled={submitting} className="btn-danger flex-1 py-2.5 rounded-xl text-sm font-600">Confirmer</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
