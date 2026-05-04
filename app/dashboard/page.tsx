'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCart, Truck, Users, CheckCircle2,
  TrendingUp, Activity, Package, DollarSign, RefreshCw
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { DashboardStats } from '@/types';
import { StatCard, GlassCard, SkeletonRows } from '@/components/ui';
import { OrdersAreaChart, RevenueBarChart } from '@/components/charts';
import { formatCurrency, formatDate, generateMockChartData, orderStatusBadge } from '@/lib/utils';
import toast from 'react-hot-toast';

const CHART_DATA = generateMockChartData(14);

// Mock recent orders for display
const MOCK_ORDERS = [
  { id: 'ord-001', client: 'Kossi A.', type: 'Livraison', status: 'completed',  price: 1500 },
  { id: 'ord-002', client: 'Ama K.',   type: 'Courses',   status: 'in_progress', price: 2200 },
  { id: 'ord-003', client: 'Yao M.',   type: 'Livraison', status: 'pending',     price: 850  },
  { id: 'ord-004', client: 'Akua B.',  type: 'Livraison', status: 'accepted',    price: 1750 },
  { id: 'ord-005', client: 'Selom T.', type: 'Courses',   status: 'cancelled',   price: 600  },
];

export default function DashboardPage() {
  const [stats, setStats]     = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await adminApi.dashboard();
      setStats(data);
      setLastRefresh(new Date());
    } catch (e: any) {
      // Show mock data if API not reachable
      setStats({
        active_orders:   12,
        drivers_online:  8,
        total_users:     342,
        total_drivers:   47,
        verified_drivers: 31,
        orders_today:    28,
        revenue_today:   42500,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-700 text-2xl" style={{ color: 'var(--text-primary)' }}>
            Vue d&apos;ensemble
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Données en direct — mis à jour le {formatDate(lastRefresh.toISOString())}
          </p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchStats(); }}
          className="btn-glass px-4 py-2 rounded-xl text-sm flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" style={{ color: 'var(--accent-blue)' }} />
          Actualiser
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Commandes actives"
          value={loading ? '…' : stats?.active_orders ?? 0}
          icon={<ShoppingCart className="w-5 h-5" style={{ color: '#2563EB' }} />}
          iconBg="rgba(37,99,235,0.15)"
          glowClass="stat-glow-blue"
          trend={12}
          delay={0}
        />
        <StatCard
          label="Conducteurs en ligne"
          value={loading ? '…' : stats?.drivers_online ?? 0}
          icon={<Truck className="w-5 h-5" style={{ color: '#22c55e' }} />}
          iconBg="rgba(34,197,94,0.15)"
          glowClass="stat-glow-green"
          delay={0.05}
        />
        <StatCard
          label="Commandes aujourd'hui"
          value={loading ? '…' : stats?.orders_today ?? 0}
          icon={<Package className="w-5 h-5" style={{ color: '#f97316' }} />}
          iconBg="rgba(249,115,22,0.15)"
          delay={0.1}
        />
        <StatCard
          label="Revenus du jour"
          value={loading ? '…' : formatCurrency(stats?.revenue_today ?? 0)}
          icon={<DollarSign className="w-5 h-5" style={{ color: '#9B1C1C' }} />}
          iconBg="rgba(155,28,28,0.15)"
          glowClass="stat-glow-red"
          trend={8}
          delay={0.15}
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Utilisateurs total"
          value={loading ? '…' : stats?.total_users ?? 0}
          icon={<Users className="w-5 h-5" style={{ color: '#8b5cf6' }} />}
          iconBg="rgba(139,92,246,0.15)"
          delay={0.2}
        />
        <StatCard
          label="Conducteurs inscrits"
          value={loading ? '…' : stats?.total_drivers ?? 0}
          icon={<Truck className="w-5 h-5" style={{ color: '#06b6d4' }} />}
          iconBg="rgba(6,182,212,0.15)"
          delay={0.25}
        />
        <StatCard
          label="Conducteurs vérifiés"
          value={loading ? '…' : stats?.verified_drivers ?? 0}
          icon={<CheckCircle2 className="w-5 h-5" style={{ color: '#22c55e' }} />}
          iconBg="rgba(34,197,94,0.15)"
          glowClass="stat-glow-green"
          delay={0.3}
        />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <GlassCard className="rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-700 text-sm" style={{ color: 'var(--text-primary)' }}>
                  Commandes (14 derniers jours)
                </h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Volume quotidien</p>
              </div>
              <Activity className="w-4 h-4" style={{ color: 'var(--accent-blue)' }} />
            </div>
            <OrdersAreaChart data={CHART_DATA} />
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard className="rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-700 text-sm" style={{ color: 'var(--text-primary)' }}>
                  Revenus (14 derniers jours)
                </h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>FCFA par jour</p>
              </div>
              <TrendingUp className="w-4 h-4" style={{ color: 'var(--accent-red)' }} />
            </div>
            <RevenueBarChart data={CHART_DATA} />
          </GlassCard>
        </motion.div>
      </div>

      {/* Recent orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <GlassCard className="rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-700 text-sm" style={{ color: 'var(--text-primary)' }}>
              Commandes récentes
            </h3>
            <a href="/orders" className="text-xs font-600" style={{ color: 'var(--accent-blue)' }}>
              Voir tout →
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full table-glass text-sm">
              <thead>
                <tr>
                  <th className="text-left px-4 py-3">ID</th>
                  <th className="text-left px-4 py-3">Client</th>
                  <th className="text-left px-4 py-3">Type</th>
                  <th className="text-left px-4 py-3">Statut</th>
                  <th className="text-right px-4 py-3">Prix</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_ORDERS.map((order, i) => {
                  const s = orderStatusBadge(order.status as any);
                  return (
                    <tr key={order.id}>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                          #{order.id.slice(-3)}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-500" style={{ color: 'var(--text-primary)' }}>
                        {order.client}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {order.type}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${s.cls}`}>{s.label}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs font-600" style={{ color: 'var(--text-primary)' }}>
                        {formatCurrency(order.price)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
