import type { ReactNode } from 'react';

type ViewerFrameProps = {
  children: ReactNode;
};

export const ViewerFrame = ({ children }: ViewerFrameProps) => {
  return (
    <div className="rounded-lg border bg-muted/50 p-8">
      {children}
    </div>
  );
};
