import { NavLink, Outlet } from "react-router-dom";
import { BarChart3, Boxes, ClipboardList } from "lucide-react";

const adminLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
    isActive ? "bg-brand-600 text-white" : "text-slate-700 hover:bg-slate-100"
  }`;

export const AdminLayout = () => (
  <div className="container-page py-8">
    <div className="mb-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
        Admin
      </p>
      <h1 className="mt-1 text-2xl font-bold text-slate-950">Operations</h1>
    </div>

    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <aside className="card h-fit p-3">
        <nav className="grid gap-1">
          <NavLink className={adminLinkClass} end to="/admin">
            <BarChart3 className="h-4 w-4" aria-hidden="true" />
            Dashboard
          </NavLink>
          <NavLink className={adminLinkClass} to="/admin/products">
            <Boxes className="h-4 w-4" aria-hidden="true" />
            Products
          </NavLink>
          <NavLink className={adminLinkClass} to="/admin/orders">
            <ClipboardList className="h-4 w-4" aria-hidden="true" />
            Orders
          </NavLink>
        </nav>
      </aside>

      <section>
        <Outlet />
      </section>
    </div>
  </div>
);
