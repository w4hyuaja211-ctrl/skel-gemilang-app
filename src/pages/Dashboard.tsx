import AppShell from "@/components/AppShell";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listSiswa, getSekolah, bulkUpdateStatus, deleteAllSiswa, type StatusKelulusan } from "@/lib/skl-api";
import { FileText, Plus, Users, CheckCircle2, XCircle, ArrowUpRight, Calendar, Trash2, Edit3 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const qc = useQueryClient();
  const { data: siswa = [] } = useQuery({ queryKey: ["siswa-list"], queryFn: listSiswa });
  const { data: sekolah } = useQuery({ queryKey: ["sekolah"], queryFn: getSekolah });

  const [bulkStatusModal, setBulkStatusModal] = useState(false);
  const [deleteAllModal, setDeleteAllModal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [selectedBulkStatus, setSelectedBulkStatus] = useState<StatusKelulusan>("Lulus");

  const lulus = siswa.filter((s) => s.status === "Lulus").length;
  const tunda = siswa.filter((s) => s.status === "Tunda").length;
  const belum = siswa.filter((s) => s.status === "Belum").length;

  const handleBulkUpdate = async () => {
    setBusy(true);
    try {
      await bulkUpdateStatus(selectedBulkStatus);
      toast.success(`Status semua siswa diubah menjadi ${selectedBulkStatus}`);
      qc.invalidateQueries({ queryKey: ["siswa-list"] });
      setBulkStatusModal(false);
    } catch (err: any) {
      toast.error("Gagal mengubah status", { description: err.message });
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteAll = async () => {
    setBusy(true);
    try {
      await deleteAllSiswa();
      toast.success("Semua data siswa berhasil dihapus");
      qc.invalidateQueries({ queryKey: ["siswa-list"] });
      setDeleteAllModal(false);
    } catch (err: any) {
      toast.error("Gagal menghapus data", { description: err.message });
    } finally {
      setBusy(false);
    }
  };

  const stats = [
    { l: "Total Siswa", v: siswa.length, i: Users, c: "bg-primary/10 text-primary" },
    { l: "Lulus", v: lulus, i: CheckCircle2, c: "bg-success/10 text-success" },
    { l: "Tunda", v: tunda, i: FileText, c: "bg-amber-500/10 text-amber-700 dark:text-amber-400" },
    { l: "Belum Lulus", v: belum, i: XCircle, c: "bg-destructive/10 text-destructive" },
  ];

  return (
    <AppShell>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">Dasbor</div>
          <h1 className="mt-1 font-display text-3xl font-bold md:text-4xl">Selamat datang 👋</h1>
          <p className="mt-1 text-sm text-muted-foreground">{sekolah?.nama}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setBulkStatusModal(true)} className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-500/20">
            <Edit3 className="h-4 w-4" /> Status Semua
          </button>
          <button onClick={() => setDeleteAllModal(true)} className="inline-flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/20">
            <Trash2 className="h-4 w-4" /> Hapus Semua
          </button>
          <Link to="/siswa/baru" className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md-soft hover:shadow-glow">
            <Plus className="h-4 w-4" /> Tambah Siswa
          </Link>
        </div>
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
            <h2 className="font-display text-lg font-bold">Siswa Terbaru</h2>
            <p className="text-xs text-muted-foreground">5 entri terakhir yang dibuat</p>
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
                    <div className="text-xs text-muted-foreground">NISN {s.nisn} · {s.kelas ?? "-"}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase ${s.status === "Lulus" ? "bg-success/10 text-success" : s.status === "Tunda" ? "bg-amber-500/10 text-amber-700 dark:text-amber-400" : "bg-destructive/10 text-destructive"}`}>
                    {s.status}
                  </span>
                  {s.tanggal_lulus && (
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Calendar className="h-3 w-3" /> {new Date(s.tanggal_lulus).toLocaleDateString("id-ID")}
                    </div>
                  )}
                </div>
              </Link>
            </li>
          ))}
          {siswa.length === 0 && (
            <li className="p-10 text-center text-sm text-muted-foreground">Belum ada data siswa.</li>
          )}
        </ul>
      </div>

      <Dialog open={bulkStatusModal} onOpenChange={setBulkStatusModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ubah Status Semua Siswa</DialogTitle>
            <DialogDescription>Pilih status baru untuk semua siswa</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3 py-4">
            <button
              type="button"
              onClick={() => setSelectedBulkStatus("Lulus")}
              className={`flex flex-col items-center gap-2 rounded-xl border p-4 cursor-pointer ${selectedBulkStatus === "Lulus" ? "border-green-500 bg-green-50 dark:bg-green-950/30" : "border-border hover:bg-accent"}`}
            >
              <CheckCircle2 className={`h-8 w-8 ${selectedBulkStatus === "Lulus" ? "text-green-600" : "text-muted-foreground"}`} />
              <span className="text-sm font-semibold">Lulus</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedBulkStatus("Belum")}
              className={`flex flex-col items-center gap-2 rounded-xl border p-4 cursor-pointer ${selectedBulkStatus === "Belum" ? "border-gray-500 bg-gray-50 dark:bg-gray-950/30" : "border-border hover:bg-accent"}`}
            >
              <XCircle className={`h-8 w-8 ${selectedBulkStatus === "Belum" ? "text-gray-600" : "text-muted-foreground"}`} />
              <span className="text-sm font-semibold">Belum</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedBulkStatus("Tunda")}
              className={`flex flex-col items-center gap-2 rounded-xl border p-4 cursor-pointer ${selectedBulkStatus === "Tunda" ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30" : "border-border hover:bg-accent"}`}
            >
              <FileText className={`h-8 w-8 ${selectedBulkStatus === "Tunda" ? "text-amber-600" : "text-muted-foreground"}`} />
              <span className="text-sm font-semibold">Tunda</span>
            </button>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setBulkStatusModal(false)} disabled={busy}>Batal</Button>
            <Button onClick={handleBulkUpdate} disabled={busy}>{busy ? "Menyimpan..." : "Simpan"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteAllModal} onOpenChange={setDeleteAllModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Semua Data Siswa?</DialogTitle>
            <DialogDescription>Tindakan ini tidak bisa dibatalkan! Semua data siswa akan dihapus secara permanen.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteAllModal(false)} disabled={busy}>Batal</Button>
            <Button variant="destructive" onClick={handleDeleteAll} disabled={busy}>{busy ? "Menghapus..." : "Hapus Semua"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
