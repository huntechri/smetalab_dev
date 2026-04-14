import { TeamMember, TeamRoleFilter } from '../types';

export function filterTeamMembers(members: TeamMember[], searchQuery: string, roleFilter: TeamRoleFilter): TeamMember[] {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return members.filter((member) => {
        const matchesRole = roleFilter === 'all' || member.role === roleFilter;
        if (!matchesRole) return false;
        if (!normalizedQuery) return true;

        const name = member.user.name?.toLowerCase() ?? '';
        const emailValue = member.user.email.toLowerCase();
        return name.includes(normalizedQuery) || emailValue.includes(normalizedQuery);
    });
}

export function getRoleLabel(role: string): string {
    switch (role) {
        case 'admin':
            return 'Администратор';
        case 'estimator':
            return 'Сметчик';
        case 'manager':
            return 'Менеджер';
        default:
            return role;
    }
}

export function getRoleBadgeVariant(role: string): 'default' | 'secondary' | 'outline' {
    switch (role) {
        case 'admin':
            return 'default';
        case 'estimator':
            return 'secondary';
        case 'manager':
            return 'outline';
        default:
            return 'outline';
    }
}

export function getMemberInitials(name: string | null, email: string): string {
    if (name) {
        return name
            .split(' ')
            .map((part) => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }

    return email.slice(0, 2).toUpperCase();
}

export function parseDevLinkMessage(message: string): { textPart: string; url: string } | null {
    const urlMatch = message.match(/\(Dev Link: (http[^)]+)\)/);
    if (!urlMatch) {
        return null;
    }

    const [fullMatch, url] = urlMatch;
    const textPart = message.split(fullMatch)[0] ?? '';
    return { textPart, url };
}
