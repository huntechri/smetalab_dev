import { NextResponse } from 'next/server';
import { getTeamForUser } from '@/lib/data/db/queries';
import { EstimateProcurementService } from '@/lib/services/estimate-procurement.service';

const statusByErrorCode = (code?: string) => {
  if (code === 'UNAUTHORIZED') return 401;
  if (code === 'NOT_FOUND') return 404;
  if (code === 'FORBIDDEN') return 403;
  return 400;
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ estimateId: string }> },
) {
  const team = await getTeamForUser();
  if (!team) {
    return NextResponse.json(
      { success: false, error: { message: 'Команда не найдена', code: 'TEAM_NOT_FOUND' } },
      { status: 401 },
    );
  }

  const { estimateId } = await context.params;
  const result = await EstimateProcurementService.list(team.id, estimateId);

  if (!result.success) {
    return NextResponse.json(result, { status: statusByErrorCode(result.error.code) });
  }

  return NextResponse.json(result);
}
