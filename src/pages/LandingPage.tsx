import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, CheckCircle, Zap, TrendingUp, Star, Users, Play, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/index';
import { Logo } from '../components/layout/AppShell';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } }
};

// Floating glass card
function FloatingCard({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      className={`glass-card px-3 py-2 text-sm font-medium ${className}`}
      style={{ animation: `float ${3 + delay}s ease-in-out ${delay}s infinite` }}
    >
      {children}
    </motion.div>
  );
}

const taskTypes = [
  { icon: '🏷️', title: 'Data Labeling', desc: 'Image, text & category labeling' },
  { icon: '📋', title: 'Surveys & Feedback', desc: 'Product & UX research' },
  { icon: '📝', title: 'Content Review', desc: 'Moderation & validation' },
  { icon: '🔬', title: 'Research Tasks', desc: 'Information collection' },
  { icon: '🧪', title: 'App / Website Testing', desc: 'Bug reports & feedback' },
  { icon: '⚙️', title: 'Custom Tasks', desc: 'Flexible requirements' },
];

const howItWorks = [
  { step: 1, icon: '👤', title: 'Sign Up', desc: 'Choose your role — Contributor or Business' },
  { step: 2, icon: '🔍', title: 'Browse / Post', desc: 'Find tasks or create new ones' },
  { step: 3, icon: '✅', title: 'Complete', desc: 'Submit work with required details' },
  { step: 4, icon: '🔎', title: 'Review', desc: 'Business verifies submissions' },
  { step: 5, icon: '💎', title: 'Earn', desc: 'Receive reward on blockchain' },
  { step: 6, icon: '🏆', title: 'Build Profile', desc: 'Grow reputation & unlock more' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* ====== NAV ====== */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#D8DEE8]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo size="md" />
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#64748B]">
            <a href="#how" className="hover:text-[#1A4B8F] transition-colors">How It Works</a>
            <a href="#tasks" className="hover:text-[#1A4B8F] transition-colors">Task Types</a>
            <a href="#trust" className="hover:text-[#1A4B8F] transition-colors">Trust</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/signup')}>Login</Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/signup')} icon={<Zap className="w-4 h-4" />}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* ====== HERO ====== */}
      <section className="relative overflow-hidden">
        {/* BG gradient blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #1A4B8F 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-8"
            style={{ background: 'radial-gradient(circle, #4F78B4 0%, transparent 70%)', transform: 'translate(-20%, 20%)' }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-20 pb-16 grid lg:grid-cols-2 gap-12 items-center">
          {/* LEFT — Copy */}
          <motion.div variants={stagger} initial="initial" animate="animate">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-6"
              style={{ background: '#EBF1FA', color: '#1A4B8F', border: '1px solid #BFDBFE' }}>
              <Shield className="w-4 h-4" />
              Verified Micro-Task Marketplace
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl lg:text-6xl font-black text-[#0F172A] leading-tight mb-4">
              Real Work.<br />Real Skills.<br />
              <span className="gradient-text">Verified Rewards.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg text-[#64748B] max-w-lg mb-8 leading-relaxed">
              A verified micro-task marketplace where businesses get high-quality results
              and contributors earn transparent rewards with verifiable proof.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-3 mb-10">
              <Button size="lg" icon={<Zap className="w-5 h-5" />} onClick={() => navigate('/signup?role=contributor')}>
                Explore Tasks
              </Button>
              <Button size="lg" variant="secondary" icon={<ChevronRight className="w-5 h-5" />} onClick={() => navigate('/signup?role=business')}>
                Post a Task
              </Button>
              <Button size="lg" variant="ghost" icon={<Play className="w-5 h-5" />} onClick={() => navigate('/signup')}>
                Try Demo
              </Button>
            </motion.div>

            {/* Value strip */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
              {[
                { icon: <Shield className="w-4 h-4" />, label: 'Verified Work' },
                { icon: <Zap className="w-4 h-4" />, label: 'Transparent Rewards' },
                { icon: <TrendingUp className="w-4 h-4" />, label: 'Build Reputation' },
                { icon: <Star className="w-4 h-4" />, label: 'Real Opportunities' },
              ].map(v => (
                <div key={v.label} className="flex items-center gap-1.5 text-sm text-[#64748B]">
                  <span className="text-[#1A4B8F]">{v.icon}</span>
                  {v.label}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* RIGHT — Visual */}
          <div className="relative h-[480px] hidden lg:block">
            {/* Central card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 glass-card p-5 w-64"
              style={{ animation: 'float 5s ease-in-out infinite' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#1A4B8F] flex items-center justify-center text-white text-lg">🤖</div>
                <div>
                  <p className="text-sm font-bold text-[#0F172A]">AI Response Evaluation</p>
                  <p className="text-xs text-[#64748B]">Nova Labs · 5–8 min</p>
                </div>
              </div>
              <div className="progress-bar h-1.5 mb-2">
                <div className="progress-fill" style={{ width: '68%' }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#94A3B8]">312 slots left</span>
                <span className="text-xs font-bold text-[#1A4B8F] bg-[#EBF1FA] px-2 py-0.5 rounded-full">+35 TCR</span>
              </div>
            </motion.div>

            {/* Floating badges */}
            <FloatingCard className="absolute top-12 left-8 flex items-center gap-2" delay={0}>
              <CheckCircle className="w-4 h-4 text-[#16A34A]" />
              <span className="text-[#16A34A] font-semibold">Task Completed</span>
              <span className="text-[#1A4B8F] font-bold">+50 TCR</span>
            </FloatingCard>

            <FloatingCard className="absolute top-24 right-6 flex items-center gap-2" delay={0.5}>
              <Shield className="w-4 h-4 text-[#1A4B8F]" />
              <span className="text-[#0F172A]">Verified Submission</span>
            </FloatingCard>

            <FloatingCard className="absolute bottom-28 left-4 flex items-center gap-2" delay={1}>
              <div className="w-6 h-6 rounded-lg bg-[#1A4B8F] flex items-center justify-center text-white text-xs font-bold">4</div>
              <div>
                <p className="text-xs font-bold text-[#0F172A]">Level 4</p>
                <p className="text-xs text-[#64748B]">Data Explorer</p>
              </div>
            </FloatingCard>

            <FloatingCard className="absolute bottom-16 right-8 flex items-center gap-2" delay={1.5}>
              <span className="text-lg">🔒</span>
              <div>
                <p className="text-xs font-bold text-[#0F172A]">On-chain Proof</p>
                <p className="text-xs text-[#94A3B8]">0x7f3a...9b12</p>
              </div>
            </FloatingCard>

            <FloatingCard className="absolute top-1/2 right-0 -translate-y-16 flex items-center gap-2" delay={2}>
              <Users className="w-4 h-4 text-[#1A4B8F]" />
              <span className="text-xs font-bold text-[#0F172A]">1,250 TCR balance</span>
            </FloatingCard>

            {/* BG shape */}
            <div className="absolute inset-0 -z-10 flex items-center justify-center">
              <div className="w-80 h-80 rounded-full opacity-15"
                style={{ background: 'radial-gradient(circle, #1A4B8F 0%, transparent 70%)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ====== DEMO BANNER ====== */}
      <section className="max-w-7xl mx-auto px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ background: 'linear-gradient(135deg, rgba(26,75,143,0.06) 0%, rgba(79,120,180,0.06) 100%)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1A4B8F] flex items-center justify-center">
              <Play className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-[#0F172A]">Try the Demo instantly</p>
              <p className="text-sm text-[#64748B]">No sign-up required. Experience the full product flow.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="primary" size="md" onClick={() => { navigate('/signup'); setTimeout(() => { /* auto-login */ }, 100); }}>
              Demo as Contributor
            </Button>
            <Button variant="secondary" size="md" onClick={() => navigate('/signup?role=business')}>
              Demo as Business
            </Button>
          </div>
        </motion.div>
      </section>

      {/* ====== HOW IT WORKS ====== */}
      <section id="how" className="max-w-7xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#0F172A] mb-3">How TaskProof Works</h2>
          <p className="text-[#64748B] max-w-lg mx-auto">From sign-up to verified reward in six clear stages.</p>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {howItWorks.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass-card p-4 text-center relative"
            >
              {i < howItWorks.length - 1 && (
                <div className="hidden lg:block absolute top-8 -right-2 z-10 text-[#D8DEE8]">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="w-6 h-6 rounded-full bg-[#1A4B8F] text-white text-xs font-bold flex items-center justify-center mx-auto mb-2">
                {s.step}
              </div>
              <p className="text-sm font-bold text-[#0F172A] mb-1">{s.title}</p>
              <p className="text-xs text-[#64748B]">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ====== TASK TYPES ====== */}
      <section id="tasks" className="max-w-7xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
          <h2 className="text-3xl font-bold text-[#0F172A] mb-3">Supported Task Types</h2>
          <p className="text-[#64748B]">Built for real micro-work — structured, verifiable, rewarded.</p>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {taskTypes.map((t, i) => (
            <motion.div
              key={t.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ y: -3 }}
              className="glass-card p-5 flex items-start gap-4"
            >
              <div className="text-3xl">{t.icon}</div>
              <div>
                <h3 className="font-semibold text-[#0F172A] text-sm">{t.title}</h3>
                <p className="text-xs text-[#64748B] mt-0.5">{t.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ====== TWO-SIDED MARKETPLACE ====== */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Contributor */}
          <motion.div
            initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="glass-card p-8"
            style={{ background: 'linear-gradient(135deg, rgba(26,75,143,0.06) 0%, rgba(255,255,255,0.7) 100%)' }}
          >
            <div className="w-12 h-12 rounded-2xl bg-[#1A4B8F] flex items-center justify-center text-white text-2xl mb-5">👤</div>
            <h3 className="text-xl font-bold text-[#0F172A] mb-2">For Contributors</h3>
            <p className="text-[#64748B] mb-5">Turn your time and skills into verified work. Build a professional micro-work reputation.</p>
            <ul className="space-y-2 mb-6">
              {['Browse hundreds of tasks by skill', 'Earn TCR for every approved submission', 'Build a verifiable work history', 'Level up and unlock better opportunities'].map(item => (
                <li key={item} className="flex items-center gap-2 text-sm text-[#0F172A]">
                  <CheckCircle className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Button variant="primary" icon={<ArrowRight className="w-4 h-4" />} onClick={() => navigate('/signup?role=contributor')}>
              Start Contributing
            </Button>
          </motion.div>

          {/* Business */}
          <motion.div
            initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="glass-card p-8"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(26,75,143,0.04) 100%)' }}
          >
            <div className="w-12 h-12 rounded-2xl bg-[#0F172A] flex items-center justify-center text-white text-2xl mb-5">🏢</div>
            <h3 className="text-xl font-bold text-[#0F172A] mb-2">For Businesses</h3>
            <p className="text-[#64748B] mb-5">Turn fragmented micro-work into verified outcomes. Pay only for approved results.</p>
            <ul className="space-y-2 mb-6">
              {['Post structured tasks in minutes', 'Access a verified contributor pool', 'Pay only for approved submissions', 'Get quality analytics and proof'].map(item => (
                <li key={item} className="flex items-center gap-2 text-sm text-[#0F172A]">
                  <CheckCircle className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Button variant="secondary" icon={<ArrowRight className="w-4 h-4" />} onClick={() => navigate('/signup?role=business')}>
              Post a Task
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ====== TRUST / VERIFICATION ====== */}
      <section id="trust" className="max-w-7xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
          <h2 className="text-3xl font-bold text-[#0F172A] mb-3">How Verification Works</h2>
          <p className="text-[#64748B]">Every reward is earned, not given. Every transaction is recorded.</p>
        </motion.div>
        <div className="glass-card p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {[
              { icon: '📤', label: 'Submission', color: '#64748B' },
              { icon: '⚡', label: 'Automated Pre-check', color: '#D97706' },
              { icon: '👁️', label: 'Business Review', color: '#1A4B8F' },
              { icon: '✅', label: 'Approved', color: '#16A34A' },
              { icon: '💎', label: 'Reward Released', color: '#1A4B8F' },
              { icon: '🔒', label: 'Proof Recorded', color: '#1A4B8F' },
            ].map((step, i, arr) => (
              <div key={step.label} className="flex items-center gap-3 md:gap-4 md:flex-col md:text-center">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: `${step.color}18`, border: `1px solid ${step.color}33` }}>
                  {step.icon}
                </div>
                <span className="text-sm font-medium text-[#0F172A] whitespace-nowrap">{step.label}</span>
                {i < arr.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-[#D8DEE8] flex-shrink-0 hidden md:block" />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-[#64748B] mt-6">
            No approval = No reward. Approved = Reward released. Reward released = Proof generated.
          </p>
        </div>
      </section>

      {/* ====== REPUTATION ====== */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="glass-card p-8 md:flex items-center gap-8">
          <div className="md:w-1/2 mb-6 md:mb-0">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-4"
              style={{ background: '#EBF1FA', color: '#1A4B8F', border: '1px solid #BFDBFE' }}>
              <TrendingUp className="w-4 h-4" /> Verified Work History
            </div>
            <h2 className="text-2xl font-bold text-[#0F172A] mb-3">Build a reputation that proves itself</h2>
            <p className="text-[#64748B] mb-5">Every completed task adds to your verified profile. Your work history is transparent, tamper-proof, and portable.</p>
            <Button onClick={() => navigate('/signup?role=contributor')}>Start Building</Button>
          </div>
          <div className="md:w-1/2 grid grid-cols-2 gap-4">
            {[
              { label: 'Tasks Completed', value: '48', icon: '✅' },
              { label: 'Quality Score', value: '96%', icon: '⭐' },
              { label: 'Total Earned', value: '1,250 TCR', icon: '💎' },
              { label: 'Current Level', value: 'Data Explorer', icon: '🏆' },
            ].map(m => (
              <div key={m.label} className="p-4 rounded-xl text-center" style={{ background: '#F5F7FA', border: '1px solid #D8DEE8' }}>
                <div className="text-2xl mb-1">{m.icon}</div>
                <p className="text-lg font-bold text-[#0F172A]">{m.value}</p>
                <p className="text-xs text-[#64748B]">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== FINAL CTA ====== */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center glass-card p-12"
          style={{ background: 'linear-gradient(135deg, #1A4B8F 0%, #4F78B4 100%)' }}
        >
          <h2 className="text-4xl font-black text-white mb-4">Build. Complete. Get Verified.</h2>
          <p className="text-white/80 text-lg mb-8 max-w-lg mx-auto">Join TaskProof and start earning verified rewards for real work today.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary" onClick={() => navigate('/signup?role=contributor')}>
              Join as Contributor
            </Button>
            <Button size="lg"
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
              onClick={() => navigate('/signup?role=business')}>
              Post Your First Task
            </Button>
          </div>
          <p className="text-white/50 text-xs mt-6">Demo credits only. No real monetary value. TCR = Task Credits.</p>
        </motion.div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer className="border-t border-[#D8DEE8] bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-sm text-[#94A3B8]">© 2026 TaskProof. Built for DEV2HACK 2026. Demo prototype — no real monetary value.</p>
          <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
            <Shield className="w-3.5 h-3.5" />
            Verified Micro-Task Marketplace
          </div>
        </div>
      </footer>
    </div>
  );
}
