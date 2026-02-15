'use server';

import { z } from 'zod';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/data/db/drizzle';
import {
  User,
  users,
  teams,
  teamMembers,
  activityLogs,
  type NewUser,
  type NewTeam,
  type NewTeamMember,
  type NewActivityLog,
  ActivityType,
  invitations,
  notifications,
  type TenantRole
} from '@/lib/data/db/schema';
import { comparePasswords, hashPassword, setSession, clearSession } from '@/lib/infrastructure/auth/session';
import { redirect } from 'next/navigation';
import { createCheckoutSession } from '@/lib/infrastructure/payments/stripe';
import { getUser, getUserWithTeam } from '@/lib/data/db/queries';
import {
  validatedAction,
  validatedActionWithUser
} from '@/lib/infrastructure/auth/middleware';
import { sendInvitationEmail } from '@/lib/infrastructure/email/email';
import { hasPermission } from '@/lib/infrastructure/auth/rbac';
import { rateLimit } from '@/lib/infrastructure/auth/rate-limit';

async function logActivity(
  teamId: number | null | undefined,
  userId: number,
  type: ActivityType,
  ipAddress?: string
) {
  if (teamId === null || teamId === undefined) {
    return;
  }
  const newActivity: NewActivityLog = {
    teamId,
    userId,
    action: type,
    ipAddress: ipAddress || ''
  };
  await db.insert(activityLogs).values(newActivity);
}

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100),
  inviteId: z.string().optional()
});

export const signIn = validatedAction(signInSchema, async (data, formData) => {
  const { email, password, inviteId } = data;

  if (!(await rateLimit(5, 60 * 1000))) {
    return {
      error: 'Too many requests. Please try again later.',
      email,
      password
    };
  }

  const userResult = await db
    .select({
      user: users,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (userResult.length === 0) {
    return {
      error: 'Invalid email or password. Please try again.',
      email,
      password
    };
  }

  const { user: foundUser } = userResult[0];

  const isPasswordValid = await comparePasswords(
    password,
    foundUser.passwordHash
  );

  if (!isPasswordValid) {
    return {
      error: 'Invalid email or password. Please try again.',
      email,
      password
    };
  }

  // Handle invitation during sign in
  if (inviteId) {
    const [invitation] = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.id, parseInt(inviteId)),
          eq(invitations.email, email),
          eq(invitations.status, 'pending')
        )
      )
      .limit(1);

    if (invitation) {
      // Check if already a member
      const existingMember = await db
        .select()
        .from(teamMembers)
        .where(
          and(
            eq(teamMembers.userId, foundUser.id),
            eq(teamMembers.teamId, invitation.teamId)
          )
        )
        .limit(1);

      if (existingMember.length === 0) {
        await db.insert(teamMembers).values({
          userId: foundUser.id,
          teamId: invitation.teamId,
          role: invitation.role
        });
      }

      await db
        .update(invitations)
        .set({ status: 'accepted' })
        .where(eq(invitations.id, invitation.id));

      await logActivity(invitation.teamId, foundUser.id, ActivityType.ACCEPT_INVITATION);
    }
  }

  // Get current team (after potentially accepting invite)
  const userWithTeam = await db
    .select({
      team: teams
    })
    .from(teamMembers)
    .leftJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(eq(teamMembers.userId, foundUser.id))
    .limit(1);

  const foundTeam = userWithTeam[0]?.team;

  await Promise.all([
    setSession(foundUser),
    logActivity(foundTeam?.id, foundUser.id, ActivityType.SIGN_IN)
  ]);

  const redirectTo = formData.get('redirect') as string | null;
  if (redirectTo === 'checkout') {
    const priceId = formData.get('priceId') as string;
    return createCheckoutSession({ team: foundTeam, priceId });
  }

  redirect('/app');
});

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  organizationName: z.string().min(2).max(100).optional(),
  inviteId: z.string().optional()
});

