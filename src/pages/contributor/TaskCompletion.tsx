import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, Shield, ChevronRight, AlertCircle } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { GlassCard, Button, PageHeader, ProgressBar, Textarea } from '../../components/ui/index';
import { taskService } from '../../services/taskService';
import { submissionService } from '../../services/submissionService';
import { useAuth } from '../../context/AuthContext';

export default function TaskCompletion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, contributorProfile, updateContributorProfile } = useAuth();

  const task = id ? taskService.getById(id) : null;

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!task) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto text-center py-20">
          <AlertCircle className="w-16 h-16 text-[#94A3B8] mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Task not found</h2>
          <Button onClick={() => navigate('/app/contributor/tasks')}>Back to Marketplace</Button>
        </div>
      </AppShell>
    );
  }

  const fields = task.inputFields;
  const currentField = fields[step];
  const handleAnswer = (value: string | string[]) => {
    setAnswers(prev => ({ ...prev, [currentField.id]: value }));
    setError('');
  };

  const handleNext = () => {
    if (currentField.required && !answers[currentField.id]) {
      setError('This field is required.');
      return;
    }
    if (step < fields.length - 1) {
      setStep(s => s + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));

    submissionService.create({
      taskId: task.id,
      taskTitle: task.title,
      contributorId: user?.id || '',
      contributorName: user?.name || '',
      contributorLevel: contributorProfile?.level || 1,
      data: answers,
    });

    taskService.decrementSlot(task.id);

    // Add XP
    if (contributorProfile) {
      updateContributorProfile({ xp: contributorProfile.xp + 25 });
    }

    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <AppShell>
        <div className="max-w-lg mx-auto py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-10 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 rounded-full bg-[#DCFCE7] flex items-center justify-center mx-auto mb-5"
            >
              <CheckCircle className="w-10 h-10 text-[#16A34A]" />
            </motion.div>

            <h2 className="text-2xl font-black text-[#0F172A] mb-2">Task Submitted!</h2>
            <p className="text-[#64748B] mb-6">Your submission is under review. You'll be notified once it's verified.</p>

            {/* Potential reward */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl p-5 mb-6"
              style={{ background: 'linear-gradient(135deg, #EBF1FA 0%, #F5F7FA 100%)', border: '1px solid #BFDBFE' }}
            >
              <p className="text-sm text-[#64748B] mb-1">Potential Reward</p>
              <p className="text-3xl font-black text-[#1A4B8F]">+{task.reward} TCR</p>
              <p className="text-xs text-[#94A3B8] mt-1">Released after business verification</p>
            </motion.div>

            {/* Verification steps */}
            <div className="text-left mb-6 space-y-2">
              {['Submission received', 'Automated pre-check running', 'Awaiting business review', 'Reward released on approval'].map((step, i) => (
                <div key={step} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                    ${i < 2 ? 'bg-[#16A34A] text-white' : 'bg-[#E6E9EF] text-[#94A3B8]'}`}>
                    {i < 2 ? '✓' : i + 1}
                  </div>
                  <span className={`text-sm ${i < 2 ? 'text-[#0F172A] font-medium' : 'text-[#94A3B8]'}`}>{step}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <Button className="w-full" onClick={() => navigate('/app/contributor/my-tasks')}>
                View My Tasks
              </Button>
              <Button variant="secondary" className="w-full" onClick={() => navigate('/app/contributor/tasks')}>
                Explore More Tasks
              </Button>
            </div>
          </motion.div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title={task.title}
          subtitle={`Step ${step + 1} of ${fields.length}`}
          backLabel="Exit task"
          onBack={() => navigate(`/app/contributor/tasks/${task.id}`)}
        />

        {/* Progress */}
        <GlassCard className="p-4 mb-6">
          <div className="flex items-center justify-between mb-2 text-sm text-[#64748B]">
            <span>Progress</span>
            <span className="font-medium text-[#1A4B8F]">Field {step + 1}/{fields.length}</span>
          </div>
          <ProgressBar value={step + 1} max={fields.length} />
        </GlassCard>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Work Area */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <GlassCard className="p-6">
                  <div className="mb-2">
                    <span className="text-xs font-medium text-[#1A4B8F] bg-[#EBF1FA] px-2 py-0.5 rounded-full">
                      {currentField.required ? 'Required' : 'Optional'}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-[#0F172A] mb-4">{currentField.label}</h2>

                  {/* Select */}
                  {currentField.type === 'select' && (
                    <div className="space-y-2">
                      {currentField.options?.map(opt => (
                        <button
                          key={opt}
                          onClick={() => handleAnswer(opt)}
                          className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all cursor-pointer
                            ${answers[currentField.id] === opt
                              ? 'bg-[#1A4B8F] text-white border-[#1A4B8F] shadow-[0_4px_14px_rgba(26,75,143,0.25)]'
                              : 'bg-white border-[#D8DEE8] text-[#0F172A] hover:border-[#1A4B8F] hover:bg-[#EBF1FA]'
                            }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Radio */}
                  {currentField.type === 'radio' && (
                    <div className="grid grid-cols-2 gap-2">
                      {currentField.options?.map(opt => (
                        <button
                          key={opt}
                          onClick={() => handleAnswer(opt)}
                          className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all cursor-pointer
                            ${answers[currentField.id] === opt
                              ? 'bg-[#1A4B8F] text-white border-[#1A4B8F] shadow-[0_4px_14px_rgba(26,75,143,0.25)]'
                              : 'bg-white border-[#D8DEE8] text-[#0F172A] hover:border-[#1A4B8F]'
                            }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Rating */}
                  {currentField.type === 'rating' && (
                    <div className="flex gap-2 flex-wrap">
                      {currentField.options?.map(opt => (
                        <button
                          key={opt}
                          onClick={() => handleAnswer(opt)}
                          className={`w-12 h-12 rounded-xl border text-sm font-bold transition-all cursor-pointer
                            ${answers[currentField.id] === opt
                              ? 'bg-[#1A4B8F] text-white border-[#1A4B8F]'
                              : 'bg-white border-[#D8DEE8] text-[#0F172A] hover:border-[#1A4B8F]'
                            }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Textarea */}
                  {currentField.type === 'textarea' && (
                    <Textarea
                      value={(answers[currentField.id] as string) || ''}
                      onChange={e => handleAnswer(e.target.value)}
                      placeholder={currentField.placeholder}
                      className="min-h-[120px]"
                    />
                  )}

                  {/* Text */}
                  {currentField.type === 'text' && (
                    <input
                      value={(answers[currentField.id] as string) || ''}
                      onChange={e => handleAnswer(e.target.value)}
                      placeholder={currentField.placeholder}
                      className="w-full h-10 rounded-xl border border-[#D8DEE8] bg-white px-3 text-sm focus:outline-none focus:border-[#1A4B8F] focus:ring-2 focus:ring-[#1A4B8F]/20 transition-all"
                    />
                  )}

                  {/* Checkbox */}
                  {currentField.type === 'checkbox' && (
                    <div className="space-y-2">
                      {currentField.options?.map(opt => {
                        const selected = (answers[currentField.id] as string[] || []).includes(opt);
                        return (
                          <button
                            key={opt}
                            onClick={() => {
                              const current = (answers[currentField.id] as string[] || []);
                              const next = selected ? current.filter(v => v !== opt) : [...current, opt];
                              handleAnswer(next);
                            }}
                            className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all cursor-pointer flex items-center gap-3
                              ${selected ? 'bg-[#EBF1FA] border-[#1A4B8F] text-[#1A4B8F]' : 'bg-white border-[#D8DEE8] text-[#0F172A] hover:border-[#1A4B8F]'}`}
                          >
                            <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${selected ? 'bg-[#1A4B8F]' : 'border-2 border-[#D8DEE8]'}`}>
                              {selected && <span className="text-white text-xs">✓</span>}
                            </div>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {error && <p className="text-sm text-[#DC2626] mt-3">{error}</p>}

                  <div className="flex items-center justify-between mt-6">
                    <Button
                      variant="ghost"
                      onClick={() => step > 0 ? setStep(s => s - 1) : navigate(`/app/contributor/tasks/${task.id}`)}
                    >
                      {step > 0 ? '← Back' : 'Skip'}
                    </Button>
                    <Button
                      loading={submitting}
                      iconRight={<ChevronRight className="w-4 h-4" />}
                      onClick={handleNext}
                    >
                      {step < fields.length - 1 ? 'Save & Next' : 'Submit'}
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Side Panel */}
          <div className="space-y-4">
            <GlassCard className="p-5">
              <h3 className="text-sm font-bold text-[#0F172A] mb-3">Task Guidelines</h3>
              <div className="space-y-2">
                {task.requirements.filter(r => r.type === 'instruction').map(r => (
                  <p key={r.id} className="text-xs text-[#64748B] flex items-start gap-2">
                    <span className="text-[#1A4B8F] mt-0.5 flex-shrink-0">•</span>
                    {r.description}
                  </p>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#64748B]">Reward</span>
                <span className="font-bold text-[#1A4B8F]">+{task.reward} TCR</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#64748B]">Est. Time</span>
                <span className="text-sm font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                  {task.estimatedMinutes} min
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#94A3B8] mt-3 pt-3 border-t border-[#D8DEE8]/50">
                <Shield className="w-3.5 h-3.5 text-[#1A4B8F]" />
                Reward released after verification
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
