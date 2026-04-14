export type TeamRole = 'admin' | 'estimator' | 'manager';
export type TeamRoleFilter = 'all' | TeamRole;

export interface TeamMember {
    id: number;
    role: string;
    joinedAt: string;
    user: {
        id: number;
        name: string | null;
        email: string;
    };
}

export interface TeamData {
    id: number;
    name: string;
    teamMembers: TeamMember[];
}

export interface TeamMessage {
    type: 'success' | 'error';
    text: string;
}
