import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, ShieldCheck, Truck, Activity, Sparkles, Code2, Cpu, ChevronRight, ShoppingBag, Terminal } from "lucide-react";

interface ProductSim {
  name: string;
  stock: number;
  initialStock: number;
  category: string;
  price: string;
  lastAction?: "purchase" | "restock";
}

const features = [
  {
    title: "Real-time updates",
    description: "Instant stock updates stream dynamically from the backend using optimized Socket.IO connections.",
    icon: Clock,
    accent: "text-indigo-600 bg-indigo-50 border-indigo-100"
  },
  {
    title: "Secure workflows",
    description: "Rigorous JWT tokens control checkout pipelines, protecting customer states and administrative operations.",
    icon: ShieldCheck,
    accent: "text-emerald-600 bg-emerald-50 border-emerald-100"
  },
  {
    title: "Fulfillment design",
    description: "Architected tracking pipeline ready for rapid extension to third-party shipping API aggregations.",
    icon: Truck,
    accent: "text-purple-600 bg-purple-50 border-purple-100"
  }
];

const techBadges = [
  { name: "React 18", desc: "Interactive frontend UI SPA", category: "Core Client" },
  { name: "TypeScript", desc: "Type-safe robust compilation", category: "Language" },
  { name: "Tailwind CSS", desc: "Premium styling architecture", category: "Design System" },
  { name: "Socket.IO", desc: "Real-time bidirectional event sync", category: "Transport" },
  { name: "Node.js & Express", desc: "Performant modular REST APIs", category: "Backend Engine" },
  { name: "MongoDB & Mongoose", desc: "Flexible document store models", category: "Database Layer" }
];

