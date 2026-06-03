// Shared blockchain-like ledger backed by Lovable Cloud (database).
// All devices read/write to the SAME source of truth so any device can
// verify a certificate that was issued from any other device.

import { supabase } from "@/integrations/supabase/client";

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

// Map a DB row to the BlockchainRecord shape used across the UI.
type CertRow = {
  id: string;
  name: string;
  competition: string;
  rank: string;
  date: string;
  issuer: string;
  hash: string;
  tx_hash: string;
  block_number: number;
  created_at: string;
};

function rowToRecord(row: CertRow): BlockchainRecord {
  const ts = new Date(row.created_at).getTime();
  return {
    id: row.id,
    hash: row.hash,
    txHash: row.tx_hash,
    blockNumber: Number(row.block_number),
    timestamp: ts,
    data: {
      id: row.id,
      name: row.name,
      competition: row.competition,
      rank: row.rank,
      date: row.date,
      issuer: row.issuer,
      createdAt: ts,
    },
  };
}

export async function getLedger(): Promise<BlockchainRecord[]> {
  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return (data as CertRow[]).map(rowToRecord);
}

export async function issueCertificate(
  data: Omit<CertificateData, "id" | "createdAt">
): Promise<BlockchainRecord> {
  const id = generateCertId();
  const payload = `${id}|${data.name}|${data.competition}|${data.rank}|${data.date}|${data.issuer}`;
  const hash = await sha256(payload);
  const txHash = randomTxHash();

  // Derive block number from current ledger size (deterministic enough for demo).
  const { count } = await supabase
    .from("certificates")
    .select("*", { count: "exact", head: true });
  const blockNumber = 18_000_000 + (count ?? 0) + 1;

  const { data: inserted, error } = await supabase
    .from("certificates")
    .insert({
      id,
      name: data.name,
      competition: data.competition,
      rank: data.rank,
      date: data.date,
      issuer: data.issuer,
      hash,
      tx_hash: txHash,
      block_number: blockNumber,
    })
    .select()
    .single();

  if (error || !inserted) throw new Error(error?.message || "Insert failed");

  // Simulasi delay konfirmasi block
  await new Promise((r) => setTimeout(r, 600));
  return rowToRecord(inserted as CertRow);
}

export async function getCertificateById(
  id: string
): Promise<BlockchainRecord | undefined> {
  const target = id.toUpperCase().trim();
  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .eq("id", target)
    .maybeSingle();
  if (error || !data) return undefined;
  return rowToRecord(data as CertRow);
}

export async function verifyCertificate(id: string): Promise<{
  valid: boolean;
  record?: BlockchainRecord;
  computedHash?: string;
}> {
  const record = await getCertificateById(id);
  if (!record) return { valid: false };
  const payload = `${record.data.id}|${record.data.name}|${record.data.competition}|${record.data.rank}|${record.data.date}|${record.data.issuer}`;
  const computed = await sha256(payload);
  return { valid: computed === record.hash, record, computedHash: computed };
}

export function shortHash(h: string, len = 6): string {
  if (!h) return "";
  return `${h.slice(0, len + 2)}...${h.slice(-len)}`;
}
