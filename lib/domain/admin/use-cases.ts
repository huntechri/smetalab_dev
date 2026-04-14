import { createImpersonationSession, endImpersonationSession } from '@/lib/data/admin/impersonation.repository';

export async function startImpersonationUseCase(superadminUserId: number, targetTeamId: number, sessionToken: string, ipAddress: string) {
  await createImpersonationSession(superadminUserId, targetTeamId, sessionToken, ipAddress);
}

export async function stopImpersonationUseCase(sessionToken: string) {
  await endImpersonationSession(sessionToken);
}
