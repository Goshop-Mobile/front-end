'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Plus, Eye, MousePointer, Bell, Loader2, Image as ImageIcon,PenLine,StretchVerticalIcon, Ban } from 'lucide-react';
import { adsApi } from '@/lib/api';
import { Ad } from '@/types';
import { GlassCard, EmptyState, Modal, Input, Textarea } from '@/components/ui';
import { adStatusBadge, formatDate } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';

const schema = z.object({
  title:                    z.string().min(2, 'Requis'),
  body:                     z.string().optional(),
  link_url:                 z.string().url('URL invalide').optional().or(z.literal('')),
  display_duration_seconds: z.coerce.number().int().min(1).default(10),
  send_push:                z.boolean().default(false),
  scheduled_at:             z.string().optional(),
  expires_at:               z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const MOCK_ADS: Ad[] = [
  { id: 'ad-1', title: 'Promo Ramadan', body: '-20% sur toutes les livraisons', image_url: 'https://placehold.co/600x200/1E3A8A/white?text=Promo+Ramadan', link_url: null, status: 'active', display_duration_seconds: 8, send_push: true, push_sent: true, view_count: 1240, click_count: 87, scheduled_at: null, expires_at: null, created_at: new Date(Date.now()-86400000).toISOString() },
  { id: 'ad-2', title: 'Nouveaux conducteurs', body: 'Rejoignez Go Shop et gagnez plus', image_url: 'https://placehold.co/600x200/9B1C1C/white?text=Rejoignez+GoShop', link_url: 'https://goshop.tg', status: 'scheduled', display_duration_seconds: 12, send_push: false, push_sent: false, view_count: 0, click_count: 0, scheduled_at: new Date(Date.now()+86400000).toISOString(), expires_at: null, created_at: new Date().toISOString() },
  { id: 'ad-3', title: 'Fête de l\'indépendance', body: null, image_url: null, link_url: null, status: 'expired', display_duration_seconds: 5, send_push: false, push_sent: false, view_count: 3200, click_count: 110, scheduled_at: null, expires_at: new Date(Date.now()-86400000*3).toISOString(), created_at: new Date(Date.now()-86400000*10).toISOString() },
];

export default function AdsPage() {
  const [ads, setAds]           = useState<Ad[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isAdSet, setIsAdSet]= useState(false);
  const [currentPubId, setCurrentPubId] = useState<string| null>(null);
  const [currentAds, setCurrentAds] = useState<Ad | null>(null);
  const [createdId, setCreatedId]   = useState<string | null>(null);
  const [imageFile, setImageFile]   = useState<File | null>(null);
  const [isConfirm, setIsConfirm]  = useState<boolean>(false);

  const deleteAds = ()=>{
    console.log("message");
    if (!currentPubId){
      setIsConfirm(false);
      return ;
    }
    
    setDeleting(true);
    setTimeout(() => {
      setDeleting(false);
    },5000);
  }

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { display_duration_seconds: 10, send_push: false },
  });

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adsApi.list();
      setAds(Array.isArray(data) ? data : []);
    } catch { setAds(MOCK_ADS); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const { data: ad } = await adsApi.create({
        ...data, link_url: data.link_url || null,
        scheduled_at: data.scheduled_at || null,
        expires_at: data.expires_at || null,
      });
      if (imageFile) {
        await adsApi.uploadImage(ad.id, imageFile);
      }
      toast.success('Publicité créée !');
      setShowModal(false); setImageFile(null); reset(); fetch();
    } catch {
      toast.success('Publicité créée (mode démo)');
      setShowModal(false); setImageFile(null); reset(); fetch();
    } finally { setSubmitting(false); }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-700 text-xl" style={{ color: 'var(--text-primary)' }}>Bannières publicitaires</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{ads.length} bannière(s)</p>
        </div>
        <button onClick={() => { setShowModal(true); reset(); }} className="btn-primary px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nouvelle bannière
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)}</div>
      ) : ads.length === 0 ? (
        <GlassCard className="rounded-2xl"><EmptyState icon={<Megaphone className="w-5 h-5" />} title="Aucune bannière" description="Créez votre première bannière publicitaire" /></GlassCard>
      ) : (
        <div className="space-y-4">
          {ads.map((ad, i) => {
            const s = adStatusBadge(ad.status);
            return (
              <motion.div key={ad.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <GlassCard className="rounded-2xl overflow-hidden p-0">
                  <div className="flex flex-col sm:flex-row">
                    {/* Image */}
                    <div className="w-full sm:w-56 h-28 flex-shrink-0 relative" style={{ background: 'var(--bg-surface)' }}>
                      {ad.image_url
                        ? <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-8 h-8" style={{ color: 'var(--text-muted)' }} /></div>
                      }
                    </div>
                    {/* Info */}
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-display font-700 text-base" style={{ color: 'var(--text-primary)' }}>{ad.title}</h3>
                        <div className='flex space-y-2 flex-col'>
                          <span className={`badge ${s.cls} flex-shrink-0`}>{s.label}</span>
                          <div className='space-x-2'>
                            <span className={`badge badge-gray w-8`}
                              onClick={()=>{setCurrentAds(ad);setIsAdSet(true)}}
                            ><PenLine/></span>
                            <span className={`badge badge-red w-8`}
                              onClick={()=>{setIsConfirm(true); setCurrentPubId(ad.id)}}>
                                <Ban/> </span>
                          </div>
                          
                        </div>
                      </div>
                      {ad.body && <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>{ad.body}</p>}
                      <div className="flex flex-wrap items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {ad.view_count.toLocaleString()} vues</span>
                        <span className="flex items-center gap-1"><MousePointer className="w-3 h-3" /> {ad.click_count.toLocaleString()} clics</span>
                        {ad.send_push && <span className="flex items-center gap-1"><Bell className="w-3 h-3 text-blue-400" /> Push envoyé</span>}
                        <span>Durée : {ad.display_duration_seconds}s</span>
                        <span>Créée {formatDate(ad.created_at, { day: '2-digit', month: 'short', year: undefined, hour: undefined, minute: undefined })}</span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nouvelle bannière" maxWidth="max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Titre *" placeholder="Titre de la bannière" {...register('title')} error={errors.title?.message} />
          <Textarea label="Texte (optionnel)" placeholder="Description de la bannière" rows={2} {...register('body')} />
          <Input label="Lien URL (optionnel)" placeholder="https://…" {...register('link_url')} error={errors.link_url?.message} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Durée d'affichage (sec)" type="number" {...register('display_duration_seconds')} />
            <Input label="Date programmée" type="datetime-local" {...register('scheduled_at')} />
          </div>
          <Input label="Date d'expiration" type="datetime-local" {...register('expires_at')} />
          {/* Image upload */}
          <div>
            <label className="block text-xs font-600 uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Image</label>
            <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)}
              className="input-glass w-full rounded-xl px-4 py-2.5 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:text-xs file:py-1 file:px-2 file:cursor-pointer" />
          </div>
          {/* Send push */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" {...register('send_push')} className="w-4 h-4 rounded accent-blue-600" />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Envoyer une notification push</span>
          </label>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-glass flex-1 py-2.5 rounded-xl text-sm">Annuler</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 py-2.5 rounded-xl text-sm font-600 flex items-center justify-center gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />} Publier
            </button>
          </div>
        </form>
      </Modal>
      <Modal open={isConfirm} onClose={()=>setIsConfirm(false)} title="Etes vous sûr de vouloir supprimer cette Publicitée" maxWidth='max-w-lg'>
        <div className="space-y-4">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Êtes-vous sûr de vouloir Supprimer cette pub ?
            </p>
            <div className="flex gap-2">
              <button onClick={() => setIsConfirm(false)} className="btn-glass flex-1 py-2.5 rounded-xl text-sm">
                Annuler
              </button>
              <button
                onClick={() => deleteAds()}
                disabled={deleting}
                className={`flex-1 py-2.5 rounded-xl text-sm font-600 btn-danger`}
              >
                {deleting ? <span className="">...</span>
                  : "Supprimer"
                }
              </button>
            </div>
          </div>
      </Modal>
      <Modal open={isAdSet} onClose={()=>{setIsAdSet(false); setCurrentAds(null)}} title='Detailles sur la publicité' over>
        {currentAds && <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Titre *" placeholder="Titre de la bannière" {...register('title')} error={errors.title?.message} value={currentAds.title} />
          <Textarea label="Texte (optionnel)" placeholder="Description de la bannière" rows={2} {...register('body')} value={currentAds.body??""}/>
          <Input label="Lien URL (optionnel)" placeholder="https://…" {...register('link_url')} error={errors.link_url?.message} value={currentAds.link_url??""} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Durée d'affichage (sec)" type="number" {...register('display_duration_seconds')} value={currentAds.display_duration_seconds}/>
            <Input label="Date programmée" type="datetime-local" {...register('scheduled_at')} value={currentAds.scheduled_at??undefined}/>
          </div>
          <Input label="Date d'expiration" type="datetime-local" {...register('expires_at')} value={currentAds.expires_at??undefined}/>
          {/* Image upload */}
          <div>
            <label className="block text-xs font-600 uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Image</label>
            <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)}
              className="input-glass w-full rounded-xl px-4 py-2.5 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:text-xs file:py-1 file:px-2 file:cursor-pointer" />
            {currentAds.image_url && <img src={currentAds.image_url} alt={currentAds.title} />}

          </div>
          {/* Send push */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" {...register('send_push')} className="w-4 h-4 rounded accent-blue-600" defaultChecked={currentAds.push_sent}/>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Envoyer une notification push</span>
          </label>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => {setIsAdSet(false); setCurrentAds(null)}} className="btn-glass flex-1 py-2.5 rounded-xl text-sm">Annuler</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 py-2.5 rounded-xl text-sm font-600 flex items-center justify-center gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />} Modifier
            </button>
          </div>
        </form>}
      </Modal>
    </div>
  );
}
