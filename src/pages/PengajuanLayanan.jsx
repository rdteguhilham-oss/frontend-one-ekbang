import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { useState, useEffect } from "react";
import Swal from 'sweetalert2';
import { getDataLayanan, updateStatusLayanan } from "../services/api"; 
import { Link } from "react-router-dom";
import { FORMAT_SURAT } from "../utils/formatSurat";
import './PengajuanLayanan.css';

export default function PengajuanLayanan() {
    const [dataLayanan, setDataLayanan] = useState([]);
    const [filterKategori, setFilterKategori] = useState("Semua");
    const [kataKunci, setKataKunci] = useState("");
    const [tanggalMulai, setTanggalMulai] = useState("");
    const [tanggalSelesai, setTanggalSelesai] = useState("");
    // STATE UNTUK POP-UP BERKAS
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dataPilih, setDataPilih] = useState(null);
    // STATE UNTUK FITUR CETAK SURAT FISIK
    const [suratPilih, setSuratPilih] = useState(null);
    
    const muatData = async () => {
        try {
            const hasil = await getDataLayanan();
            setDataLayanan(hasil); 
        } catch (error) {
            setDataLayanan([]); 
        }
    };

    useEffect(() => {
        muatData();
    }, []);
    
    const handleUbahStatus = async (id, statusBaru) => {
        Swal.fire({
            title: 'Perbarui Status?',
            text: `Yakin ingin mengubah status menjadi: ${statusBaru}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3C50E0',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, Ubah!',
            cancelButtonText: 'Batal'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const respons = await updateStatusLayanan(id, statusBaru);
                    if (respons && respons.status === 'sukses') {
                        Swal.fire({ title: 'Berhasil!', text: respons.pesan, icon: 'success', confirmButtonColor: '#3C50E0' });
                        muatData(); 
                    } else {
                        Swal.fire({ title: 'Gagal!', text: 'Gagal mengubah status.', icon: 'error' });
                    }
                } catch (error) {
                    Swal.fire({ title: 'Error', text: "Gagal terhubung ke server! Cek koneksi Anda.", icon: 'error' });
                }
            }
        });
    };

    const bukaModalDokumen = (data) => {
        setDataPilih(data);
        setIsModalOpen(true);
    };

    const bukaModalSurat = (data) => {
        setSuratPilih(data);
    };

    const renderLink = (namaFile, label) => {
    if (!namaFile) return null; 
    
    // Trik deteksi link cerdas
    const linkAman = namaFile.startsWith('http') ? namaFile : `https://backend-one-ekbang-production.up.railway.app/uploads/${namaFile}`;
    
    return (
        <a href={linkAman} target="_blank" rel="noreferrer" className="btn-link-dokumen">
            📄 Lihat {label}
        </a>
    );
};

    const hasilFilter = dataLayanan.filter((item) => {
        const cocokKategori = filterKategori === "Semua" || item.jenis_layanan === filterKategori;
        const teksCari = kataKunci.toLowerCase();
        const cocokNama = item.nama_pemohon && item.nama_pemohon.toLowerCase().includes(teksCari);
        
        let cocokTanggal = true;
        if (tanggalMulai && tanggalSelesai) {
            const tglData = new Date(item.tanggal_pengajuan).getTime();
            const tglAwal = new Date(tanggalMulai).getTime();
            const tglAkhir = new Date(tanggalSelesai).setHours(23, 59, 59, 999); // Sampai detik terakhir hari itu
            
            if (!isNaN(tglData)) {
                cocokTanggal = tglData >= tglAwal && tglData <= tglAkhir;
            }
        }
        
        return cocokKategori && cocokNama && cocokTanggal;
    });

    const unduhExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Laporan Layanan');

        worksheet.columns = [
            { header: 'No', key: 'no', width: 5 },
            { header: 'Tanggal', key: 'tanggal', width: 15 },
            { header: 'NIK Pemohon', key: 'nik', width: 25 },
            { header: 'Nama Pemohon', key: 'nama', width: 30 },
            { header: 'No. Telepon / WA', key: 'telepon', width: 20 },
            { header: 'Jenis Layanan', key: 'jenis', width: 25 },
            { header: 'Status Saat Ini', key: 'status', width: 20 }
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).alignment = { horizontal: 'center' };

        hasilFilter.forEach((item, index) => {
            worksheet.addRow({
                no: index + 1,
                tanggal: item.tanggal_pengajuan ? new Date(item.tanggal_pengajuan).toLocaleDateString('id-ID') : '-',
                nik: item.nik_pemohon,
                nama: item.nama_pemohon,
                telepon: item.no_telepon || '-',
                jenis: item.jenis_layanan,
                status: item.status || 'Baru'
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), "Rekap_Pengajuan_Layanan.xlsx");
    };

    return (
        <div className="layanan-container">
            <h2>Daftar Pengajuan Layanan (Dasbor Admin)</h2>
            <p style={{color: 'var(--text-redup)', marginBottom: '20px'}}>Total pengajuan saat ini: {hasilFilter.length}</p>
            
            <div className="aksi-atas-group">
                <Link to="/tambah_layanan" className="link-tambah-layanan">
                    + Ajukan Data Layanan Baru
                </Link>
                
                <button onClick={unduhExcel} className="btn-excel">
                    📥 Download Laporan Excel
                </button>
            </div>
            
            <div className="filter-layanan-area">
                <div className="filter-group">
                    <label>Pencarian Nama:</label>
                    <input type="text" placeholder="Ketik nama pemohon..." value={kataKunci} onChange={(e) => setKataKunci(e.target.value)} />
                </div>
                
                <div className="filter-group">
                    <label>Filter Kategori:</label>
                    <select value={filterKategori} onChange={(e) => setFilterKategori(e.target.value)} className="select-layanan-filter">
                        <option value="Semua">Semua Layanan</option>
                        <option value="RUTILAHU">RUTILAHU</option>
                        <option value="POHON TUMBANG">POHON TUMBANG</option>
                        <option value="BURUAN SAE">BURUAN SAE</option>
                        <option value="MUSRENBANG">MUSRENBANG</option>
                        <option value="DAU DAN PRAKARSA">DAU & PRAKARSA</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Dari Tanggal:</label>
                    <input type="date" value={tanggalMulai} onChange={(e) => setTanggalMulai(e.target.value)} />
                </div>
                
                <div className="filter-group">
                    <label>Sampai Tanggal:</label>
                    <input type="date" value={tanggalSelesai} onChange={(e) => setTanggalSelesai(e.target.value)} />
                </div>
            </div>
            
            <div className="layanan-table-card">
                <div className="table-responsive">
                    <table className="tabel-utama">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Tanggal</th>
                                <th>Jenis Layanan</th>
                                <th>Nama Pemohon</th>
                                <th>No. Telepon</th>
                                <th>Status</th>
                                <th>Aksi Cepat</th> 
                                <th>Verifikasi Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {hasilFilter.length === 0 ? (
                                <tr>
                                    <td colSpan="8" style={{textAlign: 'center'}}>Belum ada data pengajuan.</td>
                                </tr>
                            ) : (
                                hasilFilter.map((data, index) => (
                                    <tr key={data.id}>
                                        <td>{index +1}</td>
                                        <td>{new Date(data.tanggal_pengajuan).toLocaleDateString('id-ID')}</td>
                                        <td>{data.jenis_layanan}</td>
                                        <td>{data.nama_pemohon}</td>
                                        <td>{data.no_telepon || '-'}</td>
                                        <td><b>{data.status || 'Baru'}</b></td>
                                        
                                        {/* KOLOM AKSI CEPAT */}
                                        <td style={{ verticalAlign: 'middle' }}>
                                            <div className="grup-aksi-sejajar">
                                                <button className="btn-buka-berkas" onClick={() => bukaModalDokumen(data)}>
                                                    📂 Berkas
                                                </button>
                                                <button className="btn-cetak-surat" onClick={() => bukaModalSurat(data)}>
                                                    🖨️ Surat
                                                </button>
                                            </div>
                                        </td>
                                        
                                        {/* KOLOM VERIFIKASI STATUS */}
                                        <td style={{ verticalAlign: 'middle' }}>
                                            <div className="grup-aksi-sejajar">
                                                <button className="btn-proses" onClick={() => handleUbahStatus(data.id, 'Diproses')}>
                                                    Proses
                                                </button>
                                                <button className="btn-selesai" onClick={() => handleUbahStatus(data.id, 'Selesai')}>
                                                    Selesai
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL POP-UP BERKAS WARGA */}
            {isModalOpen && dataPilih && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{maxWidth: '600px'}}>
                        <button className="btn-tutup-modal" onClick={() => setIsModalOpen(false)}>X</button>
                        <h3 style={{ marginTop: '0', marginBottom: '20px' }}>
                            Berkas: {dataPilih.nama_pemohon} ({dataPilih.jenis_layanan})
                        </h3>
                        
                        <div className="grid-dokumen">
                            {renderLink(dataPilih.foto_ktp, "Foto KTP")}
                            {renderLink(dataPilih.foto_kk, "Kartu Keluarga")}
                            {renderLink(dataPilih.surat_pengantar, "Surat Pengantar")}
                            {renderLink(dataPilih.sertifikat_tanah, "Sertifikat Tanah")}
                            {renderLink(dataPilih.foto_kondisi_rumah, "Foto Rumah")}
                            {renderLink(dataPilih.foto_lokasi, "Foto Lokasi")}
                            {renderLink(dataPilih.sk_buruan_sae, "SK Buruan Sae")}
                            {renderLink(dataPilih.kebutuhan_tanaman, "Kebutuhan Tanaman")}
                            {renderLink(dataPilih.dokumen_a1, "Dokumen A1")}
                            {renderLink(dataPilih.dokumen_a2, "Dokumen A2")}
                            {renderLink(dataPilih.foto_rembuk, "Foto Rembuk Warga")}
                            {renderLink(dataPilih.daftar_hadir, "Daftar Hadir")}
                            {renderLink(dataPilih.ba_muskel, "BA Muskel")}
                            {renderLink(dataPilih.foto_muskel, "Foto Muskel")}
                            {renderLink(dataPilih.foto_halaman, "Foto Halaman")}
                            {renderLink(dataPilih.proposal_sarpras, "Proposal Sarpras")}
                            {renderLink(dataPilih.foto_sarpras, "Foto Sasaran")}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL CETAK SURAT (OUTPUT FISIK) */}
            {suratPilih && (
                <div className="print-modal-overlay">
                    <div className="cetak-surat-container">
                        
                        {/* Area Tombol (Akan hilang saat di-print) */}
                        <div className="aksi-print-non-cetak">
                            <button className="btn-buka-berkas" onClick={() => window.print()} style={{ fontSize: '15px', padding: '10px 20px' }}>
                                🖨️ Cetak / Simpan PDF
                            </button>
                            <button className="btn-tutup-modal-print" onClick={() => setSuratPilih(null)}>
                                X Batal Cetak
                            </button>
                        </div>

                        {/* KERTAS SURAT RESMI */}
                        <div className="kertas-surat">
                            <div className="kop-surat">
                                <h4>PEMERINTAH KOTA BANDUNG</h4>
                                <h3>KECAMATAN SUKAJADI</h3>
                                <h2>KELURAHAN PASTEUR</h2>
                                <p>Jl. Dr. Djunjunan, Pasteur, Kec. Sukajadi, Kota Bandung, Jawa Barat</p>
                                <hr className="garis-kop-1" />
                                <hr className="garis-kop-2" />
                            </div>

                            <div className="isi-surat">
                                {/* MENGAMBIL JUDUL DARI formatSurat.js ATAU GUNAKAN DEFAULT */}
                                <h4 className="judul-surat">
                                    {(FORMAT_SURAT[suratPilih.jenis_layanan] || FORMAT_SURAT["DEFAULT"]).judul}
                                </h4>
                                
                                {/* MENGAMBIL KODE SURAT DARI formatSurat.js */}
                                <p className="nomor-surat">
                                    Nomor: {(FORMAT_SURAT[suratPilih.jenis_layanan] || FORMAT_SURAT["DEFAULT"]).kodeFormat} / {suratPilih.id} / Ekbang / Kel.Pst / {new Date().getFullYear()}
                                </p>

                                <p>Yang bertanda tangan di bawah ini Lurah Pasteur, Kecamatan Sukajadi, Kota Bandung, menerangkan dengan sesungguhnya bahwa:</p>

                                <table className="tabel-identitas">
                                    <tbody>
                                        <tr><td width="180">Nama Lengkap</td><td width="20">:</td><td><strong>{suratPilih.nama_pemohon}</strong></td></tr>
                                        <tr><td>NIK</td><td>:</td><td>{suratPilih.nik_pemohon}</td></tr>
                                        <tr><td>No. Telepon / WA</td><td>:</td><td>{suratPilih.no_telepon || '-'}</td></tr>
                                        <tr><td>Keperluan / Layanan</td><td>:</td><td><strong>Pengajuan {suratPilih.jenis_layanan}</strong></td></tr>
                                    </tbody>
                                </table>

                                {/* MENGAMBIL REDAKSI TENGAH DARI formatSurat.js */}
                                <p style={{textIndent: '40px', marginTop: '20px'}}>
                                    {(FORMAT_SURAT[suratPilih.jenis_layanan] || FORMAT_SURAT["DEFAULT"]).redaksiTengah(suratPilih.jenis_layanan)} 
                                    {" "}Saat ini, status dokumen dan pengajuan yang bersangkutan terdata dalam sistem dengan status: <strong>{suratPilih.status || 'Baru'}</strong>.
                                </p>
                                <p style={{textIndent: '40px'}}>
                                    Demikian surat keterangan ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.
                                </p>
                            </div>

                            <div className="ttd-surat">
                                <p>Bandung, {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                <p style={{marginBottom: '70px'}}><strong>Lurah Pasteur</strong></p>
                                <p style={{textDecoration: 'underline', fontWeight: 'bold', margin: '0'}}>.............................................</p>
                                <p style={{margin: '0'}}>NIP. ......................................</p>
                            </div>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}