import { Spinner } from '@repo/ui/spinner';

export const Loading = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <Spinner className="size-6" />
    </div>
  );
};
