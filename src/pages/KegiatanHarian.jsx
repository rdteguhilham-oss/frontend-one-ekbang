import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import React, { useState, useEffect } from 'react';
import { 
    getPetugas, 
    tambahKegiatanGober, 
    getKegiatanGober, 
    tambahKegiatanSampah, 
    getKegiatanSampah 
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

    const fetchData = async () => {
        try {
            const resPetugas = await getPetugas();
            setPetugasList(resPetugas);

            const resGober = await getKegiatanGober();
            setDataGober(resGober);

            const resSampah = await getKegiatanSampah();
            setDataSampah(resSampah);
        } catch (error) {
            console.error("Gagal menarik data kegiatan:", error);
            setPetugasList([]);
            setDataGober([]);
            setDataSampah([]);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getNamaPetugas = (id) => {
        const petugas = petugasList.find(p => p.id === parseInt(id));
        return petugas ? petugas.nama_petugas : '';
    };

    const submitGober = async (e) => {
        e.preventDefault();
        if (!fotoGober) {
            alert("Foto kegiatan Gober wajib diunggah!");
            return;
        }

        const formData = new FormData();
        formData.append('petugas_id', idPetugasGober);
        formData.append('nama_petugas', getNamaPetugas(idPetugasGober));
        formData.append('lokasi', lokasi);
        formData.append('panjang_meter', panjangMeter);
        formData.append('foto', fotoGober);

        try {
            const result = await tambahKegiatanGober(formData);
            if (result.status === 'sukses') {
                alert(result.pesan);
                fetchData(); 
                setIdPetugasGober(''); setLokasi(''); setPanjangMeter(''); setFotoGober(null);
                setIsModalOpen(false);
            } else {
                alert("Gagal: " + result.pesan);
            }
        } catch (error) {
            alert("Koneksi gagal saat menyimpan laporan Gober!");
        }
    };

    const submitSampah = async (e) => {
        e.preventDefault();
        
        // WAJIB ADA FOTO SEKARANG
        if (!fotoSampah) {
            alert("Foto bukti timbangan wajib diunggah!");
            return;
        }

        const formData = new FormData();
        formData.append('petugas_id', idPetugasSampah);
        formData.append('nama_petugas', getNamaPetugas(idPetugasSampah));
        formData.append('kategori_tugas', kategoriTugas);
        formData.append('data_rw', dataRw);
        formData.append('berat_kiloan', beratKiloan);
        formData.append('foto', fotoSampah); // Memasukkan foto ke paketan

        try {
            const result = await tambahKegiatanSampah(formData);
            if (result.status === 'sukses') {
                alert(result.pesan);
                fetchData();
                setIdPetugasSampah(''); setDataRw(''); setBeratKiloan(''); setFotoSampah(null);
                setIsModalOpen(false);
            } else {
                alert("Gagal: " + result.pesan);
            }
        } catch (error) {
            alert("Koneksi gagal saat menyimpan laporan Sampah!");
        }
    };

    const hasilFilterGober = dataGober.filter((item) => {
        const teksCari = kataKunci.toLowerCase();
        return item.nama_petugas && item.nama_petugas.toLowerCase().includes(teksCari);
    });

    const hasilFilterSampah = dataSampah.filter((item) => {
        const teksCari = kataKunci.toLowerCase();
        return item.nama_petugas && item.nama_petugas.toLowerCase().includes(teksCari);
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

            // 1. Tambahkan baris teks TERLEBIH DAHULU agar tidak ada baris kosong yang melompat
            const row = worksheet.addRow({
                no: i + 1,
                tanggal: new Date(item.tanggal_kegiatan).toLocaleDateString('id-ID'),
                nama: item.nama_petugas,
                detail: tabAktif === 'Gober' ? item.lokasi : `${item.kategori_tugas} - RW ${item.data_rw}`,
                ukuran: tabAktif === 'Gober' ? item.panjang_meter : item.berat_kiloan,
                foto: '' 
            });

            // 2. Atur tinggi pada baris yang baru saja dibuat
            row.height = 130; 
            row.alignment = { vertical: 'middle' };

            // 3. Masukkan gambar dengan titik koordinat yang sejajar (Zero-based index)
            if (item.foto) {
                try {
                    const response = await fetch(`https://backend-one-ekbang-production.up.railway.app/uploads/${item.foto}`);
                    const arrayBuffer = await response.arrayBuffer();
                    const ekstensi = item.foto.split('.').pop().toLowerCase() === 'png' ? 'png' : 'jpeg';
                    
                    const imageId = workbook.addImage({
                        buffer: arrayBuffer,
                        extension: ekstensi,
                    });

                    worksheet.addImage(imageId, {
                        // i + 1 berarti mulai dari baris ke-2 (karena baris 1 adalah header)
                        tl: { col: 5.1, row: i + 1 + 0.1 }, 
                        ext: { width: 150, height: 150 } 
                    });
                } catch (error) {
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
                    {/* HEADER TABEL GOBER DENGAN PENCARIAN */}
                    <div className="header-tabel-kegiatan">
                        <h3>Riwayat Lapangan</h3>
                        <div className="search-kegiatan-group">
                            <label>Cari Nama Petugas:</label>
                            <input 
                                type="text" 
                                placeholder="Ketik nama petugas..." 
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
                                </tr>
                            </thead>
                            <tbody>
                                {hasilFilterGober.map((item) => (
                                    <tr key={item.id}>
                                        <td>{new Date(item.tanggal_kegiatan).toLocaleDateString('id-ID')}</td>
                                        <td>{item.nama_petugas}</td>
                                        <td>{item.lokasi}</td>
                                        <td>{item.panjang_meter}</td>
                                        <td>
                                            <a href={`https://backend-one-ekbang-production.up.railway.app/uploads/${item.foto}`} target="_blank" rel="noreferrer" className="btn-lihat">Lihat Foto</a>
                                        </td>
                                    </tr>
                                ))}
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
                            <label>Cari Nama Petugas:</label>
                            <input 
                                type="text" 
                                placeholder="Ketik nama petugas..." 
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
                                </tr>
                            </thead>
                            <tbody>
                                {hasilFilterSampah.map((item) => (
                                    <tr key={item.id}>
                                        <td>{new Date(item.tanggal_kegiatan).toLocaleDateString('id-ID')}</td>
                                        <td>{item.nama_petugas}</td>
                                        <td>{item.kategori_tugas}</td>
                                        <td>{item.data_rw}</td>
                                        <td>{item.berat_kiloan} Kg</td>
                                        <td>
                                            {item.foto ? (
                                                <a href={`https://backend-one-ekbang-production.up.railway.app/uploads/${item.foto}`} target="_blank" rel="noreferrer" className="btn-lihat">Lihat Bukti</a>
                                            ) : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

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
                                            {/* MENAMPILKAN GOBER, GORONG-GORONG, TAMAN */}
                                            {petugasList.filter(p => ['Gober', 'Gorong-gorong', 'Taman'].includes(p.kategori_petugas)).map(p => (
                                                <option key={p.id} value={p.id}>{p.nama_petugas} ({p.kategori_petugas})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Lokasi Pengerjaan</label>
                                        <input type="text" value={lokasi} onChange={(e) => setLokasi(e.target.value)} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Ukuran Panjang/Luas</label>
                                        <input type="text" value={panjangMeter} onChange={(e) => setPanjangMeter(e.target.value)} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Foto Kegiatan</label>
                                        <input type="file" accept="image/*" onChange={(e) => setFotoGober(e.target.files[0])} required />
                                    </div>
                                    <button type="submit" className="btn-simpan-kegiatan">Simpan Laporan</button>
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
                                            {petugasList.filter(p => ['Gaslah', 'Petugas Magot'].includes(p.kategori_petugas)).map(p => (
                                                <option key={p.id} value={p.id}>{p.nama_petugas}</option>
                                            ))}
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
                                        <input type="number" step="0.01" value={beratKiloan} onChange={(e) => setBeratKiloan(e.target.value)} required />
                                    </div>
                                    
                                    {/* INPUT FOTO UNTUK SAMPAH */}
                                    <div className="form-group">
                                        <label>Foto Bukti Timbangan</label>
                                        <input type="file" accept="image/*" onChange={(e) => setFotoSampah(e.target.files[0])} required />
                                    </div>

                                    <button type="submit" className="btn-simpan-kegiatan">Simpan Laporan Sampah</button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}