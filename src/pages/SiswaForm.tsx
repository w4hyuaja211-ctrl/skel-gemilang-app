import AppShell from "@/components/AppShell";
import { useSKL, type Nilai } from "@/store/skl";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, ArrowLeft, Save } from "lucide-react";
import { z } from "zod";

const schema = z.object({
  nisn: z.string().trim().min(4, "NISN minimal 4 digit").max(20),
  nis: z.string().trim().max(20),
  nama: z.string().trim().min(2, "Nama wajib diisi").max(100),
  tempatLahir: z.string().trim().min(2).max(60),
  tanggalLahir: z.string().min(1, "Tanggal lahir wajib"),
  orangTua: z.string().trim().max(100),
  alamat: z.string().trim().max(200),
  kelas: z.string().trim().min(1, "Kelas wajib"),
  jurusan: z.string().trim().max(50).optional(),
  tahunAjaran: z.string().trim().min(4),
  tanggalLulus: z.string().min(1, "Tanggal lulus wajib"),
  nomorSurat: z.string().trim().min(1, "Nomor surat wajib"),
});

const Field = ({ label, children, required }: any) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-semibold text-foreground">
      {label} {required && <span className="text-destructive">*</span>}
    </span>
    {children}
  </label>
);

const inputCls = "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none ring-primary/20 focus:ring-2 transition";

export default function SiswaForm() {
  const nav = useNavigate();
  const add = useSKL((s) => s.addSiswa);
  const [form, setForm] = useState({
    nisn: "",
    nis: "",
    nama: "",
    tempatLahir: "",
    tanggalLahir: "",
    jenisKelamin: "Laki-laki" as "Laki-laki" | "Perempuan",
    orangTua: "",
    alamat: "",
    kelas: "",
    jurusan: "",
    tahunAjaran: "2024/2025",
    tanggalLulus: new Date().toISOString().slice(0, 10),
    nomorSurat: "",
    status: "Lulus" as "Lulus" | "Tidak Lulus",
  });
  const [nilai, setNilai] = useState<Nilai[]>([]);

  const set = (k: keyof typeof form, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    const created = add({ ...form, nilai });
    toast.success("Data siswa berhasil ditambahkan");
    nav(`/skl/${created.id}`);
  };

  return (
    <AppShell>
      <button onClick={() => nav(-1)} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Kembali
      </button>
      <div className="mb-6">
        <div className="text-xs font-semibold uppercase tracking-widest text-primary">Form Input</div>
        <h1 className="mt-1 font-display text-3xl font-bold">Tambah Siswa & SKL</h1>
      </div>

      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm-soft">
            <h2 className="mb-4 font-display text-base font-bold">Identitas Siswa</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nama Lengkap" required><input className={inputCls} value={form.nama} onChange={(e) => set("nama", e.target.value)} maxLength={100} /></Field>
              <Field label="NISN" required><input className={inputCls} value={form.nisn} onChange={(e) => set("nisn", e.target.value)} maxLength={20} /></Field>
              <Field label="NIS"><input className={inputCls} value={form.nis} onChange={(e) => set("nis", e.target.value)} maxLength={20} /></Field>
              <Field label="Jenis Kelamin">
                <select className={inputCls} value={form.jenisKelamin} onChange={(e) => set("jenisKelamin", e.target.value)}>
                  <option>Laki-laki</option><option>Perempuan</option>
                </select>
              </Field>
              <Field label="Tempat Lahir" required><input className={inputCls} value={form.tempatLahir} onChange={(e) => set("tempatLahir", e.target.value)} maxLength={60} /></Field>
              <Field label="Tanggal Lahir" required><input type="date" className={inputCls} value={form.tanggalLahir} onChange={(e) => set("tanggalLahir", e.target.value)} /></Field>
              <Field label="Nama Orang Tua/Wali"><input className={inputCls} value={form.orangTua} onChange={(e) => set("orangTua", e.target.value)} maxLength={100} /></Field>
              <Field label="Alamat"><input className={inputCls} value={form.alamat} onChange={(e) => set("alamat", e.target.value)} maxLength={200} /></Field>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm-soft">
            <h2 className="mb-4 font-display text-base font-bold">Akademik</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Kelas" required><input className={inputCls} value={form.kelas} onChange={(e) => set("kelas", e.target.value)} placeholder="XII IPA 1" /></Field>
              <Field label="Jurusan / Program"><input className={inputCls} value={form.jurusan} onChange={(e) => set("jurusan", e.target.value)} placeholder="MIPA" /></Field>
              <Field label="Tahun Ajaran" required><input className={inputCls} value={form.tahunAjaran} onChange={(e) => set("tahunAjaran", e.target.value)} /></Field>
              <Field label="Status Kelulusan">
                <select className={inputCls} value={form.status} onChange={(e) => set("status", e.target.value)}>
                  <option>Lulus</option><option>Tidak Lulus</option>
                </select>
              </Field>
              <Field label="Nomor Surat" required><input className={inputCls} value={form.nomorSurat} onChange={(e) => set("nomorSurat", e.target.value)} placeholder="421/SKL/045/2025" /></Field>
              <Field label="Tanggal Lulus" required><input type="date" className={inputCls} value={form.tanggalLulus} onChange={(e) => set("tanggalLulus", e.target.value)} /></Field>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm-soft">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-display text-base font-bold">Nilai Mata Pelajaran <span className="ml-1 text-xs font-normal text-muted-foreground">(opsional)</span></h2>
              <button type="button" onClick={() => setNilai([...nilai, { mapel: "", nilai: 0 }])} className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20">
                <Plus className="h-3.5 w-3.5" /> Tambah
              </button>
            </div>
            <p className="mb-4 text-xs text-muted-foreground">Boleh dikosongkan jika hanya untuk pengumuman kelulusan.</p>
            <div className="space-y-2">
              {nilai.map((n, i) => (
                <div key={i} className="grid grid-cols-[1fr_100px_auto] gap-2">
                  <input className={inputCls} value={n.mapel} onChange={(e) => setNilai(nilai.map((x, j) => j === i ? { ...x, mapel: e.target.value } : x))} placeholder="Mata pelajaran" maxLength={50} />
                  <input type="number" min={0} max={100} className={inputCls} value={n.nilai} onChange={(e) => setNilai(nilai.map((x, j) => j === i ? { ...x, nilai: Number(e.target.value) } : x))} />
                  <button type="button" onClick={() => setNilai(nilai.filter((_, j) => j !== i))} className="grid h-10 w-10 place-items-center rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-border bg-gradient-primary p-6 text-primary-foreground shadow-md-soft">
            <h3 className="font-display text-lg font-bold">Siap menerbitkan?</h3>
            <p className="mt-2 text-sm opacity-90">Setelah disimpan, SKL akan langsung di-generate lengkap dengan QR Code untuk verifikasi.</p>
            <button type="submit" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-background px-5 py-3 text-sm font-semibold text-foreground hover:bg-background/90">
              <Save className="h-4 w-4" /> Simpan & Terbitkan
            </button>
          </div>
        </aside>
      </form>
    </AppShell>
  );
}
