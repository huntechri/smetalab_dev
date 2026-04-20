import { NextRequest, NextResponse } from 'next/server';
import { getTeamForUser, getUser } from '@/lib/data/db/queries';
import { EstimateExportService } from '@/lib/services/estimate-export.service';

export async function GET(request: NextRequest, context: { params: Promise<{ estimateId: string }> }) {
    const user = await getUser();
    if (!user) {
        return NextResponse.json({ success: false, message: 'Пользователь не найден' }, { status: 401 });
    }

    const team = await getTeamForUser();
    if (!team) {
        return NextResponse.json({ success: false, message: 'Команда не найдена' }, { status: 404 });
    }

    const { estimateId } = await context.params;
    const formatParam = request.nextUrl.searchParams.get('format') ?? 'xlsx';

    const formatResult = EstimateExportService.validateFormat(formatParam);
    if (!formatResult.success) {
        return NextResponse.json({ success: false, message: formatResult.error.message }, { status: 400 });
    }

    const payloadResult = await EstimateExportService.buildPayload(team.id, estimateId);
    if (!payloadResult.success) {
        const status = payloadResult.error.code === 'NOT_FOUND' ? 404 : 400;
        return NextResponse.json({ success: false, message: payloadResult.error.message }, { status });
    }

    try {
        const payload = payloadResult.data;
        const format = formatResult.data;
        const buffer = format === 'xlsx'
            ? await EstimateExportService.exportXlsx(payload)
            : await EstimateExportService.exportPdf(payload);

        const filename = EstimateExportService.buildFilename(payload, format);
        const contentType = format === 'xlsx'
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'application/pdf';

        return new NextResponse(new Uint8Array(buffer), {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Cache-Control': 'no-store',
            },
        });
    } catch (serviceError) {
        console.error('Estimate export route error:', serviceError);
        return NextResponse.json({ success: false, message: 'Не удалось сформировать файл экспорта' }, { status: 500 });
    }
}
