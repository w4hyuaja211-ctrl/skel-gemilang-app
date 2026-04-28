import { Link } from "react-router-dom";
import { ArrowRight, GraduationCap, FileCheck2, QrCode, Leaf, Sparkles, ShieldCheck, FileText, Users } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Nav */}
      <header className="container flex h-20 items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary shadow-glow">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-lg font-bold">e-SKL</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Premium Edition</div>
          </div>
        </div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          Buka Dasbor <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      {/* Hero */}
      <section className="container grid gap-12 pb-20 pt-10 md:grid-cols-2 md:items-center md:pt-16">
        <div className="animate-fade-in">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Hemat kertas. Cepat. Terverifikasi.
          </div>
          <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
            Surat Keterangan <span className="bg-gradient-primary bg-clip-text text-transparent">Lulus Digital</span> untuk sekolahmu.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
            Bikin, cetak, dan verifikasi SKL siswa dalam hitungan menit. Setiap surat punya QR Code unik yang bisa diverifikasi siapapun, kapanpun.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/siswa/baru"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg-soft transition hover:shadow-glow"
            >
              Buat SKL Baru <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-sm font-semibold shadow-sm-soft hover:bg-accent"
            >
              Lihat Demo
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
            {[
              { n: "100%", l: "Paperless" },
              { n: "<2 mnt", l: "Per surat" },
              { n: "QR", l: "Verifikasi" },
            ].map((s) => (
              <div key={s.l} className="rounded-xl border border-border/60 bg-card/60 p-3 text-center backdrop-blur">
                <div className="font-display text-xl font-bold text-primary">{s.n}</div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Visual mock */}
        <div className="relative animate-scale-in">
          <div className="absolute -left-8 -top-8 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-10 -right-6 h-48 w-48 rounded-full bg-primary-glow/30 blur-3xl" />
          <div className="relative rotate-1 rounded-2xl border border-border bg-white p-6 shadow-lg-soft">
            <div className="mb-4 flex items-center gap-3 border-b border-border pb-4">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="font-display text-sm font-bold leading-tight">SMA NEGERI 1 HARAPAN BANGSA</div>
                <div className="text-[10px] text-muted-foreground">Jl. Pendidikan No. 10, Jakarta Selatan</div>
              </div>
            </div>
            <div className="text-center">
              <div className="font-serif text-base font-semibold uppercase">Surat Keterangan Lulus</div>
              <div className="text-[10px] text-muted-foreground">No. 421/SKL/045/2025</div>
            </div>
            <div className="mt-4 space-y-1.5 font-serif text-xs leading-relaxed">
              <p>Yang bertanda tangan di bawah ini menerangkan bahwa:</p>
              <div className="my-3 space-y-1 rounded-lg bg-secondary/60 p-3 text-[11px]">
                <div className="flex justify-between"><span className="text-muted-foreground">Nama</span><span className="font-semibold">Aulia Rahmadani</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">NISN</span><span>0098765432</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Kelas</span><span>XII IPA 1</span></div>
              </div>
              <p>Berdasarkan rapat dewan guru, dinyatakan <span className="font-bold text-primary">LULUS</span>.</p>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div className="rounded-lg bg-secondary p-2">
                <div className="grid h-16 w-16 place-items-center rounded bg-foreground">
                  <QrCode className="h-10 w-10 text-background" />
                </div>
              </div>
              <div className="text-right text-[10px]">
                <div>Jakarta, 5 Mei 2025</div>
                <div className="mt-6 font-semibold">Drs. Bambang Widodo</div>
                <div className="text-muted-foreground">Kepala Sekolah</div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-4 -left-4 -rotate-6 rounded-xl border border-border bg-card px-4 py-3 shadow-md-soft">
            <div className="flex items-center gap-2 text-xs">
              <div className="grid h-7 w-7 place-items-center rounded-full bg-success/15"><ShieldCheck className="h-4 w-4 text-success" /></div>
              <div>
                <div className="font-semibold">Terverifikasi</div>
                <div className="text-[10px] text-muted-foreground">via QR Code</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container pb-24">
        <div className="mb-10 max-w-2xl">
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">Fitur Unggulan</div>
          <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Semua yang dibutuhkan satu sekolah.</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            { i: Users, t: "Manajemen Siswa", d: "Input data siswa lengkap dengan nilai per mata pelajaran." },
            { i: FileText, t: "Generate PDF", d: "Cetak SKL profesional dalam format PDF siap distribusi." },
            { i: QrCode, t: "QR Verifikasi", d: "Setiap surat punya kode unik untuk verifikasi keaslian publik." },
            { i: Leaf, t: "Ramah Lingkungan", d: "Kurangi penggunaan kertas, distribusi via tautan digital." },
          ].map((f) => (
            <div key={f.t} className="group rounded-2xl border border-border bg-card p-6 shadow-sm-soft transition hover:-translate-y-1 hover:shadow-md-soft">
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-gradient-primary group-hover:text-primary-foreground">
                <f.i className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-bold">{f.t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 overflow-hidden rounded-3xl border border-border bg-gradient-primary p-8 text-primary-foreground md:p-12">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-xl">
              <h3 className="font-display text-2xl font-bold md:text-3xl">Siap menerbitkan SKL pertama?</h3>
              <p className="mt-2 text-sm opacity-90 md:text-base">Mulai dari data demo yang sudah tersedia, atau langsung input siswa baru.</p>
            </div>
            <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-background px-6 py-3.5 text-sm font-semibold text-foreground hover:bg-background/90">
              <FileCheck2 className="h-4 w-4" /> Mulai Sekarang
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
