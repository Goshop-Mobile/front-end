'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Ban, CheckCircle2, Eye } from 'lucide-react';
import { usersApi } from '@/lib/api';
import { User } from '@/types';
import { GlassCard, Badge, Avatar, EmptyState, SkeletonRows, Pagination, Modal } from '@/components/ui';
import { formatRelative } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const [users, setUsers]     = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(1);
  const [total, setTotal]     = useState(0);
  const [blockTarget, setBlockTarget] = useState<User | null>(null);
  const [submitting, setSubmitting]   = useState(false);
  const PER_PAGE = 25;

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await usersApi.list({ page, per_page: PER_PAGE, search });
      const items = Array.isArray(data) ? data : (data.items || []);
      setUsers(items); setTotal(data.total || items.length);
    } catch {
      const mock: User[] = Array.from({ length: 18 }, (_, i) => ({
        id: `usr-${i}`, phone: `+2289${i.toString().padStart(7,'0')}`,
        email: i % 3 === 0 ? `user${i}@example.com` : null,
        full_name: ['Kossi Agbeko','Ama Koffivi','Yao Mensah','Akua Bello','Selom Tété','Kafui Dossou'][i % 6],
        avatar_url: null, role: 'client' as const, phone_verified: true,
        is_active: true, is_blocked: i === 5,
        created_at: new Date(Date.now() - i * 86400000 * 2).toISOString(),
      }));
      setUsers(mock); setTotal(mock.length);
    } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleBlock = async (user: User, block: boolean) => {
    setSubmitting(true);
    try {
      await usersApi.block(user.id, block);
      toast.success(block ? 'Compte bloqué' : 'Compte débloqué');
      setBlockTarget(null); fetch();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Erreur');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="font-display font-700 text-xl" style={{ color: 'var(--text-primary)' }}>Utilisateurs</h2>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{total} client(s) enregistré(s)</p>
      </div>

      <GlassCard className="rounded-2xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
          <input type="search" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Nom, téléphone, email…" className="input-glass w-full rounded-xl pl-9 pr-4 py-2.5 text-sm" />
        </div>
      </GlassCard>

      <GlassCard className="rounded-2xl overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full table-glass text-sm">
            <thead>
              <tr>
                <th className="text-left px-4 py-3">Utilisateur</th>
                <th className="text-left px-4 py-3">Contact</th>
                <th className="text-left px-4 py-3">Statut</th>
                <th className="text-left px-4 py-3">Inscription</th>
                <th className="text-center px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <SkeletonRows count={8} cols={5} /> : users.length === 0 ? (
                <tr><td colSpan={5} className="py-16"><EmptyState icon={<Users className="w-5 h-5" />} title="Aucun utilisateur" /></td></tr>
              ) : users.map((user, i) => (
                <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={user.full_name} size="sm" />
                      <span className="font-500" style={{ color: 'var(--text-primary)' }}>{user.full_name ?? '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>{user.phone}</p>
                    {user.email && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user.email}</p>}
                  </td>
                  <td className="px-4 py-3">
                    {user.is_blocked
                      ? <span className="badge badge-red">Bloqué</span>
                      : user.phone_verified
                        ? <span className="badge badge-green">Actif</span>
                        : <span className="badge badge-yellow">Non vérifié</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{formatRelative(user.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button className="p-1.5 rounded-lg btn-glass"><Eye className="w-3.5 h-3.5" style={{ color: 'var(--accent-blue)' }} /></button>
                      <button onClick={() => setBlockTarget(user)} className="p-1.5 rounded-lg btn-glass">
                        {user.is_blocked ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Ban className="w-3.5 h-3.5 text-red-400" />}
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pages={Math.ceil(total / PER_PAGE)} onChange={setPage} />
      </GlassCard>

      <Modal open={!!blockTarget} onClose={() => setBlockTarget(null)}
        title={blockTarget?.is_blocked ? 'Débloquer' : 'Bloquer'} maxWidth="max-w-sm">
        {blockTarget && (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {blockTarget.is_blocked ? `Débloquer ${blockTarget.full_name} ?` : `Bloquer ${blockTarget.full_name} ?`}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setBlockTarget(null)} className="btn-glass flex-1 py-2.5 rounded-xl text-sm">Annuler</button>
              <button onClick={() => handleBlock(blockTarget, !blockTarget.is_blocked)} disabled={submitting}
                className={`flex-1 py-2.5 rounded-xl text-sm font-600 ${blockTarget.is_blocked ? 'btn-primary' : 'btn-danger'}`}>
                {blockTarget.is_blocked ? 'Débloquer' : 'Bloquer'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
