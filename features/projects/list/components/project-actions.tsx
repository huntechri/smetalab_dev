import Link from 'next/link';
import { Edit, ExternalLink, Trash2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/shared/ui/alert-dialog';

type ProjectActionsProps = {
    projectId: string;
    projectSlug: string;
    projectName: string;
    onDelete: (projectId: string) => void;
    onEdit: (projectId: string) => void;
    density?: 'default' | 'compact';
};

type ProjectActionButtonsProps = Omit<ProjectActionsProps, 'onDelete' | 'density'> & {
    compact: boolean;
};

function ProjectActionButtons({
    projectId,
    projectSlug,
    projectName,
    onEdit,
    compact,
}: ProjectActionButtonsProps) {
    const gridClassName = compact
        ? 'grid shrink-0 grid-cols-3 gap-2'
        : 'grid grid-cols-3 gap-2 pt-2';

    return (
        <div className={gridClassName}>
            <Button asChild variant="outline">
                <Link href={`/app/projects/${projectSlug}`} aria-label={`Открыть ${projectName}`}>
                    <ExternalLink className="size-4 sm:hidden" />
                    <span className="hidden sm:inline">Открыть</span>
                </Link>
            </Button>
            <Button
                variant="outline"
                onClick={() => onEdit(projectId)}
                aria-label={`Изменить ${projectName}`}
            >
                <Edit className="size-4 sm:hidden" />
                <span className="hidden sm:inline">Изменить</span>
            </Button>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" aria-label={`Удалить ${projectName}`}>
                    <Trash2 className="size-4 sm:hidden hover:text-destructive" />
                    <span className="hidden sm:inline hover:text-destructive">Удалить</span>
                </Button>
            </AlertDialogTrigger>
        </div>
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
    const compact = density === 'compact';

    return (
        <AlertDialog>
            <ProjectActionButtons
                projectId={projectId}
                projectSlug={projectSlug}
                projectName={projectName}
                onEdit={onEdit}
                compact={compact}
            />
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Удалить проект?</AlertDialogTitle>
                    <AlertDialogDescription>
                        {`Это навсегда удалит "${projectName}" из списка.`}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(projectId)}>Удалить</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
