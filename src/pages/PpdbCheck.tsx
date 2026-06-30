import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getPpdbPengaturanPublic, findPpdbByNomor, formatNoPendaftaran, isValidNoPendaftaran,
  type PpdbPendaftar,
} from "@/lib/ppdb-api";
import { getSekolah } from "@/lib/skl-api";
import {
  GraduationCap, Search, ShieldCheck, CheckCircle2, XCircle,
  Settings, Clock, CalendarClock, FileCheck2, MapPin, Calendar, ArrowLeft, Sparkles, Heart,
} from "lucide-react";

const pad = (n: number) => String(n).padStart(2, "0");

export default function PpdbCheck() {
  const { data: sekolah } = useQuery({ queryKey: ["sekolah"], queryFn: getSekolah });
  const { data: cfg } = useQuery({ queryKey: ["ppdb-pengaturan-public"], queryFn: getPpdbPengaturanPublic });

  const [q, setQ] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [busy, setBusy] = useState(false);
  const [hasil, setHasil] = useState<PpdbPendaftar | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const buka = cfg ? new Date(cfg.jadwal_buka).getTime() : 0;
  const sudahBuka = cfg ? now >= buka : false;
  const diff = Math.max(0, buka - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const sec = Math.floor((diff % 60000) / 1000);

  const onChange = (v: string) => {
    setQ(formatNoPendaftaran(v));
    setErr(null);
  };

  const cek = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setHasil(null);
    if (!isValidNoPendaftaran(q)) {
      setErr("Format nomor pendaftaran salah. Contoh: 01-061-001-1");
      return;
    }
    setBusy(true);
    const r = await findPpdbByNomor(q);
    setBusy(false);
    if (r) setHasil(r);
    else setErr("Nomor pendaftaran tidak ditemukan.");
  };

  const adaNilai = useMemo(() => {
    if (!hasil) return false;
    return Number(hasil.nilai_matematika) > 0 || Number(hasil.nilai_ipa) > 0 || Number(hasil.nilai_bahasa_inggris) > 0;
  }, [hasil]);
  const rata = useMemo(() => {
    if (!hasil) return 0;
    return (Number(hasil.nilai_matematika) + Number(hasil.nilai_ipa) + Number(hasil.nilai_bahasa_inggris)) / 3;
  }, [hasil]);

  if (!cfg || !sekolah) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Memuat…</div>;
  }

  const lulus = hasil?.status === "Lulus";

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="container flex h-20 items-center justify-between">
        <div className="flex items-center gap-2.5">
          {sekolah.logo_url ? (
            <img src={sekolah.logo_url} alt="Logo" className="h-12 w-12 object-contain" />
          ) : (
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary shadow-glow">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
          )}
          <div className="leading-tight">
            <div className="font-display text-lg font-bold">SPMB Online</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Pengumuman Seleksi</div>
          </div>
        </div>
        <Link to="/" className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/70 px-3 py-2 text-xs font-medium text-muted-foreground backdrop-blur hover:bg-card hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Beranda
        </Link>
      </header>

      <section className="container pb-12 pt-6 md:pt-10">
        <div className="mx-auto max-w-2xl text-center animate-fade-in">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <ShieldCheck className="h-3.5 w-3.5" /> {sekolah.nama} • {cfg.gelombang}
          </div>
          <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight md:text-5xl">
            {cfg.judul.split(" ").slice(0, -1).join(" ")}{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              {cfg.judul.split(" ").slice(-1)}
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
            Tahun Pelajaran {cfg.tahun_ajaran}. Masukkan nomor pendaftaran SPMB/PPDB Anda untuk melihat hasil seleksi.
          </p>

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
                Dibuka pada <strong>{new Date(cfg.jadwal_buka).toLocaleString("id-ID", { dateStyle: "full", timeStyle: "short" })}</strong>
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
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Contoh: 01-061-001-1"
                    inputMode="numeric"
                    maxLength={13}
                    disabled={!sudahBuka}
                    className="w-full rounded-xl bg-background py-4 pl-12 pr-3 text-base tracking-widest outline-none ring-primary/20 focus:ring-2 disabled:opacity-60"
                  />
                </div>
                <button type="submit" disabled={!sudahBuka || busy}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-6 py-4 text-sm font-bold text-primary-foreground shadow-md-soft transition hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-60">
                  {sudahBuka ? (<><FileCheck2 className="h-4 w-4" /> {busy ? "Memeriksa…" : "Cek Hasil"}</>) : (<><Clock className="h-4 w-4" /> Belum Dibuka</>)}
                </button>
              </div>
            </div>
            {err && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm text-destructive">
                <XCircle className="h-4 w-4" /> {err}
              </div>
            )}
          </form>
          <p className="mt-4 text-xs text-muted-foreground">Format: 2 digit – 3 digit – 3 digit – 1 digit</p>
        </div>

        {hasil && (
          <div className="mx-auto mt-12 max-w-2xl animate-fade-in">
            <div className={`rounded-2xl border-2 p-6 shadow-lg-soft ${lulus ? "border-green-500/40 bg-green-500/5" : "border-amber-500/40 bg-amber-500/5"}`}>
              <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-4">
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">No. Pendaftaran</div>
                  <div className="mt-1 font-display text-xl font-bold tracking-wider">{hasil.no_pendaftaran}</div>
                </div>
                <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${lulus ? "bg-green-500 text-white" : "bg-amber-500 text-white"}`}>
                  {lulus ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  {lulus ? "LULUS" : "TIDAK LULUS"}
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 text-left">
                <div><div className="text-[11px] uppercase tracking-wider text-muted-foreground">Nama</div><div className="font-semibold">{hasil.nama}</div></div>
                {hasil.asal_sekolah && (
                  <div><div className="text-[11px] uppercase tracking-wider text-muted-foreground">Asal Sekolah</div><div className="font-semibold">{hasil.asal_sekolah}</div></div>
                )}
              </div>

              {adaNilai && (
                <div className="mt-6">
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                    <Sparkles className="h-3.5 w-3.5" /> Nilai Tes Kemampuan Akademik (TKA)
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      { l: "Matematika", v: hasil.nilai_matematika },
                      { l: "IPA", v: hasil.nilai_ipa },
                      { l: "Bahasa Inggris", v: hasil.nilai_bahasa_inggris },
                    ].map((m) => (
                      <div key={m.l} className="rounded-xl border border-border bg-card p-4 text-center">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{m.l}</div>
                        <div className="mt-1 font-display text-3xl font-extrabold tabular-nums text-primary">{Number(m.v).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-center text-xs text-muted-foreground">
                    Rata-rata: <strong className="text-foreground">{rata.toFixed(2)}</strong>
                  </div>
                </div>
              )}

              <div className={`mt-6 rounded-xl p-4 text-sm leading-relaxed ${lulus ? "bg-green-500/10 text-green-900 dark:text-green-100" : "bg-amber-500/10 text-amber-900 dark:text-amber-100"}`}>
                <div className="flex items-start gap-2">
                  {lulus ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : <Heart className="mt-0.5 h-5 w-5 shrink-0" />}
                  <div>
                    <p>{lulus ? cfg.pesan_lulus : cfg.pesan_tidak_lulus}</p>
                    {lulus && (
                      <div className="mt-3 grid gap-2 sm:grid-cols-2 text-xs">
                        <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5" /> Mulai {new Date(cfg.tanggal_pengambilan).toLocaleDateString("id-ID", { dateStyle: "full" })}</div>
                        <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> {cfg.lokasi_pengambilan}</div>
                      </div>
                    )}
                    {hasil.catatan && <p className="mt-2 text-xs opacity-80">Catatan: {hasil.catatan}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      <footer className="container border-t border-border/50 py-8 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} {sekolah.nama}</p>
      </footer>
    </div>
  );
}
