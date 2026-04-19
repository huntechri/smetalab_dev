'use client';

import { usePermissions } from '@/shared/hooks/use-permissions';
import { InviteTeamMemberCard } from '../components/InviteTeamMemberCard';
import { TeamHeaderCard } from '../components/TeamHeaderCard';
import { TeamMembersCard } from '../components/TeamMembersCard';
import { useTeamPage } from '../hooks/useTeamPage';
import { Card } from '@repo/ui';
import { Separator } from '@repo/ui';
import { useBreadcrumbs } from '@/components/providers/breadcrumb-provider';

export function TeamScreen() {
    useBreadcrumbs([
        { label: 'Главная', href: '/app' },
        { label: 'Команда' },
    ]);

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
        <Card className="overflow-hidden border-border/70 shadow-sm bg-background">
            <TeamHeaderCard teamName={team?.name} membersCount={members.length} />

            {canManageMembers && (
                <>
                    <Separator className="bg-border/50" />
                    <InviteTeamMemberCard
                        email={email}
                        role={role}
                        isInviting={isInviting}
                        message={message}
                        onEmailChange={setEmail}
                        onRoleChange={setRole}
                        onSubmit={handleInvite}
                    />
                </>
            )}

            <Separator className="bg-border/50" />
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
        </Card>
    );
}
