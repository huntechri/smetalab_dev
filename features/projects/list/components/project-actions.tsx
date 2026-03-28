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
    const buttonClass = "h-9 min-w-0 px-2 transition-colors bg-white hover:bg-secondary border border-border rounded-[7.6px] font-medium text-[14px] leading-[20px] gap-[6px] shadow-none flex items-center justify-center";

    if (density === 'compact') {
        return (
            <AlertDialog>
                <div className="grid shrink-0 grid-cols-3 gap-2">
                    <Button asChild variant="ghost" className={buttonClass}>
                        <Link href={`/app/projects/${projectSlug}`} aria-label={`Открыть ${projectName}`}>
                            <ExternalLink className="size-4 sm:hidden" />
                            <span className="hidden sm:inline">Открыть</span>
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        className={buttonClass}
                        onClick={() => onEdit(projectId)}
                        aria-label={`Изменить ${projectName}`}
                    >
                        <Edit className="size-4 sm:hidden" />
                        <span className="hidden sm:inline">Изменить</span>
                    </Button>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" className={buttonClass} aria-label={`Удалить ${projectName}`}>
                            <Trash2 className="size-4 sm:hidden hover:text-destructive" />
                            <span className="hidden sm:inline hover:text-destructive">Удалить</span>
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
        <div className="grid grid-cols-3 gap-2 pt-2">
            <Button asChild variant="ghost" className={buttonClass}>
                <Link href={`/app/projects/${projectSlug}`} aria-label={`Открыть ${projectName}`}>
                    <ExternalLink className="size-4 sm:hidden" />
                    <span className="hidden sm:inline">Открыть</span>
                </Link>
            </Button>
            <Button
                variant="ghost"
                className={buttonClass}
                onClick={() => onEdit(projectId)}
                aria-label={`Изменить ${projectName}`}
            >
                <Edit className="size-4 sm:hidden" />
                <span className="hidden sm:inline">Изменить</span>
            </Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" className={buttonClass} aria-label={`Удалить ${projectName}`}>
                        <Trash2 className="size-4 sm:hidden hover:text-destructive" />
                        <span className="hidden sm:inline hover:text-destructive">Удалить</span>
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
