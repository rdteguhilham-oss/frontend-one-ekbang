import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar'; 
import 'react-calendar/dist/Calendar.css'; 
import Swal from 'sweetalert2';
import { getKegiatanAgenda, tambahKegiatanAgenda, uploadFotoAgenda, hapusKegiatanAgenda } from '../services/api';
import './AgendaKegiatan.css';

export default function AgendaKegiatan() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [agendaList, setAgendaList] = useState([]);
    
    // State baru untuk Kalender
    const [tanggalPilih, setTanggalPilih] = useState(new Date());
    const [modeLihatSemua, setModeLihatSemua] = useState(true); 

    const [judul, setJudul] = useState('');
    const [kategori, setKategori] = useState('');
    const [tanggalWaktu, setTanggalWaktu] = useState('');
    const [lokasi, setLokasi] = useState('');
    const [catatan, setCatatan] = useState('');
    const [foto, setFoto] = useState(null);

    const fetchAgenda = async () => {
        try {
            const data = await getKegiatanAgenda();
            setAgendaList(data);
        } catch (error) {
            console.error("Gagal menarik data agenda:", error);
            setAgendaList([]);
        }
    };

    useEffect(() => {
        fetchAgenda();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('judul_agenda', judul);
        formData.append('kategori_agenda', kategori);
        formData.append('tanggal_waktu', tanggalWaktu);
        formData.append('lokasi', lokasi);
        formData.append('catatan_reminder', catatan);
        
        if (foto) {
            formData.append('foto_dokumentasi', foto);
        }

        try {
            const result = await tambahKegiatanAgenda(formData);
            if (result.status === 'sukses') {
                Swal.fire(result.pesan);
                fetchAgenda(); 
                
                setJudul(''); setKategori(''); setTanggalWaktu(''); 
                setLokasi(''); setCatatan(''); setFoto(null);
                document.getElementById('inputFotoAgenda').value = '';

                setIsModalOpen(false);
            } else {
                Swal.fire("Gagal: " + result.pesan);
            }
        } catch (error) {
            Swal.fire("Terjadi kesalahan saat menyimpan agenda (Server mati)!");
        }
    };

    const handleUploadSusulan = async (id, file) => {
        if (!file) return; 

        Swal.fire({
            title: 'Unggah Dokumentasi?',
            text: "Yakin ingin mengunggah foto ini sebagai dokumentasi?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3C50E0',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, Unggah!',
            cancelButtonText: 'Batal'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const formData = new FormData();
                formData.append('foto_dokumentasi', file);

                try {
                    const resultApi = await uploadFotoAgenda(id, formData);
                    if (resultApi.status === 'sukses') {
                        Swal.fire({ title: 'Berhasil!', text: resultApi.pesan, icon: 'success', confirmButtonColor: '#3C50E0' });
                        fetchAgenda(); 
                    } else {
                        Swal.fire({ title: 'Gagal!', text: resultApi.pesan, icon: 'error' });
                    }
                } catch (error) {
                    Swal.fire({ title: 'Error', text: "Terjadi kesalahan saat mengunggah foto!", icon: 'error' });
                }
            }
        });
    };

    const hapusAgenda = async (id) => {
        Swal.fire({
            title: 'Hapus Agenda?',
            text: "Yakin ingin membatalkan dan menghapus agenda ini?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const resultApi = await hapusKegiatanAgenda(id);
                    if (resultApi.status === 'sukses') {
                        Swal.fire({ title: 'Terhapus!', text: resultApi.pesan, icon: 'success', confirmButtonColor: '#3C50E0' });
                        fetchAgenda(); 
                    } else {
                        Swal.fire({ title: 'Gagal!', text: resultApi.pesan, icon: 'error' });
                    }
                } catch (error) {
                    Swal.fire({ title: 'Error', text: "Terjadi kesalahan saat menghapus data.", icon: 'error' });
                }
            }
        });
    };

    // LOGIKA KALENDER: Memberi Titik Merah pada tanggal yg ada jadwal
    const berikanTandaKalender = ({ date, view }) => {
        if (view === 'month') {
            const adaAgenda = agendaList.find(item => {
                const tglAgenda = new Date(item.tanggal_waktu);
                return tglAgenda.getDate() === date.getDate() &&
                       tglAgenda.getMonth() === date.getMonth() &&
                       tglAgenda.getFullYear() === date.getFullYear();
            });
            if (adaAgenda) {
                return <div className="titik-agenda"></div>;
            }
        }
        return null;
    };

    // Aksi saat tanggal di kalender di klik
    const klikTanggal = (value) => {
        setTanggalPilih(value);
        setModeLihatSemua(false); 
    };

    // Filter data tabel berdasarkan klik kalender
    const dataDitampilkan = modeLihatSemua ? agendaList : agendaList.filter(item => {
            const tglAgenda = new Date(item.tanggal_waktu);
            return tglAgenda.getDate() === tanggalPilih.getDate() &&
                   tglAgenda.getMonth() === tanggalPilih.getMonth() &&
                   tglAgenda.getFullYear() === tanggalPilih.getFullYear();
        });

    return (
        <div className="agenda-container">
            <h2>Sistem Penjadwalan & Agenda Kegiatan Ekbang</h2>
            
            <button className="btn-tambah-utama" onClick={() => setIsModalOpen(true)}>
                + Buat Agenda Baru
            </button>

            {/* LAYOUT GRID: KALENDER KIRI, TABEL KANAN */}
            <div className="kalender-layout">
                
                {/* BAGIAN KIRI: KALENDER */}
                <div className="kalender-card">
                    <h3>Kalender Agenda</h3>
                    <Calendar 
                        onChange={klikTanggal} 
                        value={tanggalPilih}
                        tileContent={berikanTandaKalender}
                        className="kalender-kustom"
                    />
                    <div className="info-kalender">
                        <span className="titik-contoh"></span> 
                        <small>Tanggal dengan titik memiliki jadwal kegiatan.</small>
                    </div>
                </div>

                {/* BAGIAN KANAN: TABEL JADWAL */}
                <div className="agenda-card">
                    <div className="header-tabel-agenda">
                        <h3>
                            {modeLihatSemua 
                                ? "Semua Jadwal Mendatang" 
                                : `Jadwal Tanggal: ${tanggalPilih.toLocaleDateString('id-ID')}`
                            }
                        </h3>
                        {!modeLihatSemua && (
                            <button className="btn-lihat-semua" onClick={() => setModeLihatSemua(true)}>
                                Tampilkan Semua
                            </button>
                        )}
                    </div>

                    <div className="table-responsive">
                        <table className="tabel-utama">
                            <thead>
                                <tr>
                                    <th>Waktu</th>
                                    <th>Kategori</th>
                                    <th>Judul & Lokasi</th>
                                    <th>Catatan</th>
                                    <th>Dokumentasi</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dataDitampilkan.length > 0 ? (
                                    dataDitampilkan.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                <strong>{new Date(item.tanggal_waktu).toLocaleDateString('id-ID')}</strong><br/>
                                                <small style={{color: 'var(--text-redup)'}}>{new Date(item.tanggal_waktu).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})} WIB</small>
                                            </td>
                                            <td><span className="badge-kategori">{item.kategori_agenda}</span></td>
                                            <td>
                                                <strong>{item.judul_agenda}</strong><br/>
                                                <small style={{color: 'var(--text-redup)'}}>📍 {item.lokasi}</small>
                                            </td>
                                            <td>{item.catatan_reminder || '-'}</td>
                                            <td>
                                                {item.foto_dokumentasi ? (
                                                    <a href={`https://backend-one-ekbang-production.up.railway.app/uploads/${item.foto_dokumentasi}`} target="_blank" rel="noreferrer" className="link-foto">Lihat Foto</a>
                                                ) : (
                                                    <label className="btn-upload-susulan">
                                                        📷 Upload Bukti
                                                        <input 
                                                            type="file" 
                                                            accept="image/*" 
                                                            style={{ display: 'none' }} 
                                                            onChange={(e) => handleUploadSusulan(item.id, e.target.files[0])} 
                                                        />
                                                    </label>
                                                )}
                                            </td>
                                            <td>
                                                <button className="btn-hapus-agenda" onClick={() => hapusAgenda(item.id)}>
                                                    Hapus
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" style={{textAlign: 'center', padding: '30px 0'}}>
                                            Tidak ada jadwal kegiatan pada tanggal ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* MODAL INPUT TETAP SAMA */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="btn-tutup-modal" onClick={() => setIsModalOpen(false)}>X</button>
                        
                        <h3 style={{ marginTop: '0', marginBottom: '20px' }}>Buat Agenda Baru</h3>
                        
                        <form onSubmit={handleSubmit} className="agenda-form">
                            <div className="form-group">
                                <label>Judul Agenda</label>
                                <input type="text" placeholder="Contoh: Rapat Mingguan" value={judul} onChange={(e) => setJudul(e.target.value)} required />
                            </div>
                            
                            <div className="form-group">
                                <label>Kategori Agenda</label>
                                <select value={kategori} onChange={(e) => setKategori(e.target.value)} required>
                                    <option value="">-- Pilih Kategori --</option>
                                    <option value="Jadwal Monitoring">Jadwal Monitoring</option>
                                    <option value="Jadwal Rapat">Jadwal Rapat</option>
                                    <option value="Jadwal Musrenbang">Jadwal Musrenbang</option>
                                    <option value="Agenda Lapangan">Agenda Lapangan</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Tanggal & Waktu</label>
                                <input type="datetime-local" value={tanggalWaktu} onChange={(e) => setTanggalWaktu(e.target.value)} required />
                            </div>

                            <div className="form-group">
                                <label>Lokasi Kegiatan</label>
                                <input type="text" placeholder="Contoh: Aula Kelurahan" value={lokasi} onChange={(e) => setLokasi(e.target.value)} required />
                            </div>

                            <div className="form-group catatan-full">
                                <label>Catatan / Reminder Kegiatan</label>
                                <textarea placeholder="Tulis rincian acara atau hal yang perlu disiapkan..." rows="3" value={catatan} onChange={(e) => setCatatan(e.target.value)}></textarea>
                            </div>

                            <div className="form-group catatan-full">
                                <label>Lampirkan Dokumentasi (Opsional - Jika acara sudah selesai)</label>
                                <small style={{ color: '#ef4444', marginTop: '6px', display: 'block', fontWeight: 'bold' }}>
                                    *Ukuran file maksimal 5 MB
                                </small>
                                <input id="inputFotoAgenda" type="file" accept="image/*" onChange={(e) => setFoto(e.target.files[0])} />
                            </div>

                            <button type="submit" className="btn-simpan-agenda">Simpan Jadwal Kegiatan</button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}