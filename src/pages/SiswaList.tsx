import AppShell from "@/components/AppShell";
import { Link } from "react-router-dom";
import { useSKL, type StatusKelulusan, type Siswa } from "@/store/skl";
import { Plus, Search, Trash2, FileText, Upload, Download } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

const TEMPLATE_HEADERS = [
  "NISN",
  "NIS",
  "Nama",
  "TempatLahir",
  "TanggalLahir",
  "JenisKelamin",
  "OrangTua",
  "Alamat",
  "Kelas",
  "Jurusan",
  "TahunAjaran",
  "NomorSurat",
  "TanggalLulus",
  "Status",
  "KeteranganTunda",
];

const statusBadge = (s: StatusKelulusan) => {
  if (s === "Lulus") return "bg-success/10 text-success";
  if (s === "Tunda") return "bg-amber-500/10 text-amber-700 dark:text-amber-400";
  return "bg-destructive/10 text-destructive";
};

const parseExcelDate = (v: any): string => {
  if (!v) return "";
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "number") {
    const d = XLSX.SSF.parse_date_code(v);
    if (d) return `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
  }
  const s = String(v).trim();
  // accept yyyy-mm-dd or dd/mm/yyyy
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  return s;
};

const normStatus = (v: any): StatusKelulusan => {
  const s = String(v || "").trim().toUpperCase();
  if (s.startsWith("L")) return "Lulus";
  if (s.startsWith("T")) return "Tunda";
  return "Belum";
};

export default function SiswaList() {
  const siswa = useSKL((s) => s.siswa);
  const del = useSKL((s) => s.deleteSiswa);
  const importSiswa = useSKL((s) => s.importSiswa);
  const pengumuman = useSKL((s) => s.pengumuman);
  const [q, setQ] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = siswa.filter(
    (s) =>
      s.nama.toLowerCase().includes(q.toLowerCase()) ||
      s.nisn.includes(q) ||
      s.kelas.toLowerCase().includes(q.toLowerCase())
  );

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      TEMPLATE_HEADERS,
      [
        "0098765432",
        "2024.001",
        "Aulia Rahmadani",
        "Bandung",
        "2007-05-14",
        "Perempuan",
        "Bapak Hendra",
        "Jl. Merdeka 21",
        "XII IPA 1",
        "MIPA",
        pengumuman.tahunAjaran,
        "421/SKL/045/2025",
        "2025-05-05",
        "LULUS",
        "",
      ],
      [
        "0011223344",
        "2024.002",
        "Rizky Pratama",
        "Jakarta",
        "2007-03-02",
        "Laki-laki",
        "Bapak Sudrajat",
        "Jl. Kenanga 5",
        "XII IPS 2",
        "IPS",
        pengumuman.tahunAjaran,
        "421/SKL/046/2025",
        "2025-05-05",
        "TUNDA",
        "Belum menyelesaikan ujian praktik Penjaskes",
      ],
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
      const parsed: Omit<Siswa, "id" | "createdAt">[] = [];
      const errors: string[] = [];

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
          nis: String(r.NIS || r.nis || "").trim(),
          nama,
          tempatLahir: String(r.TempatLahir || "").trim(),
          tanggalLahir: parseExcelDate(r.TanggalLahir),
          jenisKelamin:
            String(r.JenisKelamin || "").toLowerCase().startsWith("p")
              ? "Perempuan"
              : "Laki-laki",
          orangTua: String(r.OrangTua || "").trim(),
          alamat: String(r.Alamat || "").trim(),
          kelas: String(r.Kelas || "").trim(),
          jurusan: String(r.Jurusan || "").trim(),
          tahunAjaran: String(r.TahunAjaran || pengumuman.tahunAjaran).trim(),
          nomorSurat: String(r.NomorSurat || "").trim(),
          tanggalLulus: parseExcelDate(r.TanggalLulus) || new Date().toISOString().slice(0, 10),
          status: normStatus(r.Status),
          keteranganTunda: String(r.KeteranganTunda || "").trim(),
          nilai: [],
        });
      });

      if (parsed.length === 0) {
        toast.error("Tidak ada baris valid ditemukan");
      } else {
        const { added, updated } = importSiswa(parsed);
        toast.success(`Import sukses: ${added} ditambah, ${updated} diperbarui`);
      }
      if (errors.length) {
        toast.warning(`${errors.length} baris dilewati`, {
          description: errors.slice(0, 3).join("\n"),
        });
      }
    } catch (err: any) {
      toast.error("Gagal membaca file", { description: err?.message });
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">
            Manajemen Siswa
          </div>
          <h1 className="mt-1 font-display text-3xl font-bold">Data Siswa</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={downloadTemplate}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-accent"
          >
            <Download className="h-4 w-4" /> Template Excel
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10"
          >
            <Upload className="h-4 w-4" /> Import Excel
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFile}
            className="hidden"
          />
          <Link
            to="/siswa/baru"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md-soft hover:shadow-glow"
          >
            <Plus className="h-4 w-4" /> Tambah
          </Link>
        </div>
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
                        <div className="text-xs text-muted-foreground">
                          {s.tempatLahir}
                          {s.tanggalLahir &&
                            `, ${new Date(s.tanggalLahir).toLocaleDateString("id-ID")}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs">{s.nisn}</td>
                  <td className="px-5 py-4">{s.kelas}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${statusBadge(
                        s.status
                      )}`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1">
                      <Link
                        to={`/skl/${s.id}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20"
                      >
                        <FileText className="h-3.5 w-3.5" /> Surat
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
    </AppShell>
  );
}
