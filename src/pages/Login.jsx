import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { loginAdmin, kirimLupaPassword } from "../services/api";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaClipboardList, FaMapMarkedAlt, FaChartBar, FaTasks, FaSignInAlt } from 'react-icons/fa';
import './Login.css';

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    
    const [loading, setLoading] = useState(false);
    
    // Memori tambahan untuk fitur Lupa Password
    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [resetUsername, setResetUsername] = useState("");
    
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault(); 
        if (loading) return;
        setLoading(true);
        try {
            const respons = await loginAdmin(username, password);

            if (respons && respons.status === 'sukses') {
                await Swal.fire({ 
                    title: 'Success', 
                    text: respons.pesan, 
                    icon: 'success', 
                    confirmButtonColor: '#0066FF' });
                localStorage.setItem("isLoggedIn","true");
                localStorage.setItem("token", respons.token);
                if (respons.dataAdmin) {
                    localStorage.setItem("dataAdmin", JSON.stringify(respons.dataAdmin));
                }
                navigate("/dashboard"); 
            } else {
                Swal.fire(respons?.pesan || "Login Gagal!");
            }
        } catch {
            Swal.fire("Koneksi ke server gagal! Pastikan server menyala.");
        } finally {
            setLoading(false);
        }
    };

    const handleLupaPassword = async (e) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        try {
            const result = await kirimLupaPassword(resetUsername);
            if (result.status === 'sukses') {
                Swal.fire(result.pesan);
                setIsModalOpen(false); 
                setResetUsername(""); 
            } else {
                Swal.fire("Gagal: " + result.pesan);
            }
        } catch {
            Swal.fire("Koneksi ke server gagal saat mengirim permintaan.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-publik-wrapper">


            {/* KARTU LOGIN UTAMA */}
            <div className="login-card-container">
                <div className="login-card-header">
                    <div className="login-card-logo-wrap">
                        <img src="/rb-logo-oneEkbang.png" alt="Logo One Ekbang" className="login-card-logo-img" />
                    </div>
                    <p className="login-subtitle-utama">Akses sistem untuk seluruh pegawai Kelurahan Pasteur</p>
                </div>

                <form onSubmit={handleLogin} className="login-card-form">
                    <div className="input-group-pill">
                        <label>
                            <span className="label-icon-badge">
                                <FaUser />
                            </span>
                            Username
                        </label>
                        <input 
                            type="text" 
                            placeholder="Masukkan username atau NIP..."
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            required 
                        />
                    </div>
                    
                    <div className="input-group-pill">
                        <label>
                            <span className="label-icon-badge">
                                <FaLock />
                            </span>
                            Password
                        </label>
                        <div className="password-input-pill-wrapper">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="Masukkan password akun..."
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                            />
                            <button type="button" className="btn-toggle-pass-pill" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    <div className="login-pill-options">
                        <label className="checkbox-ingat">
                            <input type="checkbox" defaultChecked />
                            <span>Ingat saya</span>
                        </label>
                        <span className="link-lupa-pass" onClick={() => setIsModalOpen(true)}>
                            Lupa password?
                        </span>
                    </div>

                    <button 
                        type="submit" 
                        className="btn-submit-login" 
                        disabled={loading} 
                        style={loading ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
                    >
                        {loading ? (
                            '⏳ Memproses...'
                        ) : (
                            <>
                                <FaSignInAlt className="btn-login-icon" />
                                <span>Login</span>
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* 4. FLOATING MENU FITUR DI BAWAH KARTU LOGIN */}
            <div className="login-v2-floating-menu">
                <div className="floating-item">
                    <FaClipboardList className="floating-icon" />
                    <span>Kelola Data<br/>Ekbang</span>
                </div>
                <div className="floating-item">
                    <FaTasks className="floating-icon" />
                    <span>Monitoring<br/>Kegiatan</span>
                </div>
                <div className="floating-item">
                    <FaMapMarkedAlt className="floating-icon" />
                    <span>Pemetaan<br/>Wilayah</span>
                </div>
                <div className="floating-item">
                    <FaChartBar className="floating-icon" />
                    <span>Laporan &amp;<br/>Evaluasi</span>
                </div>
            </div>

            {/* 5. POP-UP MODAL LUPA PASSWORD */}
            {isModalOpen && (
                <div className="login-modal-overlay">
                    <div className="login-modal-content">
                        <button className="btn-tutup-modal" onClick={() => setIsModalOpen(false)}>✕</button>
                        
                        <h3 style={{ marginTop: 0, color: '#0F172A', fontSize: '18px', fontWeight: '800' }}>Lupa Password?</h3>
                        <p style={{ color: '#64748B', fontSize: '13px', lineHeight: '1.45', marginBottom: '20px' }}>
                            Masukkan username Anda. Sistem akan mengirimkan notifikasi ke Master Admin untuk mereset password akun Anda.
                        </p>
                        
                        <form onSubmit={handleLupaPassword}>
                            <div className="input-group-pill" style={{ marginBottom: '16px', textAlign: 'left' }}>
                                <label style={{ fontSize: '12.5px', color: '#1E293B', fontWeight: '600', marginBottom: '6px' }}>Username Anda</label>
                                <input 
                                    type="text" 
                                    placeholder="Masukkan username Anda..." 
                                    value={resetUsername}
                                    onChange={(e) => setResetUsername(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #E2E8F0', backgroundColor: '#F8FAFC' }}
                                />
                            </div>
                            <button type="submit" className="btn-submit-login" style={{ width: '100%', justifyContent: 'center' }}>
                                Kirim Permintaan Reset ➔
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}