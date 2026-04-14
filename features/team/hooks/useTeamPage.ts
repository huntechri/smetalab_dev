'use client';

import { useMemo, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { z } from 'zod';
import { inviteTeamMember, removeTeamMember } from '@/app/(login)/actions';
import { TeamData, TeamMessage, TeamRole, TeamRoleFilter } from '../types';
import { filterTeamMembers } from '../lib/team-utils';

const teamDataSchema = z.object({
    id: z.number(),
    name: z.string(),
    teamMembers: z.array(
        z.object({
            id: z.number(),
            role: z.string(),
            joinedAt: z.string(),
            user: z.object({
                id: z.number(),
                name: z.string().nullable(),
                email: z.string().email(),
            }),
        })
    ),
});

async function fetchTeamData(url: string): Promise<TeamData> {
    const response = await fetch(url);
    const json: unknown = await response.json();
    return teamDataSchema.parse(json);
}

export function useTeamPage() {
    const { data: team, isLoading } = useSWR<TeamData>('/api/team', fetchTeamData);

    const [email, setEmail] = useState('');
    const [role, setRole] = useState<TeamRole>('estimator');
    const [isInviting, setIsInviting] = useState(false);
    const [message, setMessage] = useState<TeamMessage | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<TeamRoleFilter>('all');

    const members = team?.teamMembers ?? [];

    const filteredMembers = useMemo(
        () => filterTeamMembers(members, searchQuery, roleFilter),
        [members, roleFilter, searchQuery]
    );

    const handleInvite = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsInviting(true);
        setMessage(null);

        const formData = new FormData();
        formData.append('email', email);
        formData.append('role', role);

        const result = await inviteTeamMember({ email, role }, formData);

        if (result && 'error' in result && result.error) {
            setMessage({ type: 'error', text: result.error });
        } else if (result && 'success' in result && result.success) {
            setMessage({ type: 'success', text: result.success });
            setEmail('');
        }

        setIsInviting(false);
    };

    const handleRemove = async (memberId: number) => {
        const formData = new FormData();
        formData.append('memberId', memberId.toString());

        const result = await removeTeamMember({ memberId }, formData);

        if (result && 'error' in result && result.error) {
            setMessage({ type: 'error', text: result.error });
        } else if (result && 'success' in result && result.success) {
            setMessage({ type: 'success', text: result.success });
            mutate('/api/team');
        }
    };

    return {
        email,
        filteredMembers,
        handleInvite,
        handleRemove,
        isInviting,
        isLoading,
        members,
        message,
        role,
        roleFilter,
        searchQuery,
        setEmail,
        setRole,
        setRoleFilter,
        setSearchQuery,
        team,
    };
}
