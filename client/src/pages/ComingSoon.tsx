// Generic placeholder for routes whose real implementation lands in later steps.
// Lets the Sidebar NavLinks navigate somewhere instead of 404-ing.
import { Shell } from '@/components/Shell';
import { Sparkles } from 'lucide-react';

interface Props {
  title: string;
  step: string;
}

export default function ComingSoon({ title, step }: Props) {
  return (
    <Shell title={title}>
      <div className="bg-surface border border-border rounded-card p-12 text-center">
        <div className="grid place-items-center w-14 h-14 rounded-full bg-primary-light mx-auto mb-4">
          <Sparkles size={24} className="text-primary-dark" />
        </div>
        <h2 className="font-serif text-xl font-semibold text-text-strong">Coming in {step}</h2>
        <p className="text-sm text-text-muted mt-1.5 max-w-md mx-auto">
          This screen is part of an upcoming build step. The dashboard and chatbot
          CRUD are live now — keep going to land here.
        </p>
      </div>
    </Shell>
  );
}
