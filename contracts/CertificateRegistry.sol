// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CertificateRegistry
 * @notice Smart contract sederhana untuk menyimpan dan memverifikasi
 *         hash sertifikat lomba di blockchain Ethereum (Sepolia testnet).
 * @dev    Disertakan sebagai referensi pendamping aplikasi frontend CertChain.
 *         Aplikasi web di repo ini mensimulasikan kontrak ini di sisi klien
 *         (localStorage + SHA-256 via Web Crypto API) agar mudah dijalankan
 *         tanpa setup node Ethereum.
 */
contract CertificateRegistry {
    struct Certificate {
        bytes32 dataHash;   // SHA-256 / keccak256 dari data sertifikat
        address issuer;     // Alamat penerbit (admin)
        uint256 issuedAt;   // Timestamp blok saat diterbitkan
        bool exists;
    }

    // certificateId (string) => Certificate
    mapping(string => Certificate) private certificates;

    // Daftar admin yang boleh menerbitkan
    mapping(address => bool) public isAdmin;
    address public owner;

    event CertificateIssued(
        string indexed certificateId,
        bytes32 dataHash,
        address indexed issuer,
        uint256 issuedAt
    );
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyAdmin() {
        require(isAdmin[msg.sender], "Not admin");
        _;
    }

    constructor() {
        owner = msg.sender;
        isAdmin[msg.sender] = true;
        emit AdminAdded(msg.sender);
    }

    function addAdmin(address _admin) external onlyOwner {
        isAdmin[_admin] = true;
        emit AdminAdded(_admin);
    }

    function removeAdmin(address _admin) external onlyOwner {
        isAdmin[_admin] = false;
        emit AdminRemoved(_admin);
    }

    /**
     * @notice Menerbitkan sertifikat dengan ID unik dan hash data.
     * @param  certificateId ID unik sertifikat (mis. "CERT-AB12CD34")
     * @param  dataHash      keccak256/sha256 dari data lengkap sertifikat
     */
    function issueCertificate(string calldata certificateId, bytes32 dataHash)
        external
        onlyAdmin
    {
        require(!certificates[certificateId].exists, "Cert already exists");
        require(bytes(certificateId).length > 0, "Empty id");
        require(dataHash != bytes32(0), "Empty hash");

        certificates[certificateId] = Certificate({
            dataHash: dataHash,
            issuer: msg.sender,
            issuedAt: block.timestamp,
            exists: true
        });

        emit CertificateIssued(certificateId, dataHash, msg.sender, block.timestamp);
    }

    /**
     * @notice Memverifikasi keaslian sertifikat.
     * @param  certificateId ID sertifikat
     * @param  dataHash      hash data yang akan dicocokkan
     * @return valid         true jika hash cocok dengan record on-chain
     */
    function verify(string calldata certificateId, bytes32 dataHash)
        external
        view
        returns (bool valid)
    {
        Certificate memory c = certificates[certificateId];
        return c.exists && c.dataHash == dataHash;
    }

    function getCertificate(string calldata certificateId)
        external
        view
        returns (bytes32 dataHash, address issuer, uint256 issuedAt, bool exists)
    {
        Certificate memory c = certificates[certificateId];
        return (c.dataHash, c.issuer, c.issuedAt, c.exists);
    }
}
