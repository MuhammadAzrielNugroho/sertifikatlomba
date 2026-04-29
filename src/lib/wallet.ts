// MetaMask wallet integration (optional)
declare global {
  interface Window {
    ethereum?: any;
  }
}

export async function connectWallet(): Promise<string | null> {
  if (!window.ethereum) {
    return null;
  }
  try {
    const accounts: string[] = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    return accounts[0] ?? null;
  } catch {
    return null;
  }
}

export function shortAddress(addr: string): string {
  if (!addr) return "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
