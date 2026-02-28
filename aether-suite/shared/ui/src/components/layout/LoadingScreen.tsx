import { Spinner } from "../Spinner";

export interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "Loading..." }: LoadingScreenProps) {
  return (
    <div className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-3">
      <Spinner size="lg" color="primary" />
      <p className="text-sm text-text-secondary">{message}</p>
    </div>
  );
}
