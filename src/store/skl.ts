import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Nilai = { mapel: string; nilai: number };

export type Siswa = {
  id: string;
  nisn: string;
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
  status: "Lulus" | "Tidak Lulus";
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

type State = {
  sekolah: Sekolah;
  siswa: Siswa[];
  setSekolah: (s: Sekolah) => void;
  addSiswa: (s: Omit<Siswa, "id" | "createdAt">) => Siswa;
  updateSiswa: (id: string, s: Partial<Siswa>) => void;
  deleteSiswa: (id: string) => void;
  getSiswa: (id: string) => Siswa | undefined;
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
    nilai: [
      { mapel: "Pendidikan Agama", nilai: 88 },
      { mapel: "PPKn", nilai: 85 },
      { mapel: "Bahasa Indonesia", nilai: 90 },
      { mapel: "Matematika", nilai: 87 },
      { mapel: "Bahasa Inggris", nilai: 89 },
      { mapel: "Fisika", nilai: 86 },
      { mapel: "Kimia", nilai: 84 },
      { mapel: "Biologi", nilai: 91 },
    ],
    createdAt: new Date().toISOString(),
  },
];

export const useSKL = create<State>()(
  persist(
    (set, get) => ({
      sekolah: {
        nama: "SMA Negeri 1 Harapan Bangsa",
        npsn: "20212223",
        alamat: "Jl. Pendidikan No. 10, Jakarta Selatan",
        kepalaSekolah: "Drs. Bambang Widodo, M.Pd.",
        nipKepsek: "196805121994031007",
      },
      siswa: sample,
      setSekolah: (s) => set({ sekolah: s }),
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
    }),
    { name: "eskl-store" }
  )
);
