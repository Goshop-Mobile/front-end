'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Eye, CheckCircle2, XCircle, ChevronRight,
  FileText, Camera, User, Car, CreditCard, Loader2
} from 'lucide-react';
import { driversApi } from '@/lib/api';
import { DriverProfile, DriverDocument, DocumentType } from '@/types';
import {
  GlassCard, Badge, Avatar, EmptyState, Modal, Textarea, SkeletonRows
} from '@/components/ui';
import { driverStatusBadge, docStatusBadge, docTypeLabel, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import Image from 'next/image';

const DOC_ICONS: Record<DocumentType, React.ReactNode> = {
  id_card_front:  <CreditCard className="w-4 h-4" />,
  selfie_with_id: <Camera className="w-4 h-4" />,
  profile_photo:  <User className="w-4 h-4" />,
  vehicle_photo:  <Car className="w-4 h-4" />,
  license_plate:  <FileText className="w-4 h-4" />,
};

interface ReviewModal {
  docId: string;
  docType: string;
  action: 'approved' | 'rejected';
}

export default function ModerationPage() {
  const [drivers, setDrivers]         = useState<DriverProfile[]>([]);
  const [loading, setLoading]         = useState(true);
  const [selected, setSelected]       = useState<DriverProfile | null>(null);
  const [reviewModal, setReviewModal]  = useState<ReviewModal | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting]   = useState(false);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await driversApi.pending({ per_page: 50 });
      setDrivers(Array.isArray(data) ? data : data.items || []);
    } catch {
      // Mock data for demo
      setDrivers([
        {
          id: 'drv-001', user_id: 'usr-001', status: 'pending_review',
          credits: 0, referral_code: 'DRIV001', vehicle_description: 'Moto Honda 2021 rouge',
          is_online: false, total_deliveries: 0, average_rating: 0, rating_count: 0,
          created_at: new Date().toISOString(),
          user: { id: 'usr-001', full_name: 'Kodjo Mensah', phone: '+22890123456', email: null, avatar_url: null, role: 'driver', phone_verified: true, is_active: true, is_blocked: false, created_at: new Date().toISOString() },
          documents: [
            { id: 'doc-001', doc_type: 'id_card_front',  status: 'pending',  cloudinary_url: 'https://placehold.co/400x250/1E3A8A/white?text=CNI+Recto',  rejection_reason: null, reviewed_at: null, created_at: new Date().toISOString() },
            { id: 'doc-002', doc_type: 'selfie_with_id', status: 'pending',  cloudinary_url: 'https://placehold.co/400x250/9B1C1C/white?text=Selfie+CNI',  rejection_reason: null, reviewed_at: null, created_at: new Date().toISOString() },
            { id: 'doc-003', doc_type: 'profile_photo',  status: 'approved', cloudinary_url: 'https://placehold.co/400x250/166534/white?text=Photo+Profil', rejection_reason: null, reviewed_at: null, created_at: new Date().toISOString() },
            { id: 'doc-004', doc_type: 'vehicle_photo',  status: 'pending',  cloudinary_url: 'https://placehold.co/400x250/334155/white?text=Véhicule',    rejection_reason: null, reviewed_at: null, created_at: new Date().toISOString() },
            { id: 'doc-005', doc_type: 'license_plate',  status: 'rejected', cloudinary_url: 'https://placehold.co/400x250/7f1d1d/white?text=Plaque',       rejection_reason: 'Image floue, impossible de lire la plaque', reviewed_at: null, created_at: new Date().toISOString() },
          ] as DriverDocument[],
        },
        {
          id: 'drv-002', user_id: 'usr-002', status: 'pending_review',
          credits: 0, referral_code: 'DRIV002', vehicle_description: 'Tricycle vert 2020',
          is_online: false, total_deliveries: 0, average_rating: 0, rating_count: 0,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          user: { id: 'usr-002', full_name: 'Abla Ayivi', phone: '+22891234567', email: null, avatar_url: null, role: 'driver', phone_verified: true, is_active: true, is_blocked: false, created_at: new Date().toISOString() },
          documents: [
            { id: 'doc-006', doc_type: 'id_card_front',  status: 'pending', cloudinary_url: 'https://placehold.co/400x250/1E3A8A/white?text=CNI+Recto',  rejection_reason: null, reviewed_at: null, created_at: new Date().toISOString() },
            { id: 'doc-007', doc_type: 'vehicle_photo',  status: 'pending', cloudinary_url: 'https://placehold.co/400x250/334155/white?text=Véhicule',    rejection_reason: null, reviewed_at: null, created_at: new Date().toISOString() },
          ] as DriverDocument[],
        },
      ] as DriverProfile[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  const handleReview = async () => {
    if (!reviewModal) return;
    if (reviewModal.action === 'rejected' && !rejectReason.trim()) {
      toast.error('Un motif de refus est obligatoire');
      return;
    }
    setSubmitting(true);
    try {
      await driversApi.reviewDoc(
        reviewModal.docId,
        reviewModal.action,
        reviewModal.action === 'rejected' ? rejectReason : undefined
      );
      toast.success(reviewModal.action === 'approved' ? 'Document approuvé !' : 'Document refusé');
      setReviewModal(null);
      setRejectReason('');
      fetchPending();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = drivers.reduce(
    (sum, d) => sum + (d.documents?.filter(doc => doc.status === 'pending').length || 0), 0
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.25)' }}
        >
          <Shield className="w-5 h-5" style={{ color: '#ca8a04' }} />
        </div>
        <div>
          <h2 className="font-display font-700 text-xl" style={{ color: 'var(--text-primary)' }}>
            Modération des conducteurs
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {loading ? '…' : `${drivers.length} conducteur(s) en attente — ${pendingCount} document(s) à examiner`}
          </p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid lg:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <div key={i} className="skeleton rounded-2xl h-64" />
          ))}
        </div>
      ) : drivers.length === 0 ? (
        <GlassCard className="rounded-2xl">
          <EmptyState
            icon={<CheckCircle2 className="w-6 h-6" />}
            title="Aucun conducteur en attente"
            description="Tous les dossiers ont été traités. Revenez plus tard."
          />
        </GlassCard>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {drivers.map((driver, i) => (
            <motion.div
              key={driver.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <GlassCard className="rounded-2xl cursor-pointer" onClick={() => setSelected(driver)} hover>
                {/* Driver header */}
                <div className="flex items-center gap-3 mb-4">
                  <Avatar name={driver.user?.full_name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-600 text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                      {driver.user?.full_name ?? 'Conducteur'}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {driver.user?.phone} · {formatDate(driver.created_at)}
                    </p>
                  </div>
                  <Badge {...driverStatusBadge(driver.status)} />
                  <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                </div>

                {/* Vehicle info */}
                {driver.vehicle_description && (
                  <p className="text-xs mb-4 px-3 py-2 rounded-lg" style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>
                    🏍️ {driver.vehicle_description}
                  </p>
                )}

                {/* Document status grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(driver.documents ?? []).map((doc) => {
                    const s = docStatusBadge(doc.status);
                    return (
                      <div
                        key={doc.id}
                        className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs"
                        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
                        onClick={(e) => { e.stopPropagation(); setSelected(driver); }}
                      >
                        <span style={{ color: 'var(--text-muted)' }}>{DOC_ICONS[doc.doc_type]}</span>
                        <div className="min-w-0">
                          <p className="truncate text-xs leading-none mb-1" style={{ color: 'var(--text-secondary)' }}>
                            {docTypeLabel(doc.doc_type)}
                          </p>
                          <span className={`badge text-xs ${s.cls}`} style={{ fontSize: '0.6rem', padding: '1px 6px' }}>
                            {s.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* Driver detail modal */}
      <AnimatePresence>
        {selected && (
          <Modal
            open={!!selected}
            onClose={() => setSelected(null)}
            title={`Dossier — ${selected.user?.full_name ?? 'Conducteur'}`}
            maxWidth="max-w-2xl"
          >
            <div className="space-y-4">
              {/* Driver info */}
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-surface)' }}>
                <Avatar name={selected.user?.full_name} size="lg" />
                <div>
                  <p className="font-600" style={{ color: 'var(--text-primary)' }}>{selected.user?.full_name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{selected.user?.phone}</p>
                  {selected.vehicle_description && (
                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>🏍️ {selected.vehicle_description}</p>
                  )}
                </div>
                <div className="ml-auto">
                  <Badge {...driverStatusBadge(selected.status)} />
                </div>
              </div>

              {/* Documents */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {(selected.documents ?? []).map((doc) => {
                  const s = docStatusBadge(doc.status);
                  return (
                    <div
                      key={doc.id}
                      className="rounded-xl overflow-hidden"
                      style={{ border: '1px solid var(--border)' }}
                    >
                      {/* Doc header */}
                      <div className="flex items-center justify-between px-3 py-2" style={{ background: 'var(--bg-surface)' }}>
                        <div className="flex items-center gap-2">
                          <span style={{ color: 'var(--text-muted)' }}>{DOC_ICONS[doc.doc_type]}</span>
                          <span className="text-sm font-500" style={{ color: 'var(--text-primary)' }}>
                            {docTypeLabel(doc.doc_type)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`badge ${s.cls}`}>{s.label}</span>
                          {doc.status === 'pending' && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => setReviewModal({ docId: doc.id, docType: doc.doc_type, action: 'approved' })}
                                className="p-1.5 rounded-lg transition-colors"
                                style={{ background: 'rgba(34,197,94,0.15)', color: '#16a34a' }}
                                title="Approuver"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setReviewModal({ docId: doc.id, docType: doc.doc_type, action: 'rejected' })}
                                className="p-1.5 rounded-lg transition-colors"
                                style={{ background: 'rgba(239,68,68,0.15)', color: '#dc2626' }}
                                title="Refuser"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Doc image */}
                      <div className="doc-card" style={{ aspectRatio: '16/8' }}>
                        <img
                          src={doc.cloudinary_url}
                          alt={docTypeLabel(doc.doc_type)}
                          className="w-full h-full object-cover"
                        />
                        {doc.rejection_reason && (
                          <div className="doc-card-overlay">
                            <p className="text-xs text-white">⚠️ {doc.rejection_reason}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Review confirmation modal */}
      <AnimatePresence>
        {reviewModal && (
          <Modal
            open={!!reviewModal}
            onClose={() => { setReviewModal(null); setRejectReason(''); }}
            title={reviewModal.action === 'approved' ? 'Approuver le document' : 'Refuser le document'}
            maxWidth="max-w-md"
          >
            <div className="space-y-4">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {reviewModal.action === 'approved'
                  ? `Confirmer l'approbation de « ${docTypeLabel(reviewModal.docType)} » ?`
                  : `Vous allez refuser « ${docTypeLabel(reviewModal.docType)} ». Un motif est obligatoire.`
                }
              </p>

              {reviewModal.action === 'rejected' && (
                <Textarea
                  label="Motif du refus *"
                  placeholder="Ex : Photo illisible, document expiré…"
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => { setReviewModal(null); setRejectReason(''); }}
                  className="btn-glass flex-1 py-2.5 rounded-xl text-sm"
                >
                  Annuler
                </button>
                <button
                  onClick={handleReview}
                  disabled={submitting}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-600 flex items-center justify-center gap-2 ${
                    reviewModal.action === 'approved' ? 'btn-primary' : 'btn-danger'
                  }`}
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {reviewModal.action === 'approved' ? 'Approuver' : 'Refuser'}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