export const signUp = validatedAction(signUpSchema, async (data, formData) => {
  const { email, password, organizationName, inviteId } = data;

  if (!(await rateLimit(5, 60 * 1000))) {
    return {
      error: 'Too many requests. Please try again later.',
      email,
      password
    };
  }

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return {
      error: inviteId
        ? 'У вас уже есть аккаунт. Пожалуйста, войдите в систему, чтобы принять приглашение.'
        : 'Пользователь с таким email уже существует.',
      email,
      password
    };
  }

  const passwordHash = await hashPassword(password);

  const newUser: NewUser = {
    email,
    passwordHash,
  };

  const [createdUser] = await db.insert(users).values(newUser).returning();

  if (!createdUser) {
    return {
      error: 'Failed to create user. Please try again.',
      email,
      password
    };
  }

  let teamId: number;
  let userRole: TenantRole;
  let createdTeam: typeof teams.$inferSelect | null = null;

  if (inviteId) {
    // Check if there's a valid invitation
    const [invitation] = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.id, parseInt(inviteId)),
          eq(invitations.email, email),
          eq(invitations.status, 'pending')
        )
      )
      .limit(1);

    if (invitation) {
      teamId = invitation.teamId;
      userRole = invitation.role;

      await db
        .update(invitations)
        .set({ status: 'accepted' })
        .where(eq(invitations.id, invitation.id));

      await logActivity(teamId, createdUser.id, ActivityType.ACCEPT_INVITATION);

      [createdTeam] = await db
        .select()
        .from(teams)
        .where(eq(teams.id, teamId))
        .limit(1);
    } else {
      return { error: 'Invalid or expired invitation.', email, password };
    }
  } else {
    // Create a new team if there's no invitation
    const teamName = organizationName || `${email}'s Team`;
    const newTeam: NewTeam = {
      name: teamName
    };

    [createdTeam] = await db.insert(teams).values(newTeam).returning();

    if (!createdTeam) {
      return {
        error: 'Failed to create team. Please try again.',
        email,
        password
      };
    }

    teamId = createdTeam.id;
    userRole = 'admin';

    await logActivity(teamId, createdUser.id, ActivityType.CREATE_TEAM);
  }

  const newTeamMember: NewTeamMember = {
    userId: createdUser.id,
    teamId: teamId,
    role: userRole
  };

  await Promise.all([
    db.insert(teamMembers).values(newTeamMember),
    logActivity(teamId, createdUser.id, ActivityType.SIGN_UP),
    setSession(createdUser)
  ]);

  const redirectTo = formData.get('redirect') as string | null;
  if (redirectTo === 'checkout') {
    const priceId = formData.get('priceId') as string;
    return createCheckoutSession({ team: createdTeam, priceId });
  }

  redirect('/app');
});

export async function signOut() {
  const user = (await getUser()) as User;
  if (user) {
    const userWithTeam = await getUserWithTeam(user.id);
    await logActivity(userWithTeam?.teamId, user.id, ActivityType.SIGN_OUT);
  }
  await clearSession();
  redirect('/sign-in');
}

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(100),
  newPassword: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100)
});

export const updatePassword = validatedActionWithUser(
  updatePasswordSchema,
  async (data, _, user) => {
    const { currentPassword, newPassword, confirmPassword } = data;

    const isPasswordValid = await comparePasswords(
      currentPassword,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'Current password is incorrect.'
      };
    }

    if (currentPassword === newPassword) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'New password must be different from the current password.'
      };
    }

    if (confirmPassword !== newPassword) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'New password and confirmation password do not match.'
      };
    }

    const newPasswordHash = await hashPassword(newPassword);
    const userWithTeam = await getUserWithTeam(user.id);

    await Promise.all([
      db
        .update(users)
        .set({ passwordHash: newPasswordHash })
        .where(eq(users.id, user.id)),
      logActivity(userWithTeam?.teamId, user.id, ActivityType.UPDATE_PASSWORD)
    ]);

    return {
      success: 'Password updated successfully.'
    };
  }
);

const deleteAccountSchema = z.object({
  password: z.string().min(8).max(100)
});

export const deleteAccount = validatedActionWithUser(
  deleteAccountSchema,
  async (data, _, user) => {
    const { password } = data;

    const isPasswordValid = await comparePasswords(password, user.passwordHash);
    if (!isPasswordValid) {
      return {
        password,
        error: 'Incorrect password. Account deletion failed.'
      };
    }

    const userWithTeam = await getUserWithTeam(user.id);

    await logActivity(
      userWithTeam?.teamId,
      user.id,
      ActivityType.DELETE_ACCOUNT
    );

    // Soft delete
    await db
      .update(users)
      .set({
        deletedAt: sql`CURRENT_TIMESTAMP`,
        email: sql`CONCAT(email, '-', id, '-deleted')` // Ensure email uniqueness
      })
      .where(eq(users.id, user.id));

    if (userWithTeam?.teamId) {
      await db
        .delete(teamMembers)
        .where(
          and(
            eq(teamMembers.userId, user.id),
            eq(teamMembers.teamId, userWithTeam.teamId)
          )
        );
    }

    await clearSession();
    redirect('/sign-in');
  }
);

const updateAccountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address')
});

export const updateAccount = validatedActionWithUser(
  updateAccountSchema,
  async (data, _, user) => {
    const { name, email } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    await Promise.all([
      db.update(users).set({ name, email }).where(eq(users.id, user.id)),
      logActivity(userWithTeam?.teamId, user.id, ActivityType.UPDATE_ACCOUNT)
    ]);

    return { name, success: 'Account updated successfully.' };
  }
);

const removeTeamMemberSchema = z.object({
  memberId: z.number()
});

