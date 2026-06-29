import { Link, NavLink, useLocation } from "react-router-dom";
import { Shield, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { connectWallet, getCurrentAccount, onAccountsChanged, shortAddress } from "@/lib/wallet";
import { toast } from "sonner";

const links = [
  { to: "/", label: "Home" },
  { to: "/admin", label: "Admin" },
  { to: "/peserta", label: "Peserta" },
  { to: "/verify", label: "Verifikasi" },
];

export const Navbar = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const saved = localStorage.getItem("wallet:address");
    if (saved) setAccount(saved);
    getCurrentAccount().then((addr) => {
      if (addr) {
        setAccount(addr);
        localStorage.setItem("wallet:address", addr);
      }
    });
    const off = onAccountsChanged((addr) => {
      setAccount(addr);
      if (addr) localStorage.setItem("wallet:address", addr);
      else localStorage.removeItem("wallet:address");
    });
    return off;
  }, []);

  const handleConnect = async () => {
    if (account) {
      // Disconnect (local only — MetaMask has no programmatic disconnect)
      setAccount(null);
      localStorage.removeItem("wallet:address");
      toast.success("Wallet diputuskan");
      return;
    }
    setConnecting(true);
    const res = await connectWallet();
    setConnecting(false);
    if ("address" in res) {
      setAccount(res.address);
      localStorage.setItem("wallet:address", res.address);
      toast.success("Wallet terhubung", { description: shortAddress(res.address) });
      return;
    }
    if (res.error === "no-provider") {
      toast.error("MetaMask tidak terdeteksi", {
        description: "Install ekstensi MetaMask, lalu buka halaman ini di browser yang sama.",
        action: {
          label: "Install",
          onClick: () => window.open("https://metamask.io/download/", "_blank"),
        },
      });
    } else if (res.error === "rejected") {
      toast.error("Koneksi dibatalkan");
    } else if (res.error === "pending") {
      toast.message("Buka MetaMask", { description: "Permintaan koneksi sudah menunggu di ekstensi." });
    } else {
      toast.error("Gagal terhubung", { description: res.message });
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border">
      <nav className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            Cert<span className="gradient-text">Chain</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <Button
          onClick={handleConnect}
          disabled={connecting}
          variant={account ? "secondary" : "default"}
          title={account ? "Klik untuk memutuskan" : "Hubungkan MetaMask"}
          className={
            account
              ? "font-mono text-xs"
              : "bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow"
          }
        >
          <Wallet className="w-4 h-4 mr-2" />
          {connecting ? "Menghubungkan…" : account ? shortAddress(account) : "Connect Wallet"}
        </Button>
      </nav>
      {/* Mobile nav */}
      <div className="md:hidden border-t border-border flex justify-around py-2">
        {links.map((l) => {
          const active = location.pathname === l.to;
          return (
            <Link
              key={l.to}
              to={l.to}
              className={`text-xs px-3 py-1.5 rounded-md ${
                active ? "text-primary bg-primary/10" : "text-muted-foreground"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
};
