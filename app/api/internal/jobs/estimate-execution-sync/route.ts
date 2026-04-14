import { NextResponse } from 'next/server';
import { EstimateExecutionService } from '@/lib/services/estimate-execution.service';

const isAuthorized = (request: Request) => {
    const secret = process.env.CRON_SECRET?.trim();
    if (!secret) {
        return false;
    }

    const header = request.headers.get('authorization');
    return header === `Bearer ${secret}`;
};

export async function POST(request: Request) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const synced = await EstimateExecutionService.runStaleSyncSafetyJob(100);
    return NextResponse.json({ success: true, synced });
}
