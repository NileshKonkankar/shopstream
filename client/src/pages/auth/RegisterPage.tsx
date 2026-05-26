import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { authApi } from "../../api/auth.api";
import { useAuthStore } from "../../store/auth.store";
import { getApiErrorMessage } from "../../utils/error";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: ""
    }
  });

  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      login(data.user, data.accessToken);
      navigate("/products");
    }
  });

  const onSubmit = (values: RegisterFormValues) => {
    mutation.mutate(values);
  };

  return (
    <section className="container-page flex min-h-[calc(100vh-9rem)] items-center justify-center py-10">
      <div className="card w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-slate-950">Create account</h1>
        <p className="mt-2 text-sm text-slate-600">Start shopping with ShopStream.</p>
        <form className="mt-6 grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <label className="grid gap-1.5">
            <span className="label">Name</span>
            <input className="input-field" {...form.register("name")} />
            {form.formState.errors.name && (
              <span className="text-sm text-red-600">
                {form.formState.errors.name.message}
              </span>
            )}
          </label>
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
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            {mutation.isPending ? "Creating account" : "Register"}
          </button>
        </form>
        <p className="mt-5 text-sm text-slate-600">
          Already have an account?{" "}
          <Link className="font-semibold text-brand-700" to="/login">
            Login
          </Link>
        </p>
      </div>
    </section>
  );
};
