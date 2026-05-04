'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Loader2, ShieldCheck, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  phone:    z.string().min(8, 'Numéro invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [user, loading, router]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await login(data.phone, data.password);
      toast.success('Connexion réussie');
      router.replace('/dashboard');
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || e.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #1E3A8A, transparent)', top: '10%', left: '5%' }}
          animate={{ scale: [1, 1.2, 1], x: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-72 h-72 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #9B1C1C, transparent)', bottom: '15%', right: '10%' }}
          animate={{ scale: [1, 1.15, 1], y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        <motion.div
          className="absolute w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #2563EB, transparent)', top: '50%', right: '25%' }}
          animate={{ scale: [1, 1.3, 1], y: [0, 15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md mx-4 relative z-10"
      >
        {/* Card */}
        <div className="glass-xl rounded-3xl p-8 relative noise">
          {/* Logo area */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 relative"
              style={{
                background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 60%, #9B1C1C 100%)',
                boxShadow: '0 8px 32px rgba(37,99,235,0.4)',
              }}
            >
              <Zap className="w-8 h-8 text-white" fill="white" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <h1 className="text-3xl font-display font-800 mb-1">
                <span style={{ color: 'var(--accent-red)' }}>Go</span>
                <span style={{ color: 'var(--text-primary)' }}>Shop</span>
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                Plateforme d&apos;administration
              </p>
            </motion.div>
          </div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit(onSubmit)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="space-y-4"
          >
            {/* Phone */}
            <div>
              <label className="block text-xs font-600 mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Téléphone
              </label>
              <input
                {...register('phone')}
                type="tel"
                placeholder="+228 90 00 00 00"
                className="input-glass w-full rounded-xl px-4 py-3 text-sm"
                style={{ fontFamily: 'var(--font-mono)' }}
                autoComplete="tel"
              />
              {errors.phone && (
                <p className="mt-1 text-xs" style={{ color: 'var(--accent-red)' }}>{errors.phone.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-600 mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Mot de passe
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input-glass w-full rounded-xl px-4 py-3 pr-11 text-sm"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs" style={{ color: 'var(--accent-red)' }}>{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full rounded-xl py-3 font-600 text-sm mt-2 flex items-center justify-center gap-2"
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Connexion…</>
              ) : (
                <><ShieldCheck className="w-4 h-4" /> Se connecter</>
              )}
            </motion.button>
          </motion.form>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-xs mt-6"
            style={{ color: 'var(--text-muted)' }}
          >
            Accès réservé aux <strong>administrateurs</strong> et <strong>modérateurs</strong>
          </motion.p>
        </div>

        {/* Version tag */}
        <p className="text-center text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
          v1.0.0 — Lomé, Togo
        </p>
      </motion.div>
    </div>
  );
}
