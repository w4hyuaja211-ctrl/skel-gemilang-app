import AppShell from "@/components/AppShell";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { addSiswa, getPengumuman, listKelas, listJurusan, listMapel, type StatusKelulusan, type Nilai } from "@/lib/skl-api";
import { toast } from "sonner";
import { Plus, Trash2, ArrowLeft, Save } from "lucide-react";
import { z } from "zod";

const schema = z.object({
  nisn: z.string().regex(/^\d{10}$/, "NISN harus 10 digit angka"),
  nama: z.string().trim().min(2, "Nama wajib diisi").max(100),
  tempat_lahir: z.string().trim().min(2).max(60),
  tanggal_lahir: z.string().min(1, "Tanggal lahir wajib"),
  kelas: z.string().trim().min(1, "Kelas wajib"),
  tahun_ajaran: z.string().trim().min(4),
  tanggal_lulus: z.string().min(1, "Tanggal lulus wajib"),
  nomor_surat: z.string().trim().min(1, "Nomor surat wajib"),
});

const Field = ({ label, children, required }: any) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-semibold text-foreground">{label} {required && <span className="text-destructive">*</span>}</span>
    {children}
  </label>
);
const inputCls = "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none ring-primary/20 focus:ring-2 transition";

export default function SiswaForm() {
  const nav = useNavigate();
  const { data: pengumuman } = useQuery({ queryKey: ["pengumuman"], queryFn: getPengumuman });
  const { data: kelasList = [] } = useQuery({ queryKey: ["kelas"], queryFn: listKelas });
  const { data: jurusanList = [] } = useQuery({ queryKey: ["jurusan"], queryFn: listJurusan });
  const { data: mapelList = [] } = useQuery({ queryKey: ["mapel"], queryFn: listMapel });

  const [form, setForm] = useState({
    nisn: "",
    nis: "",
    nama: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    jenis_kelamin: "Laki-laki" as "Laki-laki" | "Perempuan",
    orang_tua: "",
    alamat: "",
    kelas: "",
    jurusan: "",
    tahun_ajaran: "",
    tanggal_lulus: new Date().toISOString().slice(0, 10),
    nomor_surat: "",
    status: "Lulus" as StatusKelulusan,
    keterangan_tunda: "",
  });
  const [nilai, setNilai] = useState<Nilai[]>([]);
  const [busy, setBusy] = useState(false);

  // hydrate tahun_ajaran when pengumuman ready
  if (pengumuman && !form.tahun_ajaran) {
    setForm((p) => ({ ...p, tahun_ajaran: pengumuman.tahun_ajaran }));
  }

  const set = (k: keyof typeof form, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    if (form.status === "Tunda" && !form.keterangan_tunda.trim()) {
      toast.error("Status TUNDA wajib mencantumkan keterangan");
      return;
    }
    setBusy(true);
    try {
      const created = await addSiswa({
        ...form,
        nis: form.nis || null,
        orang_tua: form.orang_tua || null,
        alamat: form.alamat || null,
        jurusan: form.jurusan || null,
        keterangan_tunda: form.status === "Tunda" ? form.keterangan_tunda : null,
        nilai,
      } as any);
      toast.success("Data siswa berhasil ditambahkan");
      nav(`/skl/${created.id}`);
    } catch (e: any) {
      toast.error("Gagal menyimpan", { description: e.message });
    } finally { setBusy(false); }
  };

  const statusOpts: { v: StatusKelulusan; cls: string }[] = [
    { v: "Lulus", cls: "border-success/40 bg-success/5 text-success" },
    { v: "Belum", cls: "border-destructive/40 bg-destructive/5 text-destructive" },
    { v: "Tunda", cls: "border-amber-500/40 bg-amber-500/5 text-amber-700 dark:text-amber-400" },
  ];

  return (
    <AppShell>
      <button onClick={() => nav(-1)} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Kembali
      </button>
      <div className="mb-6">
        <div className="text-xs font-semibold uppercase tracking-widest text-primary">Form Input</div>
        <h1 className="mt-1 font-display text-3xl font-bold">Tambah Siswa</h1>
      </div>

      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm-soft">
            <h2 className="mb-4 font-display text-base font-bold">Identitas Siswa</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nama Lengkap" required>
                <input className={inputCls} value={form.nama} onChange={(e) => set("nama", e.target.value)} maxLength={100} />
              </Field>
              <Field label="NISN (10 digit)" required>
                <input className={inputCls} value={form.nisn} onChange={(e) => set("nisn", e.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" maxLength={10} placeholder="0000000000" />
              </Field>
              <Field label="NIS">
                <input className={inputCls} value={form.nis} onChange={(e) => set("nis", e.target.value)} maxLength={20} />
              </Field>
              <Field label="Jenis Kelamin">
                <select className={inputCls} value={form.jenis_kelamin} onChange={(e) => set("jenis_kelamin", e.target.value)}>
                  <option>Laki-laki</option>
                  <option>Perempuan</option>
                </select>
              </Field>
              <Field label="Tempat Lahir" required>
                <input className={inputCls} value={form.tempat_lahir} onChange={(e) => set("tempat_lahir", e.target.value)} maxLength={60} />
              </Field>
              <Field label="Tanggal Lahir" required>
                <input type="date" className={inputCls} value={form.tanggal_lahir} onChange={(e) => set("tanggal_lahir", e.target.value)} />
              </Field>
              <Field label="Nama Orang Tua/Wali">
                <input className={inputCls} value={form.orang_tua} onChange={(e) => set("orang_tua", e.target.value)} maxLength={100} />
              </Field>
              <Field label="Alamat">
                <input className={inputCls} value={form.alamat} onChange={(e) => set("alamat", e.target.value)} maxLength={200} />
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm-soft">
            <h2 className="mb-4 font-display text-base font-bold">Akademik & Kelulusan</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Kelas" required>
                <select className={inputCls} value={form.kelas} onChange={(e) => set("kelas", e.target.value)}>
                  <option value="">— pilih kelas —</option>
                  {kelasList.map((k) => <option key={k.id} value={k.nama}>{k.nama}</option>)}
                </select>
              </Field>
              <Field label="Jurusan / Program">
                <select className={inputCls} value={form.jurusan} onChange={(e) => set("jurusan", e.target.value)}>
                  <option value="">— pilih jurusan —</option>
                  {jurusanList.map((j) => <option key={j.id} value={j.nama}>{j.nama}</option>)}
                </select>
              </Field>
              <Field label="Tahun Pelajaran" required>
                <input className={inputCls} value={form.tahun_ajaran} onChange={(e) => set("tahun_ajaran", e.target.value)} />
              </Field>
              <Field label="Nomor Surat" required>
                <input className={inputCls} value={form.nomor_surat} onChange={(e) => set("nomor_surat", e.target.value)} placeholder="421/SKL/045/2025" />
              </Field>
              <Field label="Tanggal Lulus" required>
                <input type="date" className={inputCls} value={form.tanggal_lulus} onChange={(e) => set("tanggal_lulus", e.target.value)} />
              </Field>

              <div className="sm:col-span-2">
                <span className="mb-1.5 block text-xs font-semibold">Status Kelulusan</span>
                <div className="grid gap-2 sm:grid-cols-3">
                  {statusOpts.map((o) => (
                    <label key={o.v} className={`cursor-pointer rounded-xl border p-3 text-center text-sm font-bold uppercase tracking-wider transition ${form.status === o.v ? `${o.cls} ring-2 ring-current/30` : "border-border bg-background"}`}>
                      <input type="radio" className="sr-only" checked={form.status === o.v} onChange={() => set("status", o.v)} />
                      {o.v}
                    </label>
                  ))}
                </div>
              </div>

              {form.status === "Tunda" && (
                <Field label="Keterangan Tunda" required>
                  <textarea className={inputCls} rows={3} value={form.keterangan_tunda} onChange={(e) => set("keterangan_tunda", e.target.value)} maxLength={300} placeholder="Contoh: Belum menyelesaikan ujian praktik Penjaskes, Seni Budaya" />
                </Field>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm-soft">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-display text-base font-bold">Nilai Mata Pelajaran <span className="ml-1 text-xs font-normal text-muted-foreground">(opsional)</span></h2>
              <button type="button" onClick={() => setNilai([...nilai, { mapel: "", nilai: 0 }])} className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20">
                <Plus className="h-3.5 w-3.5" /> Tambah
              </button>
            </div>
            <p className="mb-4 text-xs text-muted-foreground">Pilih dari daftar mapel yang sudah dikelola di Master Data.</p>
            <div className="space-y-2">
              {nilai.map((n, i) => (
                <div key={i} className="grid grid-cols-[1fr_100px_auto] gap-2">
                  <select className={inputCls} value={n.mapel} onChange={(e) => setNilai(nilai.map((x, j) => (j === i ? { ...x, mapel: e.target.value } : x)))}>
                    <option value="">— pilih mapel —</option>
                    {mapelList.map((m) => <option key={m.id} value={m.nama}>{m.nama}</option>)}
                  </select>
                  <input type="number" min={0} max={100} step="0.01" className={inputCls} value={n.nilai} onChange={(e) => setNilai(nilai.map((x, j) => (j === i ? { ...x, nilai: Number(e.target.value) } : x)))} />
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
            <p className="mt-2 text-sm opacity-90">Tipe surat akan mengikuti pengaturan global: <strong>{pengumuman?.tipe_surat}</strong>.</p>
            <button type="submit" disabled={busy} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-background px-5 py-3 text-sm font-semibold text-foreground hover:bg-background/90 disabled:opacity-60">
              <Save className="h-4 w-4" /> {busy ? "Menyimpan…" : "Simpan"}
            </button>
          </div>
        </aside>
      </form>
    </AppShell>
  );
}
