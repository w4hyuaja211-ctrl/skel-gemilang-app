import AppShell from "@/components/AppShell";
import { useSKL, type TipeSurat } from "@/store/skl";
import { useState } from "react";
import { toast } from "sonner";
import { Save, School, Megaphone, FileType2 } from "lucide-react";

const inputCls =
  "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none ring-primary/20 focus:ring-2";

const tipeOptions: TipeSurat[] = [
  "SKL",
  "SKHU Sementara",
  "Surat Keterangan Pengganti Ijazah",
];

export default function Pengaturan() {
  const { sekolah, pengumuman, setSekolah, setPengumuman } = useSKL();
  const [s, setS] = useState(sekolah);
  const [p, setP] = useState(pengumuman);

  const simpan = (e: React.FormEvent) => {
    e.preventDefault();
    setSekolah(s);
    setPengumuman(p);
    toast.success("Pengaturan berhasil disimpan");
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">
            Pengaturan
          </div>
          <h1 className="mt-1 font-display text-3xl font-bold">
            Pengumuman & Profil Sekolah
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Atur halaman depan pengumuman, jadwal pembukaan, tipe surat, dan identitas sekolah.
          </p>
        </div>

        <form onSubmit={simpan} className="space-y-6">
          {/* PENGUMUMAN */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm-soft">
            <div className="mb-6 flex items-center gap-3 border-b border-border pb-4">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <Megaphone className="h-5 w-5" />
              </div>
              <div>
                <div className="font-display font-bold">Halaman Pengumuman</div>
                <div className="text-xs text-muted-foreground">
                  Tampil di halaman depan untuk siswa
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold">Tahun Pelajaran</span>
                <input
                  className={inputCls}
                  value={p.tahunAjaran}
                  onChange={(e) => setP({ ...p, tahunAjaran: e.target.value })}
                  maxLength={20}
                  placeholder="2024/2025"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold">
                  Jadwal Pembukaan Pengumuman
                </span>
                <input
                  type="datetime-local"
                  className={inputCls}
                  value={p.jadwalBuka.slice(0, 16)}
                  onChange={(e) => setP({ ...p, jadwalBuka: e.target.value })}
                />
              </label>
              <label className="sm:col-span-2 block">
                <span className="mb-1.5 block text-xs font-semibold">Header / Judul</span>
                <input
                  className={inputCls}
                  value={p.headerJudul}
                  onChange={(e) => setP({ ...p, headerJudul: e.target.value })}
                  maxLength={120}
                />
              </label>
              <label className="sm:col-span-2 block">
                <span className="mb-1.5 block text-xs font-semibold">Sub-header</span>
                <input
                  className={inputCls}
                  value={p.headerSub}
                  onChange={(e) => setP({ ...p, headerSub: e.target.value })}
                  maxLength={150}
                />
              </label>
              <label className="sm:col-span-2 block">
                <span className="mb-1.5 block text-xs font-semibold">Teks Footer</span>
                <textarea
                  className={inputCls}
                  rows={2}
                  value={p.footerTeks}
                  onChange={(e) => setP({ ...p, footerTeks: e.target.value })}
                  maxLength={300}
                />
              </label>
              <label className="sm:col-span-2 block">
                <span className="mb-1.5 block text-xs font-semibold">
                  Pesan untuk Status TUNDA
                </span>
                <textarea
                  className={inputCls}
                  rows={2}
                  value={p.pesanTunda}
                  onChange={(e) => setP({ ...p, pesanTunda: e.target.value })}
                  maxLength={400}
                  placeholder="Pesan yang muncul untuk siswa berstatus TUNDA"
                />
              </label>
            </div>
          </section>

          {/* TIPE SURAT */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm-soft">
            <div className="mb-6 flex items-center gap-3 border-b border-border pb-4">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <FileType2 className="h-5 w-5" />
              </div>
              <div>
                <div className="font-display font-bold">Tipe Surat Aktif</div>
                <div className="text-xs text-muted-foreground">
                  Berlaku untuk semua siswa
                </div>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {tipeOptions.map((t) => (
                <label
                  key={t}
                  className={`cursor-pointer rounded-xl border p-4 text-sm transition ${
                    p.tipeSurat === t
                      ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                      : "border-border bg-background hover:border-primary/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="tipe"
                    className="sr-only"
                    checked={p.tipeSurat === t}
                    onChange={() => setP({ ...p, tipeSurat: t })}
                  />
                  <div className="font-semibold">{t}</div>
                </label>
              ))}
            </div>
          </section>

          {/* PROFIL SEKOLAH */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm-soft">
            <div className="mb-6 flex items-center gap-3 border-b border-border pb-4">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <School className="h-5 w-5" />
              </div>
              <div>
                <div className="font-display font-bold">Profil Sekolah</div>
                <div className="text-xs text-muted-foreground">Muncul di kop surat</div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2 block">
                <span className="mb-1.5 block text-xs font-semibold">Nama Sekolah</span>
                <input
                  className={inputCls}
                  value={s.nama}
                  onChange={(e) => setS({ ...s, nama: e.target.value })}
                  maxLength={150}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold">NPSN</span>
                <input
                  className={inputCls}
                  value={s.npsn}
                  onChange={(e) => setS({ ...s, npsn: e.target.value })}
                  maxLength={20}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold">Kepala Sekolah</span>
                <input
                  className={inputCls}
                  value={s.kepalaSekolah}
                  onChange={(e) => setS({ ...s, kepalaSekolah: e.target.value })}
                  maxLength={100}
                />
              </label>
              <label className="sm:col-span-2 block">
                <span className="mb-1.5 block text-xs font-semibold">Alamat</span>
                <input
                  className={inputCls}
                  value={s.alamat}
                  onChange={(e) => setS({ ...s, alamat: e.target.value })}
                  maxLength={200}
                />
              </label>
              <label className="sm:col-span-2 block">
                <span className="mb-1.5 block text-xs font-semibold">NIP Kepala Sekolah</span>
                <input
                  className={inputCls}
                  value={s.nipKepsek}
                  onChange={(e) => setS({ ...s, nipKepsek: e.target.value })}
                  maxLength={30}
                />
              </label>
            </div>
          </section>

          <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md-soft hover:shadow-glow">
            <Save className="h-4 w-4" /> Simpan Semua Perubahan
          </button>
        </form>
      </div>
    </AppShell>
  );
}
