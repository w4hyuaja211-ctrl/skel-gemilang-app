import { supabase } from "@/integrations/supabase/client";

export type StatusPPDB = "Lulus" | "Tidak Lulus";

export type PpdbPengaturan = {
  id?: string;
  judul: string;
  gelombang: string;
  tahun_ajaran: string;
  jadwal_buka: string;
  tanggal_pengambilan: string;
  lokasi_pengambilan: string;
  pesan_lulus: string;
  pesan_tidak_lulus: string;
};

export type PpdbPendaftar = {
  id: string;
  no_pendaftaran: string;
  nama: string;
  asal_sekolah: string | null;
  nilai_matematika: number;
  nilai_ipa: number;
  nilai_bahasa_inggris: number;
  status: StatusPPDB;
  catatan: string | null;
  created_at?: string;
};

export type PpdbPendaftarInput = Omit<PpdbPendaftar, "id" | "created_at">;

const sb = supabase as any;

// Format helper: turns 0106100101 into 01-061-001-1
export const formatNoPendaftaran = (raw: string) => {
  const d = raw.replace(/\D/g, "").slice(0, 9);
  const parts = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 8), d.slice(8, 9)].filter(Boolean);
  return parts.join("-");
};
export const isValidNoPendaftaran = (v: string) => /^\d{2}-\d{3}-\d{3}-\d$/.test(v);

// ============= PENGATURAN =============
export async function getPpdbPengaturanAdmin(): Promise<PpdbPengaturan | null> {
  const { data } = await sb.from("ppdb_pengaturan").select("*").limit(1).maybeSingle();
  return data ?? null;
}
export async function getPpdbPengaturanPublic(): Promise<PpdbPengaturan | null> {
  const { data, error } = await sb.rpc("get_ppdb_pengaturan_public");
  if (error || !data || (Array.isArray(data) && data.length === 0)) return null;
  const row = Array.isArray(data) ? data[0] : data;
  return row;
}
export async function updatePpdbPengaturan(p: PpdbPengaturan) {
  const { error } = await sb.from("ppdb_pengaturan").update(p).eq("id", p.id!);
  if (error) throw error;
}

// ============= PENDAFTAR =============
export async function listPpdb(): Promise<PpdbPendaftar[]> {
  const { data } = await sb.from("ppdb_pendaftar").select("*").order("no_pendaftaran");
  return data ?? [];
}
export async function addPpdb(row: PpdbPendaftarInput) {
  const { error } = await sb.from("ppdb_pendaftar").insert(row);
  if (error) throw error;
}
export async function updatePpdb(id: string, row: Partial<PpdbPendaftarInput>) {
  const { error } = await sb.from("ppdb_pendaftar").update(row).eq("id", id);
  if (error) throw error;
}
export async function deletePpdb(id: string) {
  const { error } = await sb.from("ppdb_pendaftar").delete().eq("id", id);
  if (error) throw error;
}
export async function importPpdb(rows: PpdbPendaftarInput[]) {
  const { data, error } = await sb.from("ppdb_pendaftar").upsert(rows, { onConflict: "no_pendaftaran" }).select("id");
  if (error) throw error;
  return { count: data?.length ?? 0 };
}

// Public lookup (gated server-side by jadwal_buka)
export async function findPpdbByNomor(no_pendaftaran: string): Promise<PpdbPendaftar | null> {
  const { data, error } = await sb.rpc("lookup_ppdb_by_nomor", { _no: no_pendaftaran });
  if (error || !data || (Array.isArray(data) && data.length === 0)) return null;
  return Array.isArray(data) ? data[0] : data;
}
