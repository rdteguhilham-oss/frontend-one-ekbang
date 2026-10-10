import { useState, useEffect } from 'react';
import './CetakSuratModal.css';

export default function CetakSuratModal({ suratPilih, onClose }) {
    const [printNomorSurat, setPrintNomorSurat] = useState('');
    const [printSifat, setPrintSifat] = useState('Segera');
    const [printLampiran, setPrintLampiran] = useState('-');
    const [printHal, setPrintHal] = useState('');
    const [printTujuan, setPrintTujuan] = useState('');
    const [printDi, setPrintDi] = useState('BANDUNG');
    const [printParagraf1, setPrintParagraf1] = useState('');
    const [printParagraf2, setPrintParagraf2] = useState('Demikian permohonan ini disampaikan, atas perhatiannya kami ucapkan terima kasih.');
    
    // TTE & Penandatangan
    const [printPakaiTTE, setPrintPakaiTTE] = useState(true);
    const [printTteHeader, setPrintTteHeader] = useState('Ditandatangani secara elektronik oleh:\nLurah Pasteur');
    const [printNamaLurah, setPrintNamaLurah] = useState('Agung Aji Purnomo, S.IP, M.Si');
    const [printPangkatLurah, setPrintPangkatLurah] = useState('Pembina / IVa');
    const [printNipLurah, setPrintNipLurah] = useState('19801208 200604 1 008');
    const [printTembusan, setPrintTembusan] = useState('Yth. Camat Sukajadi.');
    const [printTteFooterTeks, setPrintTteFooterTeks] = useState('Dokumen ini telah ditandatangani secara elektronik menggunakan Sertifikat Elektronik yang dikeluarkan oleh Balai Besar Sertifikasi Elektronik (BSrE), BSSN');
    const [printLinkQR, setPrintLinkQR] = useState('');

    useEffect(() => {
        if (suratPilih) {
            const blnRoman = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'][new Date().getMonth()];
            setPrintNomorSurat(`S/LH.04.04/11-Kel. Pstr/${blnRoman}/${new Date().getFullYear()}`);
            setPrintHal(`Permohonan Tindak Lanjut ${suratPilih.jenis_layanan}`);
            setPrintTujuan('1. Kepala Dinas Terkait');
            setPrintParagraf1(`Dipermaklumkan dengan hormat, sehubungan dengan laporan dan usulan warga di wilayah Kelurahan Pasteur, bersama ini kami sampaikan permohonan tindak lanjut untuk program ${suratPilih.jenis_layanan}. Adapun rincian data pemohon adalah sebagai berikut:`);
        }
    }, [suratPilih]);

    if (!suratPilih) return null;

    return (
        <div className="print-modal-overlay">
            <div className="cetak-surat-split">
                {/* 1. PANEL EDITOR (Kiri) */}
                <div className="cetak-editor-panel">
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <h3 style={{margin:0}}>Pengaturan Surat</h3>
                    </div>

                    <div className="form-grup-cetak">
                        <label>Nomor Surat</label>
                        <input type="text" value={printNomorSurat} onChange={e => setPrintNomorSurat(e.target.value)} />
                    </div>
                    
                    <div style={{display:'flex', gap:'10px'}}>
                        <div className="form-grup-cetak" style={{flex:1}}>
                            <label>Sifat</label>
                            <input type="text" value={printSifat} onChange={e => setPrintSifat(e.target.value)} />
                        </div>
                        <div className="form-grup-cetak" style={{flex:1}}>
                            <label>Lampiran</label>
                            <input type="text" value={printLampiran} onChange={e => setPrintLampiran(e.target.value)} />
                        </div>
                    </div>
                    
                    <div className="form-grup-cetak">
                        <label>Hal</label>
                        <textarea value={printHal} onChange={e => setPrintHal(e.target.value)} style={{minHeight:'50px'}} />
                    </div>
                    
                    <div className="form-grup-cetak">
                        <label>Yth. (Tujuan)</label>
                        <textarea value={printTujuan} onChange={e => setPrintTujuan(e.target.value)} style={{minHeight:'60px'}} />
                    </div>

                    <div className="form-grup-cetak">
                        <label>Di (Lokasi Tujuan)</label>
                        <input type="text" value={printDi} onChange={e => setPrintDi(e.target.value)} />
                    </div>

                    <div className="form-grup-cetak">
                        <label>Paragraf Pembuka & Isi</label>
                        <textarea value={printParagraf1} onChange={e => setPrintParagraf1(e.target.value)} style={{minHeight:'150px'}} />
                    </div>
                    
                    <div className="form-grup-cetak">
                        <label>Paragraf Penutup</label>
                        <textarea value={printParagraf2} onChange={e => setPrintParagraf2(e.target.value)} style={{minHeight:'60px'}} />
                    </div>

                    {/* PEMBATAS UNTUK TTE */}
                    <div style={{borderTop: '2px dashed #cbd5e1', margin: '15px 0'}}></div>

                    <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px'}}>
                        <input type="checkbox" id="pakaiTTE" checked={printPakaiTTE} onChange={e => setPrintPakaiTTE(e.target.checked)} style={{width:'auto'}} />
                        <label htmlFor="pakaiTTE" style={{margin:0, fontSize:'14px', cursor:'pointer'}}>Gunakan Format TTE (BSrE)</label>
                    </div>

                    {printPakaiTTE ? (
                        <>
                            <div className="form-grup-cetak">
                                <label>Teks Kepala Kotak TTE</label>
                                <textarea value={printTteHeader} onChange={e => setPrintTteHeader(e.target.value)} style={{minHeight:'50px'}} />
                            </div>
                            <div className="form-grup-cetak">
                                <label>Teks Footer Barcode</label>
                                <textarea value={printTteFooterTeks} onChange={e => setPrintTteFooterTeks(e.target.value)} style={{minHeight:'60px'}} />
                            </div>
                            <div className="form-grup-cetak">
                                <label>URL / Link QR Code (Jika Ada)</label>
                                <input type="text" placeholder="https://..." value={printLinkQR} onChange={e => setPrintLinkQR(e.target.value)} />
                            </div>
                        </>
                    ) : null}

                    <div className="form-grup-cetak">
                        <label>Nama Penandatangan (Lurah)</label>
                        <input type="text" value={printNamaLurah} onChange={e => setPrintNamaLurah(e.target.value)} />
                    </div>

                    <div style={{display:'flex', gap:'10px'}}>
                        <div className="form-grup-cetak" style={{flex:1}}>
                            <label>NIP</label>
                            <input type="text" value={printNipLurah} onChange={e => setPrintNipLurah(e.target.value)} />
                        </div>
                        <div className="form-grup-cetak" style={{flex:1}}>
                            <label>Pangkat / Gol</label>
                            <input type="text" value={printPangkatLurah} onChange={e => setPrintPangkatLurah(e.target.value)} />
                        </div>
                    </div>

                    <div className="form-grup-cetak">
                        <label>Tembusan</label>
                        <textarea value={printTembusan} onChange={e => setPrintTembusan(e.target.value)} style={{minHeight:'50px'}} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px', paddingBottom: '30px' }}>
                        <button onClick={() => window.print()} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%', fontSize: '14px' }}>
                            🖨️ Cetak / Simpan PDF
                        </button>
                        <button type="button" onClick={onClose} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '12px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', width: '100%' }}>
                            Batal / Keluar
                        </button>
                    </div>

                </div>

                {/* 2. PANEL PREVIEW (Kanan) */}
                <div className="cetak-preview-panel">
                    <div className="kertas-surat-a4">
                        
                        {/* KOP SURAT */}
                        <div className="kop-surat-resmi">
                            <img src="/logo-kota-bandung.jpg" alt="Logo" className="kop-logo" />
                            <div className="kop-teks">
                                <h4>PEMERINTAH DAERAH KOTA BANDUNG</h4>
                                <h3>KECAMATAN SUKAJADI</h3>
                                <h2>KELURAHAN PASTEUR</h2>
                                <p>
                                    Jl. Sampurna No.4, Pasteur, Kec. Sukajadi, Kota Bandung, Jawa Barat 40161<br/>
                                    Telp. -, Fax - e-mail : Kelurahanpasteur042@gmail.com
                                </p>
                            </div>
                        </div>

                        {/* TANGGAL */}
                        <div className="tgl-surat-resmi">
                            Bandung, {new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}
                        </div>

                        {/* META SURAT */}
                        <div className="meta-surat-resmi">
                            <table>
                                <tbody>
                                    <tr><td width="70">Nomor</td><td width="10">:</td><td>{printNomorSurat}</td></tr>
                                    <tr><td>Sifat</td><td>:</td><td>{printSifat}</td></tr>
                                    <tr><td>Lampiran</td><td>:</td><td>{printLampiran}</td></tr>
                                    <tr><td>Hal</td><td>:</td><td>{printHal.split('\n').map((line, i) => <div key={i}>{line}</div>)}</td></tr>
                                </tbody>
                            </table>
                        </div>

                        {/* TUJUAN SURAT */}
                        <div className="tujuan-surat-resmi">
                            Yth.<br/>
                            <div style={{marginLeft: '20px'}}>
                                {printTujuan.split('\n').map((line, i) => <div key={i}>{line}</div>)}
                            </div>
                            di<br/>
                            {printDi}
                        </div>

                        {/* ISI SURAT */}
                        <div className="isi-surat-resmi">
                            {printParagraf1.split('\n').map((line, i) => (
                                <p key={i} className={i === 0 ? 'indent' : ''}>{line}</p>
                            ))}
                            

                            {printParagraf2.split('\n').map((line, i) => (
                                <p key={i} className="indent">{line}</p>
                            ))}
                        </div>

                        {/* TANDA TANGAN */}
                        <div className="ttd-box-resmi">
                            <div className="ttd-lurah">
                                LURAH PASTEUR,
                                
                                {printPakaiTTE ? (
                                    <div className="kotak-tte-bsre">
                                        <img src="/logo-kota-bandung.jpg" alt="Logo Pemkot" />
                                        <div className="kotak-tte-teks">
                                            <div className="tte-head">
                                                {printTteHeader.split('\n').map((line, i) => <div key={i}>{line}</div>)}
                                            </div>
                                            <div className="tte-nama">{printNamaLurah}</div>
                                            <div className="tte-nip">{printPangkatLurah}</div>
                                            <div className="tte-nip">NIP. {printNipLurah}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="nama-lurah-biasa">{printNamaLurah}</div>
                                        <div className="nip-lurah-biasa">{printPangkatLurah}</div>
                                        <div className="nip-lurah-biasa">NIP. {printNipLurah}</div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* TEMBUSAN */}
                        {printTembusan && (
                            <div className="tembusan-resmi">
                                Tembusan:
                                <ol>
                                    {printTembusan.split('\n').map((line, i) => {
                                        let text = line.replace(/^[0-9]+\.\s*/, '');
                                        return <li key={i}>{text}</li>;
                                    })}
                                </ol>
                            </div>
                        )}

                        {/* FOOTER BSrE */}
                        {printPakaiTTE && (
                            <div className="footer-bsre">
                                <div className="footer-bsre-kiri">
                                    {printLinkQR ? (
                                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(printLinkQR)}`} alt="QR Code" style={{width: '60px', height: '60px', border: '1px solid black', padding: '2px'}} />
                                    ) : (
                                        <div className="fake-qr"></div>
                                    )}
                                    <p className="footer-bsre-teks">{printTteFooterTeks}</p>
                                </div>
                                <div className="fake-bsre-logo">
                                    <div className="fake-bsre-bulat">?</div>
                                    <span>Balai Besar<br/><small>Sertifikasi Elektronik</small></span>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}


