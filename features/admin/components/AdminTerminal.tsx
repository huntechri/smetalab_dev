'use client';

import { useEffect, useMemo, useState } from 'react';

import { AdminTerminalPreview } from '@/shared/ui/admin-surface';

export function AdminTerminal() {
  const [terminalStep, setTerminalStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const terminalSteps = useMemo(() => [
    'git clone https://github.com/nextjs/saas-starter',
    'pnpm install',
    'pnpm db:setup',
    'pnpm db:migrate',
    'pnpm db:seed',
    'pnpm dev 🎉',
  ], []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTerminalStep((prev) =>
        prev < terminalSteps.length - 1 ? prev + 1 : prev
      );
    }, 500);

    return () => clearTimeout(timer);
  }, [terminalStep, terminalSteps.length]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(terminalSteps.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AdminTerminalPreview
      steps={terminalSteps}
      activeStep={terminalStep}
      copied={copied}
      onCopy={copyToClipboard}
    />
  );
}
