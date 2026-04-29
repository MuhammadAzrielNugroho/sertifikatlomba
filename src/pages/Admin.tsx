import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, LogOut, FileSignature, Database, Loader2, Copy, ExternalLink } from "lucide-react";
import { isLoggedIn, login, logout } from "@/lib/auth";
import { issueCertificate, getLedger, shortHash, type BlockchainRecord } from "@/lib/blockchain";

const loginSchema = z.object({
  username: z.string().trim().min(1, "Username wajib diisi").max(50),
  password: z.string().min(1, "Password wajib diisi").max(100),
});

const certSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(80),
  competition: z.string().trim().min(2, "Nama lomba wajib diisi").max(120),
  rank: z.string().trim().min(1, "Peringkat wajib diisi").max(40),
  date: z.string().min(1, "Tanggal wajib diisi"),
  issuer: z.string().trim().min(2, "Penyelenggara wajib diisi").max(80),
});

const Admin = () => {
  const [authed, setAuthed] = useState(false);
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const navigate = useNavigate();

  useEffect(() => setAuthed(isLoggedIn()), []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ username: u, password: p });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    if (login(u, p)) {
      setAuthed(true);
      toast.success("Login berhasil");
    } else {
      toast.error("Username atau password salah", {
        description: "Demo: admin / admin123",
      });
    }
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-6 py-20">
          <Card className="glass-card w-full max-w-md p-8 space-y-6 border-primary/20">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
                <Lock className="w-7 h-7 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold">Admin Login</h1>
              <p className="text-sm text-muted-foreground">
                Masuk untuk menerbitkan sertifikat baru
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={u}
                  onChange={(e) => setU(e.target.value)}
                  placeholder="admin"
                  className="bg-input/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={p}
                  onChange={(e) => setP(e.target.value)}
                  placeholder="••••••••"
                  className="bg-input/50"
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-primary text-primary-foreground shadow-glow">
                Masuk
              </Button>
              <p className="text-xs text-center text-muted-foreground font-mono">
                Demo credentials → admin / admin123
              </p>
            </form>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto px-6 py-12 flex-1">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="font-mono text-xs text-primary uppercase tracking-widest mb-1">Admin Dashboard</p>
            <h1 className="text-3xl md:text-4xl font-bold">Kelola Sertifikat</h1>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              logout();
              setAuthed(false);
            }}
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>

        <Tabs defaultValue="issue" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="issue">
              <FileSignature className="w-4 h-4 mr-2" /> Terbitkan
            </TabsTrigger>
            <TabsTrigger value="ledger">
              <Database className="w-4 h-4 mr-2" /> Ledger
            </TabsTrigger>
          </TabsList>

          <TabsContent value="issue">
            <IssueForm onIssued={(id) => navigate(`/peserta?id=${id}`)} />
          </TabsContent>
          <TabsContent value="ledger">
            <LedgerTable />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

const IssueForm = ({ onIssued }: { onIssued: (id: string) => void }) => {
  const [form, setForm] = useState({ name: "", competition: "", rank: "", date: "", issuer: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BlockchainRecord | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = certSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      const rec = await issueCertificate(parsed.data as Required<typeof parsed.data>);
      setResult(rec);
      toast.success("Sertifikat terbit & tercatat di blockchain", {
        description: `ID: ${rec.id}`,
      });
      setForm({ name: "", competition: "", rank: "", date: "", issuer: "" });
    } catch {
      toast.error("Gagal menerbitkan sertifikat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="glass-card p-6 md:p-8 border-primary/20">
        <h2 className="text-xl font-semibold mb-1">Data Peserta</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Isi data lengkap. Sistem akan menghitung hash dan menyimpannya ke smart contract.
        </p>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nama Peserta</Label>
            <Input value={form.name} onChange={set("name")} placeholder="Budi Santoso" className="bg-input/50" />
          </div>
          <div className="space-y-2">
            <Label>Nama Lomba</Label>
            <Input value={form.competition} onChange={set("competition")} placeholder="Hackathon Nasional 2025" className="bg-input/50" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Peringkat</Label>
              <Input value={form.rank} onChange={set("rank")} placeholder="Juara 1" className="bg-input/50" />
            </div>
            <div className="space-y-2">
              <Label>Tanggal</Label>
              <Input type="date" value={form.date} onChange={set("date")} className="bg-input/50" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Penyelenggara</Label>
            <Input value={form.issuer} onChange={set("issuer")} placeholder="Universitas Lovable" className="bg-input/50" />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-primary text-primary-foreground shadow-glow h-11"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menulis ke blockchain…
              </>
            ) : (
              <>Terbitkan Sertifikat</>
            )}
          </Button>
        </form>
      </Card>

      <Card className="glass-card p-6 md:p-8 border-secondary/20">
        <h2 className="text-xl font-semibold mb-1">Hasil Transaksi</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Detail on-chain akan muncul di sini setelah penerbitan.
        </p>
        {!result ? (
          <div className="border border-dashed border-border rounded-xl py-16 text-center text-sm text-muted-foreground">
            Belum ada transaksi
          </div>
        ) : (
          <div className="space-y-4 font-mono text-sm">
            <Field label="Certificate ID" value={result.id} highlight />
            <Field label="Hash" value={result.hash} mono />
            <Field label="Tx Hash" value={result.txHash} mono />
            <Field label="Block Number" value={`#${result.blockNumber.toLocaleString()}`} />
            <Button onClick={() => onIssued(result.id)} variant="outline" className="w-full mt-4 border-primary/40 hover:bg-primary/10">
              Lihat sertifikat <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

const Field = ({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: boolean }) => (
  <div className="space-y-1">
    <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
    <div className="flex items-center gap-2">
      <code
        className={`flex-1 px-3 py-2 rounded-lg bg-muted/40 border border-border text-xs break-all ${
          highlight ? "text-primary" : ""
        } ${mono ? "font-mono" : ""}`}
      >
        {value}
      </code>
      <Button
        size="icon"
        variant="ghost"
        className="h-9 w-9 shrink-0"
        onClick={() => {
          navigator.clipboard.writeText(value);
          toast.success("Disalin");
        }}
      >
        <Copy className="w-4 h-4" />
      </Button>
    </div>
  </div>
);

const LedgerTable = () => {
  const [records, setRecords] = useState<BlockchainRecord[]>([]);
  useEffect(() => setRecords(getLedger().slice().reverse()), []);

  return (
    <Card className="glass-card p-6 md:p-8">
      <h2 className="text-xl font-semibold mb-1">Blockchain Ledger</h2>
      <p className="text-sm text-muted-foreground mb-6">
        {records.length} sertifikat tercatat (urut terbaru)
      </p>
      {records.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl py-16 text-center text-sm text-muted-foreground">
          Belum ada sertifikat. Terbitkan satu untuk memulai.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-muted-foreground border-b border-border">
                <th className="py-3 px-2">ID</th>
                <th className="py-3 px-2">Nama</th>
                <th className="py-3 px-2">Lomba</th>
                <th className="py-3 px-2">Peringkat</th>
                <th className="py-3 px-2">Block</th>
                <th className="py-3 px-2">Hash</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="py-3 px-2 font-mono text-primary">{r.id}</td>
                  <td className="py-3 px-2">{r.data.name}</td>
                  <td className="py-3 px-2">{r.data.competition}</td>
                  <td className="py-3 px-2">{r.data.rank}</td>
                  <td className="py-3 px-2 font-mono text-xs">#{r.blockNumber}</td>
                  <td className="py-3 px-2 font-mono text-xs text-muted-foreground">
                    {shortHash(r.hash)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

export default Admin;
