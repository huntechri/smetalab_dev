import { NextRequest, NextResponse } from 'next/server';
import { getTeamForUser, getUser } from '@/lib/data/db/queries';
import { EstimateTabExportService } from '@/lib/services/estimate-tab-export.service';

export async function GET(_request: NextRequest, context: { params: Promise<{ estimateId: string }> }) {
    const user = await getUser();
    if (!user) {
        return NextResponse.json({ success: false, message: 'Пользователь не найден' }, { status: 401 });
    }

    const team = await getTeamForUser();
    if (!team) {
        return NextResponse.json({ success: false, message: 'Команда не найдена' }, { status: 404 });
    }

    const { estimateId } = await context.params;
    const result = await EstimateTabExportService.exportExecutionXlsx(team.id, estimateId);

    if (!result.success) {
        const status = result.error.code === 'NOT_FOUND' ? 404 : 400;
        return NextResponse.json({ success: false, message: result.error.message }, { status });
    }

    return new NextResponse(new Uint8Array(result.data.buffer), {
        status: 200,
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="${result.data.filename}"`,
            'Cache-Control': 'no-store',
        },
    });
}
