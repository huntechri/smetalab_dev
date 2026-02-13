'use client';

import { Input } from '@/components/ui/input';
import { useState } from 'react';

export function EditableCell({
    value,
    onCommit,
    type = 'text',
    disabled,
}: {
    value: string | number;
    onCommit: (value: string) => Promise<void>;
    type?: 'text' | 'number';
    disabled?: boolean;
}) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(String(value));

    const cancel = () => {
        setDraft(String(value));
        setEditing(false);
    };

    const submit = async () => {
        if (disabled) return;
        await onCommit(draft);
        setEditing(false);
    };

    if (!editing) {
        return (
            <button className="text-left w-full hover:underline" disabled={disabled} onClick={() => setEditing(true)}>
                {String(value)}
            </button>
        );
    }

    return (
        <Input
            autoFocus
            value={draft}
            type={type}
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
