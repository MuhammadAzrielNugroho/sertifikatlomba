// MetaMask / EIP-1193 wallet integration
declare global {
  interface Window {
    ethereum?: any;
  }
}

export function getProvider(): any | null {
  if (typeof window === "undefined") return null;
  const eth = window.ethereum;
  if (!eth) return null;
  // If multiple providers injected, prefer MetaMask
  if (Array.isArray(eth.providers)) {
    return eth.providers.find((p: any) => p.isMetaMask) ?? eth.providers[0];
  }
  return eth;
}

export async function getCurrentAccount(): Promise<string | null> {
  const provider = getProvider();
  if (!provider) return null;
  try {
    const accounts: string[] = await provider.request({ method: "eth_accounts" });
    return accounts?.[0] ?? null;
  } catch {
    return null;
  }
}

export async function connectWallet(): Promise<
  { address: string } | { error: "no-provider" | "rejected" | "pending" | "unknown"; message?: string }
> {
  const provider = getProvider();
  if (!provider) return { error: "no-provider" };
  try {
    const accounts: string[] = await provider.request({
      method: "eth_requestAccounts",
    });
    const address = accounts?.[0];
    if (!address) return { error: "unknown" };
    return { address };
  } catch (err: any) {
    if (err?.code === 4001) return { error: "rejected", message: "Permintaan ditolak" };
    if (err?.code === -32002)
      return { error: "pending", message: "Permintaan koneksi sudah dibuka di MetaMask" };
    return { error: "unknown", message: err?.message };
  }
}

export function onAccountsChanged(cb: (addr: string | null) => void): () => void {
  const provider = getProvider();
  if (!provider?.on) return () => {};
  const handler = (accounts: string[]) => cb(accounts?.[0] ?? null);
  provider.on("accountsChanged", handler);
  return () => provider.removeListener?.("accountsChanged", handler);
}

export function shortAddress(addr: string): string {
  if (!addr) return "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
