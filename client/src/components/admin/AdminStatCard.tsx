import { LucideIcon } from "lucide-react";

interface AdminStatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  helper?: string;
}

export const AdminStatCard = ({
  title,
  value,
  icon: Icon,
  helper
}: AdminStatCardProps) => (
  <article className="card p-5">
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
      </div>
      <span className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-50 text-brand-700">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
    </div>
    {helper && <p className="mt-3 text-sm text-slate-500">{helper}</p>}
  </article>
);
