import AppShell from "@/components/AppShell";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listMapel, addMapel, deleteMapel,
  listKelas, addKelas, deleteKelas,
  listJurusan, addJurusan, deleteJurusan,
} from "@/lib/skl-api";
import { useState } from "react";
import { Plus, Trash2, BookOpen, School2, Layers } from "lucide-react";
import { toast } from "sonner";

const inputCls = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-primary/20 focus:ring-2";

export default function MasterData() {
  return (
    <AppShell>
      <div className="mb-6">
        <div className="text-xs font-semibold uppercase tracking-widest text-primary">Master Data</div>
        <h1 className="mt-1 font-display text-3xl font-bold">Mapel, Kelas & Jurusan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Daftar yang dipakai sebagai pilihan saat input siswa & nilai.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <MapelPanel />
        <KelasPanel />
        <JurusanPanel />
      </div>
    </AppShell>
  );
}

function Panel({ title, icon: Icon, children }: any) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm-soft">
      <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="font-display font-bold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function MapelPanel() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["mapel"], queryFn: listMapel });
  const [nama, setNama] = useState("");
  const [kode, setKode] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) return;
    try {
      await addMapel({ nama: nama.trim(), kode: kode.trim() || null, urutan: data.length + 1 });
      setNama(""); setKode("");
      qc.invalidateQueries({ queryKey: ["mapel"] });
      toast.success("Mapel ditambahkan");
    } catch (e: any) { toast.error(e.message); }
  };
  return (
    <Panel title="Mata Pelajaran" icon={BookOpen}>
      <form onSubmit={submit} className="mb-3 grid gap-2 sm:grid-cols-[1fr_90px_auto]">
        <input className={inputCls} placeholder="Nama mapel" value={nama} onChange={(e) => setNama(e.target.value)} maxLength={60} />
        <input className={inputCls} placeholder="Kode" value={kode} onChange={(e) => setKode(e.target.value)} maxLength={10} />
        <button className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90">
          <Plus className="h-3.5 w-3.5" /> Tambah
        </button>
      </form>
      <ul className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
        {data.map((m) => (
          <li key={m.id} className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2 text-sm">
            <span><strong>{m.nama}</strong> {m.kode && <span className="ml-1 text-xs text-muted-foreground">({m.kode})</span>}</span>
            <button onClick={async () => { await deleteMapel(m.id); qc.invalidateQueries({ queryKey: ["mapel"] }); }} className="text-destructive hover:opacity-80"><Trash2 className="h-3.5 w-3.5" /></button>
          </li>
        ))}
        {!data.length && <li className="py-6 text-center text-xs text-muted-foreground">Belum ada mapel.</li>}
      </ul>
    </Panel>
  );
}

function KelasPanel() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["kelas"], queryFn: listKelas });
  const [nama, setNama] = useState("");
  const [tingkat, setTingkat] = useState("XII");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) return;
    try {
      await addKelas({ nama: nama.trim(), tingkat: tingkat || null });
      setNama("");
      qc.invalidateQueries({ queryKey: ["kelas"] });
      toast.success("Kelas ditambahkan");
    } catch (e: any) { toast.error(e.message); }
  };
  return (
    <Panel title="Kelas" icon={School2}>
      <form onSubmit={submit} className="mb-3 grid gap-2 sm:grid-cols-[1fr_70px_auto]">
        <input className={inputCls} placeholder="XII IPA 1" value={nama} onChange={(e) => setNama(e.target.value)} maxLength={30} />
        <input className={inputCls} placeholder="XII" value={tingkat} onChange={(e) => setTingkat(e.target.value)} maxLength={5} />
        <button className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90">
          <Plus className="h-3.5 w-3.5" /> Tambah
        </button>
      </form>
      <ul className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
        {data.map((k) => (
          <li key={k.id} className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2 text-sm">
            <span><strong>{k.nama}</strong> {k.tingkat && <span className="ml-1 text-xs text-muted-foreground">tingkat {k.tingkat}</span>}</span>
            <button onClick={async () => { await deleteKelas(k.id); qc.invalidateQueries({ queryKey: ["kelas"] }); }} className="text-destructive hover:opacity-80"><Trash2 className="h-3.5 w-3.5" /></button>
          </li>
        ))}
        {!data.length && <li className="py-6 text-center text-xs text-muted-foreground">Belum ada kelas.</li>}
      </ul>
    </Panel>
  );
}

function JurusanPanel() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["jurusan"], queryFn: listJurusan });
  const [nama, setNama] = useState("");
  const [kode, setKode] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) return;
    try {
      await addJurusan({ nama: nama.trim(), kode: kode.trim() || null });
      setNama(""); setKode("");
      qc.invalidateQueries({ queryKey: ["jurusan"] });
      toast.success("Jurusan ditambahkan");
    } catch (e: any) { toast.error(e.message); }
  };
  return (
    <Panel title="Jurusan" icon={Layers}>
      <form onSubmit={submit} className="mb-3 grid gap-2 sm:grid-cols-[1fr_90px_auto]">
        <input className={inputCls} placeholder="MIPA" value={nama} onChange={(e) => setNama(e.target.value)} maxLength={40} />
        <input className={inputCls} placeholder="Kode" value={kode} onChange={(e) => setKode(e.target.value)} maxLength={10} />
        <button className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90">
          <Plus className="h-3.5 w-3.5" /> Tambah
        </button>
      </form>
      <ul className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
        {data.map((j) => (
          <li key={j.id} className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2 text-sm">
            <span><strong>{j.nama}</strong> {j.kode && <span className="ml-1 text-xs text-muted-foreground">({j.kode})</span>}</span>
            <button onClick={async () => { await deleteJurusan(j.id); qc.invalidateQueries({ queryKey: ["jurusan"] }); }} className="text-destructive hover:opacity-80"><Trash2 className="h-3.5 w-3.5" /></button>
          </li>
        ))}
        {!data.length && <li className="py-6 text-center text-xs text-muted-foreground">Belum ada jurusan.</li>}
      </ul>
    </Panel>
  );
}
