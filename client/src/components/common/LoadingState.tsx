import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  label?: string;
}

export const LoadingState = ({ label = "Loading" }: LoadingStateProps) => (
  <div className="flex min-h-40 items-center justify-center text-slate-600">
    <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
    <span>{label}</span>
  </div>
);
