'use client';

import { Badge } from '@repo/ui/badge';
import { Button } from '@repo/ui/button';
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

type ProjectDetailProps = {
  id: string;
};

export const ProjectDetail = ({ id }: ProjectDetailProps) => {
  const trpc = useTRPC();
  const {
    data: project,
    isLoading,
    isError,
    refetch,
  } = useQuery(trpc.project.detail.queryOptions({ id }));

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !project) {
    return (
      <ErrorDisplay
        message="プロジェクトの取得に失敗しました"
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="grid gap-4 p-8">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <Button variant="outline" asChild>
          <Link href={ROUTES.projectEdit(id)}>編集</Link>
        </Button>
      </div>
      <Badge className="w-fit" variant={STATUS_CONFIG[project.status].variant}>
        {STATUS_CONFIG[project.status].label}
      </Badge>
      <dl className="grid gap-4">
        <DetailItem label="目的" value={project.purpose} />
        <DetailItem
          label="期限"
          value={project.deadline ? formatDate(project.deadline) : null}
        />
      </dl>
    </div>
  );
};

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) => {
  if (!value) return null;

  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap">{value}</dd>
    </div>
  );
};
