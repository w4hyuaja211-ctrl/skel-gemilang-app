import AppShell from "@/components/AppShell";
import { Link } from "react-router-dom";
import { useSKL } from "@/store/skl";
import { FileText, Plus, Users, CheckCircle2, XCircle, ArrowUpRight, Calendar } from "lucide-react";

export default function Dashboard() {
  const siswa = useSKL((s) => s.siswa);
  const sekolah = useSKL((s) => s.sekolah);
  const lulus = siswa.filter((s) => s.status === "Lulus").length;
  const tdkLulus = siswa.length - lulus;

  const stats = [
    { l: "Total Siswa", v: siswa.length, i: Users, c: "bg-primary/10 text-primary" },
    { l: "Lulus", v: lulus, i: CheckCircle2, c: "bg-success/10 text-success" },
    { l: "Tidak Lulus", v: tdkLulus, i: XCircle, c: "bg-destructive/10 text-destructive" },
    { l: "SKL Diterbitkan", v: siswa.length, i: FileText, c: "bg-warning/10 text-warning" },
  ];

  return (
    <AppShell>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">Dasbor</div>
          <h1 className="mt-1 font-display text-3xl font-bold md:text-4xl">Selamat datang 👋</h1>
          <p className="mt-1 text-sm text-muted-foreground">{sekolah.nama}</p>
        </div>
        <Link
          to="/siswa/baru"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md-soft hover:shadow-glow"
        >
          <Plus className="h-4 w-4" /> Tambah Siswa
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.l} className="rounded-2xl border border-border bg-card p-5 shadow-sm-soft">
            <div className={`mb-3 grid h-10 w-10 place-items-center rounded-xl ${s.c}`}>
              <s.i className="h-5 w-5" />
            </div>
            <div className="font-display text-3xl font-bold">{s.v}</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card shadow-sm-soft">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div>
            <h2 className="font-display text-lg font-bold">SKL Terbaru</h2>
            <p className="text-xs text-muted-foreground">Surat keterangan lulus terakhir yang diterbitkan</p>
          </div>
          <Link to="/siswa" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            Lihat semua <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        <ul className="divide-y divide-border">
          {siswa.slice(0, 5).map((s) => (
            <li key={s.id}>
              <Link to={`/skl/${s.id}`} className="flex items-center justify-between gap-4 p-5 transition hover:bg-secondary/50">
                <div className="flex items-center gap-4">
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-primary font-display text-sm font-bold text-primary-foreground">
                    {s.nama.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <div className="font-semibold">{s.nama}</div>
                    <div className="text-xs text-muted-foreground">NISN {s.nisn} · {s.kelas}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.status === "Lulus" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                    {s.status}
                  </span>
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Calendar className="h-3 w-3" /> {new Date(s.tanggalLulus).toLocaleDateString("id-ID")}
                  </div>
                </div>
              </Link>
            </li>
          ))}
          {siswa.length === 0 && (
            <li className="p-10 text-center text-sm text-muted-foreground">Belum ada data siswa.</li>
          )}
        </ul>
      </div>
    </AppShell>
  );
}
