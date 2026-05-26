import { Link } from "react-router-dom";
import { Clock, ShieldCheck, Truck } from "lucide-react";

const features = [
  {
    title: "Real-time inventory",
    description: "Stock updates stream from the backend with Socket.IO.",
    icon: Clock
  },
  {
    title: "Secure checkout",
    description: "JWT-protected checkout flow with Stripe planned next.",
    icon: ShieldCheck
  },
  {
    title: "Fast delivery",
    description: "Delivery tracking is ready for a future fulfillment module.",
    icon: Truck
  }
];

export const HomePage = () => (
  <section className="container-page py-12 sm:py-16">
    <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
          Portfolio commerce platform
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">
          ShopStream
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
          A modern e-commerce frontend with product discovery, cart management,
          protected customer flows, admin tools, and live inventory updates.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link className="btn-primary" to="/products">
            Browse products
          </Link>
          <Link className="btn-secondary" to="/register">
            Create account
          </Link>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="bg-slate-950 p-6 text-white">
          <p className="text-sm text-brand-100">Live storefront snapshot</p>
          <div className="mt-6 grid gap-3">
            {["Wireless Headphones", "Smart Watch", "Travel Backpack"].map(
              (item, index) => (
                <div
                  className="flex items-center justify-between rounded-md bg-white/10 p-4"
                  key={item}
                >
                  <span>{item}</span>
                  <span className="rounded-md bg-brand-500 px-2 py-1 text-xs font-semibold">
                    {12 - index * 4} left
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>

    <div className="mt-12 grid gap-4 md:grid-cols-3">
      {features.map((feature) => (
        <article className="card p-5" key={feature.title}>
          <feature.icon className="h-6 w-6 text-brand-700" aria-hidden="true" />
          <h2 className="mt-4 font-semibold text-slate-950">{feature.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
        </article>
      ))}
    </div>
  </section>
);
