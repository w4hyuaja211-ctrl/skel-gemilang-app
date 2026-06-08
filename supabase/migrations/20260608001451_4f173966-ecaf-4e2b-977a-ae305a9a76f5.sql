
-- 1. Drop public SELECT policies on siswa and nilai_siswa
DROP POLICY IF EXISTS "public read siswa" ON public.siswa;
DROP POLICY IF EXISTS "public read nilai" ON public.nilai_siswa;

-- 2. Add admin-only SELECT policies (admin write ALL still covers, but be explicit)
CREATE POLICY "admin read siswa" ON public.siswa FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin read nilai" ON public.nilai_siswa FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- 3. Public lookup function: limited fields only, by NISN
CREATE OR REPLACE FUNCTION public.lookup_siswa_by_nisn(_nisn text)
RETURNS TABLE (
  id uuid,
  nisn text,
  nama text,
  kelas text,
  jurusan text,
  tahun_ajaran text,
  status public.status_kelulusan,
  keterangan_tunda text,
  nomor_surat text,
  tanggal_lulus date
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.id, s.nisn, s.nama, s.kelas, s.jurusan, s.tahun_ajaran,
         s.status, s.keterangan_tunda, s.nomor_surat, s.tanggal_lulus
  FROM public.siswa s
  WHERE s.nisn = _nisn
    AND EXISTS (
      SELECT 1 FROM public.pengumuman p WHERE now() >= p.jadwal_buka
    )
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.lookup_siswa_by_nisn(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lookup_siswa_by_nisn(text) TO anon, authenticated;
