'use client';

import { usePermissions } from '@/hooks/use-permissions';
import { InviteTeamMemberCard } from '../components/InviteTeamMemberCard';
import { TeamHeaderCard } from '../components/TeamHeaderCard';
import { TeamMembersCard } from '../components/TeamMembersCard';
import { useTeamPage } from '../hooks/useTeamPage';

export function TeamScreen() {
    const { hasPermission } = usePermissions();
    const {
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
    } = useTeamPage();

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <p className="text-muted-foreground">Загрузка...</p>
            </div>
        );
    }

    const canManageMembers = hasPermission('team', 'manage');

    return (
        <div className="space-y-6">
            <TeamHeaderCard teamName={team?.name} membersCount={members.length} />

            {canManageMembers && (
                <InviteTeamMemberCard
                    email={email}
                    role={role}
                    isInviting={isInviting}
                    message={message}
                    onEmailChange={setEmail}
                    onRoleChange={setRole}
                    onSubmit={handleInvite}
                />
            )}

            <TeamMembersCard
                members={members}
                filteredMembers={filteredMembers}
                roleFilter={roleFilter}
                searchQuery={searchQuery}
                canManageMembers={canManageMembers}
                onRoleFilterChange={setRoleFilter}
                onSearchQueryChange={setSearchQuery}
                onRemoveMember={handleRemove}
            />
        </div>
    );
}
