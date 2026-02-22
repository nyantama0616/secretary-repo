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

export const ProjectSection = () => {
  const trpc = useTRPC();
  const {
    data: projects,
    isLoading,
    isError,
    refetch,
  } = useQuery(trpc.project.list.queryOptions());

  return (
    <section className="grid gap-3">
      <h2 className="text-lg font-semibold">プロジェクト</h2>

      {isLoading ? (
        <Loading />
      ) : isError || !projects ? (
        <ErrorDisplay
          message="プロジェクトの取得に失敗しました"
          onRetry={refetch}
        />
      ) : projects.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          プロジェクトがまだありません
        </p>
      ) : (
        <div className="grid gap-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={ROUTES.projectDetail(project.id)}
              className="block rounded-lg border p-4 transition-colors hover:bg-muted/50"
            >
              <p className="font-semibold">{project.name}</p>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant={STATUS_CONFIG[project.status].variant}>
                  {STATUS_CONFIG[project.status].label}
                </Badge>
                {project.deadline && (
                  <span>期限: {formatDate(project.deadline)}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};
