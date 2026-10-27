import { useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { tambahLayanan } from "../services/api"; 
import './TambahLayanan.css';

export default function TambahLayanan() {
    const [jenisLayanan, setJenisLayanan] = useState('');
    const [nik, setNik] = useState('');
    const [nama, setNama] = useState('');
    const [noTelepon, setNoTelepon] = useState('');

    // BERKAS LAYANAN LAMA
    const [fotoKtp, setFotoKtp] = useState(null);
    const [fotoKk, setFotoKk] = useState(null);
    const [sertifikatTanah, setSertifikatTanah] = useState(null);
    const [fotoRumah, setFotoRumah] = useState(null);
    const [fotoLokasi, setFotoLokasi] = useState(null);
    const [skBuruanSae, setSkBuruanSae] = useState(null);
    const [kebutuhanTanaman, setKebutuhanTanaman] = useState(null);
    const [docA1, setDocA1] = useState(null);
    const [docA2, setDocA2] = useState(null);
    const [fotoRembuk, setFotoRembuk] = useState(null);
    const [daftarHadir, setDaftarHadir] = useState(null);
    const [baMuskel, setBaMuskel] = useState(null);
    const [fotoMuskel, setFotoMuskel] = useState(null);
    const [fotoHalaman, setFotoHalaman] = useState(null);
    const [proposalSarpras, setProposalSarpras] = useState(null);
    const [fotoSarpras, setFotoSarpras] = useState(null);

    // BERKAS & DATA 4 LAYANAN BARU
    const [alamatRusak, setAlamatRusak] = useState('');
    const [fotoBukti, setFotoBukti] = useState(null);
    const [namaUsaha, setNamaUsaha] = useState('');
    const [jenisUsaha, setJenisUsaha] = useState('');
    const [noNibSuket, setNoNibSuket] = useState('');
    const [jenisAjuanLainnya, setJenisAjuanLainnya] = useState('');
    const [dokumenPendukung, setDokumenPendukung] = useState(null);

    // ANTI DOUBLE SUBMIT / IDEMPOTENCY GUARD
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const simpanData = async (e) => {
        e.preventDefault(); 

        if (isSubmitting) return;

        if (!jenisLayanan) {
            Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Silakan pilih jenis layanan terlebih dahulu.', confirmButtonColor: '#3C50E0' });
            return;
        }

        if (!nik || !nama || !noTelepon) {
            Swal.fire({ icon: 'warning', title: 'Data Belum Lengkap', text: 'Lengkapi data NIK, Nama Lengkap, dan Nomor Telepon.', confirmButtonColor: '#3C50E0' });
            return;
        }

        if (nik.length !== 16) {
            Swal.fire({ icon: 'warning', title: 'Format NIK Salah', text: 'Maaf, NIK harus pas 16 digit angka!', confirmButtonColor: '#3C50E0' });
            return;
        }

        if (isNaN(nik)) {
            Swal.fire({ icon: 'warning', title: 'Format NIK Salah', text: 'Maaf, NIK hanya boleh berisi angka!', confirmButtonColor: '#3C50E0' });
            return;
        }
        
        // VALIDASI UNTUK 6 LAYANAN LAMA
        if (jenisLayanan === 'RUTILAHU' && (!fotoKtp || !fotoKk || !sertifikatTanah || !fotoRumah)) {
            Swal.fire({ icon: 'warning', title: 'Berkas Kurang', text: 'Harap unggah KTP, KK, Sertifikat, dan Foto Rumah.' }); return;
        }
        if (jenisLayanan === 'POHON TUMBANG' && (!fotoKtp || !fotoKk || !fotoLokasi)) {
            Swal.fire({ icon: 'warning', title: 'Berkas Kurang', text: 'Harap unggah KTP, KK, dan Foto Lokasi Pohon.' }); return;
        }
        if (jenisLayanan === 'BURUAN SAE' && (!skBuruanSae || !fotoHalaman || !kebutuhanTanaman)) {
            Swal.fire({ icon: 'warning', title: 'Berkas Kurang', text: 'Harap unggah SK, Foto Halaman, dan File Tanaman.' }); return;
        }
        if (jenisLayanan === 'MUSRENBANG' && (!docA1 || !docA2 || !fotoRembuk || !daftarHadir)) {
            Swal.fire({ icon: 'warning', title: 'Berkas Kurang', text: 'Harap unggah A1, A2, Foto Rembuk, dan Daftar Hadir.' }); return;
        }
        if (jenisLayanan === 'DAU DAN PRAKARSA' && (!baMuskel || !fotoMuskel || !docA1 || !docA2)) {
            Swal.fire({ icon: 'warning', title: 'Berkas Kurang', text: 'Harap unggah BA Muskel, Foto Muskel, A1, dan A2.' }); return;
        }
        if (jenisLayanan === 'SARPRAS DLH' && (!fotoKtp || !fotoKk || !proposalSarpras || !fotoSarpras)) {
            Swal.fire({ icon: 'warning', title: 'Berkas Kurang', text: 'Harap unggah KTP, KK, Proposal Sarpras, dan Foto Sasaran.' }); return;
        }

        // VALIDASI UNTUK 4 LAYANAN BARU
        if ((jenisLayanan === 'KIRMIR / DRAINASE' || jenisLayanan === 'PERBAIKAN JALAN') && (!alamatRusak || !fotoKtp || !fotoBukti)) {
            Swal.fire({ icon: 'warning', title: 'Data Belum Lengkap', text: 'Harap isi Alamat Lokasi Kerusakan serta unggah Foto KTP dan Foto Bukti Kerusakan.' }); return;
        }
        if (jenisLayanan === 'UMKM' && (!namaUsaha || !jenisUsaha || !noNibSuket || !fotoKtp)) {
            Swal.fire({ icon: 'warning', title: 'Data Belum Lengkap', text: 'Harap isi Nama Usaha, Jenis Usaha, Nomor NIB/Suket serta unggah Foto KTP Pemilik.' }); return;
        }
        if (jenisLayanan === 'PENGAJUAN LAINNYA' && (!jenisAjuanLainnya || !fotoKtp || !fotoKk)) {
            Swal.fire({ icon: 'warning', title: 'Data Belum Lengkap', text: 'Harap ketik Jenis Pengajuan Anda serta unggah Foto KTP dan Kartu Keluarga (KK).' }); return;
        }

        const formData = new FormData();
        formData.append('nik', nik);
        formData.append('nama', nama);
        formData.append('no_telepon', noTelepon);
        
        if (jenisLayanan === 'PENGAJUAN LAINNYA') {
            formData.append('jenisLayanan', `LAINNYA: ${jenisAjuanLainnya}`);
        } else {
            formData.append('jenisLayanan', jenisLayanan);
        }

        // FILE LAMPIRAN LAMA
        if (fotoKtp) formData.append('foto_ktp', fotoKtp);
        if (fotoKk) formData.append('foto_kk', fotoKk);
        if (sertifikatTanah) formData.append('sertifikat_tanah', sertifikatTanah);
        if (fotoRumah) formData.append('foto_kondisi_rumah', fotoRumah);
        if (fotoLokasi) formData.append('foto_lokasi', fotoLokasi);
        if (skBuruanSae) formData.append('sk_buruan_sae', skBuruanSae);
        if (kebutuhanTanaman) formData.append('kebutuhan_tanaman', kebutuhanTanaman);
        if (docA1) formData.append('dokumen_a1', docA1);
        if (docA2) formData.append('dokumen_a2', docA2);
        if (fotoRembuk) formData.append('foto_rembuk', fotoRembuk);
        if (daftarHadir) formData.append('daftar_hadir', daftarHadir);
        if (baMuskel) formData.append('ba_muskel', baMuskel);
        if (fotoMuskel) formData.append('foto_muskel', fotoMuskel);
        if (fotoHalaman) formData.append('foto_halaman', fotoHalaman);
        if (proposalSarpras) formData.append('proposal_sarpras', proposalSarpras);
        if (fotoSarpras) formData.append('foto_sarpras', fotoSarpras);

        // DATA & BERKAS BARU
        if (alamatRusak) formData.append('alamat_rusak', alamatRusak);
        if (fotoBukti) formData.append('foto_bukti', fotoBukti);
        if (namaUsaha) formData.append('nama_usaha', namaUsaha);
        if (jenisUsaha) formData.append('jenis_usaha', jenisUsaha);
        if (noNibSuket) formData.append('no_nib_suket', noNibSuket);
        if (dokumenPendukung) formData.append('dokumen_pendukung', dokumenPendukung);

        setIsSubmitting(true);

        try {
            const data = await tambahLayanan(formData);
            if (data && data.status === 'sukses') {
                await Swal.fire({ 
                    title: 'Berhasil!', 
                    text: data.pesan, 
                    icon: 'success', 
                    confirmButtonColor: '#3C50E0' 
                });
                window.location.reload();
            } else {
                Swal.fire({ icon: 'error', title: 'Gagal Menyimpan', text: data?.pesan || 'Gagal menyimpan pengajuan.', confirmButtonColor: '#3C50E0' });
                setIsSubmitting(false);
            }
        } catch {
            Swal.fire({ icon: 'error', title: 'Koneksi Terputus', text: 'Terjadi kesalahan sistem atau server mati saat mengirim data!', confirmButtonColor: '#3C50E0' });
            setIsSubmitting(false);
        }
    };

    return (
        <div className="form-publik-wrapper">
            {/* Top Bar: Tagline (Kiri) & Logo BerAKHLAK (Kanan) */}
            <div className="top-banner-bar">
                <div className="top-banner-kiri">
                    <p className="tagline-sub">
                        Layanan Publik<br />
                        Lebih Mudah,<br />
                        Lebih Dekat<br />
                        untuk Warga Pasteur
                    </p>
                    <div className="tagline-line"></div>
                </div>

                <div className="top-banner-kanan">
                    <div className="berakhlak-badge">
                        <div className="berakhlak-title">
                            <span className="text-red">Ber</span><span className="text-dark">AKHLAK</span>
                            <span className="berakhlak-arrow">❯</span>
                        </div>
                        <span className="berakhlak-desc">
                            Berorientasi Pelayanan Akuntabel Kompeten<br />
                            Harmonis Loyal Adaptif Kolaboratif
                        </span>
                    </div>
                </div>
            </div>

            {/* Logo One Ekbang Melayang */}
            <div className="hero-logo-wrapper">
                <img src={`${import.meta.env.BASE_URL}rb-logo-oneEkbang.png`} alt="Logo One Ekbang" className="hero-logo-img" />
            </div>

            {/* KARTU FORM UTAMA */}
            <div className="form-container-publik">
                
                <div className="form-publik-header">
                    <div className="toggles-pills">
                        <button type="button" className="pill-btn pill-btn-active">
                            <svg className="pill-svg-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                            </svg>
                            Form Warga
                        </button>
                        <Link to="/login" className="pill-btn pill-btn-inactive">
                            <svg className="pill-svg-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
                            </svg>
                            ONE EKBANG
                        </Link>
                    </div>

                    <h2 className="form-title-utama">Formulir Pengajuan Layanan</h2>
                    <p className="form-subtitle-utama">Sampaikan kebutuhan layanan lingkungan Anda dengan mudah.</p>
                </div>

                <form onSubmit={simpanData}>
                    <div className="form-publik-body">
                        
                        {/* 1. PILIH JENIS LAYANAN (HERO SELECT PALING ATAS) */}
                        <div className="input-group-pill" style={{ marginBottom: '22px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#1E293B' }}>
                                <span className="label-icon-badge list-badge">
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
                                    </svg>
                                </span>
                                1. Pilih Kategori Layanan yang Anda Butuhkan:
                            </label>
                            <select 
                                value={jenisLayanan} 
                                onChange={(e) => setJenisLayanan(e.target.value)}
                                style={{ 
                                    padding: '12px 16px', 
                                    fontSize: '14px', 
                                    fontWeight: '600', 
                                    borderColor: '#3B82F6', 
                                    backgroundColor: '#F0F7FF',
                                    color: '#1E293B' 
                                }}
                            >
                                <option value="">-- Klik di sini untuk memilih jenis layanan --</option>
                                <optgroup label="Layanan Aduan & Infrastruktur">
                                    <option value="KIRMIR / DRAINASE">Kirmir / Drainase (Saluran Air)</option>
                                    <option value="PERBAIKAN JALAN">Perbaikan Jalan Lingkungan</option>
                                </optgroup>
                                <optgroup label="Pemberdayaan Ekonomi & Usaha">
                                    <option value="UMKM">Bantuan & Pendataan UMKM</option>
                                    <option value="BURUAN SAE">Program Buruan Sae</option>
                                </optgroup>
                                <optgroup label="Sosial & Fasilitas Lingkungan">
                                    <option value="RUTILAHU">Bantuan RUTILAHU</option>
                                    <option value="POHON TUMBANG">Tebang Pohon / Pemangkasan</option>
                                    <option value="MUSRENBANG">Pengajuan Musrenbang</option>
                                    <option value="DAU DAN PRAKARSA">DAU & Prakarsa</option>
                                    <option value="SARPRAS DLH">Sarpras DLH</option>
                                </optgroup>
                                <optgroup label="Layanan Terbuka">
                                    <option value="PENGAJUAN LAINNYA">Pengajuan Lainnya</option>
                                </optgroup>
                            </select>
                        </div>

                        {/* JIKA BELUM MEMILIH LAYANAN: TAMPILKAN PANDUAN RAMAH */}
                        {!jenisLayanan ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '35px 20px',
                                backgroundColor: '#F8FAFC',
                                borderRadius: '14px',
                                border: '1.5px dashed #CBD5E1',
                                color: '#64748B'
                            }}>
                                <div style={{ fontSize: '36px', marginBottom: '8px' }}>📋</div>
                                <h4 style={{ margin: '0 0 6px', color: '#334155', fontSize: '15px', fontWeight: 'bold' }}>
                                    Silakan Pilih Kategori Layanan di Atas
                                </h4>
                                <p style={{ margin: 0, fontSize: '13px' }}>
                                    Formulir dan syarat berkas akan otomatis terbuka khusus untuk layanan yang Anda pilih.
                                </p>
                            </div>
                        ) : (
                            <div className="animasi-muncul">
                                
                                {/* 2. DATA IDENTITAS PEMOHON */}
                                <div style={{ marginBottom: '22px' }}>
                                    <h4 style={{ margin: '0 0 12px', fontSize: '14px', color: '#1E293B', fontWeight: 'bold' }}>
                                        2. Data Identitas Pemohon
                                    </h4>
                                    <div className="input-grid">
                                        <div className="input-group-pill">
                                            <label>
                                                <span className="label-icon-badge id-badge">
                                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm-9 3h2v2h-2V7zm0 3h2v2h-2v-2zm-4-3h2v2H7V7zm0 3h2v2H7v-2zm-2 7v-1.5c0-.83.67-1.5 1.5-1.5h7c.83 0 1.5.67 1.5 1.5V17H5zm14 0h-3v-2h3v2zm0-3h-3v-2h3v2zm0-3h-3V8h3v3z"/>
                                                    </svg>
                                                </span>
                                                NIK Pemohon
                                            </label>
                                            <input type="text" maxLength={16} placeholder="16 digit angka..." value={nik} onChange={(e) => setNik(e.target.value)} required /> 
                                        </div>
                                        
                                        <div className="input-group-pill">
                                            <label>
                                                <span className="label-icon-badge user-badge">
                                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                                    </svg>
                                                </span>
                                                Nama Lengkap
                                            </label>
                                            <input type="text" placeholder="Sesuai KTP..." value={nama} onChange={(e) => setNama(e.target.value)} required />
                                        </div>

                                        <div className="input-group-pill full-width">
                                            <label>
                                                <span className="label-icon-badge phone-badge">
                                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                                                    </svg>
                                                </span>
                                                No. Telepon / WhatsApp
                                            </label>
                                            <input type="text" placeholder="Contoh: 0812xxxxxxxx" value={noTelepon} onChange={(e) => setNoTelepon(e.target.value)} required />
                                        </div>
                                    </div>
                                </div>

                                {/* 3. RINCIAN SPESIFIK & DOKUMEN SESUAI LAYANAN */}
                                <div className="dokumen-section animasi-muncul">
                                    <div className="dokumen-header">
                                        <h3>Unggah Persyaratan & Rincian Layanan</h3>
                                        <small>*Maks 5MB/file</small>
                                    </div>

                                    {/* KHUSUS KIRMIR / DRAINASE & PERBAIKAN JALAN */}
                                    {(jenisLayanan === 'KIRMIR / DRAINASE' || jenisLayanan === 'PERBAIKAN JALAN') && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                            <div className="input-group-pill" style={{ marginBottom: 0 }}>
                                                <label>Alamat / Lokasi Kerusakan Fisik</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="Contoh: Jl. Sukajadi No. 12 RT 03/RW 02 (Kirmir/Jalan Amblas)" 
                                                    value={alamatRusak} 
                                                    onChange={(e) => setAlamatRusak(e.target.value)} 
                                                    required
                                                />
                                            </div>
                                            <div className="input-grid">
                                                <label className="kotak-upload-pill">
                                                    {fotoKtp ? `✓ ${fotoKtp.name}` : '📁 Upload Foto KTP'}
                                                    <input type="file" className="file-input-asli" onChange={(e) => setFotoKtp(e.target.files[0])} />
                                                </label>
                                                <label className="kotak-upload-pill">
                                                    {fotoBukti ? `✓ ${fotoBukti.name}` : '📷 Upload Foto Bukti Kerusakan'}
                                                    <input type="file" className="file-input-asli" onChange={(e) => setFotoBukti(e.target.files[0])} />
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    {/* KHUSUS PENDATAAN & BANTUAN UMKM */}
                                    {jenisLayanan === 'UMKM' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                            <div className="input-grid">
                                                <div className="input-group-pill" style={{ marginBottom: 0 }}>
                                                    <label>Nama Usaha / Toko</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Contoh: Warung Seblak Bu Siti" 
                                                        value={namaUsaha} 
                                                        onChange={(e) => setNamaUsaha(e.target.value)} 
                                                        required
                                                    />
                                                </div>
                                                <div className="input-group-pill" style={{ marginBottom: 0 }}>
                                                    <label>Jenis / Bidang Usaha</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Contoh: Kuliner / Kerajinan / Jasa" 
                                                        value={jenisUsaha} 
                                                        onChange={(e) => setJenisUsaha(e.target.value)} 
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="input-group-pill" style={{ marginBottom: 0 }}>
                                                <label>Nomor NIB / Surat Keterangan Usaha (Suket)</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="Contoh: 1234567890 atau No. Suket RW/Kelurahan" 
                                                    value={noNibSuket} 
                                                    onChange={(e) => setNoNibSuket(e.target.value)} 
                                                    required
                                                />
                                            </div>
                                            <div className="input-grid">
                                                <label className="kotak-upload-pill full-width">
                                                    {fotoKtp ? `✓ ${fotoKtp.name}` : '📁 Upload Foto KTP Pemilik Usaha'}
                                                    <input type="file" className="file-input-asli" onChange={(e) => setFotoKtp(e.target.files[0])} />
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    {/* KHUSUS PENGAJUAN LAINNYA */}
                                    {jenisLayanan === 'PENGAJUAN LAINNYA' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                            <div className="input-group-pill" style={{ marginBottom: 0 }}>
                                                <label>Ketik Jenis / Rincian Pengajuan Anda</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="Contoh: Permohonan Bibit Ikan / Penerangan Jalan Gang" 
                                                    value={jenisAjuanLainnya} 
                                                    onChange={(e) => setJenisAjuanLainnya(e.target.value)} 
                                                    required
                                                />
                                            </div>
                                            <div className="input-grid">
                                                <label className="kotak-upload-pill">
                                                    {fotoKtp ? `✓ ${fotoKtp.name}` : '📁 Upload KTP'}
                                                    <input type="file" className="file-input-asli" onChange={(e) => setFotoKtp(e.target.files[0])} />
                                                </label>
                                                <label className="kotak-upload-pill">
                                                    {fotoKk ? `✓ ${fotoKk.name}` : '📁 Upload KK'}
                                                    <input type="file" className="file-input-asli" onChange={(e) => setFotoKk(e.target.files[0])} />
                                                </label>
                                                <label className="kotak-upload-pill full-width">
                                                    {dokumenPendukung ? `✓ ${dokumenPendukung.name}` : '📄 Upload Dokumen Pendukung (Opsional)'}
                                                    <input type="file" className="file-input-asli" onChange={(e) => setDokumenPendukung(e.target.files[0])} />
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    {/* KHUSUS RUTILAHU */}
                                    {jenisLayanan === 'RUTILAHU' && (
                                        <div className="input-grid">
                                            <label className="kotak-upload-pill">
                                                {fotoKtp ? `✓ ${fotoKtp.name}` : '📁 Upload KTP'}
                                                <input type="file" className="file-input-asli" onChange={(e) => setFotoKtp(e.target.files[0])} />
                                            </label>
                                            <label className="kotak-upload-pill">
                                                {fotoKk ? `✓ ${fotoKk.name}` : '📁 Upload KK'}
                                                <input type="file" className="file-input-asli" onChange={(e) => setFotoKk(e.target.files[0])} />
                                            </label>
                                            <label className="kotak-upload-pill">
                                                {sertifikatTanah ? `✓ ${sertifikatTanah.name}` : '📁 Sertifikat Tanah'}
                                                <input type="file" className="file-input-asli" onChange={(e) => setSertifikatTanah(e.target.files[0])} />
                                            </label>
                                            <label className="kotak-upload-pill">
                                                {fotoRumah ? `✓ ${fotoRumah.name}` : '📁 Foto Rumah'}
                                                <input type="file" className="file-input-asli" onChange={(e) => setFotoRumah(e.target.files[0])} />
                                            </label>
                                        </div>
                                    )}

                                    {/* KHUSUS POHON TUMBANG */}
                                    {jenisLayanan === 'POHON TUMBANG' && (
                                        <div className="input-grid">
                                            <label className="kotak-upload-pill">
                                                {fotoKtp ? `✓ ${fotoKtp.name}` : '📁 Upload KTP'}
                                                <input type="file" className="file-input-asli" onChange={(e) => setFotoKtp(e.target.files[0])} />
                                            </label>
                                            <label className="kotak-upload-pill">
                                                {fotoKk ? `✓ ${fotoKk.name}` : '📁 Upload KK'}
                                                <input type="file" className="file-input-asli" onChange={(e) => setFotoKk(e.target.files[0])} />
                                            </label>
                                            <label className="kotak-upload-pill full-width">
                                                {fotoLokasi ? `✓ ${fotoLokasi.name}` : '📁 Foto Lokasi Pohon'}
                                                <input type="file" className="file-input-asli" onChange={(e) => setFotoLokasi(e.target.files[0])} />
                                            </label>
                                        </div>
                                    )}

                                    {/* KHUSUS BURUAN SAE */}
                                    {jenisLayanan === 'BURUAN SAE' && (
                                        <div className="input-grid">
                                            <label className="kotak-upload-pill">
                                                {skBuruanSae ? `✓ ${skBuruanSae.name}` : '📁 SK Buruan Sae'}
                                                <input type="file" className="file-input-asli" onChange={(e) => setSkBuruanSae(e.target.files[0])} />
                                            </label>
                                            <label className="kotak-upload-pill">
                                                {fotoHalaman ? `✓ ${fotoHalaman.name}` : '📁 Foto Lahan'}
                                                <input type="file" className="file-input-asli" onChange={(e) => setFotoHalaman(e.target.files[0])} />
                                            </label>
                                            <label className="kotak-upload-pill full-width">
                                                {kebutuhanTanaman ? `✓ ${kebutuhanTanaman.name}` : '📁 Daftar Kebutuhan Bibit'}
                                                <input type="file" className="file-input-asli" onChange={(e) => setKebutuhanTanaman(e.target.files[0])} />
                                            </label>
                                        </div>
                                    )}

                                    {/* KHUSUS MUSRENBANG */}
                                    {jenisLayanan === 'MUSRENBANG' && (
                                        <div className="input-grid">
                                            <label className="kotak-upload-pill">
                                                {docA1 ? `✓ ${docA1.name}` : '📁 Dokumen A1'}
                                                <input type="file" className="file-input-asli" onChange={(e) => setDocA1(e.target.files[0])} />
                                            </label>
                                            <label className="kotak-upload-pill">
                                                {docA2 ? `✓ ${docA2.name}` : '📁 Dokumen A2'}
                                                <input type="file" className="file-input-asli" onChange={(e) => setDocA2(e.target.files[0])} />
                                            </label>
                                            <label className="kotak-upload-pill">
                                                {fotoRembuk ? `✓ ${fotoRembuk.name}` : '📁 Foto Rembuk Warga'}
                                                <input type="file" className="file-input-asli" onChange={(e) => setFotoRembuk(e.target.files[0])} />
                                            </label>
                                            <label className="kotak-upload-pill">
                                                {daftarHadir ? `✓ ${daftarHadir.name}` : '📁 Daftar Hadir Rembuk'}
                                                <input type="file" className="file-input-asli" onChange={(e) => setDaftarHadir(e.target.files[0])} />
                                            </label>
                                        </div>
                                    )}

                                    {/* KHUSUS DAU DAN PRAKARSA */}
                                    {jenisLayanan === 'DAU DAN PRAKARSA' && (
                                        <div className="input-grid">
                                            <label className="kotak-upload-pill">
                                                {baMuskel ? `✓ ${baMuskel.name}` : '📁 BA Muskel'}
                                                <input type="file" className="file-input-asli" onChange={(e) => setBaMuskel(e.target.files[0])} />
                                            </label>
                                            <label className="kotak-upload-pill">
                                                {fotoMuskel ? `✓ ${fotoMuskel.name}` : '📁 Foto Muskel'}
                                                <input type="file" className="file-input-asli" onChange={(e) => setFotoMuskel(e.target.files[0])} />
                                            </label>
                                            <label className="kotak-upload-pill">
                                                {docA1 ? `✓ ${docA1.name}` : '📁 Dokumen A1'}
                                                <input type="file" className="file-input-asli" onChange={(e) => setDocA1(e.target.files[0])} />
                                            </label>
                                            <label className="kotak-upload-pill">
                                                {docA2 ? `✓ ${docA2.name}` : '📁 Dokumen A2'}
                                                <input type="file" className="file-input-asli" onChange={(e) => setDocA2(e.target.files[0])} />
                                            </label>
                                        </div>
                                    )}

                                    {/* KHUSUS SARPRAS DLH */}
                                    {jenisLayanan === 'SARPRAS DLH' && (
                                        <div className="input-grid">
                                            <label className="kotak-upload-pill">
                                                {fotoKtp ? `✓ ${fotoKtp.name}` : '📁 Upload KTP'}
                                                <input type="file" className="file-input-asli" onChange={(e) => setFotoKtp(e.target.files[0])} />
                                            </label>
                                            <label className="kotak-upload-pill">
                                                {fotoKk ? `✓ ${fotoKk.name}` : '📁 Upload KK'}
                                                <input type="file" className="file-input-asli" onChange={(e) => setFotoKk(e.target.files[0])} />
                                            </label>
                                            <label className="kotak-upload-pill">
                                                {proposalSarpras ? `✓ ${proposalSarpras.name}` : '📁 Proposal Permohonan'}
                                                <input type="file" className="file-input-asli" onChange={(e) => setProposalSarpras(e.target.files[0])} />
                                            </label>
                                            <label className="kotak-upload-pill">
                                                {fotoSarpras ? `✓ ${fotoSarpras.name}` : '📁 Foto Lokasi / Sasaran'}
                                                <input type="file" className="file-input-asli" onChange={(e) => setFotoSarpras(e.target.files[0])} />
                                            </label>
                                        </div>
                                    )}

                                </div>

                                {/* FOOTER KONFIRMASI & TOMBOL KIRIM */}
                                <div className="form-publik-footer-box" style={{ marginTop: '22px' }}>
                                    <div className="footer-box-kiri">
                                        <div className="shield-icon-badge">
                                            <svg viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
                                            </svg>
                                        </div>
                                        <div className="footer-box-teks">
                                            <strong>Konfirmasi:</strong>
                                            <p>Dengan menekan tombol, Anda menyetujui data yang dikirim adalah valid.</p>
                                        </div>
                                    </div>
                                    <button 
                                        type="submit" 
                                        className="btn-kirim-pengajuan" 
                                        disabled={isSubmitting} 
                                        style={isSubmitting ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
                                    >
                                        {isSubmitting ? '⏳ Mengirim Data...' : 'Kirim Pengajuan ➔'}
                                    </button>
                                </div>

                            </div>
                        )}

                    </div>
                </form>

            </div>
        </div>
    );
}
