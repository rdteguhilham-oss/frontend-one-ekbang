import { useState } from "react";
import Swal from "sweetalert2";
import { tambahLayanan } from "../services/api"; 
import './TambahLayanan.css';

export default function TambahLayanan() {
    const [nik, setNik] = useState('');
    const [nama, setNama] = useState('');
    const [noTelepon, setNoTelepon] = useState('');
    const [jenisLayanan, setJenisLayanan] = useState('');

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
    
    // TAMBAHAN STATE BARU UNTUK SARPRAS DLH
    const [proposalSarpras, setProposalSarpras] = useState(null);
    const [fotoSarpras, setFotoSarpras] = useState(null);
    
    const simpanData = async (e) => {
        e.preventDefault(); 

        if (!nik || !nama || !noTelepon || !jenisLayanan) {
            Swal.fire('Lengkapi form terlebih dahulu.');
            return;
        }

        if (nik.length !== 16) {
            Swal.fire("Maaf, NIK harus pas 16 digit!");
            return;
        }

        if (isNaN(nik)) {
            Swal.fire("Maaf, NIK hanya boleh berisi angka!");
            return;
        }
        
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
        // VALIDASI UNTUK SARPRAS DLH
        if (jenisLayanan === 'SARPRAS DLH' && (!fotoKtp || !fotoKk || !proposalSarpras || !fotoSarpras)) {
            Swal.fire({ icon: 'warning', title: 'Berkas Kurang', text: 'Harap unggah KTP, KK, Proposal Sarpras, dan Foto Sasaran.' }); return;
        }

        const formData = new FormData();
        formData.append('nik', nik);
        formData.append('nama', nama);
        formData.append('no_telepon', noTelepon);
        formData.append('jenisLayanan', jenisLayanan);

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
        
        // TAMBAHKAN KE BUNGKUSAN DATA
        if (proposalSarpras) formData.append('proposal_sarpras', proposalSarpras);
        if (fotoSarpras) formData.append('foto_sarpras', fotoSarpras);

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
                Swal.fire('Gagal menyimpan pengajuan.');
            }
        } catch (error) {
            Swal.fire("Terjadi kesalahan sistem/server mati saat mengirim data!");
        }
    };

    return (
        <div className="form-publik-wrapper">
            <div className="form-container-publik">
                
                <div className="form-publik-header">
                    <div className="toggles-palsu">
                        <span className="toggle-aktif">Form Warga</span>
                        <span className="toggle-mati">ONE EKBANG</span>
                    </div>
                    <h2>Formulir Pengajuan Layanan</h2>
                </div>

                <form onSubmit={simpanData}>
                    <div className="form-publik-body">
                        
                        <div className="input-grid">
                            <div className="input-group-pill">
                                <label>NIK Pemohon</label>
                                <input type="text" placeholder="16 Digit Angka" value={nik} onChange={(e) => setNik(e.target.value)} /> 
                            </div>
                            
                            <div className="input-group-pill">
                                <label>Nama Lengkap</label>
                                <input type="text" placeholder="Sesuai KTP" value={nama} onChange={(e) => setNama(e.target.value)} />
                            </div>

                            <div className="input-group-pill">
                                <label>No. Telepon / WA</label>
                                <input type="text" placeholder="Contoh: 0812..." value={noTelepon} onChange={(e) => setNoTelepon(e.target.value)} />
                            </div>
                            
                            <div className="input-group-pill">
                                <label>Jenis Layanan</label>
                                <select value={jenisLayanan} onChange={(e) => setJenisLayanan(e.target.value)}>
                                    <option value="">Pilih Kategori Layanan...</option>
                                    <option value="RUTILAHU">Bantuan RUTILAHU</option>
                                    <option value="POHON TUMBANG">Tebang Pohon / Pemangkasan</option>
                                    <option value="BURUAN SAE">Program Buruan Sae</option>
                                    <option value="MUSRENBANG">Pengajuan Musrenbang</option>
                                    <option value="DAU DAN PRAKARSA">DAU & Prakarsa</option>
                                    <option value="SARPRAS DLH">Sarpras DLH</option>
                                </select>
                            </div>
                        </div>

                        {jenisLayanan && (
                            <div className="dokumen-section animasi-muncul">
                                <div className="dokumen-header">
                                    <h3>Unggah Persyaratan Dokumen</h3>
                                    <small>*Maks 5MB/file</small>
                                </div>

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

                                {jenisLayanan === 'BURUAN SAE' && (
                                    <div className="input-grid">
                                        <label className="kotak-upload-pill full-width">
                                            {skBuruanSae ? `✓ ${skBuruanSae.name}` : '📁 SK Buruan Sae'}
                                            <input type="file" className="file-input-asli" onChange={(e) => setSkBuruanSae(e.target.files[0])} />
                                        </label>
                                        <label className="kotak-upload-pill">
                                            {fotoHalaman ? `✓ ${fotoHalaman.name}` : '📁 Foto Halaman'}
                                            <input type="file" className="file-input-asli" onChange={(e) => setFotoHalaman(e.target.files[0])} />
                                        </label>
                                        <label className="kotak-upload-pill">
                                            {kebutuhanTanaman ? `✓ ${kebutuhanTanaman.name}` : '📁 File Tanaman'}
                                            <input type="file" className="file-input-asli" onChange={(e) => setKebutuhanTanaman(e.target.files[0])} />
                                        </label>
                                    </div>
                                )}

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
                                            {fotoRembuk ? `✓ ${fotoRembuk.name}` : '📁 Foto Rembuk'}
                                            <input type="file" className="file-input-asli" onChange={(e) => setFotoRembuk(e.target.files[0])} />
                                        </label>
                                        <label className="kotak-upload-pill">
                                            {daftarHadir ? `✓ ${daftarHadir.name}` : '📁 Daftar Hadir'}
                                            <input type="file" className="file-input-asli" onChange={(e) => setDaftarHadir(e.target.files[0])} />
                                        </label>
                                    </div>
                                )}

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

                                {/* UI UPLOAD KHUSUS SARPRAS DLH */}
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
                        )}
                    </div>

                    <div className="form-publik-footer">
                        <div className="footer-info">
                            <strong>Konfirmasi:</strong>
                            <p>Dengan menekan tombol, Anda menyetujui data yang dikirim adalah valid.</p>
                        </div>
                        <button type="submit" className="btn-submit-pill">
                            Submit ➔
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}