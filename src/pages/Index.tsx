import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ShieldCheck, FileCheck2, QrCode, Lock, Boxes, Sparkles, ArrowRight } from "lucide-react";

const features = [
  {
    icon: Lock,
    title: "Hash Tersimpan di Blockchain",
    desc: "Setiap sertifikat di-hash dengan SHA-256 dan dicatat di smart contract sehingga tidak dapat dimodifikasi.",
  },
  {
    icon: QrCode,
    title: "QR Code Verifikasi",
    desc: "Setiap sertifikat memiliki QR Code unik untuk verifikasi instan oleh siapa saja, tanpa login.",
  },
  {
    icon: FileCheck2,
    title: "PDF Otomatis",
    desc: "Sertifikat dirender sebagai PDF berdesain modern dan dapat diunduh oleh peserta.",
  },
  {
    icon: ShieldCheck,
    title: "Anti-Pemalsuan",
    desc: "Cocokkan ulang hash on-chain dengan data sertifikat untuk membuktikan keasliannya.",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />

        <div className="container mx-auto px-6 pt-24 pb-32 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-sm font-mono text-primary animate-float">
              <Sparkles className="w-4 h-4" />
              Powered by Ethereum · Sepolia Testnet
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
              Sertifikat Lomba
              <br />
              <span className="gradient-text glow-text">Terverifikasi Blockchain</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Buat, simpan, dan verifikasi sertifikat digital secara aman. Setiap sertifikat dijamin
              keasliannya melalui hash kriptografi yang tercatat permanen di blockchain.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90 text-base h-12 px-7">
                <Link to="/admin">
                  Mulai Terbitkan <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary/40 hover:bg-primary/10 text-base h-12 px-7">
                <Link to="/verify">Verifikasi Sertifikat</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-12 max-w-2xl mx-auto">
              {[
                { v: "SHA-256", l: "Algoritma Hash" },
                { v: "ERC-Style", l: "Smart Contract" },
                { v: "100%", l: "On-chain Verified" },
              ].map((s) => (
                <div key={s.l} className="glass-card rounded-xl p-4">
                  <div className="font-mono text-primary text-lg md:text-xl font-bold">{s.v}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-14 space-y-3">
          <p className="font-mono text-sm text-secondary uppercase tracking-widest">Fitur Utama</p>
          <h2 className="text-3xl md:text-5xl font-bold">
            Keamanan <span className="gradient-text-accent">terdesentralisasi</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="glass-card rounded-2xl p-6 hover:border-primary/40 transition-all hover:-translate-y-1 group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-primary/20 border border-primary/30 flex items-center justify-center mb-4 group-hover:shadow-glow transition-shadow">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-6 py-20">
        <div className="glass-card rounded-3xl p-8 md:p-14 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />

          <div className="relative">
            <div className="text-center mb-12 space-y-3">
              <p className="font-mono text-sm text-primary uppercase tracking-widest">Alur Sistem</p>
              <h2 className="text-3xl md:text-4xl font-bold">3 langkah, satu kebenaran</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  step: "01",
                  title: "Admin Terbitkan",
                  desc: "Admin login lalu input data peserta. Sistem membuat hash dan menyimpannya ke smart contract.",
                  icon: Boxes,
                },
                {
                  step: "02",
                  title: "Peserta Terima",
                  desc: "Peserta mengunduh sertifikat PDF lengkap dengan QR Code yang merujuk ke ID unik.",
                  icon: FileCheck2,
                },
                {
                  step: "03",
                  title: "Publik Verifikasi",
                  desc: "Siapa pun memindai QR atau memasukkan ID untuk membandingkan hash on-chain.",
                  icon: ShieldCheck,
                },
              ].map((s) => (
                <div key={s.step} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-3xl font-bold gradient-text">{s.step}</span>
                    <div className="h-px flex-1 bg-border" />
                    <s.icon className="w-5 h-5 text-secondary" />
                  </div>
                  <h3 className="text-xl font-semibold">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
