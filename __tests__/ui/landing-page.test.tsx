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
        expect(signInButtons[0]).toHaveAttribute('data-variant', 'ghost');
        expect(signInButtons[0]).not.toHaveAttribute('data-size');

        const mobileSignInButton = signInButtons[1];
        expect(mobileSignInButton).toHaveAttribute('data-variant', 'outline');
        expect(mobileSignInButton).not.toHaveAttribute('data-size');

        const scenarioButton = screen.getByRole('button', { name: 'Сценарий внедрения' });
        expect(scenarioButton).toHaveAttribute('data-variant', 'outline');
        expect(scenarioButton).toHaveAttribute('data-size', 'xl');
    });
});
