const MIN_HUE = 0;
const MAX_HUE = 120;

function clampProgress(progress: number): number {
    if (!Number.isFinite(progress)) {
        return 0;
    }

    return Math.min(100, Math.max(0, progress));
}

export function getProgressGradient(progress: number): string {
    const normalizedProgress = clampProgress(progress);
    const baseHue = Math.round((normalizedProgress / 100) * MAX_HUE);
    const startHue = Math.max(MIN_HUE, baseHue - 16);
    const endHue = Math.min(MAX_HUE, baseHue + 10);

    return `linear-gradient(90deg, hsl(${startHue} 82% 55%) 0%, hsl(${endHue} 75% 42%) 100%)`;
}
