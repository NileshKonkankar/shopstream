import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut, Menu, ShoppingBag, ShoppingCart, UserRound } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "../../store/auth.store";
import { useCartStore } from "../../store/cart.store";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition ${
    isActive ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-slate-100"
  }`;

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const clearCart = useCartStore((state) => state.clearCart);
  const cartCount = useCartStore((state) =>
    state.items.reduce((count, item) => count + item.quantity, 0)
  );

  const handleLogout = () => {
    logout();
    clearCart();
    navigate("/login");
  };

  const links = (
    <>
      <NavLink className={navLinkClass} to="/products">
        Products
      </NavLink>
      <NavLink className={navLinkClass} to="/cart">
        Cart ({cartCount})
      </NavLink>
      {isAuthenticated ? (
        <>
          <NavLink className={navLinkClass} to="/orders">
            Orders
          </NavLink>
          {user?.role === "admin" && (
            <NavLink className={navLinkClass} to="/admin">
              Admin
            </NavLink>
          )}
          <button className="btn-secondary px-3 py-2" onClick={handleLogout} type="button">
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Logout
          </button>
        </>
      ) : (
        <>
          <NavLink className={navLinkClass} to="/login">
            Login
          </NavLink>
          <NavLink className="btn-primary px-3 py-2" to="/register">
            Register
          </NavLink>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="container-page flex h-16 items-center justify-between">
        <Link className="flex items-center gap-2 text-lg font-bold text-slate-950" to="/">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-600 text-white">
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
          </span>
          ShopStream
        </Link>

        <div className="hidden items-center gap-2 md:flex">{links}</div>

        <button
          aria-label="Toggle navigation"
          className="btn-secondary px-3 py-2 md:hidden"
          onClick={() => setIsOpen((value) => !value)}
          type="button"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
      </nav>

      {isOpen && (
        <div className="container-page flex flex-col gap-2 border-t border-slate-200 py-3 md:hidden">
          {links}
          {isAuthenticated && (
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600">
              <UserRound className="h-4 w-4" aria-hidden="true" />
              {user?.name}
            </div>
          )}
          <div className="flex items-center gap-2 px-3 py-1 text-xs text-slate-500">
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            {cartCount} item(s)
          </div>
        </div>
      )}
    </header>
  );
};
