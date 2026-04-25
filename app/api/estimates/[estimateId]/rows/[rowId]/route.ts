import { NextResponse } from 'next/server';
import { getTeamForUser } from '@/lib/data/db/queries';
import { EstimateRowsService } from '@/lib/services/estimate-rows.service';

const statusByErrorCode = (code?: string) => {
  if (code === 'UNAUTHORIZED') return 401;
  if (code === 'NOT_FOUND') return 404;
  if (code === 'FORBIDDEN') return 403;
  if (code === 'VALIDATION_ERROR') return 400;
  return 400;
};

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ estimateId: string; rowId: string }> },
) {
  const team = await getTeamForUser();
  if (!team) {
    return NextResponse.json(
      { success: false, error: { message: 'Команда не найдена', code: 'TEAM_NOT_FOUND' } },
      { status: 401 },
    );
  }

  const { estimateId, rowId } = await context.params;
  const result = await EstimateRowsService.remove(team.id, estimateId, rowId);

  if (!result.success) {
    return NextResponse.json(result, { status: statusByErrorCode(result.error.code) });
  }

  return NextResponse.json(result);
}
