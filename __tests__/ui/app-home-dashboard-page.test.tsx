import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import Page from '@/app/(workspace)/app/page';
import { getTeamForUser } from '@/lib/data/db/queries';
import { HomeDashboardKpiService } from '@/lib/services/home-dashboard-kpi.service';
import { HomePerformanceDynamicsService } from '@/lib/services/home-performance-dynamics.service';

const appHomeScreenSpy = vi.fn(
    (props: { kpi: { revenue: number }; dynamics: Array<{ date: string }>; showDynamicsChart: boolean }) => (
        <div data-testid="app-home-screen">
            {props.kpi.revenue}:{props.dynamics.length}:{props.showDynamicsChart ? 'show' : 'hide'}
        </div>
    ),
);

vi.mock('@/features/dashboard', () => ({
    AppHomeScreen: (props: { kpi: { revenue: number }; dynamics: Array<{ date: string }>; showDynamicsChart: boolean }) => appHomeScreenSpy(props),
}));

vi.mock('@/lib/data/db/queries', () => ({
    getTeamForUser: vi.fn(async () => ({ id: 7, name: 'Team 7' })),
}));

vi.mock('@/lib/services/home-dashboard-kpi.service', () => ({
    HomeDashboardKpiService: {
        getByTeamId: vi.fn(async () => ({
            revenue: 180000,
            profit: 25000,
            progress: 61,
            remainingDays: 14,
        })),
    },
}));

vi.mock('@/lib/services/home-performance-dynamics.service', () => ({
    HomePerformanceDynamicsService: {
        listByTeamId: vi.fn(async () => ([
            {
                date: '2026-02-01',
                executionPlan: 1000,
                executionFact: 800,
                procurementPlan: 400,
                procurementFact: 320,
            },
        ])),
        hasVisibleEstimatesByTeamId: vi.fn(async () => true),
    },
}));

beforeEach(() => {
    appHomeScreenSpy.mockClear();
    vi.mocked(getTeamForUser).mockClear();
    vi.mocked(HomeDashboardKpiService.getByTeamId).mockClear();
    vi.mocked(HomePerformanceDynamicsService.listByTeamId).mockClear();
    vi.mocked(HomePerformanceDynamicsService.hasVisibleEstimatesByTeamId).mockClear();
});

afterEach(() => {
    cleanup();
});

test('loads consolidated home dashboard data for current team', async () => {
    const pageComponent = await Page();

    render(pageComponent as React.ReactElement);

    expect(screen.getByTestId('app-home-screen')).toHaveTextContent('180000:1:show');
    expect(getTeamForUser).toHaveBeenCalledTimes(1);
    expect(HomeDashboardKpiService.getByTeamId).toHaveBeenCalledWith(7);
    expect(HomePerformanceDynamicsService.listByTeamId).toHaveBeenCalledWith(7);
    expect(HomePerformanceDynamicsService.hasVisibleEstimatesByTeamId).toHaveBeenCalledWith(7);
    expect(appHomeScreenSpy).toHaveBeenCalledTimes(1);
});

test('returns empty dashboard values when team is missing', async () => {
    vi.mocked(getTeamForUser).mockResolvedValueOnce(null);

    const pageComponent = await Page();

    render(pageComponent as React.ReactElement);

    expect(screen.getByTestId('app-home-screen')).toHaveTextContent('0:0:hide');
    expect(HomeDashboardKpiService.getByTeamId).not.toHaveBeenCalled();
    expect(HomePerformanceDynamicsService.listByTeamId).not.toHaveBeenCalled();
    expect(HomePerformanceDynamicsService.hasVisibleEstimatesByTeamId).not.toHaveBeenCalled();
});
