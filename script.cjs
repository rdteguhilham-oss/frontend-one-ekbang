const fs = require('fs');
const file = 'd:/ProjectKelurahan/frontend-one-ekbang/src/components/CetakSuratModal.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/<h3>Pengaturan Surat<\/h3>.*?<\/button>\r?\n.*?<\/button>/s, '<h3 style={{margin:0}}>Pengaturan Surat</h3>');

const bottomRegex = /<textarea value=\{printTembusan\} onChange=\{e => setPrintTembusan\(e\.target\.value\)\} style=\{\{minHeight:'50px'\}\} \/>\r?\n\s*<\/div>\r?\n\r?\n\s*<\/div>\r?\n\r?\n\s*\{\/\* 2\. PANEL PREVIEW \(Kanan\) \*\/\}/s;

const newBottom = `<textarea value={printTembusan} onChange={e => setPrintTembusan(e.target.value)} style={{minHeight:'50px'}} />
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

                {/* 2. PANEL PREVIEW (Kanan) */}`;

content = content.replace(bottomRegex, newBottom);

fs.writeFileSync(file, content, 'utf8');
console.log('Update finished.');
