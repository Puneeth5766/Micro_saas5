'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button, Card, ProgressBar, StepIndicator, UploadZone } from '@aether/ui';

const profileSchema = z.object({
  companyName: z.string().min(2, 'Company Name is required'),
  companyDescription: z.string().min(10, 'Description is required'),
  servicesInput: z.string().min(2, 'At least one service is required'),
  pastProjects: z.string().min(10, 'Past projects are required'),
  teamSize: z.string().min(1, 'Team size is required'),
  location: z.string().min(2, 'Location is required'),
});

type ProfileValues = z.infer<typeof profileSchema>;

type ProjectPreview = {
  projectId: string;
  sectionCount: number;
  pageCount: number;
  title?: string;
  sections?: { id: string; title: string }[];
};

const providers = [
  { label: 'GPT-4o', value: 'openai', model: 'gpt-4o', estimate: '$0.42 / response' },
  { label: 'Gemini 2.5 Pro', value: 'google', model: 'gemini-2.5-pro', estimate: '$0.31 / response' },
  { label: 'Claude Sonnet', value: 'anthropic', model: 'claude-3-7-sonnet', estimate: '$0.38 / response' },
];

function countPdfPages(file: File): Promise<number> {
  return file.arrayBuffer().then((buffer) => {
    const view = new Uint8Array(buffer);
    let text = '';
    const chunkSize = 20000;
    for (let i = 0; i < view.length; i += chunkSize) {
      const slice = view.slice(i, Math.min(i + chunkSize, view.length));
      text += new TextDecoder('latin1').decode(slice);
    }
    const matches = text.match(/\/Type\s*\/Page\b/g);
    return matches?.length || 0;
  });
}

