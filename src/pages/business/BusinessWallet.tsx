import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { GlassCard, PageHeader } from '../../components/ui/index';
import { useAuth } from '../../context/AuthContext';
import { DEMO_BUSINESS_WALLET } from '../../data/seed';
import type { Transaction } from '../../types/models';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

function TxRow({ tx }: { tx: Transaction }) {
  const [exp, setExp] = useState(false);
  return (
    <div className="glass-card overflow-hidden">
      <button className="w-full px-5 py-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-[#F5F7FA]/50"
        onClick={() => setExp(v => !v)}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0
            ${tx.direction === 'credit' ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FEE2E2] text-[#DC2626]'}`}>
            {tx.direction === 'credit' ? '+' : '−'}
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-[#0F172A]">{tx.label}</p>
            {tx.taskTitle && <p className="text-xs text-[#64748B]">{tx.taskTitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <p className={`text-sm font-bold ${tx.direction === 'credit' ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
              {tx.direction === 'credit' ? '+' : '−'}{tx.amount} TCR
            </p>
            <p className="text-xs text-[#94A3B8]">{formatDate(tx.timestamp)}</p>
          </div>
          {exp ? <ChevronUp className="w-4 h-4 text-[#94A3B8]" /> : <ChevronDown className="w-4 h-4 text-[#94A3B8]" />}
        </div>
      </button>
      {exp && (
        <div className="px-5 pb-4 border-t border-[#D8DEE8]/50 pt-3 space-y-2">
          {[
            { label: 'TX ID', value: tx.id },
            { label: 'Network', value: tx.network },
            { label: 'Status', value: tx.status },
          ].map(item => (
            <div key={item.label} className="flex justify-between text-xs">
              <span className="text-[#64748B]">{item.label}</span>
              <span className="font-mono text-[#0F172A]">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BusinessWallet() {
  const { balance } = useAuth();
  const wallet = DEMO_BUSINESS_WALLET;

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        <PageHeader title="Payments" subtitle="Task budget and reward settlements" />

        {/* Main Balance */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 mb-6 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1A4B8F 100%)' }}>
          <div className="absolute right-0 top-0 w-48 h-full opacity-10">
            <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
              <circle cx="160" cy="40" r="80" fill="white" />
            </svg>
          </div>
          <div className="relative">
            <p className="text-white/60 text-sm mb-2">Available Task Credits</p>
            <p className="text-4xl font-black text-white mb-4">{balance.toLocaleString()} <span className="text-xl opacity-70">TCR</span></p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-white/60 text-xs mb-1">Reserved</p>
                <p className="text-white font-bold">{wallet.reserved.toLocaleString()} TCR</p>
              </div>
              <div>
                <p className="text-white/60 text-xs mb-1">Total Spent</p>
                <p className="text-white font-bold">{wallet.totalSpent.toLocaleString()} TCR</p>
              </div>
              <div>
                <p className="text-white/60 text-xs mb-1">Wallet</p>
                <p className="text-white font-mono text-xs">{wallet.address}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Budget flow visual */}
        <GlassCard className="p-5 mb-6">
          <h2 className="text-sm font-bold text-[#0F172A] mb-4">How Budget Works</h2>
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {[
              { icon: '💰', label: 'Fund Budget', color: '#1A4B8F' },
              { arrow: true },
              { icon: '🔒', label: 'Reserved', color: '#D97706' },
              { arrow: true },
              { icon: '✅', label: 'Approved Work', color: '#16A34A' },
              { arrow: true },
              { icon: '💎', label: 'Reward Released', color: '#1A4B8F' },
            ].map((item, i) =>
              'arrow' in item ? (
                <span key={i} className="text-[#D8DEE8]">→</span>
              ) : (
                <div key={item.label} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
                  style={{ background: `${item.color}12`, border: `1px solid ${item.color}30` }}>
                  <span>{item.icon}</span>
                  <span className="font-medium" style={{ color: item.color }}>{item.label}</span>
                </div>
              )
            )}
          </div>
          <p className="text-xs text-[#94A3B8] mt-3">
            Rewards are only deducted when you approve a submission. No approval = no charge.
          </p>
        </GlassCard>

        {/* Transactions */}
        <h2 className="text-base font-bold text-[#0F172A] mb-3">Transaction History</h2>
        <div className="space-y-3">
          {wallet.transactions.map(tx => <TxRow key={tx.id} tx={tx} />)}
        </div>

        <p className="text-xs text-center text-[#94A3B8] mt-6">
          Demo environment · Task Credits (TCR) have no monetary value
        </p>
      </div>
    </AppShell>
  );
}
