// Mock blockchain ledger menggunakan localStorage
// Mensimulasikan smart contract penyimpanan hash sertifikat

export interface CertificateData {
  id: string;
  name: string;
  competition: string;
  rank: string;
  date: string;
  issuer: string;
  createdAt: number;
}

export interface BlockchainRecord {
  id: string;
  hash: string;
  txHash: string;
  blockNumber: number;
  timestamp: number;
  data: CertificateData;
}

const STORAGE_KEY = "certchain_ledger_v1";

// SHA-256 hash via Web Crypto API
export async function sha256(message: string): Promise<string> {
  const buffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return "0x" + hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function generateCertId(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let id = "CERT-";
  for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

function randomTxHash(): string {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return "0x" + Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function getLedger(): BlockchainRecord[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveLedger(records: BlockchainRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export async function issueCertificate(
  data: Omit<CertificateData, "id" | "createdAt">
): Promise<BlockchainRecord> {
  const id = generateCertId();
  const cert: CertificateData = { ...data, id, createdAt: Date.now() };
  const payload = `${cert.id}|${cert.name}|${cert.competition}|${cert.rank}|${cert.date}|${cert.issuer}`;
  const hash = await sha256(payload);

  const ledger = getLedger();
  const record: BlockchainRecord = {
    id,
    hash,
    txHash: randomTxHash(),
    blockNumber: 18_000_000 + ledger.length + 1,
    timestamp: Date.now(),
    data: cert,
  };
  ledger.push(record);
  saveLedger(ledger);
  // Simulasi delay konfirmasi block
  await new Promise((r) => setTimeout(r, 900));
  return record;
}

export function getCertificateById(id: string): BlockchainRecord | undefined {
  return getLedger().find((r) => r.id.toUpperCase() === id.toUpperCase().trim());
}

export async function verifyCertificate(id: string): Promise<{
  valid: boolean;
  record?: BlockchainRecord;
  computedHash?: string;
}> {
  const record = getCertificateById(id);
  if (!record) return { valid: false };
  const payload = `${record.data.id}|${record.data.name}|${record.data.competition}|${record.data.rank}|${record.data.date}|${record.data.issuer}`;
  const computed = await sha256(payload);
  return { valid: computed === record.hash, record, computedHash: computed };
}

export function shortHash(h: string, len = 6): string {
  if (!h) return "";
  return `${h.slice(0, len + 2)}...${h.slice(-len)}`;
}
