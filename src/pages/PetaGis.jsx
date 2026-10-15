import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { getTitikPeta, hapusTitikPeta, tambahTitikPeta, updateTitikPeta, updateStatusPeta, BASE_URL } from '../services/api'; 
import Swal from 'sweetalert2';
import 'leaflet/dist/leaflet.css'; 
import './PetaGis.css'; 

export default function PetaGIS() {
    const posisiTengah = [-6.891226, 107.601757]; 

    const [dataTitik, setDataTitik] = useState([]);
    const [loadingSimpan, setLoadingSimpan] = useState(false);
    
    // State Default
    const [kategori, setKategori] = useState('');
    const [namaLokasi, setNamaLokasi] = useState('');
    const [alamat, setAlamat] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [foto, setFoto] = useState(null);
    const inputFotoRef = useRef(null);

    // State Tambahan Dinamis
    const [ketua, setKetua] = useState('');
    const [luasLahan, setLuasLahan] = useState('');
    const [dataRw, setDataRw] = useState('');
    const [statusProgres, setStatusProgres] = useState('');
    const [jenisOrganik, setJenisOrganik] = useState('');

    // State untuk Modal Edit Titik
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editTitikData, setEditTitikData] = useState({
        id: '',
        kategori: '',
        namaLokasi: '',
        alamat: '',
        latitude: '',
        longitude: '',
        ketua: '',
        luasLahan: '',
        dataRw: '',
        statusProgres: '',
        jenisOrganik: '',
        foto_url: ''
    });
    const [editFoto, setEditFoto] = useState(null);
    const [loadingEdit, setLoadingEdit] = useState(false);

    // Array kategori yang diizinkan untuk di-update statusnya
    const kategoriBisaUpdate = ['RUTILAHU', 'POHON TUMBANG', 'INFRASTRUKTUR UMUM'];

    const fetchDataPeta = async () => {
        try {
            const hasil = await getTitikPeta();
            setDataTitik(hasil);
        } catch {
            Swal.fire({ title: 'Gagal Memuat Peta', text: 'Koneksi ke server terputus.', icon: 'error' });
        }
    };

    useEffect(() => {
        fetchDataPeta();
    }, []);

    const handleSimpan = async (e) => {
        e.preventDefault();
        setLoadingSimpan(true);
        
        const formData = new FormData();
        const kategoriFinal = kategori === 'PENGOLAHAN SAMPAH ORGANIK' 
            ? `SAMPAH ORGANIK (${jenisOrganik})` 
            : kategori;

        formData.append('kategori_lokasi', kategoriFinal);
        formData.append('nama_lokasi', namaLokasi);
        formData.append('alamat', alamat);
        formData.append('latitude', latitude);
        formData.append('longitude', longitude);
        if (foto) formData.append('foto_url', foto);

        if (kategori === 'BURUAN SAE') {
            formData.append('ketua', ketua);
            formData.append('luas_lahan', luasLahan);
        } else if (kategori === 'KBS') {
            formData.append('data_rw', dataRw);
        } else if (kategoriBisaUpdate.includes(kategori)) {
            formData.append('status', statusProgres);
        }

        try {
            const result = await tambahTitikPeta(formData);
            if (result.status === 'sukses') {
                Swal.fire({ title: 'Berhasil!', text: result.pesan, icon: 'success', confirmButtonColor: '#3C50E0' });
                fetchDataPeta(); 
                
                setKategori(''); setNamaLokasi(''); setAlamat('');
                setLatitude(''); setLongitude(''); setFoto(null);
                setKetua(''); setLuasLahan(''); setDataRw('');
                setStatusProgres(''); setJenisOrganik('');
                if (inputFotoRef.current) inputFotoRef.current.value = '';
            } else {
                Swal.fire({ title: 'Gagal!', text: result.pesan, icon: 'error' });
            }
        } catch {
            Swal.fire({ title: 'Error!', text: 'Kesalahan server saat menyimpan titik!', icon: 'error' });
        } finally {
            setLoadingSimpan(false);
        }
    };

    const handleHapusId = async (id) => {
        Swal.fire({
            title: 'Hapus Titik Peta?',
            text: 'Yakin menghapus titik pada peta?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const resultApi = await hapusTitikPeta(id);
                    if (resultApi.status === "sukses") {
                        Swal.fire({ title: 'Terhapus!', text: resultApi.pesan, icon: 'success', confirmButtonColor: '#3C50E0' });
                        fetchDataPeta();
                    } else {
                        Swal.fire({ title: 'Gagal!', text: resultApi.pesan, icon: 'error' });
                    }
                } catch {
                    Swal.fire({ title: 'Error', text: 'Kesalahan saat menghapus titik pada peta!', icon: 'error' });
                }
            }
        });
    };

    const handleUpdateStatusPopup = async (idTitik, statusBaru) => {
        Swal.fire({
            title: 'Perbarui Status Progres?',
            text: `Ubah status lokasi ini menjadi "${statusBaru}"?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3C50E0',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, Perbarui!',
            cancelButtonText: 'Batal'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await updateStatusPeta(idTitik, statusBaru);
                    Swal.fire({ title: 'Berhasil!', text: 'Status lokasi berhasil diperbarui!', icon: 'success', confirmButtonColor: '#3C50E0' });
                    fetchDataPeta(); 
                } catch {
                    Swal.fire({ title: 'Gagal', text: "Gagal mengubah status peta.", icon: 'error' });
                }
            }
        });
    };

    const bukaModalEdit = (titik) => {
        let katUtama = titik.kategori_lokasi || '';
        let subOrganik = '';
        if (katUtama.startsWith('SAMPAH ORGANIK (')) {
            subOrganik = katUtama.replace('SAMPAH ORGANIK (', '').replace(')', '');
            katUtama = 'PENGOLAHAN SAMPAH ORGANIK';
        }

        setEditTitikData({
            id: titik.id,
            kategori: katUtama,
            namaLokasi: titik.nama_lokasi || '',
            alamat: titik.alamat || '',
            latitude: titik.latitude || '',
            longitude: titik.longitude || '',
            ketua: titik.ketua || '',
            luasLahan: titik.luas_lahan || '',
            dataRw: titik.data_rw || '',
            statusProgres: titik.status || '',
            jenisOrganik: subOrganik,
            foto_url: titik.foto_url || ''
        });
        setEditFoto(null);
        setIsEditModalOpen(true);
    };

    const handleSimpanEdit = async (e) => {
        e.preventDefault();
        setLoadingEdit(true);

        const formData = new FormData();
        const kategoriFinal = editTitikData.kategori === 'PENGOLAHAN SAMPAH ORGANIK' 
            ? `SAMPAH ORGANIK (${editTitikData.jenisOrganik || 'Komposter'})` 
            : editTitikData.kategori;

        formData.append('kategori_lokasi', kategoriFinal);
        formData.append('nama_lokasi', editTitikData.namaLokasi);
        formData.append('alamat', editTitikData.alamat);
        formData.append('latitude', editTitikData.latitude);
        formData.append('longitude', editTitikData.longitude);
        if (editFoto) formData.append('foto_url', editFoto);

        if (editTitikData.kategori === 'BURUAN SAE') {
            formData.append('ketua', editTitikData.ketua || '');
            formData.append('luas_lahan', editTitikData.luasLahan || '');
        } else if (editTitikData.kategori === 'KBS') {
            formData.append('data_rw', editTitikData.dataRw || '');
        } else if (kategoriBisaUpdate.includes(editTitikData.kategori)) {
            formData.append('status', editTitikData.statusProgres || '');
        }

        try {
            const result = await updateTitikPeta(editTitikData.id, formData);
            if (result.status === 'sukses') {
                Swal.fire({ title: 'Berhasil!', text: result.pesan || 'Data titik peta berhasil diperbarui.', icon: 'success', confirmButtonColor: '#3C50E0' });
                fetchDataPeta();
                setIsEditModalOpen(false);
            } else {
                Swal.fire({ title: 'Gagal!', text: result.pesan || 'Gagal memperbarui titik peta.', icon: 'error' });
            }
        } catch {
            Swal.fire({ title: 'Error!', text: 'Kesalahan server saat memperbarui titik peta!', icon: 'error' });
        } finally {
            setLoadingEdit(false);
        }
    };

    return (
        <div className="peta-container">
            <div className="header-peta">
                <h2>Peta Interaktif GIS (Modul Pemetaan Ekbang)</h2>
                <p>Sistem Informasi Geografis sebaran titik infrastruktur dan pengelolaan wilayah.</p>
            </div>

            <div className="peta-layout">
                <div className="form-peta-card">
                    <h3 className="judul-form-peta">Tambah Titik Baru</h3>
                    <form onSubmit={handleSimpan}>
                        
                        <div className="form-group-peta">
                            <label>Kategori Lokasi</label>
                            <select value={kategori} onChange={(e) => setKategori(e.target.value)} required>
                                <option value="">-- Pilih Kategori Peta --</option>
                                <option value="RUTILAHU">RUTILAHU</option>
                                <option value="BURUAN SAE">BURUAN SAE</option>
                                <option value="KBS">KBS (Kawasan Bebas Sampah)</option>
                                <option value="PENGOLAHAN SAMPAH ORGANIK">PENGOLAHAN SAMPAH ORGANIK</option>
                                <option value="BANK SAMPAH">BANK SAMPAH (Anorganik)</option>
                                <option value="POHON TUMBANG">POHON TUMBANG</option>
                                <option value="INFRASTRUKTUR UMUM">INFRASTRUKTUR UMUM (Jalan/Gorong/Fasum)</option>
                            </select>
                        </div>

                        {/* FORM DINAMIS */}
                        {kategoriBisaUpdate.includes(kategori) && (
                            <div className="form-group-peta">
                                <label>Status Penanganan Awal</label>
                                <select value={statusProgres} onChange={(e) => setStatusProgres(e.target.value)} required>
                                    <option value="">-- Pilih Status --</option>
                                    <option value="Pengajuan">Pengajuan Baru</option>
                                    <option value="Sedang Diproses">Sedang Diproses / Dikerjakan</option>
                                    <option value="Selesai Ditangani">Selesai Ditangani</option>
                                </select>
                            </div>
                        )}

                        {kategori === 'BURUAN SAE' && (
                            <>
                                <div className="form-group-peta">
                                    <label>Nama Ketua Kelompok</label>
                                    <input type="text" placeholder="Contoh: Bpk. Jajang" value={ketua} onChange={(e) => setKetua(e.target.value)} required />
                                </div>
                                <div className="form-group-peta">
                                    <label>Luas Lahan</label>
                                    <input type="text" placeholder="Contoh: 150 m2" value={luasLahan} onChange={(e) => setLuasLahan(e.target.value)} required />
                                </div>
                            </>
                        )}

                        {kategori === 'KBS' && (
                            <div className="form-group-peta">
                                <label>Data RW</label>
                                <input type="text" placeholder="Contoh: RW 05" value={dataRw} onChange={(e) => setDataRw(e.target.value)} required />
                            </div>
                        )}

                        {kategori === 'PENGOLAHAN SAMPAH ORGANIK' && (
                            <div className="form-group-peta">
                                <label>Sub-Kategori Organik</label>
                                <select value={jenisOrganik} onChange={(e) => setJenisOrganik(e.target.value)} required>
                                    <option value="">-- Pilih Pengolahan --</option>
                                    <option value="Loseda">Loseda</option>
                                    <option value="Maggot">Maggot</option>
                                    <option value="Gaslah">Gaslah</option>
                                    <option value="RDF">RDF</option>
                                </select>
                            </div>
                        )}

                        <div className="form-group-peta">
                            <label>Nama Penerima / Titik Lokasi</label>
                            <input type="text" placeholder="Contoh: Bpk. Asep / Bank Sampah RW 02" value={namaLokasi} onChange={(e) => setNamaLokasi(e.target.value)} required />
                        </div>
                        <div className="form-group-peta">
                            <label>Alamat Lengkap</label>
                            <input type="text" placeholder="Contoh: Kp. Baru RT 01/RW 02" value={alamat} onChange={(e) => setAlamat(e.target.value)} required />
                        </div>
                        <div className="form-group-peta">
                            <label>Garis Lintang (Latitude)</label>
                            <input type="number" step="any" placeholder="Contoh: -6.9643" value={latitude} onChange={(e) => setLatitude(e.target.value)} required />
                        </div>
                        <div className="form-group-peta">
                            <label>Garis Bujur (Longitude)</label>
                            <input type="number" step="any" placeholder="Contoh: 107.7569" value={longitude} onChange={(e) => setLongitude(e.target.value)} required />
                        </div>
                        <div className="form-group-peta">
                            <label>Foto Lokasi / Dokumentasi</label>
                            <small className="teks-peringatan-peta">*Ukuran file maksimal 5 MB</small>
                            <input ref={inputFotoRef} type="file" accept="image/*" onChange={(e) => setFoto(e.target.files[0])} required />
                        </div>
                        <button type="submit" className="btn-simpan-titik" disabled={loadingSimpan} style={loadingSimpan ? { opacity: 0.7, cursor: 'not-allowed' } : {}}>{loadingSimpan ? '⏳ Menanam Pin...' : 'Tanam Pin di Peta'}</button>
                    </form>
                </div>

                <div className="kartu-peta">
                    <MapContainer center={posisiTengah} zoom={14} scrollWheelZoom={true} className="wadah-peta">
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        
                        {dataTitik.map((titik) => (
                            <Marker key={titik.id} position={[titik.latitude, titik.longitude]}>
                                <Popup>
                                    <span className="badge-popup">{titik.kategori_lokasi}</span><br/>
                                    <strong className="teks-utama-peta">{titik.nama_lokasi}</strong><br/>
                                    <small className="teks-redup-peta">{titik.alamat}</small>
                                    
                                    {/* INFO DINAMIS */}
                                    <div className="wadah-info-dinamis">
                                        {titik.ketua && (
                                            <div className="baris-info-peta"><strong>Ketua:</strong> {titik.ketua}</div>
                                        )}
                                        {titik.luas_lahan && (
                                            <div className="baris-info-peta"><strong>Luas Lahan:</strong> {titik.luas_lahan}</div>
                                        )}
                                        {titik.data_rw && (
                                            <div className="baris-info-peta"><strong>Data RW:</strong> {titik.data_rw}</div>
                                        )}
                                        
                                        {/* DROPDOWN UPDATE STATUS UNTUK 3 KATEGORI */}
                                        {kategoriBisaUpdate.includes(titik.kategori_lokasi) ? (
                                            <div className="container-status-peta">
                                                <strong className="label-status-peta">Status: {titik.status}</strong>
                                                <select 
                                                    className="select-status-peta"
                                                    onChange={(e) => handleUpdateStatusPopup(titik.id, e.target.value)}
                                                    defaultValue=""
                                                >
                                                    <option value="" disabled>-- Perbarui Status --</option>
                                                    <option value="Pengajuan">Pengajuan Baru</option>
                                                    <option value="Sedang Diproses">Sedang Diproses</option>
                                                    <option value="Selesai Ditangani">Selesai Ditangani</option>
                                                </select>
                                            </div>
                                        ) : (
                                            titik.status && (<div className="baris-info-peta"><strong>Status:</strong> {titik.status}</div>)
                                        )}
                                    </div>

                                    {titik.foto_url && (
                                        <a href={titik.foto_url.startsWith('http') ? titik.foto_url : `${BASE_URL}/uploads/${titik.foto_url}`} target="_blank" rel="noreferrer" className="link-foto-peta">
                                            Lihat Foto Lokasi
                                        </a>
                                    )}
                                    <div className="aksi-popup-peta">
                                        <button className="btn-edit-peta" onClick={() => bukaModalEdit(titik)}>
                                            ✏️ Edit
                                        </button>
                                        <button className="btn-hapus-peta" onClick={() => handleHapusId(titik.id)} title="Hapus Titik Lokasi">
                                            🗑️ Hapus
                                        </button>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>

            </div>

            {/* MODAL EDIT TITIK PETA */}
            {isEditModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                        <button className="btn-tutup-modal" onClick={() => setIsEditModalOpen(false)}>X</button>
                        <h3 style={{ marginTop: '0', marginBottom: '20px' }}>Edit Titik Lokasi Peta</h3>
                        
                        <form onSubmit={handleSimpanEdit} className="peta-edit-form">
                            <div className="form-group-peta">
                                <label>Kategori Lokasi</label>
                                <select 
                                    value={editTitikData.kategori} 
                                    onChange={(e) => setEditTitikData({ ...editTitikData, kategori: e.target.value })} 
                                    required
                                >
                                    <option value="">-- Pilih Kategori Peta --</option>
                                    <option value="RUTILAHU">RUTILAHU</option>
                                    <option value="BURUAN SAE">BURUAN SAE</option>
                                    <option value="KBS">KBS (Kawasan Bebas Sampah)</option>
                                    <option value="POHON TUMBANG">Titik Pohon Tumbang</option>
                                    <option value="PENGOLAHAN SAMPAH ORGANIK">Pengolahan Sampah Organik</option>
                                    <option value="INFRASTRUKTUR UMUM">Infrastruktur Umum Lainnya</option>
                                </select>
                            </div>

                            {editTitikData.kategori === 'PENGOLAHAN SAMPAH ORGANIK' && (
                                <div className="form-group-peta form-dinamis-animasi">
                                    <label>Pilih Jenis Pengolahan Organik</label>
                                    <select 
                                        value={editTitikData.jenisOrganik} 
                                        onChange={(e) => setEditTitikData({ ...editTitikData, jenisOrganik: e.target.value })} 
                                        required
                                    >
                                        <option value="">-- Pilih Jenis --</option>
                                        <option value="Komposter">Komposter</option>
                                        <option value="Biopori">Biopori</option>
                                        <option value="Losida">Losida</option>
                                        <option value="Loseda">Loseda</option>
                                        <option value="Bakti">Bakti</option>
                                    </select>
                                </div>
                            )}

                            <div className="form-group-peta">
                                <label>Nama Lokasi / Program</label>
                                <input 
                                    type="text" 
                                    value={editTitikData.namaLokasi} 
                                    onChange={(e) => setEditTitikData({ ...editTitikData, namaLokasi: e.target.value })} 
                                    required 
                                />
                            </div>

                            <div className="form-group-peta">
                                <label>Alamat Lengkap</label>
                                <input 
                                    type="text" 
                                    value={editTitikData.alamat} 
                                    onChange={(e) => setEditTitikData({ ...editTitikData, alamat: e.target.value })} 
                                    required 
                                />
                            </div>

                            <div className="grid-koordinat-peta">
                                <div className="form-group-peta">
                                    <label>Latitude</label>
                                    <input 
                                        type="text" 
                                        value={editTitikData.latitude} 
                                        onChange={(e) => setEditTitikData({ ...editTitikData, latitude: e.target.value })} 
                                        required 
                                    />
                                </div>
                                <div className="form-group-peta">
                                    <label>Longitude</label>
                                    <input 
                                        type="text" 
                                        value={editTitikData.longitude} 
                                        onChange={(e) => setEditTitikData({ ...editTitikData, longitude: e.target.value })} 
                                        required 
                                    />
                                </div>
                            </div>

                            {editTitikData.kategori === 'BURUAN SAE' && (
                                <div className="grid-koordinat-peta form-dinamis-animasi">
                                    <div className="form-group-peta">
                                        <label>Nama Ketua Kelompok</label>
                                        <input 
                                            type="text" 
                                            value={editTitikData.ketua} 
                                            onChange={(e) => setEditTitikData({ ...editTitikData, ketua: e.target.value })} 
                                            required 
                                        />
                                    </div>
                                    <div className="form-group-peta">
                                        <label>Luas Lahan</label>
                                        <input 
                                            type="text" 
                                            value={editTitikData.luasLahan} 
                                            onChange={(e) => setEditTitikData({ ...editTitikData, luasLahan: e.target.value })} 
                                            required 
                                        />
                                    </div>
                                </div>
                            )}

                            {editTitikData.kategori === 'KBS' && (
                                <div className="form-group-peta form-dinamis-animasi">
                                    <label>Data RW Pelaksana KBS</label>
                                    <input 
                                        type="text" 
                                        value={editTitikData.dataRw} 
                                        onChange={(e) => setEditTitikData({ ...editTitikData, dataRw: e.target.value })} 
                                        required 
                                    />
                                </div>
                            )}

                            {kategoriBisaUpdate.includes(editTitikData.kategori) && (
                                <div className="form-group-peta form-dinamis-animasi">
                                    <label>Status Penanganan / Progres</label>
                                    <select 
                                        value={editTitikData.statusProgres} 
                                        onChange={(e) => setEditTitikData({ ...editTitikData, statusProgres: e.target.value })} 
                                        required
                                    >
                                        <option value="">-- Pilih Status Progres --</option>
                                        <option value="Pengajuan">Pengajuan Baru</option>
                                        <option value="Sedang Diproses">Sedang Diproses</option>
                                        <option value="Selesai Ditangani">Selesai Ditangani</option>
                                    </select>
                                </div>
                            )}

                            <div className="form-group-peta">
                                <label>Ganti Foto Lokasi (Opsional)</label>
                                <input type="file" accept="image/*" onChange={(e) => setEditFoto(e.target.files[0])} />
                                {editTitikData.foto_url && (
                                    <small style={{ marginTop: '5px', color: 'var(--text-redup)', fontSize: '12px' }}>
                                        Foto saat ini tersimpan di server. Pilih foto baru jika ingin mengganti.
                                    </small>
                                )}
                            </div>

                            <div className="modal-edit-peta-actions">
                                <button type="button" className="btn-batal-peta" onClick={() => setIsEditModalOpen(false)}>
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn-simpan-edit-peta" 
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