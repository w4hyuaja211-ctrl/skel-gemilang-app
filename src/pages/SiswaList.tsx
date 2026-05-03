import AppShell from "@/components/AppShell";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listSiswa, deleteSiswa, importSiswa, getPengumuman, type StatusKelulusan, updateSiswaStatus, listMapel, getNilaiSiswa, type Mapel, type Nilai } from "@/lib/skl-api";
import { Plus, Search, Trash2, FileText, Upload, Download, Edit2, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const TEMPLATE_HEADERS = [
  "NISN", "NIS", "Nama", "TempatLahir", "TanggalLahir", "JenisKelamin",
  "OrangTua", "Alamat", "Kelas", "Jurusan", "TahunAjaran", "NoPesertaUjian",
  "TanggalLulus", "Status", "KeteranganTunda",
];

const statusBadge = (s: StatusKelulusan) => {
  if (s === "Lulus") return "bg-success/10 text-success";
  if (s === "Tunda") return "bg-amber-500/10 text-amber-700 dark:text-amber-400";
  return "bg-destructive/10 text-destructive";
};

const parseExcelDate = (v: any): string | null => {
  if (!v) return null;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "number") {
    const d = XLSX.SSF.parse_date_code(v);
    if (d) return `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
  }
  const s = String(v).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  return null;
};

const normStatus = (v: any): StatusKelulusan => {
  const s = String(v || "").trim().toUpperCase();
  if (s.startsWith("L")) return "Lulus";
  if (s.startsWith("T")) return "Tunda";
  return "Belum";
};

export default function SiswaList() {
  const qc = useQueryClient();
  const { data: siswa = [] } = useQuery({ queryKey: ["siswa-list"], queryFn: listSiswa });
  const { data: pengumuman } = useQuery({ queryKey: ["pengumuman"], queryFn: getPengumuman });
  const { data: mapelList = [] } = useQuery({ queryKey: ["mapel-list"], queryFn: listMapel });
  const [q, setQ] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState<StatusKelulusan>("Belum");
  const [selectedMapel, setSelectedMapel] = useState<string[]>([]);
  const [keteranganTunda, setKeteranganTunda] = useState("");
  const [loadingEdit, setLoadingEdit] = useState(false);

  const filtered = siswa.filter(
    (s) =>
      s.nama.toLowerCase().includes(q.toLowerCase()) ||
      s.nisn.includes(q) ||
      (s.kelas ?? "").toLowerCase().includes(q.toLowerCase())
  );

  const downloadTemplate = () => {
    const ta = pengumuman?.tahun_ajaran ?? "2024/2025";
    const ws = XLSX.utils.aoa_to_sheet([
      TEMPLATE_HEADERS,
      ["0098765432", "2024.001", "Aulia Rahmadani", "Bandung", "2007-05-14", "Perempuan", "Bapak Hendra", "Jl. Merdeka 21", "XII IPA 1", "MIPA", ta, "1234567890", "2025-05-05", "LULUS", ""],
      ["0011223344", "2024.002", "Rizky Pratama", "Jakarta", "2007-03-02", "Laki-laki", "Bapak Sudrajat", "Jl. Kenanga 5", "XII IPS 2", "IPS", ta, "1234567891", "2025-05-05", "TUNDA", "Belum menyelesaikan ujian praktik Penjaskes"],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Siswa");
    XLSX.writeFile(wb, "template-import-siswa.xlsx");
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array", cellDates: true });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<any>(ws, { defval: "" });
      const parsed: any[] = [];
      const errors: string[] = [];
      const ta = pengumuman?.tahun_ajaran ?? "2024/2025";

      rows.forEach((r, i) => {
        const nisn = String(r.NISN || r.nisn || "").replace(/\D/g, "");
        const nama = String(r.Nama || r.nama || "").trim();
        if (!nisn || !nama) return;
        if (!/^\d{10}$/.test(nisn)) {
          errors.push(`Baris ${i + 2}: NISN "${nisn}" bukan 10 digit`);
          return;
        }
        parsed.push({
          nisn,
          nis: String(r.NIS || r.nis || "").trim() || null,
          nama,
          tempat_lahir: String(r.TempatLahir || "").trim() || null,
          tanggal_lahir: parseExcelDate(r.TanggalLahir),
          jenis_kelamin: String(r.JenisKelamin || "").toLowerCase().startsWith("p") ? "Perempuan" : "Laki-laki",
          orang_tua: String(r.OrangTua || "").trim() || null,
          alamat: String(r.Alamat || "").trim() || null,
          kelas: String(r.Kelas || "").trim() || null,
          jurusan: String(r.Jurusan || "").trim() || null,
          tahun_ajaran: String(r.TahunAjaran || ta).trim(),
          nomor_surat: String(r.NomorSurat || r.NoPesertaUjian || "").trim() || null,
          tanggal_lulus: parseExcelDate(r.TanggalLulus),
          status: normStatus(r.Status),
          keterangan_tunda: String(r.KeteranganTunda || "").trim() || null,
        });
      });

      if (parsed.length === 0) {
        toast.error("Tidak ada baris valid ditemukan");
      } else {
        const { count } = await importSiswa(parsed);
        toast.success(`Import sukses: ${count} baris`);
        qc.invalidateQueries({ queryKey: ["siswa-list"] });
      }
      if (errors.length) {
        toast.warning(`${errors.length} baris dilewati`, { description: errors.slice(0, 3).join("\n") });
      }
    } catch (err: any) {
      toast.error("Gagal membaca file", { description: err?.message });
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onDelete = async (id: string, nama: string) => {
    if (!confirm(`Hapus data ${nama}?`)) return;
    await deleteSiswa(id);
    toast.success("Data dihapus");
    qc.invalidateQueries({ queryKey: ["siswa-list"] });
  };

  const openEditModal = async (siswa: any) => {
    setSelectedSiswa(siswa);
    setSelectedStatus(siswa.status);
    setKeteranganTunda(siswa.keterangan_tunda || "");
    
    const existingNilai = await getNilaiSiswa(siswa.id);
    setSelectedMapel(existingNilai.map((n) => n.mapel));
    
    setEditModalOpen(true);
  };

  const saveStatus = async () => {
    if (!selectedSiswa) return;
    setLoadingEdit(true);
    
    try {
      let keterangan = keteranganTunda;
      if (selectedStatus === "Tunda" && selectedMapel.length > 0) {
        const mapelNames = selectedMapel.join(", ");
        keterangan = `Belum menyelesaikan ujian praktik mata pelajaran: ${mapelNames}${keteranganTunda ? ` | ${keteranganTunda}` : ""}`;
      }
      
      await updateSiswaStatus(selectedSiswa.id, selectedStatus, keterangan || null);
      toast.success("Status kelulusan berhasil diperbarui");
      qc.invalidateQueries({ queryKey: ["siswa-list"] });
      setEditModalOpen(false);
    } catch (err: any) {
      toast.error("Gagal memperbarui status", { description: err?.message });
    } finally {
      setLoadingEdit(false);
    }
  };

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">Manajemen Siswa</div>
          <h1 className="mt-1 font-display text-3xl font-bold">Data Siswa</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={downloadTemplate} className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-accent">
            <Download className="h-4 w-4" /> Template Excel
          </button>
          <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10">
            <Upload className="h-4 w-4" /> Import Excel
          </button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} className="hidden" />
          <Link to="/siswa/baru" className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md-soft hover:shadow-glow">
            <Plus className="h-4 w-4" /> Tambah
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm-soft">
        <div className="border-b border-border p-4">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama, NISN, atau kelas..." className="w-full rounded-xl border border-input bg-background py-2.5 pl-9 pr-3 text-sm outline-none ring-primary/20 focus:ring-2" />
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
                        <div className="text-xs text-muted-foreground">
                          {s.tempat_lahir}
                          {s.tanggal_lahir && `, ${new Date(s.tanggal_lahir).toLocaleDateString("id-ID")}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs">{s.nisn}</td>
                  <td className="px-5 py-4">{s.kelas ?? "-"}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${statusBadge(s.status)}`}>{s.status}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1">
                      <Link to={`/siswa/edit/${s.id}`} className="inline-flex items-center gap-1 rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-500/20">
                        <Edit2 className="h-3.5 w-3.5" /> Edit
                      </Link>
                      <button onClick={() => openEditModal(s)} className="inline-flex items-center gap-1 rounded-lg bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-500/20">
                        <Edit2 className="h-3.5 w-3.5" /> Status
                      </button>
                      <Link to={`/skl/${s.id}`} className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20">
                        <FileText className="h-3.5 w-3.5" /> Surat
                      </Link>
                      <button onClick={() => onDelete(s.id, s.nama)} className="inline-flex items-center gap-1 rounded-lg bg-destructive/10 px-2.5 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/20">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-sm text-muted-foreground">
                    Tidak ada data. Gunakan tombol <strong>Import Excel</strong> untuk menambah massal.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Status Kelulusan</DialogTitle>
          </DialogHeader>
          {selectedSiswa && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-primary text-sm font-bold text-primary-foreground">
                  {selectedSiswa.nama.split(" ").map((w: string) => w[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <div className="font-semibold">{selectedSiswa.nama}</div>
                  <div className="text-xs text-muted-foreground font-mono">{selectedSiswa.nisn}</div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold">Status Kelulusan</Label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedStatus("Lulus")}
                    className={`flex flex-col items-center gap-1 rounded-xl border p-3 ${selectedStatus === "Lulus" ? "border-green-500 bg-green-50 dark:bg-green-950/30" : "border-border hover:bg-accent"}`}
                  >
                    <CheckCircle2 className={`h-6 w-6 ${selectedStatus === "Lulus" ? "text-green-600" : "text-muted-foreground"}`} />
                    <span className="text-xs font-semibold">Lulus</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStatus("Belum")}
                    className={`flex flex-col items-center gap-1 rounded-xl border p-3 ${selectedStatus === "Belum" ? "border-gray-500 bg-gray-50 dark:bg-gray-950/30" : "border-border hover:bg-accent"}`}
                  >
                    <Clock className={`h-6 w-6 ${selectedStatus === "Belum" ? "text-gray-600" : "text-muted-foreground"}`} />
                    <span className="text-xs font-semibold">Belum</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStatus("Tunda")}
                    className={`flex flex-col items-center gap-1 rounded-xl border p-3 ${selectedStatus === "Tunda" ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30" : "border-border hover:bg-accent"}`}
                  >
                    <XCircle className={`h-6 w-6 ${selectedStatus === "Tunda" ? "text-amber-600" : "text-muted-foreground"}`} />
                    <span className="text-xs font-semibold">Tunda</span>
                  </button>
                </div>
              </div>

              {selectedStatus === "Tunda" && (
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Mata Pelajaran (Opsional)</Label>
                  <div className="grid grid-cols-2 gap-2 border border-border rounded-xl p-3">
                    {mapelList.map((m) => (
                      <div key={m.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`mapel-${m.id}`}
                          checked={selectedMapel.includes(m.nama)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedMapel([...selectedMapel, m.nama]);
                            } else {
                              setSelectedMapel(selectedMapel.filter((n) => n !== m.nama));
                            }
                          }}
                        />
                        <Label htmlFor={`mapel-${m.id}`} className="text-xs cursor-pointer">
                          {m.nama}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-semibold">Keterangan Tambahan</Label>
                    <Textarea
                      value={keteranganTunda}
                      onChange={(e) => setKeteranganTunda(e.target.value)}
                      placeholder="Masukkan alasan tunda..."
                      className="text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setEditModalOpen(false)}>
              Batal
            </Button>
            <Button onClick={saveStatus} disabled={loadingEdit}>
              {loadingEdit ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
