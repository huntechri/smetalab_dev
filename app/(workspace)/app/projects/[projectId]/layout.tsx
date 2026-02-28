import { ProjectWorkspaceLayout } from '@/features/projects';

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
    return <ProjectWorkspaceLayout>{children}</ProjectWorkspaceLayout>;
}
