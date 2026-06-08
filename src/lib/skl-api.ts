import { supabase } from "@/integrations/supabase/client";

export type StatusKelulusan = "Lulus" | "Belum" | "Tunda";
export type TipeSurat = "SKL" | "SKHU Sementara" | "Surat Keterangan Pengganti Ijazah";

export type Sekolah = {
  id?: string;
  nama: string;
  npsn: string;
  alamat: string;
  kepala_sekolah: string;
  nip_kepsek: string;
  logo_url: string | null;
};

export type Pengumuman = {
  id?: string;
  tahun_ajaran: string;
  header_judul: string;
  header_sub: string;
  footer_teks: string;
  jadwal_buka: string;
  pesan_tunda: string;
  tipe_surat: TipeSurat;
};

export type Nilai = { id?: string; siswa_id?: string; mapel: string; nilai: number };

export type Siswa = {
  id: string;
  nisn: string;
  nis: string | null;
  nama: string;
  tempat_lahir: string | null;
  tanggal_lahir: string | null;
  jenis_kelamin: "Laki-laki" | "Perempuan" | null;
  orang_tua: string | null;
  alamat: string | null;
  kelas: string | null;
  jurusan: string | null;
  tahun_ajaran: string;
  tanggal_lulus: string | null;
  nomor_surat: string | null;
  status: StatusKelulusan;
  keterangan_tunda: string | null;
  created_at: string;
};

export type SiswaInput = Omit<Siswa, "id" | "created_at"> & { nilai?: Nilai[] };

export type Mapel = { id: string; nama: string; kode: string | null; urutan: number };
export type Kelas = { id: string; nama: string; tingkat: string | null };
export type Jurusan = { id: string; nama: string; kode: string | null };

// ================= SEKOLAH =================
export async function getSekolah(): Promise<Sekolah | null> {
  const { data } = await supabase.from("sekolah").select("*").limit(1).maybeSingle();
  return data as any;
}
export async function updateSekolah(s: Sekolah) {
  const { error } = await supabase.from("sekolah").update(s).eq("id", s.id!);
  if (error) throw error;
}

// ================= PENGUMUMAN =================
export async function getPengumuman(): Promise<Pengumuman | null> {
  const { data } = await supabase.from("pengumuman").select("*").limit(1).maybeSingle();
  return data as any;
}
export async function updatePengumuman(p: Pengumuman) {
  const { error } = await supabase.from("pengumuman").update(p).eq("id", p.id!);
  if (error) throw error;
}

// ================= MASTER =================
export async function listMapel(): Promise<Mapel[]> {
  const { data } = await supabase.from("mapel").select("*").order("urutan").order("nama");
  return (data as any) ?? [];
}
export async function addMapel(m: Omit<Mapel, "id">) {
  const { error } = await supabase.from("mapel").insert(m);
  if (error) throw error;
}
export async function deleteMapel(id: string) {
  const { error } = await supabase.from("mapel").delete().eq("id", id);
  if (error) throw error;
}

export async function listKelas(): Promise<Kelas[]> {
  const { data } = await supabase.from("kelas").select("*").order("nama");
  return (data as any) ?? [];
}
export async function addKelas(k: Omit<Kelas, "id">) {
  const { error } = await supabase.from("kelas").insert(k);
  if (error) throw error;
}
export async function deleteKelas(id: string) {
  const { error } = await supabase.from("kelas").delete().eq("id", id);
  if (error) throw error;
}

export async function listJurusan(): Promise<Jurusan[]> {
  const { data } = await supabase.from("jurusan").select("*").order("nama");
  return (data as any) ?? [];
}
export async function addJurusan(j: Omit<Jurusan, "id">) {
  const { error } = await supabase.from("jurusan").insert(j);
  if (error) throw error;
}
export async function deleteJurusan(id: string) {
  const { error } = await supabase.from("jurusan").delete().eq("id", id);
  if (error) throw error;
}

