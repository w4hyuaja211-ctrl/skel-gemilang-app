import AppShell from "@/components/AppShell";
import { Link } from "react-router-dom";
import { useSKL } from "@/store/skl";
import { Plus, Search, Trash2, FileText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function SiswaList() {
  const siswa = useSKL((s) => s.siswa);
  const del = useSKL((s) => s.deleteSiswa);
  const [q, setQ] = useState("");

  const filtered = siswa.filter(
    (s) =>
      s.nama.toLowerCase().includes(q.toLowerCase()) ||
      s.nisn.includes(q) ||
      s.kelas.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">Manajemen Siswa</div>
          <h1 className="mt-1 font-display text-3xl font-bold">Data Siswa</h1>
        </div>
        <Link to="/siswa/baru" className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md-soft hover:shadow-glow">
          <Plus className="h-4 w-4" /> Tambah Siswa
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm-soft">
        <div className="border-b border-border p-4">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari nama, NISN, atau kelas..."
              className="w-full rounded-xl border border-input bg-background py-2.5 pl-9 pr-3 text-sm outline-none ring-primary/20 focus:ring-2"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3">Siswa</th>
                <th className="px-5 py-3">NISN</th>
                <th className="px-5 py-3">Kelas</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-primary text-xs font-bold text-primary-foreground">
                        {s.nama.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                      </div>
                      <div>
                        <div className="font-semibold">{s.nama}</div>
                        <div className="text-xs text-muted-foreground">{s.tempatLahir}, {new Date(s.tanggalLahir).toLocaleDateString("id-ID")}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs">{s.nisn}</td>
                  <td className="px-5 py-4">{s.kelas}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.status === "Lulus" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1">
                      <Link to={`/skl/${s.id}`} className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20">
                        <FileText className="h-3.5 w-3.5" /> SKL
                      </Link>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus data ${s.nama}?`)) {
                            del(s.id);
                            toast.success("Data dihapus");
                          }
                        }}
                        className="inline-flex items-center gap-1 rounded-lg bg-destructive/10 px-2.5 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="p-10 text-center text-sm text-muted-foreground">Tidak ada data.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
