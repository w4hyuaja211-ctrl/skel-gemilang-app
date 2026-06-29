import { Link, useLocation, useNavigate } from "react-router-dom";
import { GraduationCap, LayoutDashboard, Users, Settings, ShieldCheck, Database, LogOut, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { signOut, user } = useAuth();
  const nav = useNavigate();
  const items = [
    { to: "/dashboard", label: "Dasbor", icon: LayoutDashboard },
    { to: "/siswa", label: "Data Siswa", icon: Users },
    { to: "/master", label: "Master Data", icon: Database },
    { to: "/admin/ppdb", label: "SPMB / PPDB", icon: Megaphone },
    { to: "/pengaturan", label: "Pengaturan", icon: Settings },
  ];

  const logout = async () => {
    await signOut();
    nav("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-base font-bold">e-SKL</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Surat Kelulusan Digital</div>
            </div>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {items.map((n) => (
              <Link key={n.to} to={n.to}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  pathname.startsWith(n.to)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}>
                <n.icon className="h-4 w-4" />{n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/" className="hidden items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium shadow-sm-soft hover:bg-accent sm:inline-flex">
              <ShieldCheck className="h-4 w-4 text-primary" /> Pengumuman
            </Link>
            {user && (
              <button onClick={logout} title="Keluar" className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium hover:bg-accent">
                <LogOut className="h-3.5 w-3.5" /><span className="hidden md:inline">Keluar</span>
              </button>
            )}
          </div>
        </div>
        <nav className="container flex gap-1 overflow-x-auto pb-2 md:hidden">
          {items.map((n) => (
            <Link key={n.to} to={n.to}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap",
                pathname.startsWith(n.to) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"
              )}>
              <n.icon className="h-3.5 w-3.5" />{n.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="container py-8 animate-fade-in">{children}</main>
      <footer className="border-t border-border/50 py-6">
        <div className="container text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} e-SKL — {user?.email}
        </div>
      </footer>
    </div>
  );
}
