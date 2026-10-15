import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { 
    getPetugas, 
    tambahKegiatanGober, 
    updateKegiatanGober,
    hapusKegiatanGober,
    getKegiatanGober, 
    getKegiatanSampah, 
    tambahKegiatanSampah, 
    updateKegiatanSampah,
    hapusKegiatanSampah,
    BASE_URL 
} from '../services/api';
import './KegiatanHarian.css';

export default function KegiatanHarian() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tabAktif, setTabAktif] = useState('Gober'); 

    const [petugasList, setPetugasList] = useState([]);
    const [dataGober, setDataGober] = useState([]);
    const [dataSampah, setDataSampah] = useState([]);

    const [idPetugasGober, setIdPetugasGober] = useState('');
    const [lokasi, setLokasi] = useState('');
    const [panjangMeter, setPanjangMeter] = useState('');
    const [fotoGober, setFotoGober] = useState(null);

    const [idPetugasSampah, setIdPetugasSampah] = useState('');
    const [kategoriTugas, setKategoriTugas] = useState('Gaslah');
    const [dataRw, setDataRw] = useState('');
    const [beratKiloan, setBeratKiloan] = useState('');
    const [fotoSampah, setFotoSampah] = useState(null);
    const [kataKunci, setKataKunci] = useState('');
    const [loadingGober, setLoadingGober] = useState(false);
    const [loadingSampah, setLoadingSampah] = useState(false);

    // State untuk Modal Edit Gober
    const [isEditGoberOpen, setIsEditGoberOpen] = useState(false);
    const [editGoberData, setEditGoberData] = useState({ id: '', petugas_id: '', lokasi: '', panjang_meter: '', foto: '' });
    const [editFotoGober, setEditFotoGober] = useState(null);
    const [loadingEditGober, setLoadingEditGober] = useState(false);

    // State untuk Modal Edit Sampah
    const [isEditSampahOpen, setIsEditSampahOpen] = useState(false);
    const [editSampahData, setEditSampahData] = useState({ id: '', petugas_id: '', kategori_tugas: 'Gaslah', data_rw: '', berat_kiloan: '', foto: '' });
    const [editFotoSampah, setEditFotoSampah] = useState(null);
    const [loadingEditSampah, setLoadingEditSampah] = useState(false);

    const fetchData = async () => {
        try {
            const resPetugas = await getPetugas();
            setPetugasList(resPetugas);

            const resGober = await getKegiatanGober();
            setDataGober(resGober);

            const resSampah = await getKegiatanSampah();
            setDataSampah(resSampah);
        } catch {
            setPetugasList([]);
            setDataGober([]);
            setDataSampah([]);
            Swal.fire({ title: 'Gagal Memuat Laporan', text: 'Koneksi ke server terputus.', icon: 'error' });
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const submitGober = async (e) => {
        e.preventDefault();
        if (!fotoGober) {
            Swal.fire("Foto kegiatan Gober wajib diunggah!");
            return;
        }

        // Sanitasi nilai panjang_meter (menjamin format angka utuh walau user mengetik '30m')
        const nilaiAngka = parseInt(String(panjangMeter).replace(/[^0-9]/g, ''), 10);
        if (isNaN(nilaiAngka) || nilaiAngka <= 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Format Ukuran Belum Benar',
                text: 'Harap masukkan angka meter yang valid (contoh: 30).'
            });
            return;
        }

        setLoadingGober(true);
        const formData = new FormData();
        formData.append('petugas_id', idPetugasGober);
        formData.append('lokasi', lokasi);
        formData.append('panjang_meter', nilaiAngka);
        formData.append('foto', fotoGober);

        try {
            const result = await tambahKegiatanGober(formData);
            if (result.status === 'sukses') {
                Swal.fire(result.pesan);
                fetchData(); 
                setIdPetugasGober(''); setLokasi(''); setPanjangMeter(''); setFotoGober(null);
                setIsModalOpen(false);
            } else {
                Swal.fire("Gagal: " + result.pesan);
            }
        } catch {
            Swal.fire("Koneksi gagal saat menyimpan laporan Gober!");
        } finally {
            setLoadingGober(false);
        }
    };

    const submitSampah = async (e) => {
        e.preventDefault();
        
        if (!fotoSampah) {
            Swal.fire("Foto bukti timbangan wajib diunggah!");
            return;
        }

        setLoadingSampah(true);
        const formData = new FormData();
        formData.append('petugas_id', idPetugasSampah);
        formData.append('kategori_tugas', kategoriTugas);
        formData.append('data_rw', dataRw);
        formData.append('berat_kiloan', beratKiloan);
        formData.append('foto', fotoSampah);

        try {
            const result = await tambahKegiatanSampah(formData);
            if (result.status === 'sukses') {
                Swal.fire(result.pesan);
                fetchData();
                setIdPetugasSampah(''); setDataRw(''); setBeratKiloan(''); setFotoSampah(null);
                setIsModalOpen(false);
            } else {
                Swal.fire("Gagal: " + result.pesan);
            }
        } catch {
            Swal.fire("Koneksi gagal saat menyimpan laporan Sampah!");
        } finally {
            setLoadingSampah(false);
        }
    };

    // ==========================================
    // HANDLER UPDATE & DELETE GOBER
    // ==========================================
    const bukaModalEditGober = (item) => {
        setEditGoberData({
            id: item.id,
            petugas_id: item.petugas_id,
            lokasi: item.lokasi,
            panjang_meter: item.panjang_meter,
            foto: item.foto
        });
        setEditFotoGober(null);
        setIsEditGoberOpen(true);
    };

    const handleSimpanEditGober = async (e) => {
        e.preventDefault();
        const nilaiAngka = parseInt(String(editGoberData.panjang_meter).replace(/[^0-9]/g, ''), 10);
        if (isNaN(nilaiAngka) || nilaiAngka <= 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Format Ukuran Belum Benar',
                text: 'Harap masukkan angka meter yang valid (contoh: 30).'
            });
            return;
        }

        setLoadingEditGober(true);
        const formData = new FormData();
        formData.append('petugas_id', editGoberData.petugas_id);
        formData.append('lokasi', editGoberData.lokasi);
        formData.append('panjang_meter', nilaiAngka);
        if (editFotoGober) {
            formData.append('foto', editFotoGober);
        }

        try {
            const result = await updateKegiatanGober(editGoberData.id, formData);
            if (result.status === 'sukses') {
                Swal.fire({
                    title: 'Berhasil!',
                    text: result.pesan || 'Laporan kegiatan Gober berhasil diperbarui.',
                    icon: 'success',
                    confirmButtonColor: '#3C50E0'
                });
                setIsEditGoberOpen(false);
                fetchData();
            } else {
                Swal.fire({ title: 'Gagal', text: result.pesan || 'Gagal memperbarui data.', icon: 'error' });
            }
        } catch {
            Swal.fire({ title: 'Error', text: 'Terjadi kesalahan saat memperbarui kegiatan Gober.', icon: 'error' });
        } finally {
            setLoadingEditGober(false);
        }
    };

    const handleHapusGober = (id, namaPetugas, lokasiKegiatan) => {
        Swal.fire({
            title: 'Hapus Laporan Gober?',
            text: `Apakah Anda yakin ingin menghapus laporan "${namaPetugas}" di lokasi "${lokasiKegiatan}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await hapusKegiatanGober(id);
                    if (res.status === 'sukses') {
                        Swal.fire({
                            title: 'Terhapus!',
                            text: res.pesan || 'Laporan berhasil dihapus.',
                            icon: 'success',
                            confirmButtonColor: '#3C50E0'
                        });
                        fetchData();
                    } else {
                        Swal.fire({ title: 'Gagal', text: res.pesan || 'Gagal menghapus data.', icon: 'error' });
                    }
                } catch {
                    Swal.fire({ title: 'Error', text: 'Terjadi kesalahan koneksi saat menghapus.', icon: 'error' });
                }
            }
        });
    };

    // ==========================================
    // HANDLER UPDATE & DELETE SAMPAH
    // ==========================================
    const bukaModalEditSampah = (item) => {
        setEditSampahData({
            id: item.id,
            petugas_id: item.petugas_id,
            kategori_tugas: item.kategori_tugas || 'Gaslah',
            data_rw: item.data_rw,
            berat_kiloan: item.berat_kiloan,
            foto: item.foto
        });
        setEditFotoSampah(null);
        setIsEditSampahOpen(true);
    };

    const handleSimpanEditSampah = async (e) => {
        e.preventDefault();
        const cleanedBerat = parseFloat(String(editSampahData.berat_kiloan).replace(',', '.'));
        if (isNaN(cleanedBerat) || cleanedBerat <= 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Format Berat Belum Benar',
                text: 'Harap masukkan angka berat (Kg) yang valid.'
            });
            return;
        }

        setLoadingEditSampah(true);
        const formData = new FormData();
        formData.append('petugas_id', editSampahData.petugas_id);
        formData.append('kategori_tugas', editSampahData.kategori_tugas);
        formData.append('data_rw', editSampahData.data_rw);
        formData.append('berat_kiloan', cleanedBerat);
        if (editFotoSampah) {
            formData.append('foto', editFotoSampah);
        }

        try {
            const result = await updateKegiatanSampah(editSampahData.id, formData);
            if (result.status === 'sukses') {
                Swal.fire({
                    title: 'Berhasil!',
                    text: result.pesan || 'Laporan kegiatan Sampah berhasil diperbarui.',
                    icon: 'success',
                    confirmButtonColor: '#3C50E0'
                });
                setIsEditSampahOpen(false);
                fetchData();
            } else {
                Swal.fire({ title: 'Gagal', text: result.pesan || 'Gagal memperbarui data.', icon: 'error' });
            }
        } catch {
            Swal.fire({ title: 'Error', text: 'Terjadi kesalahan saat memperbarui kegiatan Sampah.', icon: 'error' });
        } finally {
            setLoadingEditSampah(false);
        }
    };

    const handleHapusSampah = (id, namaPetugas, tugas, rw) => {
        Swal.fire({
            title: 'Hapus Laporan Timbangan?',
            text: `Apakah Anda yakin ingin menghapus laporan "${tugas} - RW ${rw}" oleh "${namaPetugas}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await hapusKegiatanSampah(id);
                    if (res.status === 'sukses') {
                        Swal.fire({
                            title: 'Terhapus!',
                            text: res.pesan || 'Laporan timbangan berhasil dihapus.',
                            icon: 'success',
                            confirmButtonColor: '#3C50E0'
                        });
                        fetchData();
                    } else {
                        Swal.fire({ title: 'Gagal', text: res.pesan || 'Gagal menghapus data.', icon: 'error' });
                    }
                } catch {
                    Swal.fire({ title: 'Error', text: 'Terjadi kesalahan koneksi saat menghapus.', icon: 'error' });
                }
            }
        });
    };

    const hasilFilterGober = dataGober.filter((item) => {
        const teksCari = kataKunci.toLowerCase().trim();
        if (!teksCari) return true;
        return (
            (item.nama_petugas && item.nama_petugas.toLowerCase().includes(teksCari)) ||
            (item.lokasi && item.lokasi.toLowerCase().includes(teksCari))
        );
    });

    const hasilFilterSampah = dataSampah.filter((item) => {
        const teksCari = kataKunci.toLowerCase().trim();
        if (!teksCari) return true;
        return (
            (item.nama_petugas && item.nama_petugas.toLowerCase().includes(teksCari)) ||
            (item.kategori_tugas && item.kategori_tugas.toLowerCase().includes(teksCari)) ||
            (item.data_rw && item.data_rw.toLowerCase().includes(teksCari))
        );
    });

    // FUNGSI MENCETAK EXCEL PINTAR (DENGAN INJEKSI GAMBAR)
    const unduhExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Laporan Kegiatan');

        worksheet.columns = [
            { header: 'No', key: 'no', width: 5 },
            { header: 'Tanggal', key: 'tanggal', width: 15 },
            { header: 'Nama Petugas', key: 'nama', width: 25 },
            { header: tabAktif === 'Gober' ? 'Lokasi' : 'Tugas Spesifik', key: 'detail', width: 30 },
            { header: tabAktif === 'Gober' ? 'Ukuran (P/L)' : 'Berat (Kg)', key: 'ukuran', width: 15 },
            { header: 'Bukti Foto', key: 'foto', width: 20 }
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).alignment = { horizontal: 'center' };

        const dataDiproses = tabAktif === 'Gober' ? hasilFilterGober : hasilFilterSampah;

        for (let i = 0; i < dataDiproses.length; i++) {
            const item = dataDiproses[i];

            const row = worksheet.addRow({
                no: i + 1,
                tanggal: new Date(item.tanggal_kegiatan).toLocaleDateString('id-ID'),
                nama: item.nama_petugas,
                detail: tabAktif === 'Gober' ? item.lokasi : `${item.kategori_tugas} - RW ${item.data_rw}`,
                ukuran: tabAktif === 'Gober' ? item.panjang_meter : item.berat_kiloan,
                foto: '' 
            });

            row.height = 130; 
            row.alignment = { vertical: 'middle' };

            if (item.foto) {
                try {
                    const urlFoto = item.foto.startsWith('http') ? item.foto : `${BASE_URL}/uploads/${item.foto}`;
                    const response = await fetch(urlFoto);
                    const arrayBuffer = await response.arrayBuffer();
                    const ekstensi = item.foto.split('.').pop().toLowerCase() === 'png' ? 'png' : 'jpeg';
                    
                    const imageId = workbook.addImage({
                        buffer: arrayBuffer,
                        extension: ekstensi,
                    });

                    worksheet.addImage(imageId, {
                        tl: { col: 5.1, row: i + 1 + 0.1 }, 
                        ext: { width: 150, height: 150 } 
                    });
                } catch {
                    row.getCell('foto').value = "Gagal Dimuat";
                }
            } else {
                row.getCell('foto').value = "Tidak Ada Foto";
            }
        }

        const buffer = await workbook.xlsx.writeBuffer();
        const namaFile = tabAktif === 'Gober' ? "Rekap_Laporan_Gober.xlsx" : "Rekap_Timbangan_Organik.xlsx";
        saveAs(new Blob([buffer]), namaFile);
    };

    return (
        <div className="kegiatan-container">
            <h2>Buku Laporan Kegiatan Harian Petugas Ekbang</h2>
            
            <div className="tab-menu">
                <button 
                    className={tabAktif === 'Gober' ? 'btn-tab aktif' : 'btn-tab'} 
                    onClick={() => setTabAktif('Gober')}
                >
                    Laporan Lapangan (Gober/Gorong/Taman)
                </button>
                <button 
                    className={tabAktif === 'Gaslah & Magot' ? 'btn-tab aktif' : 'btn-tab'} 
                    onClick={() => setTabAktif('Gaslah & Magot')}
                >
                    Laporan Timbangan Organik
                </button>
            </div>

            <div className="aksi-atas-group">
                <button className="btn-tambah-utama" onClick={() => setIsModalOpen(true)} style={{ marginBottom: 0 }}>
                    + Tambah Laporan
                </button>
                <button className="btn-excel" onClick={unduhExcel}>
                    📥 Download Laporan Excel
                </button>
            </div>

            {tabAktif === 'Gober' && (
                <div className="kegiatan-card">
                    <div className="header-tabel-kegiatan">
                        <h3>Riwayat Lapangan</h3>
                        <div className="search-kegiatan-group">
                            <label>Cari Kegiatan Lapangan:</label>
                            <input 
                                type="text" 
                                placeholder="Ketik nama petugas atau lokasi..." 
                                value={kataKunci}
                                onChange={(e) => setKataKunci(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="table-responsive">
                        <table className="tabel-utama">
                            <thead>
                                <tr>
                                    <th>Tanggal</th>
                                    <th>Nama Petugas</th>
                                    <th>Lokasi</th>
                                    <th>Ukuran (P/L)</th>
                                    <th>Bukti Foto</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {hasilFilterGober.length > 0 ? (
                                    hasilFilterGober.map((item) => (
                                        <tr key={item.id}>
                                            <td>{new Date(item.tanggal_kegiatan).toLocaleDateString('id-ID')}</td>
                                            <td>{item.nama_petugas}</td>
                                            <td>{item.lokasi}</td>
                                            <td>{item.panjang_meter} m</td>
                                            <td>
                                                {item.foto ? (
                                                    <a href={item.foto.startsWith('http') ? item.foto : `${BASE_URL}/uploads/${item.foto}`} target="_blank" rel="noreferrer" className="btn-lihat">Lihat Foto</a>
                                                ) : '-'}
                                            </td>
                                            <td style={{ verticalAlign: 'middle' }}>
                                                <div className="grup-aksi-kegiatan">
                                                    <button className="btn-edit-kegiatan" onClick={() => bukaModalEditGober(item)} title="Edit Laporan Gober">
                                                        ✏️ Edit
                                                    </button>
                                                    <button className="btn-hapus-kegiatan" onClick={() => handleHapusGober(item.id, item.nama_petugas, item.lokasi)} title="Hapus Laporan Gober">
                                                        🗑️ Hapus
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center">Belum ada riwayat kegiatan lapangan.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {tabAktif === 'Gaslah & Magot' && (
                <div className="kegiatan-card">
                    <div className="header-tabel-kegiatan">
                        <h3>Riwayat Timbangan</h3>
                        <div className="search-kegiatan-group">
                            <label>Cari Data Timbangan:</label>
                            <input 
                                type="text" 
                                placeholder="Ketik nama petugas, tugas, atau RW..." 
                                value={kataKunci}
                                onChange={(e) => setKataKunci(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="table-responsive">
                        <table className="tabel-utama">
                            <thead>
                                <tr>
                                    <th>Tanggal</th>
                                    <th>Petugas</th>
                                    <th>Tugas</th>
                                    <th>RW</th>
                                    <th>Berat</th>
                                    <th>Bukti Timbangan</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {hasilFilterSampah.length > 0 ? (
                                    hasilFilterSampah.map((item) => (
                                        <tr key={item.id}>
                                            <td>{new Date(item.tanggal_kegiatan).toLocaleDateString('id-ID')}</td>
                                            <td>{item.nama_petugas}</td>
                                            <td>{item.kategori_tugas}</td>
                                            <td>{item.data_rw}</td>
                                            <td>{item.berat_kiloan} Kg</td>
                                            <td>
                                                {item.foto ? (
                                                    <a href={item.foto.startsWith('http') ? item.foto : `${BASE_URL}/uploads/${item.foto}`} target="_blank" rel="noreferrer" className="btn-lihat">Lihat Bukti</a>
                                                ) : '-'}
                                            </td>
                                            <td style={{ verticalAlign: 'middle' }}>
                                                <div className="grup-aksi-kegiatan">
                                                    <button className="btn-edit-kegiatan" onClick={() => bukaModalEditSampah(item)} title="Edit Laporan Sampah">
                                                        ✏️ Edit
                                                    </button>
                                                    <button className="btn-hapus-kegiatan" onClick={() => handleHapusSampah(item.id, item.nama_petugas, item.kategori_tugas, item.data_rw)} title="Hapus Laporan Sampah">
                                                        🗑️ Hapus
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center">Belum ada riwayat timbangan sampah.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* MODAL TAMBAH LAPORAN */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="btn-tutup-modal" onClick={() => setIsModalOpen(false)}>X</button>
                        
                        {tabAktif === 'Gober' ? (
                            <>
                                <h3 style={{ marginTop: '0', marginBottom: '20px' }}>Input Laporan Lapangan</h3>
                                <form onSubmit={submitGober} className="kegiatan-form">
                                    <div className="form-group">
                                        <label>Pilih Petugas Lapangan</label>
                                        <select value={idPetugasGober} onChange={(e) => setIdPetugasGober(e.target.value)} required>
                                            <option value="">-- Pilih Petugas --</option>
                                            {petugasList
                                                .filter(p => ['Gober', 'Gorong-gorong', 'Taman'].includes(p.kategori_petugas) && p.status !== 'Non-Aktif')
                                                .map(p => (
                                                    <option key={p.id} value={p.id}>{p.nama_petugas} ({p.kategori_petugas})</option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Lokasi Pengerjaan</label>
                                        <input type="text" placeholder='Contoh: Jl. Anyelir 2' value={lokasi} onChange={(e) => setLokasi(e.target.value)} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Ukuran Panjang / Luas (Meter)</label>
                                        <input 
                                            type="number" 
                                            min="1" 
                                            placeholder='Masukkan angka meter (contoh: 30)' 
                                            value={panjangMeter} 
                                            onChange={(e) => setPanjangMeter(e.target.value)} 
                                            required 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Foto Kegiatan</label>
                                        <input type="file" accept="image/*" onChange={(e) => setFotoGober(e.target.files[0])} required />
                                    </div>
                                    <button type="submit" className="btn-simpan-kegiatan" disabled={loadingGober} style={loadingGober ? { opacity: 0.7, cursor: 'not-allowed' } : {}}>{loadingGober ? '⏳ Menyimpan...' : 'Simpan Laporan'}</button>
                                </form>
                            </>
                        ) : (
                            <>
                                <h3 style={{ marginTop: '0', marginBottom: '20px' }}>Input Hasil Timbangan</h3>
                                <form onSubmit={submitSampah} className="kegiatan-form">
                                    <div className="form-group">
                                        <label>Pilih Petugas</label>
                                        <select value={idPetugasSampah} onChange={(e) => setIdPetugasSampah(e.target.value)} required>
                                            <option value="">-- Pilih Petugas --</option>
                                            {petugasList
                                                .filter(p => ['Gaslah', 'Petugas Magot'].includes(p.kategori_petugas) && p.status !== 'Non-Aktif')
                                                .map(p => (
                                                    <option key={p.id} value={p.id}>{p.nama_petugas}</option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Tugas Spesifik</label>
                                        <select value={kategoriTugas} onChange={(e) => setKategoriTugas(e.target.value)} required>
                                            <option value="Gaslah">Tim Gaslah</option>
                                            <option value="Magot">Tim Magot</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Data RW</label>
                                        <input type="text" placeholder="Contoh: RW 04" value={dataRw} onChange={(e) => setDataRw(e.target.value)} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Berat Kiloan (Kg)</label>
                                        <input type="number" placeholder='Contoh: 30' step="0.01" value={beratKiloan} onChange={(e) => setBeratKiloan(e.target.value)} required />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Foto Bukti Timbangan</label>
                                        <input type="file" accept="image/*" onChange={(e) => setFotoSampah(e.target.files[0])} required />
                                    </div>

                                    <button type="submit" className="btn-simpan-kegiatan" disabled={loadingSampah} style={loadingSampah ? { opacity: 0.7, cursor: 'not-allowed' } : {}}>{loadingSampah ? '⏳ Menyimpan...' : 'Simpan Laporan Sampah'}</button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* MODAL EDIT GOBER */}
            {isEditGoberOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="btn-tutup-modal" onClick={() => setIsEditGoberOpen(false)}>X</button>
                        <h3 style={{ marginTop: '0', marginBottom: '20px' }}>Edit Laporan Lapangan</h3>
                        <form onSubmit={handleSimpanEditGober} className="kegiatan-form">
                            <div className="form-group">
                                <label>Pilih Petugas Lapangan</label>
                                <select 
                                    value={editGoberData.petugas_id} 
                                    onChange={(e) => setEditGoberData({ ...editGoberData, petugas_id: e.target.value })} 
                                    required
                                >
                                    <option value="">-- Pilih Petugas --</option>
                                    {petugasList
                                        .filter(p => ['Gober', 'Gorong-gorong', 'Taman'].includes(p.kategori_petugas) && (p.status !== 'Non-Aktif' || p.id === editGoberData.petugas_id))
                                        .map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.nama_petugas} ({p.kategori_petugas}) {p.status === 'Non-Aktif' ? '(Non-Aktif)' : ''}
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Lokasi Pengerjaan</label>
                                <input 
                                    type="text" 
                                    value={editGoberData.lokasi} 
                                    onChange={(e) => setEditGoberData({ ...editGoberData, lokasi: e.target.value })} 
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>Ukuran Panjang / Luas (Meter)</label>
                                <input 
                                    type="number" 
                                    min="1" 
                                    value={editGoberData.panjang_meter} 
                                    onChange={(e) => setEditGoberData({ ...editGoberData, panjang_meter: e.target.value })} 
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>Ganti Bukti Foto (Opsional)</label>
                                <input type="file" accept="image/*" onChange={(e) => setEditFotoGober(e.target.files[0])} />
                                {editGoberData.foto && (
                                    <small style={{ marginTop: '5px', color: 'var(--text-redup)', fontSize: '12px' }}>
                                        Foto lama tersimpan di server. Pilih foto baru hanya jika ingin menggantinya.
                                    </small>
                                )}
                            </div>
                            <div className="modal-edit-kegiatan-actions">
                                <button type="button" className="btn-batal-kegiatan" onClick={() => setIsEditGoberOpen(false)}>
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn-simpan-edit-kegiatan" 
                                    disabled={loadingEditGober}
                                    style={loadingEditGober ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
                                >
                                    {loadingEditGober ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL EDIT SAMPAH */}
            {isEditSampahOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="btn-tutup-modal" onClick={() => setIsEditSampahOpen(false)}>X</button>
                        <h3 style={{ marginTop: '0', marginBottom: '20px' }}>Edit Hasil Timbangan</h3>
                        <form onSubmit={handleSimpanEditSampah} className="kegiatan-form">
                            <div className="form-group">
                                <label>Pilih Petugas</label>
                                <select 
                                    value={editSampahData.petugas_id} 
                                    onChange={(e) => setEditSampahData({ ...editSampahData, petugas_id: e.target.value })} 
                                    required
                                >
                                    <option value="">-- Pilih Petugas --</option>
                                    {petugasList
                                        .filter(p => ['Gaslah', 'Petugas Magot'].includes(p.kategori_petugas) && (p.status !== 'Non-Aktif' || p.id === editSampahData.petugas_id))
                                        .map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.nama_petugas} {p.status === 'Non-Aktif' ? '(Non-Aktif)' : ''}
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Tugas Spesifik</label>
                                <select 
                                    value={editSampahData.kategori_tugas} 
                                    onChange={(e) => setEditSampahData({ ...editSampahData, kategori_tugas: e.target.value })} 
                                    required
                                >
                                    <option value="Gaslah">Tim Gaslah</option>
                                    <option value="Magot">Tim Magot</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Data RW</label>
                                <input 
                                    type="text" 
                                    value={editSampahData.data_rw} 
                                    onChange={(e) => setEditSampahData({ ...editSampahData, data_rw: e.target.value })} 
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>Berat Kiloan (Kg)</label>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    value={editSampahData.berat_kiloan} 
                                    onChange={(e) => setEditSampahData({ ...editSampahData, berat_kiloan: e.target.value })} 
                                    required 
                                />
                            </div>
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label>Ganti Bukti Timbangan (Opsional)</label>
                                <input type="file" accept="image/*" onChange={(e) => setEditFotoSampah(e.target.files[0])} />
                                {editSampahData.foto && (
                                    <small style={{ marginTop: '5px', color: 'var(--text-redup)', fontSize: '12px' }}>
                                        Foto lama tersimpan di server. Pilih foto baru hanya jika ingin menggantinya.
                                    </small>
                                )}
                            </div>
                            <div className="modal-edit-kegiatan-actions">
                                <button type="button" className="btn-batal-kegiatan" onClick={() => setIsEditSampahOpen(false)}>
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn-simpan-edit-kegiatan" 
                                    disabled={loadingEditSampah}
                                    style={loadingEditSampah ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
                                >
                                    {loadingEditSampah ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