// ================= SISWA =================
export async function listSiswa(): Promise<Siswa[]> {
  const { data } = await supabase.from("siswa").select("*").order("created_at", { ascending: false });
  return (data as any) ?? [];
}
export async function getSiswa(id: string): Promise<{ siswa: Siswa; nilai: Nilai[] } | null> {
  const { data: siswa } = await supabase.from("siswa").select("*").eq("id", id).maybeSingle();
  if (!siswa) return null;
  const { data: nilai } = await supabase.from("nilai_siswa").select("*").eq("siswa_id", id);
  return { siswa: siswa as any, nilai: (nilai as any) ?? [] };
}
// Public-safe lookup via SECURITY DEFINER RPC — returns only fields needed for the
// public announcement page. Used by visitors who are not signed in.
export async function findByNISN(nisn: string): Promise<Siswa | null> {
  const { data, error } = await (supabase as any).rpc("lookup_siswa_by_nisn", { _nisn: nisn });
  if (error || !data || (Array.isArray(data) && data.length === 0)) return null;
  const row = Array.isArray(data) ? data[0] : data;
  return row as any;
}
export async function addSiswa(input: SiswaInput): Promise<Siswa> {
  const { nilai = [], ...row } = input;
  const { data, error } = await supabase.from("siswa").insert(row).select().single();
  if (error) throw error;
  if (nilai.length) {
    await supabase.from("nilai_siswa").insert(
      nilai.map((n) => ({ siswa_id: (data as any).id, mapel: n.mapel, nilai: n.nilai })),
    );
  }
  return data as any;
}
export async function deleteSiswa(id: string) {
  const { error } = await supabase.from("siswa").delete().eq("id", id);
  if (error) throw error;
}
export async function deleteAllSiswa() {
  const { error } = await supabase.from("siswa").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) throw error;
}
export async function bulkUpdateStatus(status: StatusKelulusan) {
  const { error } = await supabase
    .from("siswa")
    .update({ 
      status, 
      tanggal_lulus: status === "Lulus" ? new Date().toISOString().split("T")[0] : null 
    })
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) throw error;
}
export async function updateSiswa(id: string, input: SiswaInput): Promise<Siswa> {
  const { nilai = [], ...row } = input;
  const { data, error } = await supabase.from("siswa").update(row).eq("id", id).select().single();
  if (error) throw error;
  await upsertNilaiSiswa(id, nilai);
  return data as any;
}
export async function updateSiswaStatus(id: string, status: StatusKelulusan, keterangan_tunda?: string | null) {
  const { error } = await supabase
    .from("siswa")
    .update({ status, keterangan_tunda, tanggal_lulus: status === "Lulus" ? new Date().toISOString().split("T")[0] : null })
    .eq("id", id);
  if (error) throw error;
}
export async function getNilaiSiswa(siswaId: string): Promise<Nilai[]> {
  const { data } = await supabase.from("nilai_siswa").select("*").eq("siswa_id", siswaId);
  return (data as any) ?? [];
}
export async function upsertNilaiSiswa(siswaId: string, nilai: Nilai[]) {
  await supabase.from("nilai_siswa").delete().eq("siswa_id", siswaId);
  if (nilai.length > 0) {
    const { error } = await supabase.from("nilai_siswa").insert(
      nilai.map((n) => ({ siswa_id: siswaId, mapel: n.mapel, nilai: n.nilai }))
    );
    if (error) throw error;
  }
}
export async function importSiswa(rows: Omit<Siswa, "id" | "created_at">[]) {
  // upsert by nisn
  const { error, data } = await supabase
    .from("siswa")
    .upsert(rows, { onConflict: "nisn" })
    .select("id");
  if (error) throw error;
  return { count: data?.length ?? 0 };
}

// ================= STORAGE: LOGO =================
export async function uploadLogo(file: Blob, ext = "png"): Promise<string> {
  const path = `logo-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("school-logos").upload(path, file, {
    upsert: true,
    contentType: ext === "png" ? "image/png" : `image/${ext}`,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("school-logos").getPublicUrl(path);
  return data.publicUrl;
}
