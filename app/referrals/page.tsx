'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, Trophy, Coins } from 'lucide-react';
import { GlassCard, StatCard, Avatar, EmptyState, SkeletonRows } from '@/components/ui';
import { formatRelative } from '@/lib/utils';

interface ReferralStat { driverId: string; driverName: string; phone: string; referrals: number; creditsEarned: number; }

const MOCK_STATS: ReferralStat[] = [
  { driverId: '1', driverName: 'Kodjo Mensah',  phone: '+22890000001', referrals: 12, creditsEarned: 120 },
  { driverId: '2', driverName: 'Abla Ayivi',    phone: '+22890000002', referrals: 8,  creditsEarned: 80  },
  { driverId: '3', driverName: 'Kwame Agbeko',  phone: '+22890000003', referrals: 6,  creditsEarned: 60  },
  { driverId: '4', driverName: 'Ama Koffivi',   phone: '+22890000004', referrals: 5,  creditsEarned: 50  },
  { driverId: '5', driverName: 'Yao Mensah',    phone: '+22890000005', referrals: 3,  creditsEarned: 30  },
  { driverId: '6', driverName: 'Selom Tété',    phone: '+22890000006', referrals: 2,  creditsEarned: 20  },
  { driverId: '7', driverName: 'Kafui Dossou',  phone: '+22890000007', referrals: 1,  creditsEarned: 10  },
];

const MOCK_RECENT = Array.from({ length: 8 }, (_, i) => ({
  id: `ref-${i}`, referrerName: MOCK_STATS[i % 7].driverName,
  referreeName: `Nouveau ${i+1}`, creditsAwarded: 10,
  createdAt: new Date(Date.now() - i * 3600000 * 5).toISOString(),
}));

export default function ReferralsPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => { setTimeout(() => setLoading(false), 600); }, []);

  const totalReferrals = MOCK_STATS.reduce((s, r) => s + r.referrals, 0);
  const totalCredits   = MOCK_STATS.reduce((s, r) => s + r.creditsEarned, 0);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="font-display font-700 text-xl" style={{ color: 'var(--text-primary)' }}>Parrainage</h2>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Suivi des filleuls et crédits distribués</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Parrainages total" value={totalReferrals} icon={<GitBranch className="w-5 h-5" style={{ color: 'var(--accent-blue)' }} />} iconBg="rgba(37,99,235,0.15)" glowClass="stat-glow-blue" delay={0} />
        <StatCard label="Crédits distribués" value={totalCredits} icon={<Coins className="w-5 h-5 text-yellow-400" />} iconBg="rgba(234,179,8,0.15)" delay={0.05} />
        <StatCard label="Parrains actifs" value={MOCK_STATS.length} icon={<Trophy className="w-5 h-5 text-orange-400" />} iconBg="rgba(249,115,22,0.15)" delay={0.1} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Leaderboard */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <GlassCard className="rounded-2xl">
            <h3 className="font-display font-700 text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
              🏆 Classement des parrains
            </h3>
            <div className="space-y-2">
              {loading ? Array.from({length:5}).map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />) :
                MOCK_STATS.map((stat, i) => (
                  <div key={stat.driverId} className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors"
                    style={{ background: 'var(--bg-surface)' }}>
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-700 flex-shrink-0 ${
                      i === 0 ? 'bg-yellow-500 text-white' : i === 1 ? 'bg-gray-400 text-white' : i === 2 ? 'bg-orange-600 text-white' : 'text-gray-400'
                    }`} style={{ background: i > 2 ? 'var(--glass-bg)' : undefined }}>
                      {i + 1}
                    </span>
                    <Avatar name={stat.driverName} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-500 truncate" style={{ color: 'var(--text-primary)' }}>{stat.driverName}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.phone}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-700" style={{ color: 'var(--accent-blue)' }}>{stat.referrals} filleuls</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.creditsEarned} crédits</p>
                    </div>
                  </div>
                ))
              }
            </div>
          </GlassCard>
        </motion.div>

        {/* Recent activity */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <GlassCard className="rounded-2xl">
            <h3 className="font-display font-700 text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
              Activité récente
            </h3>
            <div className="space-y-2">
              {MOCK_RECENT.map((ref) => (
                <div key={ref.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                  style={{ background: 'var(--bg-surface)' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(34,197,94,0.12)' }}>
                    <GitBranch className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-500" style={{ color: 'var(--text-primary)' }}>
                      <span className="font-600">{ref.referrerName}</span> a parrainé <span className="font-600">{ref.referreeName}</span>
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatRelative(ref.createdAt)}</p>
                  </div>
                  <span className="badge badge-green flex-shrink-0">+{ref.creditsAwarded} crédits</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
