import AppShell from "@/components/AppShell";
import { useSKL } from "@/store/skl";
import { useState } from "react";
import { toast } from "sonner";
import { Save, School } from "lucide-react";

const inputCls = "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none ring-primary/20 focus:ring-2";

export default function Pengaturan() {
  const sekolah = useSKL((s) => s.sekolah);
  const setSekolah = useSKL((s) => s.setSekolah);
  const [form, setForm] = useState(sekolah);

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">Pengaturan</div>
          <h1 className="mt-1 font-display text-3xl font-bold">Profil Sekolah</h1>
          <p className="mt-1 text-sm text-muted-foreground">Data ini akan muncul pada kop SKL.</p>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); setSekolah(form); toast.success("Pengaturan disimpan"); }}
          className="rounded-2xl border border-border bg-card p-6 shadow-sm-soft"
        >
          <div className="mb-6 flex items-center gap-3 border-b border-border pb-4">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
              <School className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display font-bold">Informasi Lembaga</div>
              <div className="text-xs text-muted-foreground">Identitas sekolah Anda</div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2 block">
              <span className="mb-1.5 block text-xs font-semibold">Nama Sekolah</span>
              <input className={inputCls} value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} maxLength={150} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold">NPSN</span>
              <input className={inputCls} value={form.npsn} onChange={(e) => setForm({ ...form, npsn: e.target.value })} maxLength={20} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold">Kepala Sekolah</span>
              <input className={inputCls} value={form.kepalaSekolah} onChange={(e) => setForm({ ...form, kepalaSekolah: e.target.value })} maxLength={100} />
            </label>
            <label className="sm:col-span-2 block">
              <span className="mb-1.5 block text-xs font-semibold">Alamat</span>
              <input className={inputCls} value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} maxLength={200} />
            </label>
            <label className="sm:col-span-2 block">
              <span className="mb-1.5 block text-xs font-semibold">NIP Kepala Sekolah</span>
              <input className={inputCls} value={form.nipKepsek} onChange={(e) => setForm({ ...form, nipKepsek: e.target.value })} maxLength={30} />
            </label>
          </div>

          <button className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md-soft hover:shadow-glow">
            <Save className="h-4 w-4" /> Simpan Perubahan
          </button>
        </form>
      </div>
    </AppShell>
  );
}
