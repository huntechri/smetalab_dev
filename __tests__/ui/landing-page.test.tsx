import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import LandingPage from '@/app/page';

describe('LandingPage', () => {
    it('renders interactive navigation and CTA states with visible affordance classes', () => {
        render(<LandingPage />);

        const capabilitiesLinks = screen.getAllByRole('link', { name: 'Возможности' });
        expect(capabilitiesLinks[0]).toHaveClass('hover:bg-white/10');
        expect(capabilitiesLinks[0]).toHaveClass('focus-visible:ring-2');

        const signInButtons = screen.getAllByRole('button', { name: 'Войти' });
        expect(signInButtons[0]).toHaveClass('hover:border-white/30');
        expect(signInButtons[0]).toHaveClass('hover:bg-white/12');

        const mobileSignInButton = signInButtons[1];
        expect(mobileSignInButton).toHaveClass('bg-[#0B0A0F]');
        expect(mobileSignInButton).toHaveClass('!text-white');

        const scenarioButton = screen.getByRole('button', { name: 'Сценарий внедрения' });
        expect(scenarioButton).toHaveClass('hover:border-white/70');
        expect(scenarioButton).toHaveClass('hover:bg-white/20');
    });
});
