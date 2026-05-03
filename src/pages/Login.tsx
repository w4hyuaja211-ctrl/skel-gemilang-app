import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, useNavigate } from "react-router-dom";
import { GraduationCap, LogIn, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const { user, isAdmin, signIn, loading } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  if (!loading && user && isAdmin) return <Navigate to="/dashboard" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await signIn(email.trim(), password);
    setBusy(false);
    if (error) {
      toast.error("Login gagal", { description: error });
      return;
    }
    toast.success("Berhasil masuk");
    nav("/dashboard");
  };

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-hero p-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg-soft">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-primary shadow-glow">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="mt-3 font-display text-2xl font-bold">Login Admin</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Khusus pengelola sekolah. Siswa cek kelulusan di halaman depan.
          </p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none ring-primary/20 focus:ring-2"
              placeholder="email@sekolah.sch.id"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none ring-primary/20 focus:ring-2"
            />
          </label>
          <button
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md-soft hover:shadow-glow disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
}
