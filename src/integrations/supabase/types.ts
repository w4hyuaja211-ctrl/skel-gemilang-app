export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      jurusan: {
        Row: {
          created_at: string
          id: string
          kode: string | null
          nama: string
        }
        Insert: {
          created_at?: string
          id?: string
          kode?: string | null
          nama: string
        }
        Update: {
          created_at?: string
          id?: string
          kode?: string | null
          nama?: string
        }
        Relationships: []
      }
      kelas: {
        Row: {
          created_at: string
          id: string
          nama: string
          tingkat: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          nama: string
          tingkat?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          nama?: string
          tingkat?: string | null
        }
        Relationships: []
      }
      mapel: {
        Row: {
          created_at: string
          id: string
          kode: string | null
          nama: string
          urutan: number
        }
        Insert: {
          created_at?: string
          id?: string
          kode?: string | null
          nama: string
          urutan?: number
        }
        Update: {
          created_at?: string
          id?: string
          kode?: string | null
          nama?: string
          urutan?: number
        }
        Relationships: []
      }
      nilai_siswa: {
        Row: {
          created_at: string
          id: string
          mapel: string
          nilai: number
          siswa_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mapel: string
          nilai?: number
          siswa_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mapel?: string
          nilai?: number
          siswa_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nilai_siswa_siswa_id_fkey"
            columns: ["siswa_id"]
            isOneToOne: false
            referencedRelation: "siswa"
            referencedColumns: ["id"]
          },
        ]
      }
      pengumuman: {
        Row: {
          created_at: string
          footer_teks: string
          header_judul: string
          header_sub: string
          id: string
          jadwal_buka: string
          pesan_tunda: string
          tahun_ajaran: string
          tipe_surat: Database["public"]["Enums"]["tipe_surat"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          footer_teks?: string
          header_judul?: string
          header_sub?: string
          id?: string
          jadwal_buka?: string
          pesan_tunda?: string
          tahun_ajaran?: string
          tipe_surat?: Database["public"]["Enums"]["tipe_surat"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          footer_teks?: string
          header_judul?: string
          header_sub?: string
          id?: string
          jadwal_buka?: string
          pesan_tunda?: string
          tahun_ajaran?: string
          tipe_surat?: Database["public"]["Enums"]["tipe_surat"]
          updated_at?: string
        }
        Relationships: []
      }
      ppdb_pendaftar: {
        Row: {
          asal_sekolah: string | null
          catatan: string | null
          created_at: string
          id: string
          nama: string
          nilai_bahasa_inggris: number
          nilai_ipa: number
          nilai_matematika: number
          no_pendaftaran: string
          status: Database["public"]["Enums"]["status_ppdb"]
          updated_at: string
        }
        Insert: {
          asal_sekolah?: string | null
          catatan?: string | null
          created_at?: string
          id?: string
          nama: string
          nilai_bahasa_inggris?: number
          nilai_ipa?: number
          nilai_matematika?: number
          no_pendaftaran: string
          status?: Database["public"]["Enums"]["status_ppdb"]
          updated_at?: string
        }
        Update: {
          asal_sekolah?: string | null
          catatan?: string | null
          created_at?: string
          id?: string
          nama?: string
          nilai_bahasa_inggris?: number
          nilai_ipa?: number
          nilai_matematika?: number
          no_pendaftaran?: string
          status?: Database["public"]["Enums"]["status_ppdb"]
          updated_at?: string
        }
        Relationships: []
      }
      ppdb_pengaturan: {
        Row: {
          created_at: string
          gelombang: string
          id: string
          jadwal_buka: string
          judul: string
          lokasi_pengambilan: string
          pesan_lulus: string
          pesan_tidak_lulus: string
          tahun_ajaran: string
          tanggal_pengambilan: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          gelombang?: string
          id?: string
          jadwal_buka?: string
          judul?: string
          lokasi_pengambilan?: string
          pesan_lulus?: string
          pesan_tidak_lulus?: string
          tahun_ajaran?: string
          tanggal_pengambilan?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          gelombang?: string
          id?: string
          jadwal_buka?: string
          judul?: string
          lokasi_pengambilan?: string
          pesan_lulus?: string
          pesan_tidak_lulus?: string
          tahun_ajaran?: string
          tanggal_pengambilan?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sekolah: {
        Row: {
          alamat: string
          created_at: string
          id: string
          kepala_sekolah: string
          logo_url: string | null
          nama: string
          nip_kepsek: string
          npsn: string
          updated_at: string
        }
        Insert: {
          alamat?: string
          created_at?: string
          id?: string
          kepala_sekolah?: string
          logo_url?: string | null
          nama?: string
          nip_kepsek?: string
          npsn?: string
          updated_at?: string
        }
        Update: {
          alamat?: string
          created_at?: string
          id?: string
          kepala_sekolah?: string
          logo_url?: string | null
          nama?: string
          nip_kepsek?: string
          npsn?: string
          updated_at?: string
        }
        Relationships: []
      }
      siswa: {
        Row: {
          alamat: string | null
          created_at: string
          id: string
          jenis_kelamin: Database["public"]["Enums"]["jenis_kelamin"] | null
          jurusan: string | null
          kelas: string | null
          keterangan_tunda: string | null
          nama: string
          nis: string | null
          nisn: string
          nomor_surat: string | null
          orang_tua: string | null
          status: Database["public"]["Enums"]["status_kelulusan"]
          tahun_ajaran: string
          tanggal_lahir: string | null
          tanggal_lulus: string | null
          tempat_lahir: string | null
          updated_at: string
        }
        Insert: {
          alamat?: string | null
          created_at?: string
          id?: string
          jenis_kelamin?: Database["public"]["Enums"]["jenis_kelamin"] | null
          jurusan?: string | null
          kelas?: string | null
          keterangan_tunda?: string | null
          nama: string
          nis?: string | null
          nisn: string
          nomor_surat?: string | null
          orang_tua?: string | null
          status?: Database["public"]["Enums"]["status_kelulusan"]
          tahun_ajaran?: string
          tanggal_lahir?: string | null
          tanggal_lulus?: string | null
          tempat_lahir?: string | null
          updated_at?: string
        }
        Update: {
          alamat?: string | null
          created_at?: string
          id?: string
          jenis_kelamin?: Database["public"]["Enums"]["jenis_kelamin"] | null
          jurusan?: string | null
          kelas?: string | null
          keterangan_tunda?: string | null
          nama?: string
          nis?: string | null
          nisn?: string
          nomor_surat?: string | null
          orang_tua?: string | null
          status?: Database["public"]["Enums"]["status_kelulusan"]
          tahun_ajaran?: string
          tanggal_lahir?: string | null
          tanggal_lulus?: string | null
          tempat_lahir?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_ppdb_pengaturan_public: {
        Args: never
        Returns: {
          gelombang: string
          jadwal_buka: string
          judul: string
          lokasi_pengambilan: string
          pesan_lulus: string
          pesan_tidak_lulus: string
          tahun_ajaran: string
          tanggal_pengambilan: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      lookup_ppdb_by_nomor: {
        Args: { _no: string }
        Returns: {
          asal_sekolah: string
          catatan: string
          id: string
          nama: string
          nilai_bahasa_inggris: number
          nilai_ipa: number
          nilai_matematika: number
          no_pendaftaran: string
          status: Database["public"]["Enums"]["status_ppdb"]
        }[]
      }
      lookup_siswa_by_nisn: {
        Args: { _nisn: string }
        Returns: {
          id: string
          jurusan: string
          kelas: string
          keterangan_tunda: string
          nama: string
          nisn: string
          nomor_surat: string
          status: Database["public"]["Enums"]["status_kelulusan"]
          tahun_ajaran: string
          tanggal_lulus: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
      jenis_kelamin: "Laki-laki" | "Perempuan"
      status_kelulusan: "Lulus" | "Belum" | "Tunda"
      status_ppdb: "Lulus" | "Tidak Lulus"
      tipe_surat: "SKL" | "SKHU Sementara" | "Surat Keterangan Pengganti Ijazah"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      jenis_kelamin: ["Laki-laki", "Perempuan"],
      status_kelulusan: ["Lulus", "Belum", "Tunda"],
      status_ppdb: ["Lulus", "Tidak Lulus"],
      tipe_surat: [
        "SKL",
        "SKHU Sementara",
        "Surat Keterangan Pengganti Ijazah",
      ],
    },
  },
} as const
