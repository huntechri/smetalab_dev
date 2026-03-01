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

export function ProjectActions({
    projectId,
    projectSlug,
    projectName,
    onDelete,
    onEdit,
    density = 'default',
}: ProjectActionsProps) {
    if (density === 'compact') {
        return (
            <AlertDialog>
                <div className="grid shrink-0 grid-cols-3 gap-1.5">
                    <Button asChild size="sm" variant="outline" className="h-10 min-w-0 px-2 sm:h-8">
                        <Link href={`/app/projects/${projectSlug}`} aria-label={`Открыть ${projectName}`}>
                            <ExternalLink className="size-4 sm:hidden" />
                            <span className="hidden sm:inline">Открыть</span>
                        </Link>
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-10 min-w-0 px-2 sm:h-8"
                        onClick={() => onEdit(projectId)}
                        aria-label={`Изменить ${projectName}`}
                    >
                        <Edit className="size-4 sm:hidden" />
                        <span className="hidden sm:inline">Изменить</span>
                    </Button>
                    <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="h-10 px-2 sm:h-8" aria-label={`Удалить ${projectName}`}>
                            <Trash2 className="size-4 sm:hidden" />
                            <span className="hidden sm:inline">Удалить</span>
                        </Button>
                    </AlertDialogTrigger>
                </div>
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

    return (
        <div className="grid grid-cols-3 gap-2 pt-1">
            <Button asChild size="sm" variant="outline" className="min-w-0">
                <Link href={`/app/projects/${projectSlug}`} aria-label={`Открыть ${projectName}`}>
                    <ExternalLink className="size-4 sm:hidden" />
                    <span className="hidden sm:inline">Открыть</span>
                </Link>
            </Button>
            <Button
                size="sm"
                variant="outline"
                className="min-w-0"
                onClick={() => onEdit(projectId)}
                aria-label={`Изменить ${projectName}`}
            >
                <Edit className="size-4 sm:hidden" />
                <span className="hidden sm:inline">Изменить</span>
            </Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button size="sm" variant="outline" aria-label={`Удалить ${projectName}`}>
                        <Trash2 className="size-4 sm:hidden" />
                        <span className="hidden sm:inline">Удалить</span>
                    </Button>
                </AlertDialogTrigger>
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
        </div>
    );
}
