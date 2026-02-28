'use client';

import Link from 'next/link';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';

import { Button, Card, StepIndicator } from '@aether/ui';

const pains = [
  '40+ hours per proposal',
  'Miss deadlines and lose shortlist opportunities',
  'Generic responses that lose to specialists',
];

const comparisonRows = [
  { feature: 'Price', aether: 'From $0 to flexible plans', loopio: 'Enterprise annual contracts', rfpio: 'Enterprise annual contracts' },
  { feature: 'Target market', aether: 'Agencies, SaaS, consulting teams', loopio: 'Large enterprises', rfpio: 'Large enterprises' },
  { feature: 'AI depth', aether: 'Section-level generation + regeneration', loopio: 'Library-assisted drafting', rfpio: 'Template-centric suggestions' },
  { feature: 'Setup time', aether: 'Minutes', loopio: 'Weeks', rfpio: 'Weeks' },
  { feature: 'Export formats', aether: 'DOCX', loopio: 'PDF/DOCX', rfpio: 'PDF/DOCX' },
  { feature: 'Section regeneration', aether: 'Yes, per section', loopio: 'Limited', rfpio: 'Limited' },
];

const pricingCards = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for trying your first RFP workflow.',
    features: ['1 active RFP project', 'Basic AI generation', 'DOCX export', 'Email support'],
    cta: 'Start Free',
  },
  {
    name: 'Pro',
    price: '$49/mo',
    description: 'For teams that respond to RFPs weekly.',
    features: ['Unlimited active projects', 'Advanced AI generation', 'Section regeneration', 'Priority support'],
    cta: 'Upgrade to Pro',
  },
  {
    name: 'Pay-per-Doc',
    price: '$19/doc',
    description: 'Best for occasional high-value opportunities.',
    features: ['No subscription required', 'One complete generation flow', 'DOCX export included', '7-day revision window'],
    cta: 'Buy Credits',
  },
];

const faqs = [
  {
    question: 'What file types are supported?',
    answer:
      'You can upload PDF RFP documents up to 10MB. We parse each document, detect sections, and prepare it for AI-assisted response drafting.',
  },
  {
    question: 'How accurate are the AI responses?',
    answer:
      'Responses are optimized for clarity, relevance, and structure. You should still review each section to align tone, facts, and client-specific claims before submission.',
  },
  {
    question: 'Can I edit the generated responses?',
    answer:
      'Yes. Every section is fully editable, and you can regenerate individual sections with custom guidance when you want a different angle or level of detail.',
  },
  {
    question: 'How is my data handled?',
    answer:
      'Your data is stored securely and isolated per account. We use your uploaded content only to generate your responses and improve product reliability.',
  },
  {
    question: 'What happens when I run out of credits?',
    answer:
      'You can upgrade to Pro or purchase additional documents. Your existing projects remain accessible for editing and export.',
  },
];

export default function MarketingPage() {
  return (
    <div>
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-12 md:px-6 md:pb-20 md:pt-16">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <p className="mb-3 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              Join 500+ agencies and SaaS vendors
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
              Respond to RFPs 5x Faster With AI
            </h1>
            <p className="mt-4 text-base text-slate-600 md:text-lg">
              Stop spending 40+ hours on proposals. Upload your RFP, add your company profile, and get a structured,
              section-by-section response in minutes.
            </p>
            <div className="mt-6">
              <Link href="/auth/signup">
                <Button size="lg">Generate My First RFP Free</Button>
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-dashed border-indigo-300 bg-indigo-50/50 p-4">
            <div className="flex min-h-[280px] items-center justify-center rounded-xl border bg-white text-sm text-slate-500 md:min-h-[360px]">
              [image of RFP editor dashboard UI — placeholder]
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-14">
        <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
          <h2 className="text-2xl font-bold md:text-3xl">The Old Way Is Killing Your Win Rate</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {pains.map((pain) => (
              <Card key={pain} className="p-5">
                <p className="text-base font-semibold text-slate-900">{pain}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6">
        <h2 className="text-2xl font-bold md:text-3xl">How It Works</h2>
        <div className="mt-6 overflow-x-auto">
          <StepIndicator
            steps={[
              'Upload RFP PDF',
              'Add company profile once',
              'AI generates section-by-section response',
              'Edit, regenerate, export DOCX',
            ]}
            currentStep={4}
          />
        </div>
      </section>

      <section className="bg-slate-50 py-14">
        <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
          <h2 className="text-2xl font-bold md:text-3xl">How We Compare</h2>
          <div className="mt-6 overflow-x-auto rounded-xl border bg-white">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100 text-left">
                  <th className="px-4 py-3 font-semibold">Feature</th>
                  <th className="border-x-2 border-indigo-500 px-4 py-3 font-semibold text-indigo-700">Aether RFP</th>
                  <th className="px-4 py-3 font-semibold">Loopio</th>
                  <th className="px-4 py-3 font-semibold">RFPIO</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.feature} className="border-t">
                    <td className="px-4 py-3 font-medium">{row.feature}</td>
                    <td className="border-x-2 border-indigo-500 bg-indigo-50/40 px-4 py-3">{row.aether}</td>
                    <td className="px-4 py-3">{row.loopio}</td>
                    <td className="px-4 py-3">{row.rfpio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold md:text-3xl">Pricing</h2>
          <div className="inline-flex rounded-full border bg-white p-1 text-sm">
            <button className="rounded-full bg-indigo-600 px-3 py-1 font-medium text-white">Monthly</button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {pricingCards.map((plan) => (
            <Card key={plan.name} className="p-5">
              <p className="text-sm font-semibold text-indigo-600">{plan.name}</p>
              <p className="mt-1 text-2xl font-bold">{plan.price}</p>
              <p className="mt-2 text-sm text-slate-600">{plan.description}</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                {plan.features.map((feature) => (
                  <li key={feature}>• {feature}</li>
                ))}
              </ul>
              <Link href="/auth/signup" className="mt-5 inline-block">
                <Button className="w-full">{plan.cta}</Button>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-14">
        <div className="mx-auto w-full max-w-4xl px-4 md:px-6">
          <h2 className="text-2xl font-bold md:text-3xl">Frequently Asked Questions</h2>
          <Accordion.Root type="single" collapsible className="mt-6 space-y-3">
            {faqs.map((item, idx) => (
              <Accordion.Item key={item.question} value={`item-${idx}`} className="rounded-lg border bg-white">
                <Accordion.Header>
                  <Accordion.Trigger className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold">
                    {item.question}
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="px-4 pb-4 text-sm text-slate-600">{item.answer}</Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 text-center md:px-6">
        <h2 className="text-3xl font-bold">Start Winning More RFPs Today</h2>
        <p className="mx-auto mt-3 max-w-2xl text-slate-600">
          Replace proposal chaos with a repeatable, high-quality response workflow your team can trust.
        </p>
        <div className="mt-6">
          <Link href="/auth/signup">
            <Button size="lg">Get Started Free</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
