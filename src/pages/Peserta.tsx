import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import QRCode from "qrcode";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Search, Download, ShieldCheck, Award, Calendar, Building2 } from "lucide-react";
import { getCertificateById, shortHash, type BlockchainRecord } from "@/lib/blockchain";
import { generateCertificatePDF, downloadBlob } from "@/lib/certificate-pdf";

const Peserta = () => {
  const [params, setParams] = useSearchParams();
  const initialId = params.get("id") || "";
  const [query, setQuery] = useState(initialId);
  const [record, setRecord] = useState<BlockchainRecord | null>(null);
  const [qr, setQr] = useState<string>("");
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialId) handleSearch(initialId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (id?: string) => {
    const target = (id ?? query).trim();
    if (!target) {
      toast.error("Masukkan Certificate ID");
      return;
    }
    setSearched(true);
    const r = getCertificateById(target);
    if (!r) {
      setRecord(null);
      setQr("");
      toast.error("Sertifikat tidak ditemukan");
      return;
    }
    setRecord(r);
    setParams({ id: r.id });
    const url = `${window.location.origin}/verify?id=${r.id}`;
    const dataUrl = await QRCode.toDataURL(url, {
      margin: 2,
      width: 320,
      color: { dark: "#00DCE6", light: "#0a0f1c" },
    });
    setQr(dataUrl);
  };

  const handleDownload = async () => {
    if (!record) return;
    toast.info("Membuat PDF…");
    const blob = await generateCertificatePDF(record);
    downloadBlob(blob, `${record.id}-${record.data.name.replace(/\s+/g, "_")}.pdf`);
    toast.success("PDF berhasil diunduh");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto px-6 py-12 flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 space-y-3">
            <p className="font-mono text-xs text-secondary uppercase tracking-widest">Portal Peserta</p>
            <h1 className="text-3xl md:text-5xl font-bold">
              Sertifikat <span className="gradient-text-accent">Anda</span>
            </h1>
            <p className="text-muted-foreground">Masukkan Certificate ID untuk melihat & mengunduh</p>
          </div>

          <Card className="glass-card p-5 md:p-6 mb-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="flex-1 space-y-2">
                <Label className="sr-only">Certificate ID</Label>
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Masukkan Certificate ID (mis. CERT-XXXXXXXX)"
                  className="bg-input/50 font-mono h-11"
                />
              </div>
              <Button type="submit" className="bg-gradient-primary text-primary-foreground shadow-glow h-11 px-6">
                <Search className="w-4 h-4 mr-2" /> Cari
              </Button>
            </form>
          </Card>

          {searched && !record && (
            <Card className="glass-card p-10 text-center text-muted-foreground">
              Sertifikat dengan ID tersebut tidak ditemukan di blockchain.
            </Card>
          )}

          {record && (
            <div className="space-y-6">
              {/* Certificate Preview */}
              <Card className="glass-card p-6 md:p-12 relative overflow-hidden border-primary/30">
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

                <div className="relative text-center space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 border border-success/30 text-success text-xs font-mono">
                    <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED ON-CHAIN
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                      Certificate of Achievement
                    </p>
                    <h2 className="text-4xl md:text-6xl font-bold gradient-text glow-text leading-tight">
                      {record.data.name}
                    </h2>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto pt-4">
                    <Stat icon={Award} label="Peringkat" value={record.data.rank} />
                    <Stat icon={Calendar} label="Tanggal" value={record.data.date} />
                    <Stat icon={Building2} label="Penyelenggara" value={record.data.issuer} />
                  </div>

                  <p className="text-lg pt-2 text-muted-foreground">
                    pada lomba <span className="text-foreground font-semibold">{record.data.competition}</span>
                  </p>
                </div>
              </Card>

              {/* QR + Blockchain meta */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="glass-card p-6 text-center">
                  <h3 className="font-semibold mb-1">QR Code Verifikasi</h3>
                  <p className="text-xs text-muted-foreground mb-4">Scan untuk membuka halaman verifikasi</p>
                  {qr && (
                    <img
                      src={qr}
                      alt="QR Verifikasi Sertifikat"
                      className="mx-auto rounded-xl border border-primary/30 shadow-glow"
                      width={240}
                      height={240}
                    />
                  )}
                  <Button onClick={handleDownload} className="mt-6 bg-gradient-primary text-primary-foreground shadow-glow w-full">
                    <Download className="w-4 h-4 mr-2" /> Unduh Sertifikat (PDF)
                  </Button>
                </Card>

                <Card className="glass-card p-6 space-y-4">
                  <h3 className="font-semibold">Metadata Blockchain</h3>
                  <Meta label="Certificate ID" value={record.id} mono accent />
                  <Meta label="SHA-256 Hash" value={shortHash(record.hash, 10)} mono />
                  <Meta label="Tx Hash" value={shortHash(record.txHash, 10)} mono />
                  <Meta label="Block" value={`#${record.blockNumber.toLocaleString()}`} mono />
                  <Button asChild variant="outline" className="w-full border-primary/40 hover:bg-primary/10">
                    <Link to={`/verify?id=${record.id}`}>Verifikasi Publik →</Link>
                  </Button>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

const Stat = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="glass-card rounded-xl p-4">
    <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
    <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
    <div className="font-semibold mt-1">{value}</div>
  </div>
);

const Meta = ({ label, value, mono, accent }: { label: string; value: string; mono?: boolean; accent?: boolean }) => (
  <div className="flex justify-between items-center text-sm border-b border-border/40 pb-2">
    <span className="text-muted-foreground text-xs uppercase tracking-wider">{label}</span>
    <span className={`${mono ? "font-mono" : ""} ${accent ? "text-primary" : ""} text-xs`}>{value}</span>
  </div>
);

export default Peserta;