export default function NewRFPPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [estimatedPages, setEstimatedPages] = useState(0);
  const [provider, setProvider] = useState(providers[0]);
  const [preview, setPreview] = useState<ProjectPreview | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      companyName: '',
      companyDescription: '',
      servicesInput: '',
      pastProjects: '',
      teamSize: '',
      location: '',
    },
  });

  const services = useMemo(
    () =>
      getValues('servicesInput')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    [getValues]
  );

  async function handleFileSelect(selected: File) {
    setFile(selected);
    const pages = await countPdfPages(selected);
    setEstimatedPages(pages);
  }

  async function prepareProject() {
    if (!file) return;
    setIsUploading(true);
    try {
      const values = getValues();
      const payload = new FormData();
      payload.append('rfpFile', file);
      payload.append('companyName', values.companyName);
      payload.append('companyDescription', values.companyDescription);
      payload.append('services', JSON.stringify(values.servicesInput.split(',').map((item) => item.trim()).filter(Boolean)));
      payload.append('pastProjects', values.pastProjects);
      payload.append('teamSize', values.teamSize);
      payload.append('location', values.location);

      const uploadResponse = await fetch('/api/rfp/upload', {
        method: 'POST',
        body: payload,
      });

      if (!uploadResponse.ok) throw new Error('Failed to upload RFP');

      const uploadData = (await uploadResponse.json()) as ProjectPreview;
      const detailsResponse = await fetch(`/api/rfp/${uploadData.projectId}`);
      const details = detailsResponse.ok ? await detailsResponse.json() : null;

      setPreview({
        ...uploadData,
        title: details?.project?.title,
        sections: details?.project?.sections || [],
      });
    } finally {
      setIsUploading(false);
    }
  }

  async function runGeneration() {
    if (!preview?.projectId) return;

    setIsGenerating(true);
    setGenerationProgress(10);

    const timer = window.setInterval(() => {
      setGenerationProgress((prev) => (prev >= 90 ? prev : prev + 8));
    }, 900);

    try {
      const response = await fetch(`/api/rfp/${preview.projectId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: provider.value, model: provider.model }),
      });

      if (!response.ok) throw new Error('Generation failed');

      setGenerationProgress(100);
      window.clearInterval(timer);
      router.push(`/dashboard/rfps/${preview.projectId}`);
    } catch {
      window.clearInterval(timer);
      setIsGenerating(false);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">New RFP Response</h2>

      <Card className="p-4">
        <StepIndicator steps={['Upload RFP', 'Company Profile', 'Review + Generate']} currentStep={step} />
      </Card>

      {step === 1 && (
        <Card className="space-y-4 p-4">
          <UploadZone
            accept="application/pdf"
            maxSize={10 * 1024 * 1024}
            onFileSelect={(selectedFile: File) => handleFileSelect(selectedFile)}
          />
          {file && (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
              <p className="font-medium">{file.name}</p>
              <p className="text-slate-600">Estimated pages: {estimatedPages || 'Calculating...'}</p>
            </div>
          )}
          <Button disabled={!file} onClick={() => setStep(2)}>
            Continue
          </Button>
        </Card>
      )}

      {step === 2 && (
        <Card className="p-4">
          <form className="space-y-3" onSubmit={handleSubmit(() => setStep(3))}>
            <div>
              <label className="mb-1 block text-sm font-medium">Company Name</label>
              <input className="w-full rounded border px-3 py-2" {...register('companyName')} />
              {errors.companyName && <p className="text-xs text-red-600">{errors.companyName.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Description</label>
              <textarea className="w-full rounded border px-3 py-2" rows={4} {...register('companyDescription')} />
              {errors.companyDescription && <p className="text-xs text-red-600">{errors.companyDescription.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Services (comma-separated)</label>
              <input className="w-full rounded border px-3 py-2" {...register('servicesInput')} />
              {errors.servicesInput && <p className="text-xs text-red-600">{errors.servicesInput.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Past Projects</label>
              <textarea className="w-full rounded border px-3 py-2" rows={4} {...register('pastProjects')} />
              {errors.pastProjects && <p className="text-xs text-red-600">{errors.pastProjects.message}</p>}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Team Size</label>
                <select className="w-full rounded border px-3 py-2" {...register('teamSize')}>
                  <option value="">Select...</option>
                  <option value="1-10">1-10</option>
                  <option value="11-50">11-50</option>
                  <option value="51-200">51-200</option>
                  <option value="200+">200+</option>
                </select>
                {errors.teamSize && <p className="text-xs text-red-600">{errors.teamSize.message}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Location</label>
                <input className="w-full rounded border px-3 py-2" {...register('location')} />
                {errors.location && <p className="text-xs text-red-600">{errors.location.message}</p>}
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button type="submit">Continue</Button>
            </div>
          </form>
        </Card>
      )}

      {step === 3 && (
        <Card className="space-y-4 p-4">
          {!preview ? (
            <div className="space-y-3">
              <Button onClick={prepareProject} disabled={isUploading}>
                {isUploading ? 'Preparing project...' : 'Prepare Review'}
              </Button>
              {isUploading && <div className="h-6 animate-pulse rounded bg-slate-100" />}
            </div>
          ) : (
            <>
              <div className="rounded-md border p-3 text-sm">
                <p>
                  <span className="font-medium">Title:</span> {preview.title || file?.name}
                </p>
                <p>
                  <span className="font-medium">Page count:</span> {preview.pageCount}
                </p>
                <p>
                  <span className="font-medium">Detected sections:</span> {preview.sectionCount}
                </p>
                <ul className="mt-2 list-disc pl-5 text-slate-700">
                  {(preview.sections || []).slice(0, 12).map((section) => (
                    <li key={section.id}>{section.title}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">Select AI Provider</p>
                <div className="space-y-2">
                  {providers.map((option) => (
                    <label key={option.value} className="flex items-center justify-between rounded border p-3 text-sm">
                      <span className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="provider"
                          checked={provider.value === option.value}
                          onChange={() => setProvider(option)}
                        />
                        {option.label}
                      </span>
                      <span className="text-slate-500">{option.estimate}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button onClick={runGeneration} disabled={isGenerating}>
                {isGenerating ? 'Generating...' : 'Generate RFP Response'}
              </Button>

              {isGenerating && (
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">Processing section-by-section...</p>
                  <ProgressBar value={generationProgress} max={100} />
                </div>
              )}

              <div className="text-xs text-slate-500">Services: {services.join(', ') || 'None provided'}</div>
            </>
          )}
        </Card>
      )}
    </div>
  );
}
