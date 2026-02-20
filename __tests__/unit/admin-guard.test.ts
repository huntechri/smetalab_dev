import { describe, expect, it } from 'vitest';
import { assertPlatformAdminAccess, isPlatformAdminRole } from '@/lib/infrastructure/auth/admin-guard';
import type { User } from '@/lib/data/db/schema';

type UserLike = Pick<User, 'platformRole'>;

describe('admin-guard', () => {
  describe('isPlatformAdminRole', () => {
    it('returns true for superadmin and support', () => {
      expect(isPlatformAdminRole('superadmin')).toBe(true);
      expect(isPlatformAdminRole('support')).toBe(true);
    });

    it('returns false for null and unknown roles', () => {
      expect(isPlatformAdminRole(null)).toBe(false);
      expect(isPlatformAdminRole(undefined)).toBe(false);
    });
  });

  describe('assertPlatformAdminAccess', () => {
    it('does not throw for platform admin', () => {
      expect(() => assertPlatformAdminAccess({ platformRole: 'superadmin' } as UserLike)).not.toThrow();
      expect(() => assertPlatformAdminAccess({ platformRole: 'support' } as UserLike)).not.toThrow();
    });

    it('throws for missing user and non-admin role', () => {
      expect(() => assertPlatformAdminAccess(null)).toThrow('Forbidden: platform admin access required');
      expect(() => assertPlatformAdminAccess({ platformRole: null } as UserLike)).toThrow('Forbidden: platform admin access required');
    });
  });
});