export const HomePage = () => {
  const [products, setProducts] = useState<ProductSim[]>([
    { name: "Wireless Headphones", stock: 8, initialStock: 15, category: "Audio Gear", price: "₹99" },
    { name: "Smart Watch Active", stock: 3, initialStock: 10, category: "Wearables", price: "₹199" },
    { name: "Modular Backpack", stock: 11, initialStock: 20, category: "Travel Utility", price: "₹79" }
  ]);
  const [log, setLog] = useState<string[]>([
    "Live synchronization channel initialized.",
    "Listening for background socket inventory events..."
  ]);
  const [activePulseIdx, setActivePulseIdx] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * products.length);
      setProducts((prev) => {
        const next = [...prev];
        const prod = { ...next[idx] };
        
        let logText = "";
        if (prod.stock <= 2) {
          const restockAmt = Math.floor(Math.random() * 8) + 8;
          prod.stock = restockAmt;
          prod.lastAction = "restock";
          logText = `🔄 Restocked ${prod.name} -> set to ${restockAmt} items.`;
        } else {
          prod.stock -= 1;
          prod.lastAction = "purchase";
          logText = `🛍️ Product checkout event: 1 unit of ${prod.name} purchased.`;
        }

        next[idx] = prod;
        
        const timestamp = new Date().toLocaleTimeString([], { 
          hour: "2-digit", 
          minute: "2-digit", 
          second: "2-digit" 
        });
        setLog((prevLog) => [`[${timestamp}] ${logText}`, ...prevLog.slice(0, 3)]);
        setActivePulseIdx(idx);
        return next;
      });

      setTimeout(() => {
        setActivePulseIdx(null);
      }, 1800);
    }, 4500);

    return () => clearInterval(interval);
  }, [products]);

  return (
    <div className="relative overflow-hidden py-10 sm:py-16">
      {/* Decorative Blur Aurora Orbs */}
      <div className="absolute left-1/3 top-10 -z-10 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl animate-pulse-glow" />
      <div className="absolute right-1/4 bottom-20 -z-10 h-80 w-80 rounded-full bg-purple-200/30 blur-3xl animate-pulse-glow" />

      <section className="container-page">
        {/* Hero Section Banner */}
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col items-start text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50/80 px-3 py-1 text-xs font-semibold tracking-wide text-indigo-700 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '3s' }} />
              ⚡ Real-Time Portolio Commerce Engine
            </span>
            
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:leading-[1.15]">
              Modern Trading <br />
              <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                Fueled by Streams.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
              Explore ShopStream—an enterprise-grade portfolio storefront demonstrating immediate 
              synchronized inventory balances, rich consumer workflows, secure cart dynamics, and administrative analytics dashboards.
            </p>

            <div className="mt-8 flex flex-col w-full gap-4 sm:flex-row sm:w-auto">
              <Link to="/products" className="btn-primary group shadow-md shadow-indigo-600/10">
                Browse products
                <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
              <Link to="/register" className="btn-secondary group shadow-sm">
                Create portfolio account
              </Link>
            </div>
          </div>

          {/* Interactive Live Storefront Panel */}
          <div className="relative group">
            {/* Ambient Background Glow behind card */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 opacity-20 blur-lg transition duration-1000 group-hover:opacity-30" />
            
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-semibold text-slate-900">Live Inventory Monitor</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Continuous system socket feedback</p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 border border-emerald-200">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-live-pulse absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-bold tracking-wider text-emerald-700 uppercase">Live Stream</span>
                </div>
              </div>

              {/* Simulated Stock Feeds */}
              <div className="mt-6 space-y-4">
                {products.map((item, index) => {
                  const percent = Math.min(100, Math.max(0, (item.stock / item.initialStock) * 100));
                  const isPulsing = activePulseIdx === index;
                  const isRestock = item.lastAction === "restock";
                  
                  return (
                    <div 
                      key={item.name} 
                      className={`relative rounded-xl border p-4 transition-all duration-500 ${
                        isPulsing 
                          ? isRestock 
                            ? "border-emerald-400 bg-emerald-50/50 shadow-sm" 
                            : "border-indigo-400 bg-indigo-50/50 shadow-sm"
                          : "border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{item.category}</span>
                          <h4 className="font-medium text-slate-800 text-sm mt-0.5">{item.name}</h4>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-semibold text-slate-950">{item.price}</span>
                          <div className="mt-0.5 flex items-center justify-end gap-1.5">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold transition-all duration-300 ${
                              item.stock <= 3 
                                ? "bg-amber-100 text-amber-800" 
                                : "bg-indigo-100 text-indigo-800"
                            }`}>
                              {item.stock} left
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Animated visual progress indicator bar */}
                      <div className="mt-3.5 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            item.stock <= 3 
                              ? "bg-gradient-to-r from-amber-400 to-amber-500" 
                              : "bg-gradient-to-r from-indigo-500 to-purple-500"
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Micro terminal updates log */}
              <div className="mt-6 rounded-lg bg-slate-950 p-3.5 font-mono text-[11px] text-slate-300 shadow-inner">
                <div className="flex items-center gap-1.5 text-indigo-400 border-b border-white/5 pb-2 mb-2 font-semibold">
                  <Terminal className="h-3.5 w-3.5" />
                  <span>Real-time Sync Event Log</span>
                </div>
                <div className="space-y-1.5 min-h-[72px]">
                  {log.map((line, idx) => (
                    <div 
                      key={idx} 
                      className={`truncate transition-all duration-300 ${
                        idx === 0 ? "text-indigo-300 font-medium" : "opacity-60"
                      }`}
                    >
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-24">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-950">Engineered for Performance</h2>
            <p className="mt-3 text-slate-500 text-sm">
              Discover the modern design layers powering this portfolio commerce solution.
            </p>
          </div>
          
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <article 
                className="group relative rounded-2xl border border-slate-200 bg-white/60 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md hover:bg-white" 
                key={feature.title}
              >
                <div className={`inline-flex rounded-xl p-3 border ${feature.accent}`}>
                  <feature.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-5 font-bold text-slate-900 text-lg">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>

        {/* Technology Stack Spotlight */}
        <div className="mt-24 rounded-2xl border border-slate-200 bg-white/40 p-8 md:p-12 backdrop-blur-sm">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-md px-2.5 py-1">
                Technology Spotlight
              </span>
              <h2 className="mt-4 text-3xl font-extrabold text-slate-950">Technical Architecture</h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-500">
                This project represents a fully functional, standard integration of a modern MERN stack coupled with asynchronous socket networking, 
                serving as a robust prototype for scaled e-commerce needs.
              </p>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              {techBadges.map((tech) => (
                <div 
                  key={tech.name} 
                  className="rounded-xl border border-slate-200/80 bg-white/80 p-4 transition duration-300 hover:border-indigo-200 hover:shadow-sm"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{tech.category}</span>
                  <h4 className="font-semibold text-slate-900 mt-0.5">{tech.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-normal">{tech.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action Banner */}
        <div className="mt-24 relative overflow-hidden rounded-3xl bg-slate-950 text-white px-6 py-12 md:py-20 text-center shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#312e81,transparent_50%)] opacity-70" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,#4c1d95,transparent_50%)] opacity-70" />
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-display">
              Ready to explore live shopping?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-indigo-200 text-sm leading-relaxed">
              Create a custom client account, load products, test cart mechanics, and experience seamless real-time stock sync at scale.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/products" className="btn-primary bg-white text-indigo-950 hover:bg-slate-100 focus:ring-white border border-white px-6 py-3 w-full sm:w-auto">
                Explore Product Directory
              </Link>
              <Link to="/register" className="inline-flex justify-center items-center rounded-md border border-slate-700 bg-slate-900/60 hover:bg-slate-900/90 text-white px-6 py-3 text-sm font-semibold transition hover:border-slate-500 w-full sm:w-auto">
                Register Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
