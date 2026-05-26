interface EmptyStateProps {
  title: string;
  message: string;
}

export const EmptyState = ({ title, message }: EmptyStateProps) => (
  <div className="card px-5 py-10 text-center">
    <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
    <p className="mt-2 text-sm text-slate-600">{message}</p>
  </div>
);
