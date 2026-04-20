import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { EstimateParams } from '@/features/projects/estimates/components/tabs/EstimateParams';

const saveMock = vi.fn();
vi.mock('@/features/projects/estimates/repository/room-params.actions', () => ({
    roomParamsActionsRepo: {
        save: (...args: unknown[]) => saveMock(...args),
    },
}));

vi.mock('@/components/providers/use-app-toast', () => ({
    useAppToast: () => ({ toast: vi.fn() }),
}));

describe('EstimateParams', () => {
    beforeEach(() => {
        saveMock.mockReset();
        saveMock.mockResolvedValue({ count: 1 });
    });

    it('renders and does not autosave on input change', () => {
        render(<EstimateParams estimateId="a66be2ab-7cf8-46e9-bce8-734293d3883d" initialRows={[]} />);

        fireEvent.change(screen.getAllByRole('spinbutton')[0], { target: { value: '12' } });

        expect(saveMock).not.toHaveBeenCalled();
    });

    it('saves only on save button click', async () => {
        render(<EstimateParams estimateId="a66be2ab-7cf8-46e9-bce8-734293d3883d" initialRows={[]} />);

        fireEvent.click(screen.getAllByRole('button', { name: /сохранить/i })[0]);

        expect(saveMock).toHaveBeenCalledTimes(1);
    });
});
