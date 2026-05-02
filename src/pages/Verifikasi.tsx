import AppShell from "@/components/AppShell";
import { useSKL } from "@/store/skl";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Search,
  ShieldCheck,
  GraduationCap,
  FileText,
  AlertTriangle,
  Clock,
} from "lucide-react";

export default function Verifikasi() {
  const { id: paramId } = useParams();
  const [nisn, setNisn] = useState("");
  const [submitted, setSubmitted] = useState(!!paramId);
  const getSiswa = useSKL((s) => s.getSiswa);
  const findByNISN = useSKL((s) => s.findByNISN);
  const pengumuman = useSKL((s) => s.pengumuman);

  const siswa = paramId ? getSiswa(paramId) : submitted ? findByNISN(nisn) : undefined;

  const statusUI = (() => {
    if (!siswa) return null;
    if (siswa.status === "Lulus")
      return {
        Icon: CheckCircle2,
        color: "success",
        title: "SELAMAT, ANDA LULUS",
        desc: "Status kelulusan Anda telah diverifikasi.",
      };
    if (siswa.status === "Tunda")
      return {
        Icon: Clock,
        color: "amber",
        title: "STATUS: DITUNDA",
        desc: pengumuman.pesanTunda,
      };
    return {
      Icon: AlertTriangle,
      color: "destructive",
      title: "STATUS: BELUM LULUS",
      desc: "Silakan menghubungi sekolah untuk informasi lebih lanjut.",
    };
  })();

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary shadow-glow">
            <ShieldCheck className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold">Hasil Pengumuman Kelulusan</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tahun Pelajaran {pengumuman.tahunAjaran}
          </p>
        </div>

        {!paramId && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="mx-auto mt-8 flex max-w-md gap-2"
          >
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
            <button
              disabled={nisn.length !== 10}
              className="rounded-xl bg-gradient-primary px-5 text-sm font-semibold text-primary-foreground hover:shadow-glow disabled:opacity-50"
            >
              Cek
            </button>
          </form>
        )}

        {submitted && (
          <div className="mt-8">
            {siswa && statusUI ? (
              <div
                className={`overflow-hidden rounded-2xl border shadow-md-soft ${
                  statusUI.color === "success"
                    ? "border-success/30"
                    : statusUI.color === "amber"
                    ? "border-amber-400/40"
                    : "border-destructive/30"
                } bg-card`}
              >
                <div
                  className={`flex items-center gap-4 p-6 ${
                    statusUI.color === "success"
                      ? "bg-success/10"
                      : statusUI.color === "amber"
                      ? "bg-amber-100/60 dark:bg-amber-500/10"
                      : "bg-destructive/10"
                  }`}
                >
                  <div
                    className={`grid h-14 w-14 place-items-center rounded-full text-white ${
                      statusUI.color === "success"
                        ? "bg-success"
                        : statusUI.color === "amber"
                        ? "bg-amber-500"
                        : "bg-destructive"
                    }`}
                  >
                    <statusUI.Icon className="h-7 w-7" />
                  </div>
                  <div>
                    <div
                      className={`font-display text-xl font-extrabold tracking-wide ${
                        statusUI.color === "success"
                          ? "text-success"
                          : statusUI.color === "amber"
                          ? "text-amber-700 dark:text-amber-400"
                          : "text-destructive"
                      }`}
                    >
                      {statusUI.title}
                    </div>
                    <div className="text-xs text-muted-foreground">{statusUI.desc}</div>
                  </div>
                </div>

                {siswa.status === "Tunda" && siswa.keteranganTunda && (
                  <div className="border-y border-amber-400/30 bg-amber-50/80 p-4 text-sm dark:bg-amber-500/5">
                    <div className="font-semibold text-amber-700 dark:text-amber-400">
                      Keterangan:
                    </div>
                    <div className="mt-1 text-foreground">{siswa.keteranganTunda}</div>
                  </div>
                )}

                <div className="space-y-3 p-6 text-sm">
                  {[
                    ["Nama", siswa.nama],
                    ["NISN", siswa.nisn],
                    ["Kelas", siswa.kelas],
                    ["Tahun Pelajaran", siswa.tahunAjaran],
                    ["Nomor Surat", siswa.nomorSurat],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      className="flex justify-between border-b border-border/60 pb-2 last:border-0"
                    >
                      <span className="text-muted-foreground">{k}</span>
                      <span className="font-semibold">{v}</span>
                    </div>
                  ))}
                </div>
                {siswa.status === "Lulus" && (
                  <div className="border-t border-border bg-secondary/30 p-4">
                    <Link
                      to={`/skl/${siswa.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                    >
                      <FileText className="h-3.5 w-3.5" /> Lihat {pengumuman.tipeSurat}
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
                <XCircle className="mx-auto h-12 w-12 text-destructive" />
                <h2 className="mt-3 font-display text-xl font-bold text-destructive">
                  NISN Tidak Ditemukan
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pastikan 10 digit NISN benar dan terdaftar pada tahun pelajaran ini.
                </p>
              </div>
            )}
          </div>
        )}

        {!paramId && !submitted && (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/50 p-5 text-center text-xs text-muted-foreground">
            <GraduationCap className="mx-auto mb-2 h-5 w-5 text-primary" />
            Coba dengan NISN demo:{" "}
            <code className="rounded bg-secondary px-1.5 py-0.5 font-mono">0098765432</code>{" "}
            atau{" "}
            <code className="rounded bg-secondary px-1.5 py-0.5 font-mono">0011223344</code>
          </div>
        )}
      </div>
    </AppShell>
  );
}
