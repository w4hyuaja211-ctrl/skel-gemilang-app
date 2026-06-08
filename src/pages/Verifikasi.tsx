import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPengumuman, findByNISN, type Siswa } from "@/lib/skl-api";
import {
  CheckCircle2, XCircle, Search, ShieldCheck, GraduationCap, FileText,
  AlertTriangle, Clock, ArrowLeft,
} from "lucide-react";

export default function Verifikasi() {
  const [params] = useSearchParams();
  const urlNisn = params.get("nisn") ?? "";
  const [nisn, setNisn] = useState(urlNisn);
  const [submitted, setSubmitted] = useState(!!urlNisn);
  const [searchResult, setSearchResult] = useState<Siswa | null>(null);
  const [busy, setBusy] = useState(false);

  const { data: pengumuman } = useQuery({ queryKey: ["pengumuman"], queryFn: getPengumuman });

  useEffect(() => {
    if (urlNisn && /^\d{10}$/.test(urlNisn)) {
      setBusy(true);
      findByNISN(urlNisn).then((s) => { setSearchResult(s); setBusy(false); });
    }
  }, [urlNisn]);

  const siswa: Siswa | null = searchResult;

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const s = await findByNISN(nisn);
    setSearchResult(s);
    setSubmitted(true);
    setBusy(false);
  };

  const statusUI = (() => {
    if (!siswa) return null;
    if (siswa.status === "Lulus") return { Icon: CheckCircle2, color: "success", title: "SELAMAT, ANDA LULUS", desc: "Status kelulusan Anda telah diverifikasi." };
    if (siswa.status === "Tunda") return { Icon: Clock, color: "amber", title: "STATUS: DITUNDA", desc: pengumuman?.pesan_tunda ?? "" };
    return { Icon: AlertTriangle, color: "destructive", title: "STATUS: BELUM LULUS", desc: "Silakan menghubungi sekolah untuk informasi lebih lanjut." };
  })();

  return (
    <div className="min-h-screen bg-gradient-soft p-6">
      <div className="mx-auto max-w-2xl">
        <Link to="/" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Kembali ke pengumuman
        </Link>
        <div className="text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary shadow-glow">
            <ShieldCheck className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold">Hasil Pengumuman Kelulusan</h1>
          <p className="mt-2 text-sm text-muted-foreground">Tahun Pelajaran {pengumuman?.tahun_ajaran}</p>
        </div>

        {!urlNisn && (
          <form onSubmit={onSearch} className="mx-auto mt-8 flex max-w-md gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={nisn}
                onChange={(e) => setNisn(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="Masukkan 10 digit NISN"
                inputMode="numeric"
                className="w-full rounded-xl border border-input bg-card py-3 pl-10 pr-3 text-sm tracking-widest shadow-sm-soft outline-none ring-primary/20 focus:ring-2"
                maxLength={10}
              />
            </div>
            <button disabled={nisn.length !== 10 || busy}
              className="rounded-xl bg-gradient-primary px-5 text-sm font-semibold text-primary-foreground hover:shadow-glow disabled:opacity-50">
              {busy ? "…" : "Cek"}
            </button>
          </form>
        )}

        {submitted && (
          <div className="mt-8">
            {siswa && statusUI ? (
              <div className={`overflow-hidden rounded-2xl border shadow-md-soft ${statusUI.color === "success" ? "border-success/30" : statusUI.color === "amber" ? "border-amber-400/40" : "border-destructive/30"} bg-card`}>
                <div className={`flex items-center gap-4 p-6 ${statusUI.color === "success" ? "bg-success/10" : statusUI.color === "amber" ? "bg-amber-100/60 dark:bg-amber-500/10" : "bg-destructive/10"}`}>
                  <div className={`grid h-14 w-14 place-items-center rounded-full text-white ${statusUI.color === "success" ? "bg-success" : statusUI.color === "amber" ? "bg-amber-500" : "bg-destructive"}`}>
                    <statusUI.Icon className="h-7 w-7" />
                  </div>
                  <div>
                    <div className={`font-display text-xl font-extrabold tracking-wide ${statusUI.color === "success" ? "text-success" : statusUI.color === "amber" ? "text-amber-700 dark:text-amber-400" : "text-destructive"}`}>{statusUI.title}</div>
                    <div className="text-xs text-muted-foreground">{statusUI.desc}</div>
                  </div>
                </div>

                {siswa.status === "Tunda" && siswa.keterangan_tunda && (
                  <div className="border-y border-amber-400/30 bg-amber-50/80 p-4 text-sm dark:bg-amber-500/5">
                    <div className="font-semibold text-amber-700 dark:text-amber-400">Keterangan:</div>
                    <div className="mt-1 text-foreground">{siswa.keterangan_tunda}</div>
                  </div>
                )}

                <div className="space-y-3 p-6 text-sm">
                  {[
                    ["Nama", siswa.nama],
                    ["NISN", siswa.nisn],
                    ["Kelas", siswa.kelas ?? "-"],
                    ["Tahun Pelajaran", siswa.tahun_ajaran],
                    ["Nomor Surat", siswa.nomor_surat ?? "-"],
                  ].map(([k, v]) => (
                    <div key={k as string} className="flex justify-between border-b border-border/60 pb-2 last:border-0">
                      <span className="text-muted-foreground">{k}</span>
                      <span className="font-semibold">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
                <XCircle className="mx-auto h-12 w-12 text-destructive" />
                <h2 className="mt-3 font-display text-xl font-bold text-destructive">NISN Tidak Ditemukan</h2>
                <p className="mt-1 text-sm text-muted-foreground">Pastikan 10 digit NISN benar dan terdaftar pada tahun pelajaran ini.</p>
              </div>
            )}
          </div>
        )}

        {!urlNisn && !submitted && (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/50 p-5 text-center text-xs text-muted-foreground">
            <GraduationCap className="mx-auto mb-2 h-5 w-5 text-primary" />
            Coba dengan NISN demo:{" "}
            <code className="rounded bg-secondary px-1.5 py-0.5 font-mono">0098765432</code>{" "}atau{" "}
            <code className="rounded bg-secondary px-1.5 py-0.5 font-mono">0011223344</code>
          </div>
        )}
      </div>
    </div>
  );
}
