import AppShell from "@/components/AppShell";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSekolah, getPengumuman, updateSekolah, updatePengumuman, uploadLogo, type TipeSurat } from "@/lib/skl-api";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save, School, Megaphone, FileType2, Image as ImageIcon, Loader2, Trash2 } from "lucide-react";
import { removeBackground } from "@/lib/remove-bg";

const inputCls = "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none ring-primary/20 focus:ring-2";
const tipeOptions: TipeSurat[] = ["SKL", "SKHU Sementara", "Surat Keterangan Pengganti Ijazah"];

export default function Pengaturan() {
  const qc = useQueryClient();
  const { data: sekolah } = useQuery({ queryKey: ["sekolah"], queryFn: getSekolah });
  const { data: pengumuman } = useQuery({ queryKey: ["pengumuman"], queryFn: getPengumuman });

  const [s, setS] = useState(sekolah);
  const [p, setP] = useState(pengumuman);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { if (sekolah) setS(sekolah); }, [sekolah]);
  useEffect(() => { if (pengumuman) setP(pengumuman); }, [pengumuman]);

  if (!s || !p) return <AppShell><div className="p-10 text-center text-sm text-muted-foreground">Memuat…</div></AppShell>;

  const simpan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await Promise.all([updateSekolah(s), updatePengumuman(p)]);
      toast.success("Pengaturan berhasil disimpan");
      qc.invalidateQueries({ queryKey: ["sekolah"] });
      qc.invalidateQueries({ queryKey: ["pengumuman"] });
    } catch (err: any) {
      toast.error("Gagal menyimpan", { description: err.message });
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      toast.info("Memproses logo & menghapus latar…");
      const transparent = await removeBackground(file);
      const url = await uploadLogo(transparent, "png");
      const updated = { ...s, logo_url: url };
      await updateSekolah(updated);
      setS(updated);
      qc.invalidateQueries({ queryKey: ["sekolah"] });
      toast.success("Logo terpasang dengan latar transparan");
    } catch (err: any) {
      toast.error("Gagal upload logo", { description: err.message });
    } finally {
      setUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const removeLogo = async () => {
    const updated = { ...s, logo_url: null };
    await updateSekolah(updated);
    setS(updated);
    qc.invalidateQueries({ queryKey: ["sekolah"] });
    toast.success("Logo dihapus");
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">Pengaturan</div>
          <h1 className="mt-1 font-display text-3xl font-bold">Pengumuman & Profil Sekolah</h1>
          <p className="mt-1 text-sm text-muted-foreground">Atur halaman depan pengumuman, jadwal, tipe surat, identitas dan logo sekolah.</p>
        </div>

        <form onSubmit={simpan} className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm-soft">
            <div className="mb-6 flex items-center gap-3 border-b border-border pb-4">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><Megaphone className="h-5 w-5" /></div>
              <div><div className="font-display font-bold">Halaman Pengumuman</div><div className="text-xs text-muted-foreground">Tampil di halaman depan</div></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold">Tahun Pelajaran</span>
                <input className={inputCls} value={p.tahun_ajaran} onChange={(e) => setP({ ...p, tahun_ajaran: e.target.value })} maxLength={20} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold">Jadwal Pembukaan</span>
                <input type="datetime-local" className={inputCls}
                  value={new Date(p.jadwal_buka).toISOString().slice(0, 16)}
                  onChange={(e) => setP({ ...p, jadwal_buka: new Date(e.target.value).toISOString() })} />
              </label>
              <label className="sm:col-span-2 block">
                <span className="mb-1.5 block text-xs font-semibold">Header / Judul</span>
                <input className={inputCls} value={p.header_judul} onChange={(e) => setP({ ...p, header_judul: e.target.value })} maxLength={120} />
              </label>
              <label className="sm:col-span-2 block">
                <span className="mb-1.5 block text-xs font-semibold">Sub-header</span>
                <input className={inputCls} value={p.header_sub} onChange={(e) => setP({ ...p, header_sub: e.target.value })} maxLength={150} />
              </label>
              <label className="sm:col-span-2 block">
                <span className="mb-1.5 block text-xs font-semibold">Teks Footer</span>
                <textarea className={inputCls} rows={2} value={p.footer_teks} onChange={(e) => setP({ ...p, footer_teks: e.target.value })} maxLength={300} />
              </label>
              <label className="sm:col-span-2 block">
                <span className="mb-1.5 block text-xs font-semibold">Pesan untuk Status TUNDA</span>
                <textarea className={inputCls} rows={2} value={p.pesan_tunda} onChange={(e) => setP({ ...p, pesan_tunda: e.target.value })} maxLength={400} />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm-soft">
            <div className="mb-6 flex items-center gap-3 border-b border-border pb-4">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><FileType2 className="h-5 w-5" /></div>
              <div><div className="font-display font-bold">Tipe Surat Aktif</div><div className="text-xs text-muted-foreground">Berlaku untuk semua siswa</div></div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {tipeOptions.map((t) => (
                <label key={t} className={`cursor-pointer rounded-xl border p-4 text-sm transition ${p.tipe_surat === t ? "border-primary bg-primary/5 ring-2 ring-primary/30" : "border-border bg-background hover:border-primary/40"}`}>
                  <input type="radio" name="tipe" className="sr-only" checked={p.tipe_surat === t} onChange={() => setP({ ...p, tipe_surat: t })} />
                  <div className="font-semibold">{t}</div>
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm-soft">
            <div className="mb-6 flex items-center gap-3 border-b border-border pb-4">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><ImageIcon className="h-5 w-5" /></div>
              <div><div className="font-display font-bold">Logo Sekolah</div><div className="text-xs text-muted-foreground">Latar otomatis dihapus jadi transparan</div></div>
            </div>
            <div className="flex items-center gap-5">
              <div className="grid h-24 w-24 place-items-center rounded-xl border border-dashed border-border bg-[conic-gradient(at_50%_50%,#f3f4f6_25%,#fff_0,#fff_50%,#f3f4f6_0,#f3f4f6_75%,#fff_0)] bg-[length:16px_16px]">
                {s.logo_url ? (
                  <img src={s.logo_url} alt="Logo" className="max-h-full max-w-full object-contain" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                  {uploading ? "Memproses…" : "Pilih Logo"}
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleLogoUpload} disabled={uploading} />
                </label>
                {s.logo_url && (
                  <button type="button" onClick={removeLogo} className="ml-2 inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/5">
                    <Trash2 className="h-3.5 w-3.5" /> Hapus
                  </button>
                )}
                <p className="text-xs text-muted-foreground">PNG/JPG/WEBP. Logo dengan latar warna solid (putih/biru/dll) akan otomatis dijadikan transparan.</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm-soft">
            <div className="mb-6 flex items-center gap-3 border-b border-border pb-4">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><School className="h-5 w-5" /></div>
              <div><div className="font-display font-bold">Profil Sekolah</div><div className="text-xs text-muted-foreground">Muncul di kop surat</div></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2 block"><span className="mb-1.5 block text-xs font-semibold">Nama Sekolah</span>
                <input className={inputCls} value={s.nama} onChange={(e) => setS({ ...s, nama: e.target.value })} maxLength={150} /></label>
              <label className="block"><span className="mb-1.5 block text-xs font-semibold">NPSN</span>
                <input className={inputCls} value={s.npsn} onChange={(e) => setS({ ...s, npsn: e.target.value })} maxLength={20} /></label>
              <label className="block"><span className="mb-1.5 block text-xs font-semibold">Kepala Sekolah</span>
                <input className={inputCls} value={s.kepala_sekolah} onChange={(e) => setS({ ...s, kepala_sekolah: e.target.value })} maxLength={100} /></label>
              <label className="sm:col-span-2 block"><span className="mb-1.5 block text-xs font-semibold">Alamat</span>
                <input className={inputCls} value={s.alamat} onChange={(e) => setS({ ...s, alamat: e.target.value })} maxLength={200} /></label>
              <label className="sm:col-span-2 block"><span className="mb-1.5 block text-xs font-semibold">NIP Kepala Sekolah</span>
                <input className={inputCls} value={s.nip_kepsek} onChange={(e) => setS({ ...s, nip_kepsek: e.target.value })} maxLength={30} /></label>
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
