import { motion } from 'framer-motion';
import { Clock, Users, Zap, ChevronRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Task } from '../../types/models';
import { RewardBadge, DifficultyBadge } from './index';

const categoryIcons: Record<string, string> = {
  'data-labeling': '🏷️',
  'survey': '📋',
  'content-review': '📝',
  'research': '🔬',
  'testing': '🧪',
  'ai-evaluation': '🤖',
  'custom': '⚙️',
};

const categoryLabels: Record<string, string> = {
  'data-labeling': 'Data Labeling',
  'survey': 'Survey',
  'content-review': 'Content Review',
  'research': 'Research',
  'testing': 'Testing',
  'ai-evaluation': 'AI Evaluation',
  'custom': 'Custom',
};

interface TaskCardProps {
  task: Task;
  variant?: 'default' | 'compact';
}

export function TaskCard({ task, variant = 'default' }: TaskCardProps) {
  const navigate = useNavigate();

  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ y: -2, boxShadow: '0 12px 40px rgba(26,75,143,0.12)' }}
        transition={{ duration: 0.2 }}
        onClick={() => navigate(`/app/contributor/tasks/${task.id}`)}
        className="glass-card p-4 cursor-pointer"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: '#EBF1FA' }}>
              {categoryIcons[task.category] || '📌'}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A] leading-tight">{task.title}</h3>
              <p className="text-xs text-[#64748B] mt-0.5">{task.businessName}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <DifficultyBadge difficulty={task.difficulty} />
                <span className="text-xs text-[#94A3B8] flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {task.estimatedMinutes}m
                </span>
              </div>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <RewardBadge amount={task.reward} />
            <p className="text-xs text-[#94A3B8] mt-1">{task.remainingSlots} slots</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: '0 16px 48px rgba(26,75,143,0.14)' }}
      transition={{ duration: 0.2 }}
      onClick={() => navigate(`/app/contributor/tasks/${task.id}`)}
      className="glass-card p-5 cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #EBF1FA 0%, #E6E9EF 100%)', border: '1px solid #D8DEE8' }}>
            {categoryIcons[task.category] || '📌'}
          </div>
          <div>
            <span className="text-xs font-medium text-[#1A4B8F] bg-[#EBF1FA] px-2 py-0.5 rounded-full">
              {categoryLabels[task.category]}
            </span>
            <h3 className="text-sm font-bold text-[#0F172A] mt-1 leading-tight">{task.title}</h3>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#1A4B8F] transition-colors flex-shrink-0 mt-1" />
      </div>

      {/* Description */}
      <p className="text-xs text-[#64748B] line-clamp-2 mb-3">{task.shortDescription}</p>

      {/* Meta */}
      <div className="flex items-center gap-3 mb-4">
        <DifficultyBadge difficulty={task.difficulty} />
        <span className="text-xs text-[#94A3B8] flex items-center gap-1">
          <Clock className="w-3 h-3" /> {task.estimatedMinutes}–{task.estimatedMinutes + 3} min
        </span>
        <span className="text-xs text-[#94A3B8] flex items-center gap-1">
          <Users className="w-3 h-3" /> {task.remainingSlots} slots
        </span>
        {task.qualityScore > 95 && (
          <span className="text-xs text-[#D97706] flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" /> Top Rated
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-[#D8DEE8]/50">
        <span className="text-xs text-[#94A3B8]">by {task.businessName}</span>
        <div className="flex items-center gap-2">
          <RewardBadge amount={task.reward} size="md" />
          <motion.button
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-1 text-xs font-semibold text-white bg-[#1A4B8F] px-3 py-1.5 rounded-lg hover:bg-[#12386D] transition-colors cursor-pointer"
            onClick={(e) => { e.stopPropagation(); navigate(`/app/contributor/tasks/${task.id}`); }}
          >
            <Zap className="w-3 h-3" /> Start
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
