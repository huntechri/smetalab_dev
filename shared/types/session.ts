export type TenantRole = 'owner' | 'admin' | 'member' | 'estimator' | 'manager';
export type PlatformRole = 'superadmin' | 'support' | null;

export interface PermissionEntry {
  code: string;
  level: 'read' | 'manage';
}

export interface AppUser {
  id: number;
  email: string;
  name: string | null;
  platformRole?: PlatformRole;
  teamRole?: TenantRole | null;
}

export interface AppUserWithPermissions extends AppUser {
  teamId?: number | null;
  permissions?: PermissionEntry[];
}

export interface AppTeam {
  id: number;
  name: string;
}