export const removeTeamMember = validatedActionWithUser(
  removeTeamMemberSchema,
  async (data, _, user) => {
    const { memberId } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    const authorized = await hasPermission(user.id, userWithTeam.teamId, 'team', 'manage');
    if (!authorized) {
      return { error: 'Недостаточно прав для удаления участников.' };
    }

    // Protection against self-removal
    const [memberToRemove] = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.id, memberId))
      .limit(1);

    if (memberToRemove && memberToRemove.userId === user.id) {
      return { error: 'Вы не можете удалить сами себя из команды здесь.' };
    }

    await db
      .update(teamMembers)
      .set({ leftAt: sql`CURRENT_TIMESTAMP` })
      .where(
        and(
          eq(teamMembers.id, memberId),
          eq(teamMembers.teamId, userWithTeam.teamId)
        )
      );

    await db.insert(notifications).values({
      userId: memberToRemove.userId,
      teamId: userWithTeam.teamId,
      title: 'Удаление из команды',
      description: `Вы были удалены из команды администратором ${user.email}`,
    });

    await logActivity(
      userWithTeam.teamId,
      user.id,
      ActivityType.REMOVE_TEAM_MEMBER
    );

    return { success: 'Team member removed successfully' };
  }
);

const updateTeamMemberRoleSchema = z.object({
  memberId: z.number(),
  role: z.enum(['admin', 'estimator', 'manager'])
});

export const updateTeamMemberRole = validatedActionWithUser(
  updateTeamMemberRoleSchema,
  async (data, _, user) => {
    const { memberId, role } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    const authorized = await hasPermission(user.id, userWithTeam.teamId, 'team', 'manage');
    if (!authorized) {
      return { error: 'Недостаточно прав для смены ролей.' };
    }

    const [memberToUpdate] = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.id, memberId))
      .limit(1);

    if (!memberToUpdate) {
      return { error: 'Участник не найден.' };
    }

    // Protection against self-role change (to avoid accidentally losing admin rights)
    if (memberToUpdate.userId === user.id) {
      return { error: 'Вы не можете изменить свою собственную роль.' };
    }

    await db.update(teamMembers)
      .set({ role })
      .where(eq(teamMembers.id, memberId));

    await db.insert(notifications).values({
      userId: memberToUpdate.userId,
      teamId: userWithTeam.teamId,
      title: 'Смена роли',
      description: `Ваша роль в команде изменена на "${role}"`,
    });

    await logActivity(
      userWithTeam.teamId,
      user.id,
      `CHANGE_ROLE: member ${memberId} to ${role}` as ActivityType
    );

    return { success: 'Роль участника обновлена' };
  }
);

const inviteTeamMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'estimator', 'manager'])
});

export const inviteTeamMember = validatedActionWithUser(
  inviteTeamMemberSchema,
  async (data, _, user) => {
    const { email, role } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    const authorized = await hasPermission(user.id, userWithTeam.teamId, 'team', 'manage');
    if (!authorized) {
      return { error: 'Недостаточно прав для приглашения участников.' };
    }

    const existingMember = await db
      .select()
      .from(users)
      .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
      .where(
        and(eq(users.email, email), eq(teamMembers.teamId, userWithTeam.teamId))
      )
      .limit(1);

    if (existingMember.length > 0) {
      return { error: 'User is already a member of this team' };
    }

    // Check if there's an existing invitation
    const existingInvitation = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.email, email),
          eq(invitations.teamId, userWithTeam.teamId),
          eq(invitations.status, 'pending')
        )
      )
      .limit(1);

    if (existingInvitation.length > 0) {
      return { error: 'An invitation has already been sent to this email' };
    }

    // Create a new invitation
    const [newInvitation] = await db.insert(invitations).values({
      teamId: userWithTeam.teamId,
      email,
      role,
      invitedBy: user.id,
      status: 'pending'
    }).returning();

    await logActivity(
      userWithTeam.teamId,
      user.id,
      ActivityType.INVITE_TEAM_MEMBER
    );

    // Get team name for email and notification
    const [team] = await db
      .select()
      .from(teams)
      .where(eq(teams.id, userWithTeam.teamId))
      .limit(1);

    // If user already exists, notify them
    if (existingMember.length > 0 && existingMember[0].users) {
      await db.insert(notifications).values({
        userId: existingMember[0].users.id,
        teamId: userWithTeam.teamId,
        title: 'Приглашение в команду',
        description: `Вас пригласили в команду "${team?.name || 'Команда'}"`,
      });
    }

    // Send invitation email
    const emailResult = await sendInvitationEmail({
      to: email,
      teamName: team?.name || 'Команда',
      role,
      inviteId: newInvitation.id,
      inviterEmail: user.email,
    });

    if (!emailResult.success) {
      console.error('Failed to send invitation email:', emailResult.error);
      // Still return success - invitation was created, just email failed
      const inviteLink = `${process.env.BASE_URL || 'http://localhost:3000'}/invitations?inviteId=${newInvitation.id}`;
      const reasonSuffix = emailResult.error ? ` Причина: ${emailResult.error}.` : '';

      return {
        success: `Приглашение создано, но письмо не отправлено.${reasonSuffix} Ссылка: ${inviteLink}`
      };
    }

    let successMessage = 'Приглашение отправлено на ' + email;

    if (process.env.NODE_ENV === 'development') {
      successMessage += `. (Dev Link: ${process.env.BASE_URL || 'http://localhost:3000'}/invitations?inviteId=${newInvitation.id})`;
    }

    return { success: successMessage };
  }
);
