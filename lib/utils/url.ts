const DEFAULT_BASE_URL = 'http://localhost:3000';
const DEFAULT_INVITATION_BASE_URL = 'https://smetalabv3.vercel.app';

function normalizeBaseUrl(url: string): string {
    return url.replace(/\/$/, '');
}

export function getBaseUrl() {
    if (process.env.BASE_URL) {
        return normalizeBaseUrl(process.env.BASE_URL);
    }

    if (process.env.RENDER_EXTERNAL_URL) {
        return normalizeBaseUrl(process.env.RENDER_EXTERNAL_URL);
    }

    if (process.env.VERCEL_URL) {
        return normalizeBaseUrl(`https://${process.env.VERCEL_URL}`);
    }

    return DEFAULT_BASE_URL;
}

export function getInvitationBaseUrl() {
    if (process.env.INVITATION_BASE_URL) {
        return normalizeBaseUrl(process.env.INVITATION_BASE_URL);
    }

    if (process.env.BASE_URL) {
        return normalizeBaseUrl(process.env.BASE_URL);
    }

    return DEFAULT_INVITATION_BASE_URL;
}
