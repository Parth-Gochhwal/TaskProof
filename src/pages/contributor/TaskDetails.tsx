import { useNavigate, useParams } from 'react-router-dom';
import { Clock, Users, Shield, ChevronRight, AlertCircle } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { GlassCard, Button, DifficultyBadge, PageHeader, StatusBadge } from '../../components/ui/index';
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

const reqTypeColors: Record<string, string> = {
  instruction: '#1A4B8F',
  acceptance_criteria: '#16A34A',
  example: '#D97706',
};

const reqTypeLabels: Record<string, string> = {
  instruction: 'Instruction',
  acceptance_criteria: 'Acceptance Criteria',
  example: 'Example',
};

export default function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const task = id ? taskService.getById(id) : null;

  if (!task) {
    return (
      <AppShell>
        <div className="max-w-3xl mx-auto text-center py-20">
          <AlertCircle className="w-16 h-16 text-[#94A3B8] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#0F172A] mb-2">Task not found</h2>
          <p className="text-[#64748B] mb-4">This task may have been removed or is no longer available.</p>
          <Button onClick={() => navigate('/app/contributor/tasks')}>Back to Marketplace</Button>
        </div>
      </AppShell>
    );
  }

  // Check if already submitted
  const existingSub = submissionService.getByContributor('user-contributor-demo')
    .find(s => s.taskId === task.id && s.status !== 'rejected');

  const isAvailable = task.remainingSlots > 0 && task.status === 'active';

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title={task.title}
          backLabel="Back to Marketplace"
          onBack={() => navigate('/app/contributor/tasks')}
        />

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Overview Card */}
            <GlassCard className="p-6">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="text-sm font-medium text-[#1A4B8F] bg-[#EBF1FA] px-2.5 py-1 rounded-full">
                  {categoryLabels[task.category]}
                </span>
                <DifficultyBadge difficulty={task.difficulty} />
                <div className="flex items-center gap-1 text-sm text-[#64748B]">
                  <Clock className="w-4 h-4" />
                  {task.estimatedMinutes}–{task.estimatedMinutes + 3} min
                </div>
                <div className="flex items-center gap-1 text-sm text-[#64748B]">
                  <Users className="w-4 h-4" />
                  {task.remainingSlots} slots remaining
                </div>
              </div>

              <p className="text-[#0F172A] leading-relaxed mb-4">{task.description}</p>

              <div className="flex items-center gap-2 text-sm text-[#64748B] bg-[#F5F7FA] rounded-xl p-3">
                <Shield className="w-4 h-4 text-[#1A4B8F] flex-shrink-0" />
                <span>Reward is released only after successful verification by {task.businessName}.</span>
              </div>
            </GlassCard>

            {/* Requirements */}
            <GlassCard className="p-6">
              <h2 className="text-base font-bold text-[#0F172A] mb-4">Task Guidelines</h2>
              <div className="space-y-3">
                {task.requirements.map(req => (
                  <div key={req.id} className="flex items-start gap-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 mt-0.5"
                      style={{ background: `${reqTypeColors[req.type]}15`, color: reqTypeColors[req.type], border: `1px solid ${reqTypeColors[req.type]}30` }}
                    >
                      {reqTypeLabels[req.type]}
                    </span>
                    <p className="text-sm text-[#0F172A]">{req.description}</p>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Input Fields Preview */}
            <GlassCard className="p-6">
              <h2 className="text-base font-bold text-[#0F172A] mb-2">What you'll fill in</h2>
              <p className="text-sm text-[#64748B] mb-4">These are the fields you'll complete during the task.</p>
              <div className="space-y-2">
                {task.inputFields.map(field => (
                  <div key={field.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#F5F7FA', border: '1px solid #D8DEE8' }}>
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-xs font-bold text-[#1A4B8F] border border-[#D8DEE8]">
                      {field.type === 'select' ? '▼' : field.type === 'radio' ? '●' : field.type === 'rating' ? '★' : 'T'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#0F172A]">{field.label}</p>
                      <p className="text-xs text-[#94A3B8] capitalize">{field.type}{field.required ? ' · Required' : ' · Optional'}</p>
                    </div>
                    {field.options && (
                      <div className="ml-auto text-xs text-[#94A3B8]">{field.options.length} options</div>
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Reward Card */}
            <GlassCard className="p-6" glow>
              <p className="text-sm text-[#64748B] mb-1">Reward per submission</p>
              <div className="text-3xl font-black text-[#1A4B8F] mb-4">+{task.reward} TCR</div>
              <p className="text-xs text-[#94A3B8] mb-5 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                Released after verification
              </p>

              {existingSub ? (
                <div className="text-center">
                  <StatusBadge status={existingSub.status} />
                  <p className="text-xs text-[#64748B] mt-2">You have already submitted this task.</p>
                  <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={() => navigate('/app/contributor/my-tasks')}>
                    View Submission
                  </Button>
                </div>
              ) : !isAvailable ? (
                <div className="text-center">
                  <p className="text-sm text-[#DC2626] font-medium mb-2">Task no longer available</p>
                  <Button variant="secondary" className="w-full" onClick={() => navigate('/app/contributor/tasks')}>
                    Browse Other Tasks
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full"
                  size="lg"
                  iconRight={<ChevronRight className="w-5 h-5" />}
                  onClick={() => navigate(`/app/contributor/tasks/${task.id}/complete`)}
                >
                  Start Task
                </Button>
              )}
            </GlassCard>

            {/* Task Info */}
            <GlassCard className="p-5">
              <h3 className="text-sm font-bold text-[#0F172A] mb-3">Task Info</h3>
              <div className="space-y-2">
                {[
                  { label: 'Posted by', value: task.businessName },
                  { label: 'Category', value: categoryLabels[task.category] },
                  { label: 'Difficulty', value: task.difficulty },
                  { label: 'Est. Time', value: `${task.estimatedMinutes}–${task.estimatedMinutes + 3} min` },
                  { label: 'Slots Left', value: task.remainingSlots.toString() },
                  { label: 'Quality Score', value: `${task.qualityScore}%` },
                ].map(info => (
                  <div key={info.label} className="flex justify-between text-sm">
                    <span className="text-[#64748B]">{info.label}</span>
                    <span className="font-medium text-[#0F172A]">{info.value}</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Tags */}
            <GlassCard className="p-5">
              <h3 className="text-sm font-bold text-[#0F172A] mb-3">Skills Required</h3>
              <div className="flex flex-wrap gap-2">
                {task.tags.map(tag => (
                  <span key={tag} className="text-xs px-2.5 py-1 rounded-full" style={{ background: '#EBF1FA', color: '#1A4B8F', border: '1px solid #BFDBFE' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
