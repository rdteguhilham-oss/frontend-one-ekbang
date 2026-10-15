import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { useState, useEffect } from "react";
import Swal from 'sweetalert2';
import { getDataLayanan, updateStatusLayanan, updateDataLayanan, BASE_URL } from "../services/api"; 
import { Link } from "react-router-dom";
import './PengajuanLayanan.css';
import CetakSuratModal from '../components/CetakSuratModal';

const MAP_DOKUMEN_LAYANAN = {
    'RUTILAHU': [
        { field: 'foto_ktp', label: 'Foto KTP' },
        { field: 'foto_kk', label: 'Kartu Keluarga (KK)' },
        { field: 'surat_pengantar', label: 'Surat Pengantar RT/RW' },
        { field: 'sertifikat_tanah', label: 'Sertifikat Tanah' },
        { field: 'foto_kondisi_rumah', label: 'Foto Kondisi Rumah' }
    ],
    'POHON TUMBANG': [
        { field: 'foto_ktp', label: 'Foto KTP' },
        { field: 'foto_kk', label: 'Kartu Keluarga (KK)' },
        { field: 'surat_pengantar', label: 'Surat Pengantar' },
        { field: 'foto_lokasi', label: 'Foto Lokasi / Pohon' }
    ],
    'BURUAN SAE': [
        { field: 'sk_buruan_sae', label: 'SK Buruan Sae' },
        { field: 'foto_halaman', label: 'Foto Halaman / Lahan' },
        { field: 'kebutuhan_tanaman', label: 'Kebutuhan Bibit / Tanaman' }
    ],
    'MUSRENBANG': [
        { field: 'dokumen_a1', label: 'Dokumen Form A1' },
        { field: 'dokumen_a2', label: 'Dokumen Form A2' },
        { field: 'foto_rembuk', label: 'Foto Rembuk Warga' },
        { field: 'daftar_hadir', label: 'Daftar Hadir Rembuk' }
    ],
    'DAU DAN PRAKARSA': [
        { field: 'ba_muskel', label: 'Berita Acara (BA) Muskel' },
        { field: 'foto_muskel', label: 'Foto Kegiatan Muskel' },
        { field: 'dokumen_a1', label: 'Dokumen Form A1' },
        { field: 'dokumen_a2', label: 'Dokumen Form A2' }
    ],
    'SARPRAS DLH': [
        { field: 'foto_ktp', label: 'Foto KTP' },
        { field: 'foto_kk', label: 'Kartu Keluarga (KK)' },
        { field: 'proposal_sarpras', label: 'Proposal Permohonan Sarpras' },
        { field: 'foto_sarpras', label: 'Foto Lokasi / Sasaran' }
    ]
};

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
    // STATE UNTUK FITUR EDIT DATA PEMOHON
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editData, setEditData] = useState({
        id: null,
        nik_pemohon: '',
        nama_pemohon: '',
        no_telepon: '',
        jenis_layanan: '',
        status: ''
    });
    const [editDataOriginal, setEditDataOriginal] = useState(null);
    const [editFiles, setEditFiles] = useState({});
    const [loadingEdit, setLoadingEdit] = useState(false);
    
    const muatData = async () => {
        try {
            const hasil = await getDataLayanan();
            setDataLayanan(hasil); 
        } catch {
            setDataLayanan([]); 
            Swal.fire({ title: 'Gagal Memuat Data', text: 'Koneksi ke server terputus.', icon: 'error' });
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
                } catch {
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

    const bukaModalEdit = (data) => {
        setEditData({
            id: data.id,
            nik_pemohon: data.nik_pemohon || '',
            nama_pemohon: data.nama_pemohon || '',
            no_telepon: data.no_telepon || '',
            jenis_layanan: data.jenis_layanan || 'RUTILAHU',
            status: data.status || 'Baru'
        });
        setEditDataOriginal(data);
        setEditFiles({});
        setIsEditModalOpen(true);
    };

    const handleFileChange = (field, file) => {
        setEditFiles((prev) => ({
            ...prev,
            [field]: file
        }));
    };

    const handleBatalGantiFile = (field) => {
        setEditFiles((prev) => {
            const salinan = { ...prev };
            delete salinan[field];
            return salinan;
        });
    };

    const handleSimpanEdit = async (e) => {
        e.preventDefault();
        if (loadingEdit) return;

        if (editData.nik_pemohon && (editData.nik_pemohon.length !== 16 || isNaN(editData.nik_pemohon))) {
            Swal.fire({
                icon: 'warning',
                title: 'Format NIK Salah',
                text: 'NIK pemohon harus persis 16 digit angka!'
            });
            return;
        }

        setLoadingEdit(true);
        try {
            const formData = new FormData();
            formData.append('nik_pemohon', editData.nik_pemohon);
            formData.append('nama_pemohon', editData.nama_pemohon);
            formData.append('no_telepon', editData.no_telepon);
            formData.append('status', editData.status);

            let adaFileBaru = false;
            Object.entries(editFiles).forEach(([field, file]) => {
                if (file) {
                    formData.append(field, file);
                    adaFileBaru = true;
                }
            });

            const respons = await updateDataLayanan(editData.id, formData);
            if (respons && respons.status === 'sukses') {
                Swal.fire({
                    title: 'Berhasil!',
                    text: adaFileBaru
                        ? 'Data pemohon dan berkas dokumen berhasil diperbarui.'
                        : (respons.pesan || 'Data pengajuan pemohon berhasil diperbarui.'),
                    icon: 'success',
                    confirmButtonColor: '#3C50E0'
                });
                setIsEditModalOpen(false);
                setEditFiles({});
                setEditDataOriginal(null);
                muatData();
            } else {
                Swal.fire({
                    title: 'Gagal!',
                    text: respons?.pesan || 'Gagal memperbarui data pengajuan.',
                    icon: 'error'
                });
            }
        } catch {
            Swal.fire({
                title: 'Error',
                text: 'Koneksi ke server terputus saat menyimpan perubahan!',
                icon: 'error'
            });
        } finally {
            setLoadingEdit(false);
        }
    };

    const renderLink = (namaFile, label) => {
    if (!namaFile) return null; 
    
    // Trik deteksi link cerdas
    const linkAman = namaFile.startsWith('http') ? namaFile : `${BASE_URL}/uploads/${namaFile}`;
    
    return (
        <a href={linkAman} target="_blank" rel="noreferrer" className="btn-link-dokumen">
            📄 Lihat {label}
        </a>
    );
};

    const hasilFilter = dataLayanan.filter((item) => {
        const cocokKategori = filterKategori === "Semua" || item.jenis_layanan === filterKategori;
        const teksCari = kataKunci.toLowerCase().trim();
        const cocokCari = !teksCari || (
            (item.nama_pemohon && item.nama_pemohon.toLowerCase().includes(teksCari)) ||
            (item.nik_pemohon && String(item.nik_pemohon).toLowerCase().includes(teksCari)) ||
            (item.no_telepon && String(item.no_telepon).toLowerCase().includes(teksCari))
        );
        
        let cocokTanggal = true;
        if (tanggalMulai && tanggalSelesai) {
            const tglData = new Date(item.tanggal_pengajuan).getTime();
            const tglAwal = new Date(tanggalMulai).getTime();
            const tglAkhir = new Date(tanggalSelesai).setHours(23, 59, 59, 999); // Sampai detik terakhir hari itu
            
            if (!isNaN(tglData)) {
                cocokTanggal = tglData >= tglAwal && tglData <= tglAkhir;
            }
        }
        
        return cocokKategori && cocokCari && cocokTanggal;
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
                    <label>Pencarian Data:</label>
                    <input type="text" placeholder="Ketik nama, NIK, atau no. telepon..." value={kataKunci} onChange={(e) => setKataKunci(e.target.value)} />
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
                        <option value="SARPRAS DLH">SARPRAS DLH</option>
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
                                <th>Dokumen</th> 
                                <th>Tindakan & Verifikasi</th>
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
                                        <td>{data.tanggal_pengajuan ? new Date(data.tanggal_pengajuan).toLocaleDateString('id-ID') : '-'}</td>
                                        <td>{data.jenis_layanan}</td>
                                        <td>{data.nama_pemohon}</td>
                                        <td>{data.no_telepon || '-'}</td>
                                        <td>
                                            <span className={`badge-status badge-status-${(data.status || 'Baru').toLowerCase()}`}>
                                                {data.status || 'Baru'}
                                            </span>
                                        </td>
                                        
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
                                                <button className="btn-edit-layanan" onClick={() => bukaModalEdit(data)} title="Edit Data Pemohon">
                                                    ✏️ Edit
                                                </button>
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

            {/* MODAL CETAK SURAT INTERAKTIF (SPLIT SCREEN) */}
            <CetakSuratModal suratPilih={suratPilih} onClose={() => setSuratPilih(null)} />

            {/* MODAL EDIT DATA PEMOHON */}
            {isEditModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content modal-edit-layanan-content">
                        <button 
                            className="btn-tutup-modal" 
                            onClick={() => {
                                setIsEditModalOpen(false);
                                setEditFiles({});
                                setEditDataOriginal(null);
                            }}
                        >
                            ✕
                        </button>
                        <h3 className="modal-edit-title">✏️ Edit Data & Berkas Pengajuan</h3>
                        <p className="modal-edit-sub">Perbarui identitas pemohon, status, atau ganti berkas dokumen yang salah/buram.</p>

                        <form onSubmit={handleSimpanEdit} className="form-edit-layanan">
                            <div className="form-group-edit">
                                <label>NIK Pemohon (16 Digit)</label>
                                <input 
                                    type="text" 
                                    maxLength={16}
                                    placeholder="Contoh: 327301xxxxxxxxxx" 
                                    value={editData.nik_pemohon} 
                                    onChange={(e) => setEditData({ ...editData, nik_pemohon: e.target.value })} 
                                    required 
                                />
                            </div>

                            <div className="form-group-edit">
                                <label>Nama Lengkap Pemohon</label>
                                <input 
                                    type="text" 
                                    placeholder="Nama sesuai KTP..." 
                                    value={editData.nama_pemohon} 
                                    onChange={(e) => setEditData({ ...editData, nama_pemohon: e.target.value })} 
                                    required 
                                />
                            </div>

                            <div className="form-group-edit">
                                <label>Nomor Telepon / WhatsApp</label>
                                <input 
                                    type="text" 
                                    placeholder="Contoh: 0812xxxxxxxx" 
                                    value={editData.no_telepon} 
                                    onChange={(e) => setEditData({ ...editData, no_telepon: e.target.value })} 
                                    required 
                                />
                            </div>

                            {/* JENIS LAYANAN (TERKUNCI / READ ONLY) */}
                            <div className="form-group-edit">
                                <label>Jenis Layanan</label>
                                <div className="badge-layanan-terkunci">
                                    <span className="badge-layanan-icon">🔒</span>
                                    <span className="badge-layanan-teks">{editData.jenis_layanan}</span>
                                    <span className="badge-layanan-tag">Terkunci</span>
                                </div>
                                <span className="info-layanan-terkunci">
                                    *Jenis layanan tidak dapat diubah agar keabsahan arsip pengajuan warga tetap terjaga.
                                </span>
                            </div>

                            <div className="form-group-edit">
                                <label>Status Pengajuan</label>
                                <select 
                                    value={editData.status} 
                                    onChange={(e) => setEditData({ ...editData, status: e.target.value })} 
                                    required
                                >
                                    <option value="Baru">Baru</option>
                                    <option value="Diproses">Diproses</option>
                                    <option value="Selesai">Selesai</option>
                                    <option value="Ditolak">Ditolak</option>
                                </select>
                            </div>

                            {/* BAGIAN GANTI BERKAS DOKUMEN (OPSIONAL) */}
                            <div className="section-edit-berkas">
                                <div className="section-berkas-header">
                                    <label className="section-berkas-title">📁 Penggantian Berkas Dokumen (Opsional)</label>
                                    <p className="section-berkas-sub">
                                        Pilih file baru hanya jika berkas yang dikirimkan warga salah, buram, atau perlu diperbaiki (Maks. 5MB).
                                    </p>
                                </div>

                                <div className="list-edit-berkas">
                                    {(MAP_DOKUMEN_LAYANAN[editData.jenis_layanan] || []).map((dok) => {
                                        const fileLama = editDataOriginal ? editDataOriginal[dok.field] : null;
                                        const fileDipilih = editFiles[dok.field];
                                        const linkFileLama = fileLama ? (fileLama.startsWith('http') ? fileLama : `${BASE_URL}/uploads/${fileLama}`) : null;

                                        return (
                                            <div key={dok.field} className={`item-edit-berkas ${fileDipilih ? 'ada-file-baru' : ''}`}>
                                                <div className="berkas-info-kolom">
                                                    <span className="label-nama-berkas">{dok.label}</span>
                                                    <div className="berkas-status-bar">
                                                        {linkFileLama ? (
                                                            <a 
                                                                href={linkFileLama} 
                                                                target="_blank" 
                                                                rel="noreferrer" 
                                                                className="link-lihat-berkas-lama"
                                                            >
                                                                📄 Lihat Berkas Saat Ini
                                                            </a>
                                                        ) : (
                                                            <span className="badge-berkas-kosong">Belum ada file</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="berkas-input-kolom">
                                                    <input
                                                        type="file"
                                                        id={`file-input-${dok.field}`}
                                                        className="input-file-native"
                                                        onChange={(e) => {
                                                            if (e.target.files && e.target.files[0]) {
                                                                handleFileChange(dok.field, e.target.files[0]);
                                                            }
                                                        }}
                                                    />
                                                    <label 
                                                        htmlFor={`file-input-${dok.field}`} 
                                                        className={`btn-upload-ganti ${fileDipilih ? 'btn-upload-aktif' : ''}`}
                                                    >
                                                        {fileDipilih ? `✓ ${fileDipilih.name}` : (fileLama ? '🔄 Ganti File' : '➕ Unggah File')}
                                                    </label>
                                                    {fileDipilih && (
                                                        <button
                                                            type="button"
                                                            className="btn-batal-ganti-berkas"
                                                            onClick={() => handleBatalGantiFile(dok.field)}
                                                            title="Batalkan perubahan file ini"
                                                        >
                                                            ✕
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="modal-edit-actions">
                                <button 
                                    type="button" 
                                    className="btn-batal-modal" 
                                    onClick={() => {
                                        setIsEditModalOpen(false);
                                        setEditFiles({});
                                        setEditDataOriginal(null);
                                    }}
                                >
                                    Batal
                                </button>
                                <button type="submit" className="btn-simpan-modal" disabled={loadingEdit}>
                                    {loadingEdit ? '⏳ Menyimpan...' : '💾 Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
