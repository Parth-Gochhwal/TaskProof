import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Input, Tabs, PageHeader, EmptyState } from '../../components/ui/index';
import { TaskCard } from '../../components/ui/TaskCard';
import { taskService } from '../../services/taskService';
import { useApi } from '../../hooks/useApi';

const CATEGORY_TABS = [
  { id: 'all', label: 'All Tasks' },
  { id: 'ai-evaluation', label: 'AI & Data' },
  { id: 'research', label: 'Research' },
  { id: 'content-review', label: 'Content' },
  { id: 'testing', label: 'Testing' },
  { id: 'survey', label: 'Surveys' },
  { id: 'data-labeling', label: 'Labeling' },
];

export default function TaskMarketplace() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const { data: allTasks = [], isLoading } = useApi(() => taskService.getAll());

  const filtered = useMemo(() => {
    return allTasks.filter(t => {
      const matchesCat = category === 'all' || t.category === category;
      const matchesQ = !query ||
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.description.toLowerCase().includes(query.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
      return matchesCat && matchesQ;
    });
  }, [allTasks, category, query]);

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto">
        <PageHeader
          title="Task Marketplace"
          subtitle={isLoading ? "Loading tasks..." : `${allTasks.length} tasks available`}
        />

        {/* Search */}
        <div className="mb-5">
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search tasks, skills, or keywords..."
            icon={<Search className="w-4 h-4" />}
            className="h-12 text-base"
          />
        </div>

        {/* Category filter */}
        <div className="mb-6 overflow-x-auto pb-2">
          <Tabs
            tabs={CATEGORY_TABS.map(t => ({ 
              ...t, 
              count: t.id === 'all' ? allTasks.length : allTasks.filter(task => task.category === t.id).length 
            }))}
            active={category}
            onChange={setCategory}
          />
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 gap-4">
             {/* Skeletons could go here */}
             <div className="h-48 bg-white/5 backdrop-blur rounded-2xl animate-pulse" />
             <div className="h-48 bg-white/5 backdrop-blur rounded-2xl animate-pulse" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Search className="w-12 h-12" />}
            title="No tasks found"
            description="Try a different search or category filter."
          />
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {filtered.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
