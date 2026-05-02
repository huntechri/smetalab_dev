import type { ReactNode } from 'react';
import Link from 'next/link';
import { Edit, ExternalLink, Trash2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import {
    ActionButtonGroup,
    actionButtonLabelClassName,
    actionButtonMobileIconClassName,
    ConfirmAction,
} from '@/shared/ui/action-menu';

type ProjectActionsProps = {
    projectId: string;
    projectSlug: string;
    projectName: string;
    onDelete: (projectId: string) => void;
    onEdit: (projectId: string) => void;
    density?: 'default' | 'compact';
};

type ProjectActionButtonsProps = Omit<ProjectActionsProps, 'onDelete' | 'density'> & {
    density: 'default' | 'compact';
    deleteTrigger: ReactNode;
};

function ProjectActionButtons({
    projectId,
    projectSlug,
    projectName,
    onEdit,
    density,
    deleteTrigger,
}: ProjectActionButtonsProps) {
    const buttonSize = density === 'compact' ? 'xs' : 'default';

    return (
        <ActionButtonGroup density={density}>
            <Button asChild variant="outline" size={buttonSize}>
                <Link href={`/app/projects/${projectSlug}`} aria-label={`Открыть ${projectName}`}>
                    <ExternalLink className={actionButtonMobileIconClassName} />
                    <span className={actionButtonLabelClassName}>Открыть</span>
                </Link>
            </Button>
            <Button
                variant="outline"
                size={buttonSize}
                onClick={() => onEdit(projectId)}
                aria-label={`Изменить ${projectName}`}
            >
                <Edit className={actionButtonMobileIconClassName} />
                <span className={actionButtonLabelClassName}>Изменить</span>
            </Button>
            {deleteTrigger}
        </ActionButtonGroup>
    );
}

export function ProjectActions({
    projectId,
    projectSlug,
    projectName,
    onDelete,
    onEdit,
    density = 'default',
}: ProjectActionsProps) {
    const buttonSize = density === 'compact' ? 'xs' : 'default';

    return (
        <ProjectActionButtons
            projectId={projectId}
            projectSlug={projectSlug}
            projectName={projectName}
            onEdit={onEdit}
            density={density}
            deleteTrigger={
                <ConfirmAction
                    title="Удалить проект?"
                    description={`Это навсегда удалит "${projectName}" из списка.`}
                    confirmLabel="Удалить"
                    onConfirm={() => onDelete(projectId)}
                    trigger={
                        <Button variant="destructive" size={buttonSize} aria-label={`Удалить ${projectName}`}>
                            <Trash2 className={actionButtonMobileIconClassName} />
                            <span className={actionButtonLabelClassName}>Удалить</span>
                        </Button>
                    }
                />
            }
        />
    );
}
