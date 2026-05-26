import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { LogIn } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { authApi } from "../../api/auth.api";
import { useAuthStore } from "../../store/auth.store";
import { getApiErrorMessage } from "../../utils/error";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required")
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      login(data.user, data.accessToken);
      const redirectTo =
        (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ??
        "/products";
      navigate(redirectTo);
    }
  });

  const onSubmit = (values: LoginFormValues) => {
    mutation.mutate(values);
  };

  return (
    <section className="container-page flex min-h-[calc(100vh-9rem)] items-center justify-center py-10">
      <div className="card w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-slate-950">Login</h1>
        <p className="mt-2 text-sm text-slate-600">Access your orders and checkout.</p>
        <form className="mt-6 grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <label className="grid gap-1.5">
            <span className="label">Email</span>
            <input className="input-field" type="email" {...form.register("email")} />
            {form.formState.errors.email && (
              <span className="text-sm text-red-600">
                {form.formState.errors.email.message}
              </span>
            )}
          </label>
          <label className="grid gap-1.5">
            <span className="label">Password</span>
            <input
              className="input-field"
              type="password"
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <span className="text-sm text-red-600">
                {form.formState.errors.password.message}
              </span>
            )}
          </label>
          {mutation.isError && (
            <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {getApiErrorMessage(mutation.error)}
            </p>
          )}
          <button className="btn-primary w-full" disabled={mutation.isPending} type="submit">
            <LogIn className="h-4 w-4" aria-hidden="true" />
            {mutation.isPending ? "Logging in" : "Login"}
          </button>
        </form>
        <p className="mt-5 text-sm text-slate-600">
          New here?{" "}
          <Link className="font-semibold text-brand-700" to="/register">
            Create an account
          </Link>
        </p>
      </div>
    </section>
  );
};
