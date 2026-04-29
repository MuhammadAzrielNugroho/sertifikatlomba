import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ShieldCheck, ShieldX, Search, Loader2, Hash, Box } from "lucide-react";
import { verifyCertificate, type BlockchainRecord } from "@/lib/blockchain";

type Result = { state: "idle" } | { state: "loading" } | { state: "valid"; record: BlockchainRecord; hash: string } | { state: "invalid" };

const Verify = () => {
  const [params] = useSearchParams();
  const initialId = params.get("id") || "";
  const [id, setId] = useState(initialId);
  const [result, setResult] = useState<Result>({ state: "idle" });

  useEffect(() => {
    if (initialId) verify(initialId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verify = async (target?: string) => {
    const t = (target ?? id).trim();
    if (!t) {
      toast.error("Masukkan Certificate ID");
      return;
    }
    setResult({ state: "loading" });
    // simulasi panggilan ke smart contract
    await new Promise((r) => setTimeout(r, 700));
    const res = await verifyCertificate(t);
    if (!res.record) {
      setResult({ state: "invalid" });
      return;
    }
    if (res.valid) {
      setResult({ state: "valid", record: res.record, hash: res.computedHash! });
    } else {
      setResult({ state: "invalid" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto px-6 py-12 flex-1">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 space-y-3">
            <p className="font-mono text-xs text-primary uppercase tracking-widest">Verifikasi Publik</p>
            <h1 className="text-3xl md:text-5xl font-bold">
              Cek <span className="gradient-text">Keaslian Sertifikat</span>
            </h1>
            <p className="text-muted-foreground">
              Bandingkan hash on-chain dengan data sertifikat. Tidak perlu login.
            </p>
          </div>

          <Card className="glass-card p-5 md:p-6 mb-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                verify();
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Input
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="Masukkan Certificate ID atau scan QR Code"
                className="bg-input/50 font-mono h-11"
              />
              <Button
                type="submit"
                disabled={result.state === "loading"}
                className="bg-gradient-primary text-primary-foreground shadow-glow h-11 px-6"
              >
                {result.state === "loading" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Verifikasi
              </Button>
            </form>
          </Card>

          {result.state === "loading" && (
            <Card className="glass-card p-12 text-center space-y-3">
              <Loader2 className="w-10 h-10 text-primary mx-auto animate-spin" />
              <p className="text-sm text-muted-foreground font-mono">Querying smart contract…</p>
            </Card>
          )}

          {result.state === "invalid" && (
            <Card className="glass-card p-10 text-center border-destructive/40 space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-destructive/10 border border-destructive/40 flex items-center justify-center">
                <ShieldX className="w-10 h-10 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold text-destructive">TIDAK VALID</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Sertifikat dengan ID ini tidak ditemukan di blockchain, atau hash data tidak cocok dengan record on-chain.
              </p>
            </Card>
          )}

          {result.state === "valid" && (
            <Card className="glass-card p-8 md:p-10 border-success/40 space-y-6">
              <div className="text-center space-y-3">
                <div className="w-20 h-20 mx-auto rounded-full bg-success/10 border border-success/40 flex items-center justify-center animate-pulse-glow">
                  <ShieldCheck className="w-10 h-10 text-success" />
                </div>
                <h2 className="text-3xl font-bold text-success">SERTIFIKAT VALID</h2>
                <p className="text-sm text-muted-foreground">
                  Hash data cocok dengan yang tercatat di blockchain.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-4">
                <Detail label="Nama" value={result.record.data.name} />
                <Detail label="Lomba" value={result.record.data.competition} />
                <Detail label="Peringkat" value={result.record.data.rank} />
                <Detail label="Tanggal" value={result.record.data.date} />
                <Detail label="Penyelenggara" value={result.record.data.issuer} />
                <Detail label="Certificate ID" value={result.record.id} mono accent />
              </div>

              <div className="pt-4 space-y-3 border-t border-border">
                <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
                  <Hash className="w-3.5 h-3.5" /> Hash On-chain
                </div>
                <code className="block bg-muted/40 border border-border rounded-lg p-3 text-xs font-mono break-all text-primary">
                  {result.record.hash}
                </code>
                <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider pt-2">
                  <Box className="w-3.5 h-3.5" /> Tx Hash · Block #{result.record.blockNumber.toLocaleString()}
                </div>
                <code className="block bg-muted/40 border border-border rounded-lg p-3 text-xs font-mono break-all text-muted-foreground">
                  {result.record.txHash}
                </code>
              </div>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

const Detail = ({ label, value, mono, accent }: { label: string; value: string; mono?: boolean; accent?: boolean }) => (
  <div className="space-y-1">
    <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
    <div className={`font-medium ${mono ? "font-mono text-sm" : ""} ${accent ? "text-primary" : ""}`}>
      {value}
    </div>
  </div>
);

export default Verify;
