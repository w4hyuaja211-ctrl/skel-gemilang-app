
-- Pengaturan PPDB
CREATE TABLE public.ppdb_pengaturan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  judul text NOT NULL DEFAULT 'Pengumuman SPMB Gelombang 2',
  gelombang text NOT NULL DEFAULT 'Gelombang 2',
  tahun_ajaran text NOT NULL DEFAULT '2026/2027',
  jadwal_buka timestamptz NOT NULL DEFAULT now(),
  tanggal_pengambilan date NOT NULL DEFAULT '2026-06-30',
  lokasi_pengambilan text NOT NULL DEFAULT 'Tata Usaha Sekolah',
  pesan_lulus text NOT NULL DEFAULT 'Selamat! Anda dinyatakan LULUS seleksi. Silakan ambil surat kelulusan di Tata Usaha mulai tanggal 30 Juni 2026.',
  pesan_tidak_lulus text NOT NULL DEFAULT 'Mohon maaf, Anda belum berhasil pada seleksi kali ini. Jangan kecewa, tetap semangat — masih banyak jalan menuju kesuksesan!',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ppdb_pengaturan TO authenticated;
GRANT ALL ON public.ppdb_pengaturan TO service_role;
ALTER TABLE public.ppdb_pengaturan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin kelola ppdb_pengaturan" ON public.ppdb_pengaturan
  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TYPE public.status_ppdb AS ENUM ('Lulus','Tidak Lulus');

-- Pendaftar PPDB
CREATE TABLE public.ppdb_pendaftar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  no_pendaftaran text NOT NULL UNIQUE CHECK (no_pendaftaran ~ '^[0-9]{2}-[0-9]{3}-[0-9]{3}-[0-9]$'),
  nama text NOT NULL,
  asal_sekolah text,
  nilai_matematika numeric(5,2) NOT NULL DEFAULT 0,
  nilai_ipa numeric(5,2) NOT NULL DEFAULT 0,
  nilai_bahasa_inggris numeric(5,2) NOT NULL DEFAULT 0,
  status public.status_ppdb NOT NULL DEFAULT 'Tidak Lulus',
  catatan text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ppdb_pendaftar TO authenticated;
GRANT ALL ON public.ppdb_pendaftar TO service_role;
ALTER TABLE public.ppdb_pendaftar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin kelola ppdb_pendaftar" ON public.ppdb_pendaftar
  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Trigger updated_at
CREATE TRIGGER trg_ppdb_pengaturan_upd BEFORE UPDATE ON public.ppdb_pengaturan
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_ppdb_pendaftar_upd BEFORE UPDATE ON public.ppdb_pendaftar
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed satu baris pengaturan
INSERT INTO public.ppdb_pengaturan DEFAULT VALUES;

-- RPC publik untuk cek hasil PPDB (gated by jadwal_buka)
CREATE OR REPLACE FUNCTION public.lookup_ppdb_by_nomor(_no text)
RETURNS TABLE(
  id uuid, no_pendaftaran text, nama text, asal_sekolah text,
  nilai_matematika numeric, nilai_ipa numeric, nilai_bahasa_inggris numeric,
  status public.status_ppdb, catatan text
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT p.id, p.no_pendaftaran, p.nama, p.asal_sekolah,
         p.nilai_matematika, p.nilai_ipa, p.nilai_bahasa_inggris,
         p.status, p.catatan
  FROM public.ppdb_pendaftar p
  WHERE p.no_pendaftaran = _no
    AND EXISTS (SELECT 1 FROM public.ppdb_pengaturan s WHERE now() >= s.jadwal_buka)
  LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.lookup_ppdb_by_nomor(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lookup_ppdb_by_nomor(text) TO anon, authenticated;

-- RPC publik untuk baca pengaturan tampilan
CREATE OR REPLACE FUNCTION public.get_ppdb_pengaturan_public()
RETURNS TABLE(
  judul text, gelombang text, tahun_ajaran text,
  jadwal_buka timestamptz, tanggal_pengambilan date,
  lokasi_pengambilan text, pesan_lulus text, pesan_tidak_lulus text
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT judul, gelombang, tahun_ajaran, jadwal_buka, tanggal_pengambilan,
         lokasi_pengambilan, pesan_lulus, pesan_tidak_lulus
  FROM public.ppdb_pengaturan LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.get_ppdb_pengaturan_public() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_ppdb_pengaturan_public() TO anon, authenticated;
