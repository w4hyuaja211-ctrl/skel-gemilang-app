import AppShell from "@/components/AppShell";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getPpdbPengaturanAdmin, updatePpdbPengaturan, listPpdb, addPpdb, updatePpdb, deletePpdb, importPpdb,
  isValidNoPendaftaran, formatNoPendaftaran,
  type PpdbPendaftar, type StatusPPDB,
} from "@/lib/ppdb-api";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Save, Megaphone, Plus, Trash2, Pencil, Upload, Download, CheckCircle2, XCircle, FileSpreadsheet,
} from "lucide-react";
import * as XLSX from "xlsx";

const inputCls = "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none ring-primary/20 focus:ring-2";

export default function PpdbAdmin() {
  const qc = useQueryClient();
  const { data: cfg } = useQuery({ queryKey: ["ppdb-pengaturan"], queryFn: getPpdbPengaturanAdmin });
  const { data: list = [] } = useQuery({ queryKey: ["ppdb-list"], queryFn: listPpdb });

  const [c, setC] = useState(cfg);
  useEffect(() => { if (cfg) setC(cfg); }, [cfg]);

  // Form
  const empty = {
    no_pendaftaran: "", nama: "", asal_sekolah: "",
    nilai_matematika: 0, nilai_ipa: 0, nilai_bahasa_inggris: 0,
    status: "Tidak Lulus" as StatusPPDB, catatan: "",
  };
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const simpanCfg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!c) return;
    try {
      await updatePpdbPengaturan(c);
      qc.invalidateQueries({ queryKey: ["ppdb-pengaturan"] });
      qc.invalidateQueries({ queryKey: ["ppdb-pengaturan-public"] });
      toast.success("Pengaturan tersimpan");
    } catch (err: any) { toast.error("Gagal", { description: err.message }); }
  };

  const submitPendaftar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidNoPendaftaran(form.no_pendaftaran)) {
      toast.error("Format nomor salah", { description: "Contoh: 01-061-001-1" });
      return;
    }
    try {
      const payload = {
        ...form,
        asal_sekolah: form.asal_sekolah || null,
        catatan: form.catatan || null,
        nilai_matematika: Number(form.nilai_matematika),
        nilai_ipa: Number(form.nilai_ipa),
        nilai_bahasa_inggris: Number(form.nilai_bahasa_inggris),
      } as any;
      if (editId) await updatePpdb(editId, payload);
      else await addPpdb(payload);
      qc.invalidateQueries({ queryKey: ["ppdb-list"] });
      setForm(empty); setEditId(null);
      toast.success(editId ? "Data diperbarui" : "Data ditambahkan");
    } catch (err: any) { toast.error("Gagal", { description: err.message }); }
  };

  const onEdit = (r: PpdbPendaftar) => {
    setEditId(r.id);
    setForm({
      no_pendaftaran: r.no_pendaftaran, nama: r.nama,
      asal_sekolah: r.asal_sekolah ?? "",
      nilai_matematika: Number(r.nilai_matematika),
      nilai_ipa: Number(r.nilai_ipa),
      nilai_bahasa_inggris: Number(r.nilai_bahasa_inggris),
      status: r.status, catatan: r.catatan ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDelete = async (id: string) => {
    if (!confirm("Hapus pendaftar ini?")) return;
    await deletePpdb(id);
    qc.invalidateQueries({ queryKey: ["ppdb-list"] });
    toast.success("Dihapus");
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["no_pendaftaran", "nama", "asal_sekolah", "nilai_matematika", "nilai_ipa", "nilai_bahasa_inggris", "status", "catatan"],
      ["01-061-001-1", "Contoh Siswa", "SMP Negeri 1", 85.5, 90, 88, "Lulus", ""],
      ["01-061-002-2", "Contoh Lain", "SMP Negeri 2", 60, 55, 70, "Tidak Lulus", ""],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "PPDB");
    XLSX.writeFile(wb, "template-ppdb.xlsx");
  };

  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<any>(ws);
      const mapped = rows.map((r) => {
        const no = String(r.no_pendaftaran ?? "").trim();
        return {
          no_pendaftaran: isValidNoPendaftaran(no) ? no : formatNoPendaftaran(no),
          nama: String(r.nama ?? "").trim(),
          asal_sekolah: r.asal_sekolah ? String(r.asal_sekolah) : null,
          nilai_matematika: Number(r.nilai_matematika ?? 0),
          nilai_ipa: Number(r.nilai_ipa ?? 0),
          nilai_bahasa_inggris: Number(r.nilai_bahasa_inggris ?? 0),
          status: (String(r.status ?? "").toLowerCase().includes("lulus") && !String(r.status ?? "").toLowerCase().includes("tidak"))
            ? "Lulus" : "Tidak Lulus",
          catatan: r.catatan ? String(r.catatan) : null,
        };
      }).filter((r) => isValidNoPendaftaran(r.no_pendaftaran) && r.nama);
      if (!mapped.length) throw new Error("Tidak ada baris valid ditemukan");
      const { count } = await importPpdb(mapped as any);
      qc.invalidateQueries({ queryKey: ["ppdb-list"] });
      toast.success(`Berhasil mengimpor ${count} data`);
    } catch (err: any) {
      toast.error("Gagal import", { description: err.message });
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  if (!c) return <AppShell><div className="p-10 text-center text-sm text-muted-foreground">Memuat…</div></AppShell>;

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">Pengumuman PPDB</div>
          <h1 className="mt-1 font-display text-3xl font-bold">SPMB / PPDB Gelombang</h1>
          <p className="mt-1 text-sm text-muted-foreground">Kelola pengaturan & data hasil seleksi peserta didik baru.</p>
        </div>

        {/* Pengaturan */}
        <form onSubmit={simpanCfg} className="rounded-2xl border border-border bg-card p-6 shadow-sm-soft">
          <div className="mb-6 flex items-center gap-3 border-b border-border pb-4">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><Megaphone className="h-5 w-5" /></div>
            <div><div className="font-display font-bold">Pengaturan Pengumuman</div><div className="text-xs text-muted-foreground">Tampil pada halaman cek SPMB</div></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block"><span className="mb-1.5 block text-xs font-semibold">Judul</span>
              <input className={inputCls} value={c.judul} onChange={(e) => setC({ ...c, judul: e.target.value })} maxLength={120} /></label>
            <label className="block"><span className="mb-1.5 block text-xs font-semibold">Gelombang</span>
              <input className={inputCls} value={c.gelombang} onChange={(e) => setC({ ...c, gelombang: e.target.value })} maxLength={40} /></label>
            <label className="block"><span className="mb-1.5 block text-xs font-semibold">Tahun Pelajaran</span>
              <input className={inputCls} value={c.tahun_ajaran} onChange={(e) => setC({ ...c, tahun_ajaran: e.target.value })} maxLength={20} /></label>
            <label className="block"><span className="mb-1.5 block text-xs font-semibold">Jadwal Dibuka</span>
              <input type="datetime-local" className={inputCls}
                value={new Date(c.jadwal_buka).toISOString().slice(0, 16)}
                onChange={(e) => setC({ ...c, jadwal_buka: new Date(e.target.value).toISOString() })} /></label>
            <label className="block"><span className="mb-1.5 block text-xs font-semibold">Tanggal Pengambilan Surat</span>
              <input type="date" className={inputCls} value={c.tanggal_pengambilan} onChange={(e) => setC({ ...c, tanggal_pengambilan: e.target.value })} /></label>
            <label className="block"><span className="mb-1.5 block text-xs font-semibold">Lokasi Pengambilan</span>
              <input className={inputCls} value={c.lokasi_pengambilan} onChange={(e) => setC({ ...c, lokasi_pengambilan: e.target.value })} maxLength={150} /></label>
            <label className="sm:col-span-2 block"><span className="mb-1.5 block text-xs font-semibold">Pesan untuk yang LULUS</span>
              <textarea className={inputCls} rows={2} value={c.pesan_lulus} onChange={(e) => setC({ ...c, pesan_lulus: e.target.value })} maxLength={400} /></label>
            <label className="sm:col-span-2 block"><span className="mb-1.5 block text-xs font-semibold">Pesan untuk yang TIDAK LULUS</span>
              <textarea className={inputCls} rows={2} value={c.pesan_tidak_lulus} onChange={(e) => setC({ ...c, pesan_tidak_lulus: e.target.value })} maxLength={400} /></label>
          </div>
          <button className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md-soft hover:shadow-glow">
            <Save className="h-4 w-4" /> Simpan Pengaturan
          </button>
        </form>

        {/* Form Pendaftar */}
        <form onSubmit={submitPendaftar} className="rounded-2xl border border-border bg-card p-6 shadow-sm-soft">
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><Plus className="h-5 w-5" /></div>
              <div><div className="font-display font-bold">{editId ? "Edit Pendaftar" : "Tambah Pendaftar"}</div><div className="text-xs text-muted-foreground">No. format xx-xxx-xxx-x</div></div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={downloadTemplate} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium hover:bg-accent">
                <Download className="h-3.5 w-3.5" /> Template
              </button>
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10">
                <Upload className="h-3.5 w-3.5" /> Import Excel
                <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={onImport} />
              </label>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block"><span className="mb-1.5 block text-xs font-semibold">No. Pendaftaran</span>
              <input className={inputCls} placeholder="01-061-001-1" value={form.no_pendaftaran}
                onChange={(e) => setForm({ ...form, no_pendaftaran: formatNoPendaftaran(e.target.value) })} maxLength={13} /></label>
            <label className="block lg:col-span-2"><span className="mb-1.5 block text-xs font-semibold">Nama</span>
              <input className={inputCls} value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} maxLength={120} /></label>
            <label className="block"><span className="mb-1.5 block text-xs font-semibold">Asal Sekolah</span>
              <input className={inputCls} value={form.asal_sekolah} onChange={(e) => setForm({ ...form, asal_sekolah: e.target.value })} maxLength={150} /></label>
            <label className="block"><span className="mb-1.5 block text-xs font-semibold">Nilai Matematika <span className="text-muted-foreground font-normal">(opsional)</span></span>
              <input type="number" step="0.01" min="0" max="100" className={inputCls}
                value={form.nilai_matematika} onChange={(e) => setForm({ ...form, nilai_matematika: Number(e.target.value) })} /></label>
            <label className="block"><span className="mb-1.5 block text-xs font-semibold">Nilai IPA <span className="text-muted-foreground font-normal">(opsional)</span></span>
              <input type="number" step="0.01" min="0" max="100" className={inputCls}
                value={form.nilai_ipa} onChange={(e) => setForm({ ...form, nilai_ipa: Number(e.target.value) })} /></label>
            <label className="block"><span className="mb-1.5 block text-xs font-semibold">Nilai Bahasa Inggris <span className="text-muted-foreground font-normal">(opsional)</span></span>
              <input type="number" step="0.01" min="0" max="100" className={inputCls}
                value={form.nilai_bahasa_inggris} onChange={(e) => setForm({ ...form, nilai_bahasa_inggris: Number(e.target.value) })} /></label>
            <label className="block"><span className="mb-1.5 block text-xs font-semibold">Status</span>
              <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as StatusPPDB })}>
                <option value="Lulus">Lulus</option>
                <option value="Tidak Lulus">Tidak Lulus</option>
              </select></label>
            <label className="sm:col-span-2 lg:col-span-4 block"><span className="mb-1.5 block text-xs font-semibold">Catatan (opsional)</span>
              <input className={inputCls} value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} maxLength={300} /></label>
          </div>
          <div className="mt-4 flex gap-2">
            <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md-soft hover:shadow-glow">
              <Save className="h-4 w-4" /> {editId ? "Update" : "Tambah"}
            </button>
            {editId && (
              <button type="button" onClick={() => { setEditId(null); setForm(empty); }} className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium hover:bg-accent">
                Batal
              </button>
            )}
          </div>
        </form>

        {/* List */}
        <div className="rounded-2xl border border-border bg-card shadow-sm-soft">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div className="flex items-center gap-2 text-sm font-semibold"><FileSpreadsheet className="h-4 w-4 text-primary" /> Daftar Pendaftar ({list.length})</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">No. Pendaftaran</th>
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3 text-center">MTK</th>
                  <th className="px-4 py-3 text-center">IPA</th>
                  <th className="px-4 py-3 text-center">B.Ing</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {list.length === 0 && (
                  <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">Belum ada data. Tambah manual atau import dari Excel.</td></tr>
                )}
                {list.map((r) => (
                  <tr key={r.id} className="border-t border-border/60 hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs">{r.no_pendaftaran}</td>
                    <td className="px-4 py-3 font-medium">{r.nama}<div className="text-xs text-muted-foreground">{r.asal_sekolah}</div></td>
                    <td className="px-4 py-3 text-center tabular-nums">{Number(r.nilai_matematika).toFixed(2)}</td>
                    <td className="px-4 py-3 text-center tabular-nums">{Number(r.nilai_ipa).toFixed(2)}</td>
                    <td className="px-4 py-3 text-center tabular-nums">{Number(r.nilai_bahasa_inggris).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${r.status === "Lulus" ? "bg-green-500/15 text-green-700 dark:text-green-300" : "bg-amber-500/15 text-amber-700 dark:text-amber-300"}`}>
                        {r.status === "Lulus" ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => onEdit(r)} className="mr-1 inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs hover:bg-accent">
                        <Pencil className="h-3 w-3" /> Edit
                      </button>
                      <button onClick={() => onDelete(r.id)} className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 bg-destructive/5 px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-3 w-3" /> Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
