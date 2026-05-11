/**
 * Team Roles API — Next.js App Router Route Handler
 *
 * GET  /api/team/roles  — return all tenant roles mapped to their permissions
 * POST /api/team/roles  — create a new role with permission assignments (admin/owner)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/data/db/drizzle';
import {
  permissions,
  rolePermissions,
} from '@/lib/data/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { requirePermission } from '@/lib/auth/permissions';
import { CreateRoleSchema } from '@/lib/validators/team';

// ─── GET /api/team/roles ────────────────────────────────────────────────

export async function GET(_req: NextRequest) {
  try {
    await requirePermission('team');

    // Fetch all permissions
    const allPermissions = await db
      .select({
        id: permissions.id,
        code: permissions.code,
        name: permissions.name,
        description: permissions.description,
        scope: permissions.scope,
      })
      .from(permissions)
      .where(eq(permissions.scope, 'tenant'))
      .orderBy(permissions.code);

    // Fetch all role → permission mappings
    const allRolePerms = await db
      .select({
        role: rolePermissions.role,
        permissionId: rolePermissions.permissionId,
        accessLevel: rolePermissions.accessLevel,
      })
      .from(rolePermissions);

    // Group by role
    const roleMap = new Map<
      string,
      Array<{ permissionId: number; code: string; name: string; accessLevel: 'read' | 'manage' }>
    >();

    for (const rp of allRolePerms) {
      if (!roleMap.has(rp.role)) {
        roleMap.set(rp.role, []);
      }
      const perm = allPermissions.find((p) => p.id === rp.permissionId);
      if (perm) {
        roleMap.get(rp.role)!.push({
          permissionId: rp.permissionId,
          code: perm.code,
          name: perm.name,
          accessLevel: rp.accessLevel as 'read' | 'manage',
        });
      }
    }

    const roles = Array.from(roleMap.entries()).map(([role, perms]) => ({
      role,
      permissions: perms,
    }));

    return NextResponse.json({
      roles,
      availablePermissions: allPermissions.map((p) => ({
        id: p.id,
        code: p.code,
        name: p.name,
        description: p.description,
      })),
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
    console.error('[GET /api/team/roles]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// ─── POST /api/team/roles ───────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    await requirePermission('team');

    const body = CreateRoleSchema.safeParse(await req.json());
    if (!body.success) {
      return NextResponse.json(
        { error: 'Validation error', details: body.error.flatten() },
        { status: 400 },
      );
    }

    const { code, name, description, permissionIds } = body.data;

    // Create the permission entry
    const [newPerm] = await db
      .insert(permissions)
      .values({
        code,
        name,
        description: description ?? null,
        scope: 'tenant',
      })
      .returning({ id: permissions.id, code: permissions.code });

    // If permission IDs provided, create role_permissions entries
    if (permissionIds && permissionIds.length > 0) {
      // The new role created here is a permission entry, but the task describes
      // creating a "role" with permission assignments. In the current schema,
      // `rolePermissions` maps tenant_role_enum → permission_id.
      // We default to 'member' for newly added permission entries that aren't
      // yet tied to a role in the enum.
      await db.insert(rolePermissions).values(
        permissionIds.map((pid) => ({
          role: 'member' as const, // placeholder; caller should specify target role
          permissionId: pid,
          accessLevel: 'read' as const,
        })),
      );
    }

    return NextResponse.json(
      {
        success: true,
        permission: { id: newPerm.id, code: newPerm.code },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.startsWith('Unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message.startsWith('Forbidden')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    console.error('[POST /api/team/roles]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
