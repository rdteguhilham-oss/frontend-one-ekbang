import { useState, useEffect, useRef } from 'react';
import Calendar from 'react-calendar'; 
import 'react-calendar/dist/Calendar.css'; 
import Swal from 'sweetalert2';
import { 
    getKegiatanAgenda, 
    tambahKegiatanAgenda, 
    updateKegiatanAgenda,
    uploadFotoAgenda, 
    hapusKegiatanAgenda, 
    BASE_URL 
} from '../services/api';
import './AgendaKegiatan.css';

export default function AgendaKegiatan() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loadingSimpan, setLoadingSimpan] = useState(false);

    const [agendaList, setAgendaList] = useState([]);
    
    // State Kalender
    const [tanggalPilih, setTanggalPilih] = useState(new Date());
    const [modeTampilan, setModeTampilan] = useState('mendatang'); // 'mendatang' | 'riwayat' | 'kalender' 

    const [judul, setJudul] = useState('');
    const [kategori, setKategori] = useState('');
    const [tanggalWaktu, setTanggalWaktu] = useState('');
    const [waktuSelesai, setWaktuSelesai] = useState('');
    const [lokasi, setLokasi] = useState('');
    const [catatan, setCatatan] = useState('');
    const [foto, setFoto] = useState(null);
    const inputFotoRef = useRef(null);

    // State untuk Modal Edit Agenda
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editAgendaData, setEditAgendaData] = useState({
        id: '',
        judul_agenda: '',
        kategori_agenda: '',
        tanggal_waktu: '',
        waktu_selesai: '',
        lokasi: '',
        catatan_reminder: '',
        foto_dokumentasi: ''
    });
    const [editFoto, setEditFoto] = useState(null);
    const [loadingEdit, setLoadingEdit] = useState(false);

    const fetchAgenda = async () => {
        try {
            const data = await getKegiatanAgenda();
            setAgendaList(data);
        } catch {
            setAgendaList([]);
            Swal.fire({ title: 'Gagal Memuat Agenda', text: 'Koneksi ke server terputus.', icon: 'error' });
        }
    };

    useEffect(() => {
        fetchAgenda();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoadingSimpan(true);
        
        const formData = new FormData();
        formData.append('judul_agenda', judul);
        formData.append('kategori_agenda', kategori);
        formData.append('tanggal_waktu', tanggalWaktu);
        if (waktuSelesai) {
            formData.append('waktu_selesai', waktuSelesai);
        }
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
                
                setJudul(''); setKategori(''); setTanggalWaktu(''); setWaktuSelesai('');
                setLokasi(''); setCatatan(''); setFoto(null);
                if (inputFotoRef.current) inputFotoRef.current.value = '';

                setIsModalOpen(false);
            } else {
                Swal.fire("Gagal: " + result.pesan);
            }
        } catch {
            Swal.fire("Terjadi kesalahan saat menyimpan agenda (Server mati)!");
        } finally {
            setLoadingSimpan(false);
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
                } catch {
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
                } catch {
                    Swal.fire({ title: 'Error', text: "Terjadi kesalahan saat menghapus data.", icon: 'error' });
                }
            }
        });
    };

    // Helper konversi datetime string ke format input datetime-local (YYYY-MM-DDTHH:mm)
    const formatForDateTimeInput = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(typeof dateStr === 'string' && !dateStr.includes('T') ? dateStr.replace(' ', 'T') : dateStr);
        if (isNaN(d.getTime())) return '';
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const bukaModalEdit = (item) => {
        setEditAgendaData({
            id: item.id,
            judul_agenda: item.judul_agenda || '',
            kategori_agenda: item.kategori_agenda || '',
            tanggal_waktu: formatForDateTimeInput(item.tanggal_waktu),
            waktu_selesai: formatForDateTimeInput(item.waktu_selesai),
            lokasi: item.lokasi || '',
            catatan_reminder: item.catatan_reminder || '',
            foto_dokumentasi: item.foto_dokumentasi || ''
        });
        setEditFoto(null);
        setIsEditModalOpen(true);
    };

    const handleSimpanEdit = async (e) => {
        e.preventDefault();
        setLoadingEdit(true);

        const formData = new FormData();
        formData.append('judul_agenda', editAgendaData.judul_agenda);
        formData.append('kategori_agenda', editAgendaData.kategori_agenda);
        formData.append('tanggal_waktu', editAgendaData.tanggal_waktu);
        if (editAgendaData.waktu_selesai) {
            formData.append('waktu_selesai', editAgendaData.waktu_selesai);
        }
        formData.append('lokasi', editAgendaData.lokasi);
        formData.append('catatan_reminder', editAgendaData.catatan_reminder || '');
        if (editFoto) {
            formData.append('foto_dokumentasi', editFoto);
        }

        try {
            const result = await updateKegiatanAgenda(editAgendaData.id, formData);
            if (result.status === 'sukses') {
                Swal.fire({
                    title: 'Berhasil!',
                    text: result.pesan || 'Agenda kegiatan berhasil diperbarui.',
                    icon: 'success',
                    confirmButtonColor: '#3C50E0'
                });
                fetchAgenda();
                setIsEditModalOpen(false);
            } else {
                Swal.fire({ title: 'Gagal', text: result.pesan || 'Gagal memperbarui agenda.', icon: 'error' });
            }
        } catch {
            Swal.fire({ title: 'Error', text: 'Terjadi kesalahan saat memperbarui agenda kegiatan.', icon: 'error' });
        } finally {
            setLoadingEdit(false);
        }
    };

    // Helper parsing tanggal aman dari format MySQL atau ISO
    const parseTanggal = (str) => {
        if (!str) return null;
        const normalized = typeof str === 'string' && !str.includes('T') ? str.replace(' ', 'T') : str;
        return new Date(normalized);
    };

    // LOGIKA KALENDER: Memberi Titik Merah pada tanggal yg ada jadwal
    const berikanTandaKalender = ({ date, view }) => {
        if (view === 'month') {
            const adaAgenda = agendaList.find(item => {
                const tglAgenda = parseTanggal(item.tanggal_waktu);
                if (!tglAgenda || isNaN(tglAgenda.getTime())) return false;
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
        setModeTampilan('kalender'); 
    };

    // ── LOGIKA FILTER AGENDA (OPSI 1: HARI INI & MENDATANG SECARA DEFAULT) ──
    const startHariIni = new Date();
    startHariIni.setHours(0, 0, 0, 0);

    const isMendatang = (item) => {
        const tglMulai = parseTanggal(item.tanggal_waktu);
        if (!tglMulai || isNaN(tglMulai.getTime())) return false;
        const tglSelesai = parseTanggal(item.waktu_selesai);
        const tglAkhir = tglSelesai && !isNaN(tglSelesai.getTime()) ? tglSelesai : tglMulai;
        return tglAkhir >= startHariIni;
    };

    let dataDitampilkan;
    if (modeTampilan === 'kalender') {
        dataDitampilkan = agendaList.filter(item => {
            const tglAgenda = parseTanggal(item.tanggal_waktu);
            if (!tglAgenda || isNaN(tglAgenda.getTime())) return false;
            return tglAgenda.getDate() === tanggalPilih.getDate() &&
                   tglAgenda.getMonth() === tanggalPilih.getMonth() &&
                   tglAgenda.getFullYear() === tanggalPilih.getFullYear();
        }).sort((a, b) => parseTanggal(a.tanggal_waktu) - parseTanggal(b.tanggal_waktu));
    } else if (modeTampilan === 'riwayat') {
        dataDitampilkan = agendaList.filter(item => !isMendatang(item))
            .sort((a, b) => parseTanggal(b.tanggal_waktu) - parseTanggal(a.tanggal_waktu)); // Riwayat: urut dari yang paling baru
    } else {
        // Mode 'mendatang' (default): hanya hari ini dan masa depan
        dataDitampilkan = agendaList.filter(item => isMendatang(item))
            .sort((a, b) => parseTanggal(a.tanggal_waktu) - parseTanggal(b.tanggal_waktu));
    }

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
                        <div className="header-agenda-left">
                            <h3>
                                {modeTampilan === 'kalender' 
                                    ? `Jadwal Tanggal: ${tanggalPilih.toLocaleDateString('id-ID')}`
                                    : modeTampilan === 'riwayat'
                                        ? "Riwayat Kegiatan (Selesai)"
                                        : "Semua Jadwal Mendatang"
                                }
                            </h3>
                            <span className="badge-total-agenda">
                                {dataDitampilkan.length} kegiatan
                            </span>
                        </div>
                        <div className="filter-agenda-tabs">
                            <button 
                                type="button"
                                className={`btn-filter-agenda ${modeTampilan === 'mendatang' ? 'active' : ''}`}
                                onClick={() => setModeTampilan('mendatang')}
                            >
                                📅 Jadwal Mendatang
                            </button>
                            <button 
                                type="button"
                                className={`btn-filter-agenda ${modeTampilan === 'riwayat' ? 'active' : ''}`}
                                onClick={() => setModeTampilan('riwayat')}
                            >
                                📋 Riwayat Selesai
                            </button>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="tabel-utama">
                            <thead>
                                <tr>
                                    <th>Waktu</th>
                                    <th>Agenda Kegiatan</th>
                                    <th>Catatan</th>
                                    <th>Dokumentasi</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dataDitampilkan.length > 0 ? (
                                    dataDitampilkan.map((item) => {
                                        const tglMulai = parseTanggal(item.tanggal_waktu);
                                        const tglSelesai = item.waktu_selesai ? parseTanggal(item.waktu_selesai) : null;
                                        const bedaHari = tglSelesai && (tglMulai.toDateString() !== tglSelesai.toDateString());

                                        let rentangWaktu = `${tglMulai.toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})} WIB`;
                                        if (tglSelesai) {
                                            if (bedaHari) {
                                                rentangWaktu = `${tglMulai.toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})} s/d ${tglSelesai.toLocaleDateString('id-ID')} ${tglSelesai.toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})} WIB`;
                                            } else {
                                                rentangWaktu = `${tglMulai.toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})} – ${tglSelesai.toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})} WIB`;
                                            }
                                        }

                                        return (
                                            <tr key={item.id}>
                                                <td>
                                                    <strong>{tglMulai.toLocaleDateString('id-ID')}</strong><br/>
                                                    <small style={{color: 'var(--text-redup)'}}>{rentangWaktu}</small>
                                                </td>
                                                <td>
                                                    <div className="agenda-info-cell">
                                                        <span className="badge-kategori">{item.kategori_agenda}</span>
                                                        <strong className="agenda-judul">{item.judul_agenda}</strong>
                                                        <small className="agenda-lokasi">📍 {item.lokasi}</small>
                                                    </div>
                                                </td>
                                                <td>{item.catatan_reminder || '-'}</td>
                                                <td>
                                                    {item.foto_dokumentasi ? (
                                                        <a href={item.foto_dokumentasi.startsWith('http') ? item.foto_dokumentasi : `${BASE_URL}/uploads/${item.foto_dokumentasi}`} target="_blank" rel="noreferrer" className="link-foto">Lihat Foto</a>
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
                                                <td style={{ verticalAlign: 'middle' }}>
                                                    <div className="grup-aksi-agenda">
                                                        <button className="btn-edit-agenda" onClick={() => bukaModalEdit(item)} title="Edit Agenda">
                                                            ✏️ Edit
                                                        </button>
                                                        <button className="btn-hapus-agenda" onClick={() => hapusAgenda(item.id)} title="Hapus Agenda">
                                                            🗑️ Hapus
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" style={{textAlign: 'center', padding: '35px 15px', color: 'var(--text-redup)'}}>
                                            {modeTampilan === 'kalender' 
                                                ? `Tidak ada jadwal kegiatan pada tanggal ${tanggalPilih.toLocaleDateString('id-ID')}.`
                                                : modeTampilan === 'riwayat'
                                                    ? 'Belum ada riwayat agenda yang selesai.'
                                                    : 'Tidak ada jadwal kegiatan mendatang.'
                                            }
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* MODAL INPUT AGENDA BARU */}
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
                                <label>Waktu Mulai</label>
                                <input type="datetime-local" value={tanggalWaktu} onChange={(e) => setTanggalWaktu(e.target.value)} required />
                            </div>

                            <div className="form-group">
                                <label>Waktu Selesai (Opsional)</label>
                                <input type="datetime-local" value={waktuSelesai} onChange={(e) => setWaktuSelesai(e.target.value)} />
                            </div>

                            <div className="form-group catatan-full">
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
                                <input ref={inputFotoRef} type="file" accept="image/*" onChange={(e) => setFoto(e.target.files[0])} />
                            </div>

                            <button type="submit" className="btn-simpan-agenda" disabled={loadingSimpan} style={loadingSimpan ? { opacity: 0.7, cursor: 'not-allowed' } : {}}>{loadingSimpan ? '⏳ Menyimpan Jadwal...' : 'Simpan Jadwal Kegiatan'}</button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL EDIT AGENDA */}
            {isEditModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="btn-tutup-modal" onClick={() => setIsEditModalOpen(false)}>X</button>
                        
                        <h3 style={{ marginTop: '0', marginBottom: '20px' }}>Edit Agenda Kegiatan</h3>
                        
                        <form onSubmit={handleSimpanEdit} className="agenda-form">
                            <div className="form-group">
                                <label>Judul Agenda</label>
                                <input 
                                    type="text" 
                                    value={editAgendaData.judul_agenda} 
                                    onChange={(e) => setEditAgendaData({ ...editAgendaData, judul_agenda: e.target.value })} 
                                    required 
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Kategori Agenda</label>
                                <select 
                                    value={editAgendaData.kategori_agenda} 
                                    onChange={(e) => setEditAgendaData({ ...editAgendaData, kategori_agenda: e.target.value })} 
                                    required
                                >
                                    <option value="">-- Pilih Kategori --</option>
                                    <option value="Jadwal Monitoring">Jadwal Monitoring</option>
                                    <option value="Jadwal Rapat">Jadwal Rapat</option>
                                    <option value="Jadwal Musrenbang">Jadwal Musrenbang</option>
                                    <option value="Agenda Lapangan">Agenda Lapangan</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Waktu Mulai</label>
                                <input 
                                    type="datetime-local" 
                                    value={editAgendaData.tanggal_waktu} 
                                    onChange={(e) => setEditAgendaData({ ...editAgendaData, tanggal_waktu: e.target.value })} 
                                    required 
                                />
                            </div>

                            <div className="form-group">
                                <label>Waktu Selesai (Opsional)</label>
                                <input 
                                    type="datetime-local" 
                                    value={editAgendaData.waktu_selesai} 
                                    onChange={(e) => setEditAgendaData({ ...editAgendaData, waktu_selesai: e.target.value })} 
                                />
                            </div>

                            <div className="form-group catatan-full">
                                <label>Lokasi Kegiatan</label>
                                <input 
                                    type="text" 
                                    value={editAgendaData.lokasi} 
                                    onChange={(e) => setEditAgendaData({ ...editAgendaData, lokasi: e.target.value })} 
                                    required 
                                />
                            </div>

                            <div className="form-group catatan-full">
                                <label>Catatan / Reminder Kegiatan</label>
                                <textarea 
                                    rows="3" 
                                    value={editAgendaData.catatan_reminder} 
                                    onChange={(e) => setEditAgendaData({ ...editAgendaData, catatan_reminder: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="form-group catatan-full">
                                <label>Ganti Bukti Dokumentasi (Opsional)</label>
                                <input type="file" accept="image/*" onChange={(e) => setEditFoto(e.target.files[0])} />
                                {editAgendaData.foto_dokumentasi && (
                                    <small style={{ marginTop: '5px', color: 'var(--text-redup)', fontSize: '12px' }}>
                                        Foto dokumentasi tersimpan di server. Pilih file baru jika ingin mengganti.
                                    </small>
                                )}
                            </div>

                            <div className="modal-edit-agenda-actions">
                                <button type="button" className="btn-batal-agenda" onClick={() => setIsEditModalOpen(false)}>
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn-simpan-edit-agenda" 
                                    disabled={loadingEdit}
                                    style={loadingEdit ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
                                >
                                    {loadingEdit ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}