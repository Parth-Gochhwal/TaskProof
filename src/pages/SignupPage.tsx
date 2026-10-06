import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Zap, Users, Building2, ArrowRight } from 'lucide-react';

import { Logo } from '../components/layout/AppShell';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const navigate = useNavigate();

  const { loginAsContributor, loginAsBusiness } = useAuth();

  const handleContributor = () => {
    loginAsContributor();
    navigate('/app/contributor');
  };

  const handleBusiness = () => {
    loginAsBusiness();
    navigate('/app/business');
  };

  return (
    <div className="min-h-screen page-bg flex flex-col items-center justify-center p-6">
      {/* Bg blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #1A4B8F 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-8"
          style={{ background: 'radial-gradient(circle, #4F78B4 0%, transparent 70%)', transform: 'translate(-20%, 20%)' }} />
      </div>

      <div className="relative w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <h1 className="text-3xl font-black text-[#0F172A] mb-2">Join TaskProof</h1>
          <p className="text-[#64748B]">Choose your role to get started. No setup required for demo.</p>
        </div>

        {/* Role Cards */}
        <div className="grid sm:grid-cols-2 gap-5 mb-6">
          {/* Contributor */}
          <motion.button
            whileHover={{ y: -4, boxShadow: '0 20px 60px rgba(26,75,143,0.18)' }}
            whileTap={{ scale: 0.98 }}
            onClick={handleContributor}
            className="glass-card p-6 text-left cursor-pointer group"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#1A4B8F] flex items-center justify-center text-white mb-4 group-hover:scale-105 transition-transform">
              <Users className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-[#0F172A] mb-2">I'm a Contributor</h2>
            <p className="text-sm text-[#64748B] mb-4">Complete structured micro-tasks and earn verified rewards. Build your professional work history.</p>
            <ul className="space-y-1.5 mb-5">
              {['Browse available tasks', 'Submit work & get verified', 'Earn TCR rewards', 'Build your reputation'].map(item => (
                <li key={item} className="flex items-center gap-2 text-sm text-[#0F172A]">
                  <Zap className="w-3.5 h-3.5 text-[#1A4B8F] flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2 text-[#1A4B8F] font-semibold text-sm">
              Continue as Contributor <ArrowRight className="w-4 h-4" />
            </div>
          </motion.button>

          {/* Business */}
          <motion.button
            whileHover={{ y: -4, boxShadow: '0 20px 60px rgba(26,75,143,0.12)' }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBusiness}
            className="glass-card p-6 text-left cursor-pointer group"
            style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.04) 0%, rgba(255,255,255,0.7) 100%)' }}
          >
            <div className="w-14 h-14 rounded-2xl bg-[#0F172A] flex items-center justify-center text-white mb-4 group-hover:scale-105 transition-transform">
              <Building2 className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-[#0F172A] mb-2">I'm a Business</h2>
            <p className="text-sm text-[#64748B] mb-4">Create tasks, manage submissions, and pay only for approved results with transparent proof.</p>
            <ul className="space-y-1.5 mb-5">
              {['Post structured tasks', 'Review submissions', 'Approve & release rewards', 'Track quality analytics'].map(item => (
                <li key={item} className="flex items-center gap-2 text-sm text-[#0F172A]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A] flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2 text-[#0F172A] font-semibold text-sm">
              Continue as Business <ArrowRight className="w-4 h-4" />
            </div>
          </motion.button>
        </div>

        {/* Demo note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-4 text-center"
        >
          <p className="text-sm text-[#64748B] flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#1A4B8F]" />
            <span>Demo mode — <strong>Task Credits (TCR)</strong> have no monetary value. For hackathon demonstration only.</span>
          </p>
        </motion.div>

        <p className="text-center text-sm text-[#94A3B8] mt-4">
          <button onClick={() => navigate('/')} className="hover:text-[#1A4B8F] transition-colors cursor-pointer">← Back to home</button>
        </p>
      </div>
    </div>
  );
}
