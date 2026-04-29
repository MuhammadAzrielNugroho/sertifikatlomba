import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import type { BlockchainRecord } from "./blockchain";

export async function generateCertificatePDF(record: BlockchainRecord): Promise<Blob> {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = 297;
  const H = 210;

  // Background
  doc.setFillColor(8, 12, 24);
  doc.rect(0, 0, W, H, "F");

  // Outer border (cyan)
  doc.setDrawColor(0, 220, 230);
  doc.setLineWidth(1.2);
  doc.rect(8, 8, W - 16, H - 16);

  // Inner border (purple)
  doc.setDrawColor(170, 80, 230);
  doc.setLineWidth(0.4);
  doc.rect(12, 12, W - 24, H - 24);

  // Top label
  doc.setTextColor(0, 220, 230);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("BLOCKCHAIN-VERIFIED CERTIFICATE", W / 2, 25, { align: "center" });

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(34);
  doc.text("CERTIFICATE OF ACHIEVEMENT", W / 2, 45, { align: "center" });

  // Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(180, 190, 210);
  doc.text("Diberikan dengan bangga kepada", W / 2, 60, { align: "center" });

  // Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(38);
  doc.setTextColor(0, 220, 230);
  doc.text(record.data.name, W / 2, 80, { align: "center" });

  // Underline name
  doc.setDrawColor(170, 80, 230);
  doc.setLineWidth(0.5);
  doc.line(W / 2 - 70, 84, W / 2 + 70, 84);

  // Body
  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.setTextColor(220, 225, 235);
  doc.text(`atas pencapaian sebagai ${record.data.rank}`, W / 2, 98, { align: "center" });
  doc.text(`pada lomba "${record.data.competition}"`, W / 2, 108, { align: "center" });
  doc.text(`tanggal ${record.data.date}`, W / 2, 118, { align: "center" });

  // QR
  const verifyUrl = `${window.location.origin}/verify?id=${record.id}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    margin: 1,
    color: { dark: "#00DCE6", light: "#0a0f1cff" },
    width: 300,
  });
  doc.addImage(qrDataUrl, "PNG", W - 55, H - 65, 40, 40);
  doc.setFontSize(8);
  doc.setTextColor(150, 160, 180);
  doc.text("Scan untuk verifikasi", W - 35, H - 22, { align: "center" });

  // Issuer + signature
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text(record.data.issuer, 30, H - 32);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(160, 170, 190);
  doc.text("Penyelenggara", 30, H - 26);

  // Blockchain info (left bottom)
  doc.setFontSize(7);
  doc.setTextColor(120, 130, 150);
  doc.text(`Cert ID: ${record.id}`, 15, H - 16);
  doc.text(`Hash: ${record.hash.slice(0, 42)}...`, 15, H - 12);
  doc.text(`Tx: ${record.txHash.slice(0, 42)}...  Block #${record.blockNumber}`, 15, H - 8);

  return doc.output("blob");
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
