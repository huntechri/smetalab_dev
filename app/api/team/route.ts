/**
 * Team API — Next.js App Router Route Handler
 *
 * GET  /api/team       — return all members with their roles
 * POST /api/team       — assign/reassign a role to a user (admin/owner only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/data/db/drizzle';
import { teamMembers, users as usersTable } from '@/lib/data/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { z } from 'zod';
import { requirePermission, requireAuth } from '@/lib/auth/permissions';

// Inline schema to keep the route self-contained (validators/team.ts also exports it)
const AssignRoleBody = z.object({
  userId: z.number().int().positive(),
  role: z.enum(['owner', 'admin', 'member', 'estimator', 'manager']),
});

// ─── GET /api/team ──────────────────────────────────────────────────────

export async function GET(_req: NextRequest) {
  try {
    await requireAuth();

    const rows = await db
      .select({
        userId: teamMembers.userId,
        name: usersTable.name,
        email: usersTable.email,
        role: teamMembers.role,
        joinedAt: teamMembers.joinedAt,
      })
      .from(teamMembers)
      .innerJoin(usersTable, eq(teamMembers.userId, usersTable.id))
      .where(isNull(teamMembers.leftAt))
      .orderBy(teamMembers.joinedAt);

    const members = rows.map((r) => ({
      userId: r.userId,
      name: r.name,
      email: r.email,
      role: r.role,
      joinedAt: r.joinedAt.toISOString(),
    }));

    return NextResponse.json({ members });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[GET /api/team]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// ─── POST /api/team — assign role ───────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requirePermission('team');

    const body = AssignRoleBody.safeParse(await req.json());
    if (!body.success) {
      return NextResponse.json(
        { error: 'Validation error', details: body.error.flatten() },
        { status: 400 },
      );
    }

    const { userId: targetUserId, role } = body.data;

    // Find the target user's active membership
    const [member] = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.userId, targetUserId),
          isNull(teamMembers.leftAt),
        ),
      )
      .limit(1);

    if (!member) {
      return NextResponse.json(
        { error: 'User is not a member of any team' },
        { status: 404 },
      );
    }

    // Update the role
    const [updated] = await db
      .update(teamMembers)
      .set({ role })
      .where(eq(teamMembers.id, member.id))
      .returning();

    return NextResponse.json({
      success: true,
      member: {
        userId: updated.userId,
        teamId: updated.teamId,
        role: updated.role,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.startsWith('Unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message.startsWith('Forbidden')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    console.error('[POST /api/team]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
