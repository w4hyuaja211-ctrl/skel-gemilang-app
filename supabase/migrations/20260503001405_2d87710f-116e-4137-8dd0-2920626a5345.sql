
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.status_kelulusan AS ENUM ('Lulus', 'Belum', 'Tunda');
CREATE TYPE public.tipe_surat AS ENUM ('SKL', 'SKHU Sementara', 'Surat Keterangan Pengganti Ijazah');
CREATE TYPE public.jenis_kelamin AS ENUM ('Laki-laki', 'Perempuan');

-- ============ UTIL ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ AUTO PROFILE ON SIGNUP ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1)));
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ SEKOLAH (single row) ============
CREATE TABLE public.sekolah (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL DEFAULT '',
  npsn TEXT NOT NULL DEFAULT '',
  alamat TEXT NOT NULL DEFAULT '',
  kepala_sekolah TEXT NOT NULL DEFAULT '',
  nip_kepsek TEXT NOT NULL DEFAULT '',
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sekolah ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read sekolah" ON public.sekolah FOR SELECT USING (true);
CREATE POLICY "admin write sekolah" ON public.sekolah FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_sekolah_updated BEFORE UPDATE ON public.sekolah FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ PENGUMUMAN (single row) ============
CREATE TABLE public.pengumuman (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tahun_ajaran TEXT NOT NULL DEFAULT '2024/2025',
  header_judul TEXT NOT NULL DEFAULT 'Pengumuman Kelulusan Siswa',
  header_sub TEXT NOT NULL DEFAULT '',
  footer_teks TEXT NOT NULL DEFAULT '',
  jadwal_buka TIMESTAMPTZ NOT NULL DEFAULT now(),
  pesan_tunda TEXT NOT NULL DEFAULT '',
  tipe_surat tipe_surat NOT NULL DEFAULT 'SKL',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pengumuman ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read pengumuman" ON public.pengumuman FOR SELECT USING (true);
CREATE POLICY "admin write pengumuman" ON public.pengumuman FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_pengumuman_updated BEFORE UPDATE ON public.pengumuman FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ MAPEL ============
CREATE TABLE public.mapel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  kode TEXT,
  urutan INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mapel ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read mapel" ON public.mapel FOR SELECT USING (true);
CREATE POLICY "admin write mapel" ON public.mapel FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ KELAS ============
CREATE TABLE public.kelas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL UNIQUE,
  tingkat TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.kelas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read kelas" ON public.kelas FOR SELECT USING (true);
CREATE POLICY "admin write kelas" ON public.kelas FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ JURUSAN ============
CREATE TABLE public.jurusan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL UNIQUE,
  kode TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.jurusan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read jurusan" ON public.jurusan FOR SELECT USING (true);
CREATE POLICY "admin write jurusan" ON public.jurusan FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ SISWA ============
CREATE TABLE public.siswa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nisn TEXT NOT NULL UNIQUE CHECK (nisn ~ '^[0-9]{10}$'),
  nis TEXT,
  nama TEXT NOT NULL,
  tempat_lahir TEXT,
  tanggal_lahir DATE,
  jenis_kelamin jenis_kelamin,
  orang_tua TEXT,
  alamat TEXT,
  kelas TEXT,
  jurusan TEXT,
  tahun_ajaran TEXT NOT NULL DEFAULT '2024/2025',
  tanggal_lulus DATE,
  nomor_surat TEXT,
  status status_kelulusan NOT NULL DEFAULT 'Belum',
  keterangan_tunda TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_siswa_nisn ON public.siswa(nisn);
ALTER TABLE public.siswa ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read siswa" ON public.siswa FOR SELECT USING (true);
CREATE POLICY "admin write siswa" ON public.siswa FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_siswa_updated BEFORE UPDATE ON public.siswa FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ NILAI ============
CREATE TABLE public.nilai_siswa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  siswa_id UUID NOT NULL REFERENCES public.siswa(id) ON DELETE CASCADE,
  mapel TEXT NOT NULL,
  nilai NUMERIC(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_nilai_siswa_id ON public.nilai_siswa(siswa_id);
ALTER TABLE public.nilai_siswa ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read nilai" ON public.nilai_siswa FOR SELECT USING (true);
CREATE POLICY "admin write nilai" ON public.nilai_siswa FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ STORAGE: school-logos bucket ============
INSERT INTO storage.buckets (id, name, public) VALUES ('school-logos','school-logos',true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "public read logos" ON storage.objects FOR SELECT USING (bucket_id = 'school-logos');
CREATE POLICY "admin upload logos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'school-logos' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin update logos" ON storage.objects FOR UPDATE USING (bucket_id = 'school-logos' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin delete logos" ON storage.objects FOR DELETE USING (bucket_id = 'school-logos' AND public.has_role(auth.uid(),'admin'));

-- ============ SEED single-row tables + master defaults ============
INSERT INTO public.sekolah (nama, npsn, alamat, kepala_sekolah, nip_kepsek)
VALUES ('SMA Muhammadiyah 1 Palembang','20212223','Jl. Pendidikan No. 10, Palembang','Drs. Bambang Widodo, M.Pd.','196805121994031007');

INSERT INTO public.pengumuman (tahun_ajaran, header_judul, header_sub, footer_teks, jadwal_buka, pesan_tunda, tipe_surat)
VALUES ('2024/2025','Pengumuman Kelulusan Siswa','Tahun Pelajaran 2024/2025',
  'Selamat kepada seluruh siswa. Tetap rendah hati dan terus berkarya.',
  now() - interval '1 minute',
  'Status kelulusan Anda DITUNDA. Silakan menghubungi panitia/wali kelas untuk menyelesaikan ujian susulan.',
  'SKL');

INSERT INTO public.mapel (nama, urutan) VALUES
 ('Pendidikan Agama',1),('PPKn',2),('Bahasa Indonesia',3),('Matematika',4),
 ('Bahasa Inggris',5),('Sejarah Indonesia',6),('Seni Budaya',7),('PJOK',8);

INSERT INTO public.kelas (nama, tingkat) VALUES
 ('XII IPA 1','XII'),('XII IPA 2','XII'),('XII IPS 1','XII'),('XII IPS 2','XII');

INSERT INTO public.jurusan (nama, kode) VALUES
 ('MIPA','MIPA'),('IPS','IPS'),('Bahasa','BHS');
