import { useSKL, type Siswa, type Sekolah } from "@/store/skl";
import { QRCodeSVG } from "qrcode.react";
import { forwardRef } from "react";

type Props = { siswa: Siswa; sekolah: Sekolah; verifyUrl: string };

const SuratSKL = forwardRef<HTMLDivElement, Props>(({ siswa, sekolah, verifyUrl }, ref) => {
  return (
    <div
      ref={ref}
      id="surat-skl"
      className="mx-auto bg-white p-12 font-serif text-[13px] leading-relaxed text-black shadow-lg-soft"
      style={{ width: "210mm", minHeight: "297mm" }}
    >
      {/* Kop */}
      <div className="flex items-center gap-4 border-b-4 border-double border-black pb-4">
        <div className="grid h-20 w-20 place-items-center rounded-full border-2 border-black">
          <div className="text-center text-[8px] font-bold leading-tight">LOGO<br/>SEKOLAH</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-xs font-semibold uppercase">Pemerintah Provinsi</div>
          <div className="text-xs font-semibold uppercase">Dinas Pendidikan</div>
          <div className="font-display text-2xl font-extrabold uppercase">{sekolah.nama}</div>
          <div className="text-[11px]">{sekolah.alamat} · NPSN: {sekolah.npsn}</div>
        </div>
      </div>

      {/* Title */}
      <div className="mt-8 text-center">
        <div className="font-display text-lg font-bold uppercase underline underline-offset-4">Surat Keterangan Lulus</div>
        <div className="text-[12px]">Nomor: {siswa.nomorSurat}</div>
      </div>

      {/* Body */}
      <div className="mt-8 space-y-4">
        <p className="indent-12">Yang bertanda tangan di bawah ini, Kepala {sekolah.nama}, dengan ini menerangkan bahwa:</p>

        <table className="ml-12 text-[13px]">
          <tbody>
            {[
              ["Nama Lengkap", siswa.nama.toUpperCase()],
              ["Tempat, Tanggal Lahir", `${siswa.tempatLahir}, ${new Date(siswa.tanggalLahir).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`],
              ["Jenis Kelamin", siswa.jenisKelamin],
              ["NISN / NIS", `${siswa.nisn} / ${siswa.nis || "-"}`],
              ["Nama Orang Tua/Wali", siswa.orangTua || "-"],
              ["Alamat", siswa.alamat || "-"],
              ["Kelas / Jurusan", `${siswa.kelas}${siswa.jurusan ? ` / ${siswa.jurusan}` : ""}`],
            ].map(([k, v]) => (
              <tr key={k as string}>
                <td className="pr-3 align-top">{k}</td>
                <td className="pr-3 align-top">:</td>
                <td className="font-semibold">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="indent-12">
          Berdasarkan hasil rapat pleno Dewan Guru pada tahun ajaran <span className="font-semibold">{siswa.tahunAjaran}</span>, siswa tersebut di atas dinyatakan:
        </p>
        <div className="text-center">
          <span className={`inline-block border-2 px-8 py-2 font-display text-xl font-extrabold uppercase tracking-widest ${siswa.status === "Lulus" ? "border-black" : "border-red-700 text-red-700"}`}>
            {siswa.status}
          </span>
        </div>

        {siswa.nilai.length > 0 && (
          <div className="pt-3">
            <p className="mb-2 font-semibold">Dengan nilai sebagai berikut:</p>
            <table className="w-full border-collapse border border-black text-[12px]">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black px-2 py-1.5 text-left">No</th>
                  <th className="border border-black px-2 py-1.5 text-left">Mata Pelajaran</th>
                  <th className="border border-black px-2 py-1.5 text-center">Nilai</th>
                </tr>
              </thead>
              <tbody>
                {siswa.nilai.map((n, i) => (
                  <tr key={i}>
                    <td className="border border-black px-2 py-1">{i + 1}</td>
                    <td className="border border-black px-2 py-1">{n.mapel}</td>
                    <td className="border border-black px-2 py-1 text-center">{n.nilai}</td>
                  </tr>
                ))}
                <tr className="font-bold">
                  <td className="border border-black px-2 py-1" colSpan={2}>Rata-rata</td>
                  <td className="border border-black px-2 py-1 text-center">
                    {(siswa.nilai.reduce((a, b) => a + b.nilai, 0) / siswa.nilai.length).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <p className="indent-12 pt-2">Surat keterangan ini berlaku sementara sampai diterbitkannya ijazah resmi. Demikian surat keterangan ini dibuat untuk dipergunakan sebagaimana mestinya.</p>
      </div>

      {/* Footer */}
      <div className="mt-12 flex items-end justify-between">
        <div className="text-center">
          <div className="rounded-lg border border-black/30 bg-white p-2">
            <QRCodeSVG value={verifyUrl} size={96} level="M" />
          </div>
          <div className="mt-2 max-w-[120px] text-[9px] leading-tight">Pindai untuk verifikasi keaslian surat</div>
        </div>
        <div className="text-center text-[12px]">
          <div>Diterbitkan di {sekolah.alamat.split(",")[0]}</div>
          <div>{new Date(siswa.tanggalLulus).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</div>
          <div className="mt-1">Kepala {sekolah.nama},</div>
          <div className="my-12 font-bold underline">{sekolah.kepalaSekolah}</div>
          <div>NIP. {sekolah.nipKepsek}</div>
        </div>
      </div>
    </div>
  );
});
SuratSKL.displayName = "SuratSKL";
export default SuratSKL;
