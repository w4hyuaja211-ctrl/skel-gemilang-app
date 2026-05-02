import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Nilai = { mapel: string; nilai: number };

export type StatusKelulusan = "Lulus" | "Belum" | "Tunda";
export type TipeSurat =
  | "SKL"
  | "SKHU Sementara"
  | "Surat Keterangan Pengganti Ijazah";

export type Siswa = {
  id: string;
  nisn: string; // 10 digit
  nis: string;
  nama: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: "Laki-laki" | "Perempuan";
  orangTua: string;
  alamat: string;
  kelas: string;
  jurusan?: string;
  tahunAjaran: string;
  tanggalLulus: string;
  nomorSurat: string;
  status: StatusKelulusan;
  keteranganTunda?: string; // alasan jika status Tunda
  nilai: Nilai[];
  createdAt: string;
};

export type Sekolah = {
  nama: string;
  npsn: string;
  alamat: string;
  kepalaSekolah: string;
  nipKepsek: string;
  logoUrl?: string;
};

export type Pengumuman = {
  tahunAjaran: string;
  headerJudul: string;
  headerSub: string;
  footerTeks: string;
  jadwalBuka: string; // ISO datetime
  pesanTunda: string;
  tipeSurat: TipeSurat;
};

type State = {
  sekolah: Sekolah;
  pengumuman: Pengumuman;
  siswa: Siswa[];
  setSekolah: (s: Sekolah) => void;
  setPengumuman: (p: Pengumuman) => void;
  addSiswa: (s: Omit<Siswa, "id" | "createdAt">) => Siswa;
  updateSiswa: (id: string, s: Partial<Siswa>) => void;
  deleteSiswa: (id: string) => void;
  getSiswa: (id: string) => Siswa | undefined;
  findByNISN: (nisn: string) => Siswa | undefined;
  importSiswa: (rows: Omit<Siswa, "id" | "createdAt">[]) => { added: number; updated: number };
};

const sample: Siswa[] = [
  {
    id: "demo-001",
    nisn: "0098765432",
    nis: "2024.001",
    nama: "Aulia Rahmadani",
    tempatLahir: "Bandung",
    tanggalLahir: "2007-05-14",
    jenisKelamin: "Perempuan",
    orangTua: "Bapak Hendra Saputra",
    alamat: "Jl. Merdeka No. 21, Bandung",
    kelas: "XII IPA 1",
    jurusan: "MIPA",
    tahunAjaran: "2024/2025",
    tanggalLulus: "2025-05-05",
    nomorSurat: "421/SKL/045/2025",
    status: "Lulus",
    nilai: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "demo-002",
    nisn: "0011223344",
    nis: "2024.002",
    nama: "Rizky Pratama",
    tempatLahir: "Jakarta",
    tanggalLahir: "2007-03-02",
    jenisKelamin: "Laki-laki",
    orangTua: "Bapak Sudrajat",
    alamat: "Jl. Kenanga No. 5, Jakarta",
    kelas: "XII IPS 2",
    jurusan: "IPS",
    tahunAjaran: "2024/2025",
    tanggalLulus: "2025-05-05",
    nomorSurat: "421/SKL/046/2025",
    status: "Tunda",
    keteranganTunda: "Belum menyelesaikan ujian praktik: Penjaskes, Seni Budaya",
    nilai: [],
    createdAt: new Date().toISOString(),
  },
];

export const useSKL = create<State>()(
  persist(
    (set, get) => ({
      sekolah: {
        nama: "SMA Muhammadiyah 1 Palembang",
        npsn: "20212223",
        alamat: "Jl. Pendidikan No. 10, Palembang",
        kepalaSekolah: "Drs. Bambang Widodo, M.Pd.",
        nipKepsek: "196805121994031007",
      },
      pengumuman: {
        tahunAjaran: "2024/2025",
        headerJudul: "Pengumuman Kelulusan Siswa",
        headerSub: "Tahun Pelajaran 2024/2025",
        footerTeks: "Selamat kepada seluruh siswa. Tetap rendah hati dan terus berkarya.",
        jadwalBuka: new Date(Date.now() - 60_000).toISOString().slice(0, 16),
        pesanTunda:
          "Status kelulusan Anda DITUNDA. Silakan menghubungi panitia/wali kelas untuk menyelesaikan ujian susulan.",
        tipeSurat: "SKL",
      },
      siswa: sample,
      setSekolah: (s) => set({ sekolah: s }),
      setPengumuman: (p) => set({ pengumuman: p }),
      addSiswa: (s) => {
        const newSiswa: Siswa = {
          ...s,
          id: crypto.randomUUID().slice(0, 8),
          createdAt: new Date().toISOString(),
        };
        set({ siswa: [newSiswa, ...get().siswa] });
        return newSiswa;
      },
      updateSiswa: (id, s) =>
        set({ siswa: get().siswa.map((x) => (x.id === id ? { ...x, ...s } : x)) }),
      deleteSiswa: (id) => set({ siswa: get().siswa.filter((x) => x.id !== id) }),
      getSiswa: (id) => get().siswa.find((x) => x.id === id),
      findByNISN: (nisn) => get().siswa.find((x) => x.nisn === nisn.trim()),
      importSiswa: (rows) => {
        let added = 0;
        let updated = 0;
        const list = [...get().siswa];
        for (const r of rows) {
          const idx = list.findIndex((x) => x.nisn === r.nisn);
          if (idx >= 0) {
            list[idx] = { ...list[idx], ...r };
            updated++;
          } else {
            list.unshift({
              ...r,
              id: crypto.randomUUID().slice(0, 8),
              createdAt: new Date().toISOString(),
            });
            added++;
          }
        }
        set({ siswa: list });
        return { added, updated };
      },
    }),
    { name: "eskl-store-v2" }
  )
);
