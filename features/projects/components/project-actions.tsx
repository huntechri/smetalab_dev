import Link from 'next/link';
import { Edit, ExternalLink, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
} from '@/components/ui/alert-dialog';

type ProjectActionsProps = {
    projectId: string;
    projectName: string;
    onDelete: (projectId: string) => void;
    density?: 'default' | 'compact';
};

export function ProjectActions({
    projectId,
    projectName,
    onDelete,
    density = 'default',
}: ProjectActionsProps) {
    if (density === 'compact') {
        return (
            <AlertDialog>
                <div className="grid shrink-0 grid-cols-3 gap-1.5">
                    <Button asChild size="sm" variant="outline" className="h-10 min-w-0 px-2 sm:h-8">
                        <Link href={`/app/projects/${projectId}`} aria-label={`Open ${projectName}`}>
                            <ExternalLink className="size-4 sm:hidden" />
                            <span className="hidden sm:inline">Open</span>
                        </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="h-10 min-w-0 px-2 sm:h-8">
                        <Link href={`/app/projects/${projectId}?mode=edit`} aria-label={`Edit ${projectName}`}>
                            <Edit className="size-4 sm:hidden" />
                            <span className="hidden sm:inline">Edit</span>
                        </Link>
                    </Button>
                    <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="h-10 px-2 sm:h-8" aria-label={`Delete ${projectName}`}>
                            <Trash2 className="size-4 sm:hidden" />
                            <span className="hidden sm:inline">Delete</span>
                        </Button>
                    </AlertDialogTrigger>
                </div>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete project?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {`This will permanently remove "${projectName}" from the list.`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(projectId)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        );
    }

    return (
        <div className="grid grid-cols-3 gap-2 pt-1">
            <Button asChild size="sm" variant="outline" className="min-w-0">
                <Link href={`/app/projects/${projectId}`} aria-label={`Open ${projectName}`}>
                    <ExternalLink className="size-4 sm:hidden" />
                    <span className="hidden sm:inline">Open</span>
                </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="min-w-0">
                <Link href={`/app/projects/${projectId}?mode=edit`} aria-label={`Edit ${projectName}`}>
                    <Edit className="size-4 sm:hidden" />
                    <span className="hidden sm:inline">Edit</span>
                </Link>
            </Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button size="sm" variant="outline" aria-label={`Delete ${projectName}`}>
                        <Trash2 className="size-4 sm:hidden" />
                        <span className="hidden sm:inline">Delete</span>
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete project?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {`This will permanently remove "${projectName}" from the list.`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(projectId)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
