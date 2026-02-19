type ErrorDisplayProps = {
  message: string;
  onRetry?: () => void;
};

export const ErrorDisplay = ({ message, onRetry }: ErrorDisplayProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <p className="text-destructive">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
        >
          再試行
        </button>
      )}
    </div>
  );
};
