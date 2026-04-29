import type { ProjectListItem } from '@/features/projects/shared/types';
import { ProjectsScreen } from './ProjectsScreen';

type CounterpartyOption = {
  id: string;
  name: string;
};

type ProjectsPageContentProps = {
  initialProjects: ProjectListItem[];
  counterparties: CounterpartyOption[];
};

export function ProjectsPageContent({ initialProjects, counterparties }: ProjectsPageContentProps) {
  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-3 pt-0.5 pb-4">
      <h1 className="sr-only">Проекты</h1>
      <ProjectsScreen initialProjects={initialProjects} counterparties={counterparties} />
    </div>
  );
}
