import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Zap, Info } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { GlassCard, PageHeader, Button, StepIndicator, Input, Textarea, Select } from '../../components/ui/index';
import { taskService } from '../../services/taskService';
import type { TaskCategory, TaskDifficulty, Task } from '../../types/models';
import { useAuth } from '../../context/AuthContext';

const STEPS = ['Details', 'Requirements', 'Reward', 'Review', 'Publish'];

const CATEGORY_OPTIONS = [
  { value: 'data-labeling', label: 'Data Labeling' },
  { value: 'survey', label: 'Survey & Feedback' },
  { value: 'content-review', label: 'Content Review' },
  { value: 'research', label: 'Research' },
  { value: 'testing', label: 'App / Website Testing' },
  { value: 'ai-evaluation', label: 'AI Evaluation' },
  { value: 'custom', label: 'Custom Task' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

interface FormData {
  title: string;
  category: TaskCategory;
  description: string;
  shortDescription: string;
  estimatedMinutes: number;
  difficulty: TaskDifficulty;
  instructions: string;
  acceptanceCriteria: string;
  reward: number;
  slots: number;
}

const defaultForm: FormData = {
  title: '',
  category: 'data-labeling',
  description: '',
  shortDescription: '',
  estimatedMinutes: 10,
  difficulty: 'easy',
  instructions: '',
  acceptanceCriteria: '',
  reward: 30,
  slots: 100,
};

export default function CreateTask() {
  const navigate = useNavigate();
  const { businessProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [published, setPublished] = useState(false);
  const [newTask, setNewTask] = useState<Task | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const val = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setForm(prev => ({ ...prev, [field]: val }));
  };

  const totalBudget = form.reward * form.slots;

  const handlePublish = async () => {
    setPublishing(true);
    setError('');
    try {
      const task = await taskService.create({
        title: form.title,
        category: form.category,
        description: form.description,
        shortDescription: form.shortDescription || form.description.slice(0, 100) + '...',
        reward: form.reward,
        estimatedMinutes: form.estimatedMinutes,
        difficulty: form.difficulty,
        slots: form.slots,
        businessName: businessProfile?.companyName || 'TechCorp',
        tags: [form.category, form.difficulty],
        requirements: [
          ...(form.instructions ? [{ id: 'r1', type: 'instruction' as const, description: form.instructions }] : []),
          ...(form.acceptanceCriteria ? [{ id: 'r2', type: 'acceptance_criteria' as const, description: form.acceptanceCriteria }] : []),
        ],
        inputFields: [
          { id: 'f1', label: 'Your Response', type: 'textarea', required: true, placeholder: 'Enter your response here...' },
        ],
      });
      setNewTask(task);
      setPublished(true);
    } catch (e: any) {
      setError(e.message || 'Failed to create task');
    } finally {
      setPublishing(false);
    }
  };

  if (published && newTask) {
    return (
      <AppShell>
        <div className="max-w-lg mx-auto py-12">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-10 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 rounded-full bg-[#DCFCE7] flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-10 h-10 text-[#16A34A]" />
            </motion.div>
            <h2 className="text-2xl font-black text-[#0F172A] mb-2">Task Published!</h2>
            <p className="text-[#64748B] mb-2">Your task is now live and visible to contributors.</p>
            <p className="text-sm font-bold text-[#1A4B8F] mb-6">{newTask.title}</p>

            <div className="rounded-xl p-5 mb-6 space-y-2 text-left" style={{ background: '#F5F7FA', border: '1px solid #D8DEE8' }}>
              {[
                { label: 'Reward per submission', value: `${form.reward} TCR` },
                { label: 'Total slots', value: form.slots.toString() },
                { label: 'Estimated budget', value: `${totalBudget.toLocaleString()} TCR` },
                { label: 'Category', value: CATEGORY_OPTIONS.find(c => c.value === form.category)?.label || '' },
              ].map(item => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-[#64748B]">{item.label}</span>
                  <span className="font-semibold text-[#0F172A]">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <Button className="w-full" onClick={() => navigate('/app/business/submissions')}>
                View Submissions
              </Button>
              <Button variant="secondary" className="w-full" onClick={() => { setPublished(false); setForm(defaultForm); setStep(0); }}>
                Create Another Task
              </Button>
            </div>
          </motion.div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        <PageHeader title="Create Task" subtitle="Define a new micro-task for contributors" />

        {/* Step Indicator */}
        <div className="mb-8 overflow-x-auto">
          <StepIndicator steps={STEPS} current={step} />
        </div>

        {/* Step 1: Details */}
        {step === 0 && (
          <GlassCard className="p-6 space-y-5">
            <h2 className="text-lg font-bold text-[#0F172A]">Task Details</h2>
            <Input label="Task Title *" value={form.title} onChange={set('title')} placeholder="e.g. Product Image Categorization" />
            <Select
              label="Category *"
              value={form.category}
              onChange={set('category')}
              options={CATEGORY_OPTIONS}
            />
            <Textarea
              label="Short Description (appears in marketplace)"
              value={form.shortDescription}
              onChange={set('shortDescription')}
              placeholder="One sentence describing what contributors will do..."
            />
            <Textarea
              label="Full Description *"
              value={form.description}
              onChange={set('description')}
              placeholder="Detailed explanation of the task, context, and purpose..."
              className="min-h-[120px]"
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[#0F172A] block mb-1.5">Estimated Time (minutes)</label>
                <input type="number" value={form.estimatedMinutes} onChange={set('estimatedMinutes')} min={1}
                  className="w-full h-10 rounded-xl border border-[#D8DEE8] bg-white px-3 text-sm focus:outline-none focus:border-[#1A4B8F] focus:ring-2 focus:ring-[#1A4B8F]/20" />
              </div>
              <Select label="Difficulty" value={form.difficulty} onChange={set('difficulty')} options={DIFFICULTY_OPTIONS} />
            </div>
          </GlassCard>
        )}

        {/* Step 2: Requirements */}
        {step === 1 && (
          <GlassCard className="p-6 space-y-5">
            <h2 className="text-lg font-bold text-[#0F172A]">Requirements</h2>
            <Textarea
              label="Instructions for Contributors *"
              value={form.instructions}
              onChange={set('instructions')}
              placeholder="Step-by-step instructions for completing the task..."
              className="min-h-[100px]"
            />
            <Textarea
              label="Acceptance Criteria *"
              value={form.acceptanceCriteria}
              onChange={set('acceptanceCriteria')}
              placeholder="What does a successful submission look like? What will you reject?"
              className="min-h-[100px]"
            />
            <div className="p-4 rounded-xl flex items-start gap-3" style={{ background: '#EBF1FA', border: '1px solid #BFDBFE' }}>
              <Info className="w-4 h-4 text-[#1A4B8F] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#1A4B8F]">
                Clear acceptance criteria leads to better submissions and a higher approval rate.
                Be specific about what you will and won't accept.
              </p>
            </div>
          </GlassCard>
        )}

        {/* Step 3: Reward */}
        {step === 2 && (
          <GlassCard className="p-6 space-y-5">
            <h2 className="text-lg font-bold text-[#0F172A]">Reward & Budget</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[#0F172A] block mb-1.5">Reward per Approved Submission (TCR)</label>
                <input type="number" value={form.reward} onChange={set('reward')} min={1}
                  className="w-full h-10 rounded-xl border border-[#D8DEE8] bg-white px-3 text-sm focus:outline-none focus:border-[#1A4B8F] focus:ring-2 focus:ring-[#1A4B8F]/20" />
              </div>
              <div>
                <label className="text-sm font-medium text-[#0F172A] block mb-1.5">Number of Submissions (Slots)</label>
                <input type="number" value={form.slots} onChange={set('slots')} min={1}
                  className="w-full h-10 rounded-xl border border-[#D8DEE8] bg-white px-3 text-sm focus:outline-none focus:border-[#1A4B8F] focus:ring-2 focus:ring-[#1A4B8F]/20" />
              </div>
            </div>

            {/* Live budget calculation */}
            <div className="p-5 rounded-xl space-y-3" style={{ background: 'linear-gradient(135deg, #EBF1FA 0%, #F5F7FA 100%)', border: '1px solid #BFDBFE' }}>
              <h3 className="text-sm font-bold text-[#0F172A]">Budget Breakdown</h3>
              <div className="space-y-2">
                {[
                  { label: 'Reward per submission', value: `${form.reward} TCR` },
                  { label: 'Slots', value: `× ${form.slots}` },
                ].map(item => (
                  <div key={item.label} className="flex justify-between text-sm">
                    <span className="text-[#64748B]">{item.label}</span>
                    <span className="font-medium text-[#0F172A]">{item.value}</span>
                  </div>
                ))}
                <div className="border-t border-[#BFDBFE] pt-2 flex justify-between">
                  <span className="text-sm font-bold text-[#0F172A]">Estimated Budget</span>
                  <span className="text-lg font-black text-[#1A4B8F]">{totalBudget.toLocaleString()} TCR</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#94A3B8] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#1A4B8F]" />
              Rewards are only released after you approve each submission. Rejected submissions cost nothing.
            </p>
          </GlassCard>
        )}

        {/* Step 4: Review */}
        {step === 3 && (
          <GlassCard className="p-6">
            <h2 className="text-lg font-bold text-[#0F172A] mb-5">Review Your Task</h2>
            <div className="space-y-4">
              {[
                { label: 'Title', value: form.title || 'Not set' },
                { label: 'Category', value: CATEGORY_OPTIONS.find(c => c.value === form.category)?.label || '' },
                { label: 'Difficulty', value: form.difficulty },
                { label: 'Estimated Time', value: `${form.estimatedMinutes} minutes` },
                { label: 'Short Description', value: form.shortDescription || form.description.slice(0, 80) || 'Not set' },
                { label: 'Instructions', value: form.instructions || 'Not set' },
                { label: 'Acceptance Criteria', value: form.acceptanceCriteria || 'Not set' },
                { label: 'Reward', value: `${form.reward} TCR` },
                { label: 'Slots', value: form.slots.toString() },
                { label: 'Total Budget', value: `${totalBudget.toLocaleString()} TCR` },
              ].map(item => (
                <div key={item.label} className="flex gap-4 pb-3 border-b border-[#D8DEE8]/50 last:border-0">
                  <span className="text-sm text-[#64748B] w-40 flex-shrink-0">{item.label}</span>
                  <span className="text-sm font-medium text-[#0F172A]">{item.value}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Step 5: Publish */}
        {step === 4 && (
          <GlassCard className="p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#EBF1FA] flex items-center justify-center mx-auto mb-5">
              <Zap className="w-8 h-8 text-[#1A4B8F]" />
            </div>
            <h2 className="text-xl font-bold text-[#0F172A] mb-2">Ready to go live?</h2>
            <p className="text-[#64748B] mb-6">
              Your task "<strong>{form.title}</strong>" will be published to the marketplace immediately.
              Contributors will be able to start submitting work right away.
            </p>
            <div className="p-4 rounded-xl mb-6 space-y-2" style={{ background: '#F5F7FA', border: '1px solid #D8DEE8' }}>
              <div className="flex justify-between text-sm">
                <span className="text-[#64748B]">Reward per submission</span>
                <span className="font-bold text-[#1A4B8F]">{form.reward} TCR</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#64748B]">Total slots</span>
                <span className="font-medium text-[#0F172A]">{form.slots}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-[#D8DEE8] pt-2">
                <span className="font-bold text-[#0F172A]">Max budget</span>
                <span className="font-black text-[#1A4B8F]">{totalBudget.toLocaleString()} TCR</span>
              </div>
            </div>
            {error && <p className="text-sm text-[#DC2626] mb-4">{error}</p>}
            <Button size="lg" className="w-full" loading={publishing} icon={<CheckCircle className="w-5 h-5" />} onClick={handlePublish}>
              Publish Task
            </Button>
          </GlassCard>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button variant="secondary" onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/app/business')}>
            {step > 0 ? '← Back' : 'Cancel'}
          </Button>
          {step < STEPS.length - 1 && (
            <Button onClick={() => setStep(s => s + 1)}>
              Continue →
            </Button>
          )}
        </div>
      </div>
    </AppShell>
  );
}
