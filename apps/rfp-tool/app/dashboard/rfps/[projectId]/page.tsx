'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';

import { Badge, Button, Card, ProgressBar, Toast } from '@aether/ui';

type Section = {
  id: string;
  title: string;
  rfpRequirement: string;
  generatedResponse: string;
  status: 'pending' | 'generating' | 'done' | 'failed';
  tokensUsed: number;
};

type Project = {
  _id: string;
  title: string;
  status: 'draft' | 'processing' | 'completed' | 'failed';
  totalCost: number;
  totalTokensUsed: number;
  sections: Section[];
};

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch project');
  return response.json() as Promise<{ project: Project }>;
};

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-12 animate-pulse rounded bg-slate-100" />
      <div className="h-72 animate-pulse rounded bg-slate-100" />
    </div>
  );
}

export default function ProjectDetailPage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [showRequirement, setShowRequirement] = useState(true);
  const [instruction, setInstruction] = useState('');
  const [toast, setToast] = useState<string>('');

  const { data, isLoading, mutate } = useSWR(`/api/rfp/${params.projectId}`, fetcher);

  const project = data?.project;
  const sections = project?.sections || [];
  const activeSection = useMemo(() => {
    const fallback = sections[0];
    return sections.find((item) => item.id === selectedSectionId) || fallback;
  }, [sections, selectedSectionId]);

  async function saveSectionEdit(newResponse: string) {
    if (!project || !activeSection) return;

    const previous = data;
    if (!previous) return;

    const optimisticProject = {
      ...project,
      sections: project.sections.map((section) =>
        section.id === activeSection.id ? { ...section, generatedResponse: newResponse } : section
      ),
    };

    await mutate({ project: optimisticProject }, false);

    const response = await fetch(`/api/rfp/${project._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sectionId: activeSection.id, editedResponse: newResponse }),
    });

    if (!response.ok) {
      await mutate(previous, false);
      setToast('Failed to save section changes.');
      return;
    }

    await mutate();
    setToast('Saved changes');
  }

  async function regenerateSection() {
    if (!project || !activeSection) return;

    const response = await fetch(`/api/rfp/${project._id}/regenerate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sectionId: activeSection.id, instruction, provider: 'openai' }),
    });

    if (!response.ok) {
      setToast('Failed to regenerate section.');
      return;
    }

    setInstruction('');
    await mutate();
    setToast('Section regenerated');
  }

  async function regenerateAll() {
    if (!project) return;

    const response = await fetch(`/api/rfp/${project._id}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: 'openai', model: 'gpt-4o' }),
    });

    if (!response.ok) {
      setToast('Failed to regenerate all sections.');
      return;
    }

    await mutate();
    setToast('All sections regenerated');
  }

  async function exportDocx() {
    if (!project) return;

    const response = await fetch(`/api/rfp/${project._id}/export`);
    if (!response.ok) {
      setToast('Export failed.');
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rfp-response-${project.title.replace(/[^a-zA-Z0-9-_]+/g, '-')}.docx`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  if (isLoading) return <LoadingSkeleton />;
  if (!project) return <p className="text-sm text-slate-600">Project not found.</p>;

  const doneSections = sections.filter((item) => item.status === 'done').length;
  const progress = sections.length ? Math.round((doneSections / sections.length) * 100) : 0;

  return (
    <div className="space-y-4">
      {toast && <Toast onClose={() => setToast('')}>{toast}</Toast>}

      <Card className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">{project.title}</h2>
          <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
            <Badge>{project.status}</Badge>
            <span>Cost: ${project.totalCost.toFixed(2)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => router.push('/dashboard/rfps')}>
            Back
          </Button>
          <Button onClick={exportDocx} disabled={project.status !== 'completed'}>
            Export DOCX
          </Button>
        </div>
      </Card>

      <Card className="p-4">
        <p className="mb-2 text-sm text-slate-600">Overall generation progress</p>
        <ProgressBar value={progress} max={100} />
      </Card>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="p-3 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-medium">Sections</h3>
            <Button size="sm" variant="secondary" onClick={regenerateAll}>
              Regenerate All
            </Button>
          </div>

          <div className="hidden space-y-2 lg:block">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setSelectedSectionId(section.id)}
                className={`w-full rounded border p-2 text-left text-sm ${
                  activeSection?.id === section.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="line-clamp-1">{section.title}</span>
                  <Badge>{section.status}</Badge>
                </div>
              </button>
            ))}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setSelectedSectionId(section.id)}
                className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs ${
                  activeSection?.id === section.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200'
                }`}
              >
                {section.title}
              </button>
            ))}
          </div>
        </Card>

        <Card className="space-y-3 p-4 lg:col-span-3">
          {!activeSection ? (
            <p className="text-sm text-slate-500">No section selected.</p>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-semibold">{activeSection.title}</h3>
                <Badge>{activeSection.tokensUsed} tokens</Badge>
              </div>

              <button
                className="text-sm text-indigo-600 hover:underline"
                onClick={() => setShowRequirement((prev) => !prev)}
              >
                {showRequirement ? 'Hide' : 'Show'} RFP requirement
              </button>

              {showRequirement && (
                <div className="rounded-md border bg-slate-50 p-3 text-sm text-slate-700">{activeSection.rfpRequirement}</div>
              )}

              <textarea
                key={activeSection.id}
                defaultValue={activeSection.generatedResponse}
                onBlur={(e) => saveSectionEdit(e.target.value)}
                className="min-h-[260px] w-full rounded-md border px-3 py-2 text-sm"
              />

              <div className="flex flex-col gap-2 md:flex-row">
                <input
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  placeholder="Optional instruction for regeneration"
                  className="w-full rounded-md border px-3 py-2 text-sm"
                />
                <Button onClick={regenerateSection}>Regenerate This Section</Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
