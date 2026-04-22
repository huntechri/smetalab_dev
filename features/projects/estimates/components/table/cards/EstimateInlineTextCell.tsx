import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

interface EstimateInlineTextCellProps {
  value: string;
  ariaLabel: string;
  title?: string;
  className: string;
  onCommit: (value: string) => Promise<void>;
}

export function EstimateInlineTextCell({
  value,
  ariaLabel,
  title,
  className,
  onCommit,
}: EstimateInlineTextCellProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  const submit = async () => {
    if (draft.trim() === '') {
      cancel();
      return;
    }

    await onCommit(draft);
    setEditing(false);
  };

  if (!editing) {
    return (
      <Button
        variant="ghost"
        aria-label={ariaLabel}
        title={title}
        className={className}
        onClick={() => {
          setDraft(value);
          setEditing(true);
        }}
      >
        {value}
      </Button>
    );
  }

  return (
    <Input
      aria-label={ariaLabel}
      autoFocus
      size="xs"
      value={draft}
      className={className}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => void submit()}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          void submit();
        }
        if (event.key === 'Escape') {
          cancel();
        }
      }}
    />
  );
}
