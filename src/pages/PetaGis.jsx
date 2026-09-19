import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { getTitikPeta, hapusTitikPeta, tambahTitikPeta, updateStatusPeta } from '../services/api'; 
import 'leaflet/dist/leaflet.css'; 
import './PetaGis.css'; 

export default function PetaGIS() {
    const posisiTengah = [-6.891226, 107.601757]; 

    const [dataTitik, setDataTitik] = useState([]);
    
    // State Default
    const [kategori, setKategori] = useState('');
    const [namaLokasi, setNamaLokasi] = useState('');
    const [alamat, setAlamat] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [foto, setFoto] = useState(null);

    // State Tambahan Dinamis
    const [ketua, setKetua] = useState('');
    const [luasLahan, setLuasLahan] = useState('');
    const [dataRw, setDataRw] = useState('');
    const [statusRutilahu, setStatusRutilahu] = useState('');
    const [jenisOrganik, setJenisOrganik] = useState('');

    const fetchDataPeta = async () => {
        try {
            const hasil = await getTitikPeta();
            setDataTitik(hasil);
        } catch (error) {
            console.error("Gagal menarik data titik peta");
        }
    };

    useEffect(() => {
        fetchDataPeta();
    }, []);

    const handleSimpan = async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        
        // Kategori bisa saja ditambahkan dengan sub-kategori organik
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
        } else if (kategori === 'RUTILAHU') {
            formData.append('status', statusRutilahu);
        }
        try {
            const result = await tambahTitikPeta(formData);
            if (result.status === 'sukses') {
                alert(result.pesan);
                fetchDataPeta(); 
                
                // Reset semua form
                setKategori(''); setNamaLokasi(''); setAlamat('');
                setLatitude(''); setLongitude(''); setFoto(null);
                setKetua(''); setLuasLahan(''); setDataRw('');
                setStatusRutilahu(''); setJenisOrganik('');
                document.getElementById('inputFotoPeta').value = '';
            } else {
                alert("Gagal: " + result.pesan);
            }
        } catch (error) {
            alert("Kesalahan server saat menyimpan titik!");
        }
    };

    const handleHapusId = async (id) => {
        const konfirmasi = window.confirm('Yakin menghapus titik pada peta?');
        if (!konfirmasi) return; 
            try {
                const result = await hapusTitikPeta(id);
                if (result.status === "sukses") {
                    alert(result.pesan);
                    fetchDataPeta();
                } else {
                    alert ("Gagal: " + result.pesan);
                }
            } catch (error) {
                alert('Terjadi Kesalahan saat menghapus titik pada peta, periksa jaringan!');
            }
    }

    return (
        <div className="peta-container">
            <div className="header-peta">
                <h2>Peta Interaktif GIS (Modul Pemetaan Ekbang)</h2>
                <p>Sistem Informasi Geografis sebaran titik Rutilahu, Buruan Sae, KBS, dan Pengolahan Sampah.</p>
            </div>

            <div className="peta-layout">
                <div className="form-peta-card">
                    <h3>Tambah Titik Baru</h3>
                    <form onSubmit={handleSimpan}>
                        
                        {/* 1. PILIH KATEGORI UTAMA */}
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
                                <option value="INFRASTRUKTUR UMUM">INFRASTRUKTUR UMUM (Jalan/Gorong-gorong/Fasum)</option>
                            </select>
                        </div>

                        {/* FORM DINAMIS (MUNCUL SESUAI PILIHAN KATEGORI)  */}
                        
                        {/* Dinamis: RUTILAHU */}
                        {kategori === 'RUTILAHU' && (
                            <div className="form-group-peta">
                                <label>Status Rutilahu</label>
                                <select value={statusRutilahu} onChange={(e) => setStatusRutilahu(e.target.value)} required>
                                    <option value="">-- Pilih Status --</option>
                                    <option value="Selesai Dibangun">Selesai Dibangun</option>
                                    <option value="Sedang Diproses">Sedang Diproses</option>
                                    <option value="Pengajuan">Pengajuan</option>
                                </select>
                            </div>
                        )}

                        {/* Dinamis: BURUAN SAE */}
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

                        {/* Dinamis: KBS (Kawasan Bebas Sampah) */}
                        {kategori === 'KBS' && (
                            <div className="form-group-peta">
                                <label>Data RW</label>
                                <input type="text" placeholder="Contoh: RW 05" value={dataRw} onChange={(e) => setDataRw(e.target.value)} required />
                            </div>
                        )}

                        {/* Dinamis: PENGOLAHAN SAMPAH ORGANIK */}
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

                        {/* FORM UMUM (SELALU MUNCUL)*/}

                        <div className="form-group-peta">
                            <label>Nama Penerima / Nama Titik Lokasi</label>
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
                            <small style={{ color: '#ef4444', marginTop: '6px', display: 'block', fontWeight: 'bold' }}>
                                *Ukuran file maksimal 5 MB
                            </small>
                            <input id="inputFotoPeta" type="file" accept="image/*" onChange={(e) => setFoto(e.target.files[0])} required />
                        </div>
                        <button type="submit" className="btn-simpan-titik">Tanam Pin di Peta</button>
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
                                    <strong style={{color: 'var(--text-utama)'}}>{titik.nama_lokasi}</strong><br/>
                                    <small style={{color: 'var(--text-redup)'}}>{titik.alamat}</small>
                                    {/* AREA DATA DINAMIS (Tampil jika data ada) */}
                                    <div style={{ marginTop: '8px', marginBottom: '8px', fontSize: '12px', color: 'var(--text-utama)' }}>
                                        {titik.ketua && (
                                            <div style={{ marginBottom: '2px' }}><strong>Ketua:</strong> {titik.ketua}</div>
                                        )}
                                        {titik.luas_lahan && (
                                            <div style={{ marginBottom: '2px' }}><strong>Luas Lahan:</strong> {titik.luas_lahan}</div>
                                        )}
                                        {titik.data_rw && (
                                            <div style={{ marginBottom: '2px' }}><strong>Data RW:</strong> {titik.data_rw}</div>
                                        )}
                                        {/* LOGIKA UBAH STATUS RUTILAHU */}
                                        {titik.kategori_lokasi === 'RUTILAHU' ? (
                                            <div style={{ marginTop: '8px', padding: '8px', backgroundColor: 'var(--bg-hover)', borderRadius: '6px' }}>
                                                <strong style={{display: 'block', marginBottom: '5px'}}>Status Saat Ini: {titik.status}</strong>
                                                <select 
                                                    style={{padding: '4px', fontSize: '11px', width: '100%', borderRadius: '4px', border: '1px solid var(--border-halus)'}}
                                                    onChange={async (e) => {
                                                        const confirm = window.confirm("Ubah status progres lokasi ini?");
                                                        if(confirm) {
                                                            try {
                                                                await updateStatusPeta(titik.id, e.target.value);
                                                                fetchDataPeta(); // Refresh peta
                                                            } catch (error) {
                                                                alert("Gagal mengubah status peta.");
                                                            }
                                                        }
                                                    }}
                                                    defaultValue=""
                                                >
                                                    <option value="" disabled>-- Perbarui Status --</option>
                                                    <option value="Pengajuan">Pengajuan</option>
                                                    <option value="Sedang Diproses">Sedang Diproses</option>
                                                    <option value="Selesai Dibangun">Selesai Dibangun</option>
                                                </select>
                                            </div>
                                        ) : (
                                            titik.status && (<div style={{ marginBottom: '2px' }}><strong>Status:</strong> {titik.status}</div>)
                                        )}
                                    </div>

                                    {titik.foto_url && (
                                        <a href={`https://backend-one-ekbang-production.up.railway.app/uploads/${titik.foto_url}`} target="_blank" rel="noreferrer" style={{color: 'var(--primary-btn)', fontWeight: 'bold', display: 'inline-block', marginTop: '5px'}}>
                                            Lihat Foto Lokasi
                                        </a>
                                    )}
                                    <button className="btn-hapus-peta" onClick={() => handleHapusId(titik.id)}>
                                        Hapus Titik
                                    </button>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>

            </div>
        </div>
    );
}