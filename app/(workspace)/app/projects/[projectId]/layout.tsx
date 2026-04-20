import { ProjectWorkspaceLayout } from '@/features/projects/layouts/ProjectWorkspaceLayout';

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
    return <ProjectWorkspaceLayout>{children}</ProjectWorkspaceLayout>;
}
