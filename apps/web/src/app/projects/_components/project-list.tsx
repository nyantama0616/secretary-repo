'use client';

import { Badge } from '@repo/ui/badge';
import Link from 'next/link';
import type { ComponentProps } from 'react';

import { ErrorDisplay } from '@/components/feedback/error-display';
import { Loading } from '@/components/feedback/loading';
import { ROUTES } from '@/constants/routes';
import { formatDate } from '@/lib/format';
import type { ProjectStatus } from '@/server/domain/project/project';
import { useQuery, useTRPC } from '@/trpc/client';

const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; variant: ComponentProps<typeof Badge>['variant'] }
> = {
  active: { label: '進行中', variant: 'default' },
  done: { label: '完了', variant: 'outline' },
};

export const ProjectList = () => {
  const trpc = useTRPC();
  const { data: projects, isLoading, isError, refetch } = useQuery(
    trpc.project.list.queryOptions(),
  );

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !projects) {
    return (
      <ErrorDisplay
        message="プロジェクトの取得に失敗しました"
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="grid gap-4 p-8">
      <h1 className="text-2xl font-bold">プロジェクト一覧</h1>
      {projects.length === 0 ? (
        <p className="text-muted-foreground">プロジェクトがまだありません</p>
      ) : (
        <div className="grid gap-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              href={ROUTES.projectDetail(project.id)}
              name={project.name}
              status={project.status}
              purpose={project.purpose}
              deadline={project.deadline}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ProjectCard = ({
  href,
  name,
  status,
  purpose,
  deadline,
}: {
  href: string;
  name: string;
  status: ProjectStatus;
  purpose: string;
  deadline: Date | null;
}) => {
  return (
    <Link href={href} className="block rounded-lg border p-4 transition-colors hover:bg-muted/50">
      <p className="font-semibold">{name}</p>
      <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
        <Badge variant={STATUS_CONFIG[status].variant}>
          {STATUS_CONFIG[status].label}
        </Badge>
        {deadline && (
          <span>期限: {formatDate(deadline)}</span>
        )}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{purpose}</p>
    </Link>
  );
};
