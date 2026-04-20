import { describe, expect, it } from 'vitest';
import { filterTeamMembers, getMemberInitials, getRoleBadgeVariant, getRoleLabel, parseDevLinkMessage } from '@/features/team/lib/team-utils';
import { TeamMember } from '@/features/team/types';

const members: TeamMember[] = [
    {
        id: 1,
        role: 'admin',
        joinedAt: '2026-01-01',
        user: { id: 10, name: 'Анна Иванова', email: 'anna@demo.dev' },
    },
    {
        id: 2,
        role: 'manager',
        joinedAt: '2026-01-02',
        user: { id: 11, name: 'Boris Petrov', email: 'boris@demo.dev' },
    },
];

describe('team utils', () => {
    it('filters members by role and query', () => {
        expect(filterTeamMembers(members, '', 'all')).toHaveLength(2);
        expect(filterTeamMembers(members, '', 'admin')).toHaveLength(1);
        expect(filterTeamMembers(members, 'boris', 'all')).toEqual([members[1]]);
        expect(filterTeamMembers(members, 'anna@', 'admin')).toEqual([members[0]]);
    });

    it('returns role labels and badge variants', () => {
        expect(getRoleLabel('admin')).toBe('Администратор');
        expect(getRoleLabel('manager')).toBe('Менеджер');
        expect(getRoleBadgeVariant('admin')).toBe('info');
        expect(getRoleBadgeVariant('estimator')).toBe('warning');
        expect(getRoleBadgeVariant('unknown')).toBe('neutral');
    });

    it('builds initials from name or email', () => {
        expect(getMemberInitials('Анна Иванова', 'anna@demo.dev')).toBe('АИ');
        expect(getMemberInitials(null, 'anna@demo.dev')).toBe('AN');
    });

    it('parses dev link from message', () => {
        expect(parseDevLinkMessage('Ошибка (Dev Link: https://example.com/debug)')).toEqual({
            textPart: 'Ошибка ',
            url: 'https://example.com/debug',
        });
        expect(parseDevLinkMessage('Обычное сообщение')).toBeNull();
    });
});
