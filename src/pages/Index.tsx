import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSekolah, getPengumuman, findByNISN } from "@/lib/skl-api";
import {
  GraduationCap, Search, ShieldCheck, CheckCircle2, XCircle,
  KeyRound, FileCheck2, Info, Settings, Clock, CalendarClock,
} from "lucide-react";

const pad = (n: number) => String(n).padStart(2, "0");

export default function Index() {
  const nav = useNavigate();
  const { data: sekolah } = useQuery({ queryKey: ["sekolah"], queryFn: getSekolah });
  const { data: pengumuman } = useQuery({ queryKey: ["pengumuman"], queryFn: getPengumuman });

  const [q, setQ] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const buka = pengumuman ? new Date(pengumuman.jadwal_buka).getTime() : 0;
  const sudahBuka = pengumuman ? now >= buka : false;
  const diff = Math.max(0, buka - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const sec = Math.floor((diff % 60000) / 1000);

  const cek = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const nisn = q.trim();
    if (!/^\d{10}$/.test(nisn)) {
      setErr("NISN harus 10 digit angka.");
      return;
    }
    setBusy(true);
    const s = await findByNISN(nisn);
    setBusy(false);
    if (s) nav(`/verifikasi?nisn=${encodeURIComponent(nisn)}`);
    else setErr("NISN tidak ditemukan dalam data peserta.");
  };

  if (!sekolah || !pengumuman) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Memuat…</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="container flex h-20 items-center justify-between">
        <div className="flex items-center gap-2.5">
          {sekolah.logo_url ? (
            <img src={sekolah.logo_url} alt="Logo Sekolah" className="h-12 w-12 object-contain" />
          ) : (
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary shadow-glow">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
          )}
          <div className="leading-tight">
            <div className="font-display text-lg font-bold">e-SKL</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Pengumuman Kelulusan</div>
          </div>
        </div>
        <Link to="/login" title="Area Admin Sekolah"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/70 px-3 py-2 text-xs font-medium text-muted-foreground backdrop-blur hover:bg-card hover:text-foreground">
          <Settings className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Login Admin</span>
        </Link>
      </header>

      <section className="container pb-12 pt-6 md:pt-12">
        <div className="mx-auto max-w-2xl text-center animate-fade-in">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <ShieldCheck className="h-3.5 w-3.5" /> {sekolah.nama}
          </div>
          <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight md:text-5xl">
            {pengumuman.header_judul.split(" ").slice(0, -1).join(" ")}{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              {pengumuman.header_judul.split(" ").slice(-1)}
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">{pengumuman.header_sub}</p>

          {!sudahBuka && (
            <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-primary/30 bg-card p-6 shadow-md-soft">
              <div className="flex items-center justify-center gap-2 text-primary">
                <CalendarClock className="h-4 w-4" />
                <div className="text-xs font-bold uppercase tracking-widest">Pengumuman dibuka dalam</div>
              </div>
              <div className="mt-4 flex justify-center gap-2 sm:gap-3">
                {[["Hari", d], ["Jam", h], ["Menit", m], ["Detik", sec]].map(([l, v]) => (
                  <div key={l as string} className="min-w-[64px] rounded-xl bg-gradient-primary px-3 py-3 text-primary-foreground">
                    <div className="font-display text-2xl font-extrabold tabular-nums">{pad(v as number)}</div>
                    <div className="text-[10px] uppercase tracking-wider opacity-80">{l}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                Dibuka pada{" "}
                <strong>{new Date(pengumuman.jadwal_buka).toLocaleString("id-ID", { dateStyle: "full", timeStyle: "short" })}</strong>
              </div>
            </div>
          )}

          <form onSubmit={cek} className="mx-auto mt-8 max-w-xl animate-scale-in">
            <div className="rounded-2xl border border-border bg-card p-2 shadow-lg-soft">
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={q}
                    onChange={(e) => { setQ(e.target.value.replace(/\D/g, "").slice(0, 10)); setErr(null); }}
                    placeholder="Masukkan 10 digit NISN"
                    inputMode="numeric"
                    pattern="\d{10}"
                    maxLength={10}
                    disabled={!sudahBuka}
                    className="w-full rounded-xl bg-background py-4 pl-12 pr-3 text-base tracking-widest outline-none ring-primary/20 focus:ring-2 disabled:opacity-60"
                  />
                </div>
                <button type="submit" disabled={!sudahBuka || busy}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-6 py-4 text-sm font-bold text-primary-foreground shadow-md-soft transition hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-60">
                  {sudahBuka ? (<><FileCheck2 className="h-4 w-4" /> {busy ? "Memeriksa…" : "Cek Sekarang"}</>) : (<><Clock className="h-4 w-4" /> Belum Dibuka</>)}
                </button>
              </div>
            </div>

            {err && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm text-destructive">
                <XCircle className="h-4 w-4" />{err}
              </div>
            )}
          </form>

          <p className="mt-4 text-xs text-muted-foreground">NISN terdiri dari 10 digit angka unik dari Kemdikbud.</p>
        </div>

        <div className="mx-auto mt-16 max-w-4xl">
          <div className="mb-6 flex items-center justify-center gap-2 text-center">
            <Info className="h-4 w-4 text-primary" />
            <h2 className="font-display text-sm font-bold uppercase tracking-widest text-primary">Cara Cek Kelulusan</h2>
          </div>
          <ol className="grid gap-4 md:grid-cols-3">
            {[
              { n: "1", i: KeyRound, t: "Siapkan NISN", d: "Nomor Induk Siswa Nasional (10 digit angka). Bisa dilihat di kartu pelajar atau rapor." },
              { n: "2", i: Search, t: "Masukkan & klik Cek", d: "Ketik NISN di kolom di atas saat jadwal pengumuman telah dibuka." },
              { n: "3", i: CheckCircle2, t: "Lihat hasil", d: "Status kelulusan: LULUS, BELUM, atau TUNDA — lengkap dengan keterangan dari sekolah." },
            ].map((step) => (
              <li key={step.n} className="relative rounded-2xl border border-border bg-card p-6 shadow-sm-soft transition hover:-translate-y-1 hover:shadow-md-soft">
                <div className="absolute -top-3 left-6 grid h-8 w-8 place-items-center rounded-full bg-gradient-primary font-display text-sm font-bold text-primary-foreground shadow-glow">{step.n}</div>
                <step.i className="h-6 w-6 text-primary" />
                <h3 className="mt-3 font-display text-base font-bold">{step.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <footer className="container border-t border-border/50 py-8 text-center text-xs text-muted-foreground">
        <p className="mx-auto max-w-2xl">{pengumuman.footer_teks}</p>
        <p className="mt-3">© {new Date().getFullYear()} {sekolah.nama}</p>
      </footer>
    </div>
  );
}
