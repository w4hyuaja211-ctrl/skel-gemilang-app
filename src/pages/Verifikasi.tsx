import AppShell from "@/components/AppShell";
import { useSKL } from "@/store/skl";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { CheckCircle2, XCircle, Search, ShieldCheck, GraduationCap, FileText } from "lucide-react";

export default function Verifikasi() {
  const { id: paramId } = useParams();
  const [id, setId] = useState(paramId || "");
  const [submitted, setSubmitted] = useState(!!paramId);
  const siswa = useSKL((s) => s.getSiswa(paramId || (submitted ? id : "")));

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary shadow-glow">
            <ShieldCheck className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold">Verifikasi SKL</h1>
          <p className="mt-2 text-sm text-muted-foreground">Periksa keaslian Surat Keterangan Lulus dengan memasukkan ID surat atau memindai QR Code.</p>
        </div>

        {!paramId && (
          <form
            onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
            className="mx-auto mt-8 flex max-w-md gap-2"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="Masukkan ID Surat (contoh: demo-001)"
                className="w-full rounded-xl border border-input bg-card py-3 pl-10 pr-3 text-sm shadow-sm-soft outline-none ring-primary/20 focus:ring-2"
                maxLength={50}
              />
            </div>
            <button className="rounded-xl bg-gradient-primary px-5 text-sm font-semibold text-primary-foreground hover:shadow-glow">Cek</button>
          </form>
        )}

        {submitted && (
          <div className="mt-8">
            {siswa ? (
              <div className="overflow-hidden rounded-2xl border border-success/30 bg-card shadow-md-soft">
                <div className="flex items-center gap-3 bg-success/10 p-5">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-success text-white">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-display text-lg font-bold text-success">Surat Terverifikasi ✓</div>
                    <div className="text-xs text-muted-foreground">Surat ini terdaftar dan resmi diterbitkan</div>
                  </div>
                </div>
                <div className="space-y-3 p-6 text-sm">
                  {[
                    ["Nama", siswa.nama],
                    ["NISN", siswa.nisn],
                    ["Kelas", siswa.kelas],
                    ["Tahun Ajaran", siswa.tahunAjaran],
                    ["Nomor Surat", siswa.nomorSurat],
                    ["Tanggal Lulus", new Date(siswa.tanggalLulus).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })],
                    ["Status", siswa.status],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between border-b border-border/60 pb-2 last:border-0">
                      <span className="text-muted-foreground">{k}</span>
                      <span className="font-semibold">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border bg-secondary/30 p-4">
                  <Link to={`/skl/${siswa.id}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                    <FileText className="h-3.5 w-3.5" /> Lihat surat lengkap
                  </Link>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
                <XCircle className="mx-auto h-12 w-12 text-destructive" />
                <h2 className="mt-3 font-display text-xl font-bold text-destructive">Surat Tidak Ditemukan</h2>
                <p className="mt-1 text-sm text-muted-foreground">ID surat tidak terdaftar di sistem. Pastikan ID benar.</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/50 p-5 text-center text-xs text-muted-foreground">
          <GraduationCap className="mx-auto mb-2 h-5 w-5 text-primary" />
          Coba dengan ID: <code className="rounded bg-secondary px-1.5 py-0.5 font-mono">demo-001</code>
        </div>
      </div>
    </AppShell>
  );
}
