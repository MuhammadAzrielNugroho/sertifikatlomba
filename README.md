# CertChain — Sistem Sertifikat Lomba Berbasis Blockchain

Aplikasi web demo untuk **menerbitkan, menyimpan, dan memverifikasi sertifikat lomba** dengan jaminan keaslian melalui hash kriptografi yang tercatat di blockchain.

> Aplikasi ini dirancang **edukatif & sederhana** — frontend penuh berjalan di browser tanpa perlu node Ethereum. Smart contract Solidity disertakan sebagai referensi.

## ✨ Fitur

- **Admin** — Login, input data peserta (nama, lomba, peringkat, tanggal), generate sertifikat PDF, hitung SHA-256 hash, "tulis" ke blockchain.
- **Peserta** — Cari sertifikat berdasarkan ID, lihat preview, unduh PDF, lihat QR Code.
- **Verifikasi Publik** — Scan QR atau input ID untuk membandingkan hash on-chain → tampil **VALID** / **TIDAK VALID**.
- **Integrasi MetaMask** opsional (tombol Connect Wallet di navbar).

## 🧱 Arsitektur Proyek

```
/
├── contracts/                 # Smart contract Solidity
│   └── CertificateRegistry.sol
├── src/
│   ├── lib/
│   │   ├── blockchain.ts      # Mock ledger + SHA-256 (Web Crypto API)
│   │   ├── certificate-pdf.ts # Generate PDF (jsPDF) + QR Code
│   │   ├── wallet.ts          # MetaMask integration
│   │   └── auth.ts            # Demo admin auth
│   ├── pages/
│   │   ├── Index.tsx          # Landing page
│   │   ├── Admin.tsx          # Login + form input + ledger
│   │   ├── Peserta.tsx        # Tampilan sertifikat + download PDF
│   │   └── Verify.tsx         # Halaman verifikasi publik
│   └── components/
│       ├── Navbar.tsx
│       └── Footer.tsx
└── README.md
```

## 🔁 Alur Sistem

1. **Admin** login → input data peserta.
2. Sistem membuat **payload string** dari data → menghitung **SHA-256 hash** → menyimpan record `{id, hash, txHash, blockNumber, data}` ke ledger.
3. Sistem generate **PDF** + **QR Code** (berisi URL `/verify?id=…`).
4. **Peserta** mengakses `/peserta`, mencari ID, lalu mengunduh PDF.
5. **Publik** scan QR atau input ID di `/verify` → sistem hitung ulang hash dari data → cocokkan dengan hash on-chain → tampil **VALID** atau **TIDAK VALID**.

## 🛠️ Stack

- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Hashing:** Web Crypto API (SHA-256)
- **PDF:** jsPDF
- **QR Code:** qrcode
- **Wallet:** MetaMask (window.ethereum) — opsional
- **Smart Contract:** Solidity ^0.8.20 (Sepolia testnet ready)

## 🚀 Menjalankan Secara Lokal

```bash
# 1. Install dependencies
npm install        # atau bun install / pnpm install

# 2. Jalankan dev server
npm run dev

# 3. Buka http://localhost:5173
```

### Demo credentials Admin

```
username: admin
password: admin123
```

## 📜 Smart Contract (Opsional — Deploy ke Sepolia)

Kontrak `contracts/CertificateRegistry.sol` siap di-deploy menggunakan **Remix IDE**:

1. Buka [https://remix.ethereum.org](https://remix.ethereum.org)
2. Buat file baru, paste isi `CertificateRegistry.sol`.
3. Compile dengan Solidity 0.8.20.
4. Tab **Deploy & Run** → pilih **Injected Provider - MetaMask** → pilih jaringan **Sepolia**.
5. Klik **Deploy**. Salin alamat kontrak.
6. Panggil `issueCertificate(certificateId, dataHash)` untuk menerbitkan.
7. Panggil `verify(certificateId, dataHash)` untuk memverifikasi.

> Untuk integrasi penuh dengan blockchain nyata, ganti fungsi di `src/lib/blockchain.ts` dengan panggilan ke kontrak menggunakan `ethers.js` atau `viem`.

## 🧪 Catatan Implementasi

- **Mock blockchain** — Demo ini menggunakan `localStorage` sebagai ledger agar mudah dipelajari mahasiswa. Struktur data (id, hash, txHash, blockNumber) sudah mengikuti pola transaksi Ethereum sehingga migrasi ke kontrak nyata hanya mengganti satu file.
- **Tidak ada backend** — Hashing dilakukan sepenuhnya di browser via Web Crypto API.
- **IPFS** — Bisa ditambahkan dengan menyimpan PDF ke IPFS dan menyimpan CID di kontrak; sengaja tidak diimplementasikan untuk menjaga proyek tetap ringan.

## 📄 Lisensi

MIT — bebas digunakan untuk tujuan pembelajaran.
