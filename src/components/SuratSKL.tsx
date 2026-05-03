import type { Siswa, Sekolah, TipeSurat, Nilai } from "@/lib/skl-api";
import { forwardRef } from "react";

type Props = { siswa: Siswa; nilai: Nilai[]; sekolah: Sekolah; tipeSurat: TipeSurat };

const SuratSKL = forwardRef<HTMLDivElement, Props>(({ siswa, nilai, sekolah, tipeSurat }, ref) => {
  return (
    <div ref={ref} id="surat-skl"
      className="mx-auto bg-white p-12 font-serif text-[13px] leading-relaxed text-black shadow-lg-soft"
      style={{ width: "210mm", minHeight: "297mm" }}>
      <div className="flex items-center gap-4 border-b-4 border-double border-black pb-4">
        {sekolah.logo_url ? (
          <img src={sekolah.logo_url} alt="Logo" className="h-20 w-20 object-contain" />
        ) : (
          <div className="grid h-20 w-20 place-items-center rounded-full border-2 border-black">
            <div className="text-center text-[8px] font-bold leading-tight">LOGO<br />SEKOLAH</div>
          </div>
        )}
        <div className="flex-1 text-center">
          <div className="text-xs font-semibold uppercase">Pemerintah Provinsi</div>
          <div className="text-xs font-semibold uppercase">Dinas Pendidikan</div>
          <div className="font-display text-2xl font-extrabold uppercase">{sekolah.nama}</div>
          <div className="text-[11px]">{sekolah.alamat} · NPSN: {sekolah.npsn}</div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <div className="font-display text-lg font-bold uppercase underline underline-offset-4">{tipeSurat}</div>
        <div className="text-[12px]">Nomor: {siswa.nomor_surat}</div>
      </div>

      <div className="mt-8 space-y-4">
        <p className="indent-12">Yang bertanda tangan di bawah ini, Kepala {sekolah.nama}, dengan ini menerangkan bahwa:</p>

        <table className="ml-12 text-[13px]">
          <tbody>
            {[
              ["Nama Lengkap", siswa.nama.toUpperCase()],
              ["Tempat, Tanggal Lahir", `${siswa.tempat_lahir ?? "-"}${siswa.tanggal_lahir ? ", " + new Date(siswa.tanggal_lahir).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : ""}`],
              ["Jenis Kelamin", siswa.jenis_kelamin ?? "-"],
              ["NISN / NIS", `${siswa.nisn} / ${siswa.nis ?? "-"}`],
              ["Nama Orang Tua/Wali", siswa.orang_tua ?? "-"],
              ["Alamat", siswa.alamat ?? "-"],
              ["Kelas / Jurusan", `${siswa.kelas ?? "-"}${siswa.jurusan ? " / " + siswa.jurusan : ""}`],
            ].map(([k, v]) => (
              <tr key={k as string}>
                <td className="pr-3 align-top">{k}</td>
                <td className="pr-3 align-top">:</td>
                <td className="font-semibold">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="indent-12">Berdasarkan hasil rapat pleno Dewan Guru pada tahun pelajaran <span className="font-semibold">{siswa.tahun_ajaran}</span>, siswa tersebut di atas dinyatakan:</p>
        <div className="text-center">
          <span className={`inline-block border-2 px-8 py-2 font-display text-xl font-extrabold uppercase tracking-widest ${siswa.status === "Lulus" ? "border-black" : siswa.status === "Tunda" ? "border-amber-600 text-amber-700" : "border-red-700 text-red-700"}`}>
            {siswa.status === "Lulus" ? "LULUS" : siswa.status === "Tunda" ? "DITUNDA" : "BELUM LULUS"}
          </span>
        </div>

        {siswa.status === "Tunda" && siswa.keterangan_tunda && (
          <p className="indent-12 text-[12px]"><span className="font-semibold">Keterangan:</span> {siswa.keterangan_tunda}</p>
        )}

        {nilai.length > 0 && (
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
                {nilai.map((n, i) => (
                  <tr key={i}>
                    <td className="border border-black px-2 py-1">{i + 1}</td>
                    <td className="border border-black px-2 py-1">{n.mapel}</td>
                    <td className="border border-black px-2 py-1 text-center">{Number(n.nilai).toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="font-bold">
                  <td className="border border-black px-2 py-1" colSpan={2}>Rata-rata</td>
                  <td className="border border-black px-2 py-1 text-center">
                    {(nilai.reduce((a, b) => a + Number(b.nilai), 0) / nilai.length).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <p className="indent-12 pt-2">Surat keterangan ini berlaku sementara sampai diterbitkannya ijazah resmi. Demikian surat keterangan ini dibuat untuk dipergunakan sebagaimana mestinya.</p>
      </div>

      <div className="mt-12 flex items-end justify-end">
        <div className="text-center text-[12px]">
          <div>Diterbitkan di {sekolah.alamat.split(",")[0]}</div>
          <div>{siswa.tanggal_lulus ? new Date(siswa.tanggal_lulus).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}</div>
          <div className="mt-1">Kepala {sekolah.nama},</div>
          <div className="my-12 font-bold underline">{sekolah.kepala_sekolah}</div>
          <div>NIP. {sekolah.nip_kepsek}</div>
        </div>
      </div>
    </div>
  );
});
SuratSKL.displayName = "SuratSKL";
export default SuratSKL;
