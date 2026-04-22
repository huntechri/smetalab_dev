import { useRef, useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

interface EstimateInlineNumberCellProps {
  value: number;
  ariaLabel: string;
  className: string;
  onCommit: (value: string) => Promise<void>;
}

export function EstimateInlineNumberCell({
  value,
  ariaLabel,
  className,
  onCommit,
}: EstimateInlineNumberCellProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const wasClearedOnFocus = useRef(false);

  const cancel = () => {
    setDraft(String(value));
    setEditing(false);
  };

  const submit = async () => {
    if (draft === '') {
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
        className={className}
        onClick={() => {
          wasClearedOnFocus.current = false;
          setDraft(String(value));
          setEditing(true);
        }}
      >
        {String(value)}
      </Button>
    );
  }

  return (
    <Input
      aria-label={ariaLabel}
      autoFocus
      numeric
      type="number"
      size="xs"
      textAlign="right"
      value={draft}
      className={className}
      onChange={(event) => setDraft(event.target.value)}
      onFocus={() => {
        if (wasClearedOnFocus.current) {
          return;
        }

        wasClearedOnFocus.current = true;
        setDraft('');
      }}
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
