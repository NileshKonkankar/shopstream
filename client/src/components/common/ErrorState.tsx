import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
}

export const ErrorState = ({
  title = "Something went wrong",
  message = "Please try again in a moment."
}: ErrorStateProps) => (
  <div className="card flex items-start gap-3 p-5 text-sm text-red-700">
    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
    <div>
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-red-600">{message}</p>
    </div>
  </div>
);
