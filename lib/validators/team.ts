import { z } from 'zod';
import type { TenantRole } from '@/lib/data/db/schema';

/**
 * Zod schemas for team management operations.
 * Валидация всех входных данных на границе API.
 */

export const AssignRoleSchema = z.object({
  userId: z
    .number({ required_error: 'userId обязателен' })
    .int('userId должен быть целым числом')
    .positive('userId должен быть положительным'),

  role: z.enum(['owner', 'admin', 'member', 'estimator', 'manager'] as const satisfies readonly TenantRole[], {
    required_error: 'Роль обязательна',
    invalid_type_error: 'Недопустимая роль',
  }),
});

export const CreateRoleSchema = z.object({
  code: z
    .string({ required_error: 'Код роли обязателен' })
    .min(2, 'Код роли должен быть не менее 2 символов')
    .max(50, 'Код роли должен быть не более 50 символов')
    .regex(
      /^[a-z][a-z0-9_.]*$/,
      'Код роли должен начинаться с буквы и содержать только латинские буквы, цифры, точки и подчёркивания',
    ),

  name: z
    .string({ required_error: 'Название роли обязательно' })
    .min(1, 'Название роли не может быть пустым')
    .max(100, 'Название роли должно быть не более 100 символов'),

  description: z
    .string()
    .max(500, 'Описание роли должно быть не более 500 символов')
    .optional(),

  permissionIds: z
    .array(
      z.number().int().positive('ID права должен быть положительным'),
    )
    .min(1, 'Роль должна иметь хотя бы одно право')
    .optional(),
});

export const RemoveRoleSchema = z.object({
  roleId: z
    .number({ required_error: 'roleId обязателен' })
    .int('roleId должен быть целым числом')
    .positive('roleId должен быть положительным'),

  reassignToRoleId: z
    .number()
    .int()
    .positive('reassignToRoleId должен быть положительным')
    .optional(),
});

export const RemoveMemberSchema = z.object({
  userId: z
    .number({ required_error: 'userId обязателен' })
    .int('userId должен быть целым числом')
    .positive('userId должен быть положительным'),
});

// Type exports
export type AssignRoleInput = z.infer<typeof AssignRoleSchema>;
export type CreateRoleInput = z.infer<typeof CreateRoleSchema>;
export type RemoveRoleInput = z.infer<typeof RemoveRoleSchema>;
export type RemoveMemberInput = z.infer<typeof RemoveMemberSchema>;
