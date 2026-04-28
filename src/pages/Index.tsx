import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSKL } from "@/store/skl";
import {
  GraduationCap,
  Search,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  QrCode,
  KeyRound,
  FileCheck2,
  ArrowRight,
  Info,
  Settings,
} from "lucide-react";

const Index = () => {
  const nav = useNavigate();
  const sekolah = useSKL((s) => s.sekolah);
  const getSiswa = useSKL((s) => s.getSiswa);
  const [q, setQ] = useState("");
  const [hasil, setHasil] = useState<null | "found" | "notfound">(null);

  const cek = (e: React.FormEvent) => {
    e.preventDefault();
    const id = q.trim();
    if (!id) return;
    const s = getSiswa(id);
    if (s) {
      nav(`/verifikasi/${s.id}`);
    } else {
      setHasil("notfound");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Top bar */}
      <header className="container flex h-20 items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary shadow-glow">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-lg font-bold">e-SKL</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Pengumuman Kelulusan</div>
          </div>
        </div>
        <Link
          to="/dashboard"
          title="Area Admin Sekolah"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/70 px-3 py-2 text-xs font-medium text-muted-foreground backdrop-blur hover:bg-card hover:text-foreground"
        >
          <Settings className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Login Admin</span>
        </Link>
      </header>

      {/* Hero - Cek SKL */}
      <section className="container pb-12 pt-6 md:pt-12">
        <div className="mx-auto max-w-2xl text-center animate-fade-in">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <ShieldCheck className="h-3.5 w-3.5" /> Sistem Resmi {sekolah.nama}
          </div>
          <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight md:text-5xl">
            Cek <span className="bg-gradient-primary bg-clip-text text-transparent">Surat Keterangan Lulus</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
            Masukkan <strong>NISN</strong> atau <strong>ID Surat</strong> kamu di kolom di bawah untuk melihat hasil pengumuman kelulusan.
          </p>

          {/* Search box */}
          <form onSubmit={cek} className="mx-auto mt-8 max-w-xl animate-scale-in">
            <div className="rounded-2xl border border-border bg-card p-2 shadow-lg-soft">
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={q}
                    onChange={(e) => { setQ(e.target.value); setHasil(null); }}
                    placeholder="Contoh: 0098765432 atau demo-001"
                    maxLength={50}
                    className="w-full rounded-xl bg-background py-4 pl-12 pr-3 text-base outline-none ring-primary/20 focus:ring-2"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-6 py-4 text-sm font-bold text-primary-foreground shadow-md-soft transition hover:shadow-glow"
                >
                  <FileCheck2 className="h-4 w-4" /> Cek Sekarang
                </button>
              </div>
            </div>

            {hasil === "notfound" && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm text-destructive">
                <XCircle className="h-4 w-4" />
                Data tidak ditemukan. Periksa kembali NISN/ID Surat kamu.
              </div>
            )}
          </form>

          <p className="mt-4 text-xs text-muted-foreground">
            Tip: coba ID demo <code className="rounded bg-secondary px-1.5 py-0.5 font-mono">demo-001</code>
          </p>
        </div>

        {/* Petunjuk - 3 langkah */}
        <div className="mx-auto mt-16 max-w-4xl">
          <div className="mb-6 flex items-center justify-center gap-2 text-center">
            <Info className="h-4 w-4 text-primary" />
            <h2 className="font-display text-sm font-bold uppercase tracking-widest text-primary">Cara Cek SKL</h2>
          </div>
          <ol className="grid gap-4 md:grid-cols-3">
            {[
              {
                n: "1",
                i: KeyRound,
                t: "Siapkan NISN / ID",
                d: "Pakai Nomor Induk Siswa Nasional, atau ID Surat yang dibagikan oleh pihak sekolah.",
              },
              {
                n: "2",
                i: Search,
                t: "Masukkan & klik Cek",
                d: "Ketik di kolom pencarian di atas, lalu tekan tombol \"Cek Sekarang\".",
              },
              {
                n: "3",
                i: CheckCircle2,
                t: "Lihat & simpan hasil",
                d: "Hasil pengumuman akan tampil. Bisa juga dicek dengan memindai QR Code dari sekolah.",
              },
            ].map((step) => (
              <li
                key={step.n}
                className="relative rounded-2xl border border-border bg-card p-6 shadow-sm-soft transition hover:-translate-y-1 hover:shadow-md-soft"
              >
                <div className="absolute -top-3 left-6 grid h-8 w-8 place-items-center rounded-full bg-gradient-primary font-display text-sm font-bold text-primary-foreground shadow-glow">
                  {step.n}
                </div>
                <step.i className="h-6 w-6 text-primary" />
                <h3 className="mt-3 font-display text-base font-bold">{step.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.d}</p>
              </li>
            ))}
          </ol>

          {/* QR info card */}
          <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-gradient-primary p-6 text-primary-foreground sm:flex-row">
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-background/15">
                <QrCode className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold">Punya QR Code dari sekolah?</h3>
                <p className="text-sm opacity-90">Cukup pindai dengan kamera HP — hasil akan langsung terbuka.</p>
              </div>
            </div>
            <Link
              to="/verifikasi"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-background px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-background/90"
            >
              Halaman Verifikasi <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="container border-t border-border/50 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {sekolah.nama} — Sistem Pengumuman Kelulusan Digital
      </footer>
    </div>
  );
};

export default Index;
