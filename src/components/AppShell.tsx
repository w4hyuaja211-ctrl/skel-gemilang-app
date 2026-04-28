import { Link, useLocation } from "react-router-dom";
import { GraduationCap, LayoutDashboard, Users, Settings, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const nav = [
    { to: "/dashboard", label: "Dasbor", icon: LayoutDashboard },
    { to: "/siswa", label: "Data Siswa", icon: Users },
    { to: "/pengaturan", label: "Pengaturan", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-base font-bold">e-SKL</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Surat Kelulusan Digital</div>
            </div>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  pathname.startsWith(n.to)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            ))}
          </nav>
          <Link
            to="/verifikasi"
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium shadow-sm-soft hover:bg-accent"
          >
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline">Verifikasi</span>
          </Link>
        </div>
        <nav className="container flex gap-1 overflow-x-auto pb-2 md:hidden">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium",
                pathname.startsWith(n.to)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary"
              )}
            >
              <n.icon className="h-3.5 w-3.5" />
              {n.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="container py-8 animate-fade-in">{children}</main>
      <footer className="border-t border-border/50 py-6">
        <div className="container text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} e-SKL — Demo Aplikasi Surat Keterangan Lulus Digital
        </div>
      </footer>
    </div>
  );
}
