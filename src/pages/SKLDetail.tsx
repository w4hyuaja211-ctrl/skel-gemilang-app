import AppShell from "@/components/AppShell";
import SuratSKL from "@/components/SuratSKL";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download, Printer, Share2, ShieldCheck } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { getSiswa, getSekolah, getPengumuman } from "@/lib/skl-api";

export default function SKLDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { data } = useQuery({ queryKey: ["siswa", id], queryFn: () => getSiswa(id!), enabled: !!id });
  const { data: sekolah } = useQuery({ queryKey: ["sekolah"], queryFn: getSekolah });
  const { data: pengumuman } = useQuery({ queryKey: ["pengumuman"], queryFn: getPengumuman });
  const ref = useRef<HTMLDivElement>(null);

  if (!data || !sekolah || !pengumuman) {
    return <AppShell><div className="rounded-2xl border border-border bg-card p-10 text-center"><p className="text-muted-foreground">Memuat…</p></div></AppShell>;
  }
  const { siswa, nilai } = data;

  const verifyUrl = `${window.location.origin}/verifikasi/${siswa.id}`;

  const downloadPDF = async () => {
    toast.info("Menyiapkan PDF...");
    const html2canvas = (await import("html2canvas-pro")).default;
    const el = ref.current;
    if (!el) return;
    const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#ffffff" });
    const img = canvas.toDataURL("image/jpeg", 0.95);
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    const w = pdf.internal.pageSize.getWidth();
    const h = (canvas.height * w) / canvas.width;
    pdf.addImage(img, "JPEG", 0, 0, w, h);
    pdf.save(`SKL-${siswa.nama.replace(/\s+/g, "_")}.pdf`);
    toast.success("PDF berhasil diunduh");
  };

  const share = async () => {
    try { await navigator.clipboard.writeText(verifyUrl); toast.success("Link verifikasi disalin!"); }
    catch { toast.error("Gagal menyalin"); }
  };

  return (
    <AppShell>
      <button onClick={() => nav(-1)} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Kembali
      </button>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">{pengumuman.tipe_surat}</div>
          <h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">{siswa.nama}</h1>
          <p className="text-sm text-muted-foreground">{siswa.nomor_surat} · {siswa.kelas}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={share} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-semibold shadow-sm-soft hover:bg-accent">
            <Share2 className="h-3.5 w-3.5" /> Bagikan Link
          </button>
          <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-semibold shadow-sm-soft hover:bg-accent">
            <Printer className="h-3.5 w-3.5" /> Cetak
          </button>
          <button onClick={downloadPDF} className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-md-soft hover:shadow-glow">
            <Download className="h-3.5 w-3.5" /> Unduh PDF
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-primary">
        <ShieldCheck className="h-4 w-4" />
        <span>Surat ini bisa diverifikasi publik di: <code className="font-mono">{verifyUrl}</code></span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-secondary/30 p-4 md:p-8 print:bg-white print:p-0">
        <SuratSKL ref={ref} siswa={siswa} nilai={nilai} sekolah={sekolah} tipeSurat={pengumuman.tipe_surat} />
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #surat-skl, #surat-skl * { visibility: visible; }
          #surat-skl { position: absolute; left: 0; top: 0; box-shadow: none; }
        }
      `}</style>
    </AppShell>
  );
}
