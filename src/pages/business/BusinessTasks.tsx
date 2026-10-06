import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Users } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { GlassCard, PageHeader, Button, StatusBadge, DifficultyBadge } from '../../components/ui/index';
import { taskService } from '../../services/taskService';
import { submissionService } from '../../services/submissionService';

const categoryLabels: Record<string, string> = {
  'data-labeling': 'Data Labeling',
  'survey': 'Survey',
  'content-review': 'Content Review',
  'research': 'Research',
  'testing': 'Testing',
  'ai-evaluation': 'AI Evaluation',
  'custom': 'Custom',
};

export default function BusinessTasks() {
  const navigate = useNavigate();
  const tasks = taskService.getByBusiness('user-business-demo');
  const allSubs = submissionService.getAll();

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="My Tasks"
          subtitle={`${tasks.length} tasks created`}
          action={
            <Button icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/app/business/create-task')}>
              Create Task
            </Button>
          }
        />

        <div className="space-y-4">
          {tasks.map(task => {
            const taskSubs = allSubs.filter(s => s.taskId === task.id);
            const approved = taskSubs.filter(s => s.status === 'rewarded').length;
            const review = taskSubs.filter(s => s.status === 'under_review').length;
            const completionPct = task.slots > 0 ? Math.round(((task.slots - task.remainingSlots) / task.slots) * 100) : 0;

            return (
              <GlassCard key={task.id} className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-bold text-[#0F172A]">{task.title}</h3>
                      <StatusBadge status={task.status} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#94A3B8]">{categoryLabels[task.category]}</span>
                      <span className="text-[#94A3B8]">·</span>
                      <DifficultyBadge difficulty={task.difficulty} />
                      <span className="text-[#94A3B8]">·</span>
                      <span className="text-xs text-[#1A4B8F] font-bold">{task.reward} TCR / sub</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />} onClick={() => navigate('/app/business/submissions')}>
                      Review
                    </Button>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'Submissions', value: taskSubs.length },
                    { label: 'Approved', value: approved, color: '#16A34A' },
                    { label: 'Under Review', value: review, color: '#D97706' },
                    { label: 'Budget Est.', value: `${(task.reward * task.slots).toLocaleString()} TCR` },
                  ].map(stat => (
                    <div key={stat.label} className="p-3 rounded-xl text-center" style={{ background: '#F5F7FA', border: '1px solid #D8DEE8' }}>
                      <p className="text-base font-bold" style={{ color: stat.color || '#0F172A' }}>{stat.value}</p>
                      <p className="text-xs text-[#64748B]">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Progress */}
                <div>
                  <div className="flex justify-between text-xs text-[#64748B] mb-1.5">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {task.slots - task.remainingSlots} / {task.slots} slots filled</span>
                    <span>{completionPct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: '#E6E9EF' }}>
                    <div className="h-full rounded-full" style={{ width: `${completionPct}%`, background: 'linear-gradient(90deg, #1A4B8F 0%, #4F78B4 100%)' }} />
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
