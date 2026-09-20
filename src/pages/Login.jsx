import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { loginAdmin, kirimLupaPassword } from "../services/api";
import './Login.css';

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    
    // Memori tambahan untuk fitur Lupa Password
    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [resetUsername, setResetUsername] = useState("");
    
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault(); 
        
        try {
            const respons = await loginAdmin(username, password);

            if (respons && respons.status === 'sukses') {
                Swal.fire(respons.pesan);
                localStorage.setItem("isLoggedIn","true");
                localStorage.setItem("token", respons.token);
                navigate("/admin"); 
            } else {
                Swal.fire(respons?.pesan || "Login Gagal!");
            }
        } catch (error) {
            Swal.fire("Koneksi ke server gagal! Pastikan server menyala.");
        }
    };

    const handleLupaPassword = async (e) => {
        e.preventDefault();
        try {
            const result = await kirimLupaPassword(resetUsername);
            if (result.status === 'sukses') {
                Swal.fire(result.pesan);
                setIsModalOpen(false); 
                setResetUsername(""); 
            } else {
                Swal.fire("Gagal: " + result.pesan);
            }
        } catch (error) {
            Swal.fire("Koneksi ke server gagal saat mengirim permintaan.");
        }
    };

    return (
        <div className="login-wrapper-modern">
            <div className="login-card-split">
                
                {/* PANEL KIRI: BRANDING & AWAN */}
                <div className="login-branding">
                    <div className="branding-content">
                        <div className="icon-roket">🚀</div>
                        <h2>ONE EKBANG</h2>
                        <p>Selamat datang kembali! Silakan login untuk mengelola data operasional kelurahan.</p>
                    </div>

                    {/* SVG Awan Pembatas Desktop (Samping Kanan) */}
                    <svg className="awan-desktop" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 800" preserveAspectRatio="none">
                        <path fill="var(--bg-card)" d="M100,0 L100,800 L0,800 C60,700 60,600 0,500 C80,400 80,300 0,200 C60,100 60,50 0,0 Z" />
                    </svg>

                    {/* SVG Awan Pembatas Mobile (Bawah) */}
                    <svg className="awan-mobile" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 100" preserveAspectRatio="none">
                        <path fill="var(--bg-card)" d="M0,100 L800,100 L800,0 C700,60 600,60 500,0 C400,80 300,80 200,0 C100,60 50,60 0,0 Z" />
                    </svg>
                </div>

                {/* PANEL KANAN: FORM LOGIN */}
                <div className="login-form-section">
                    <div className="form-header">
                        <h3>Masuk ke Akun Anda</h3>
                    </div>

                    <form onSubmit={handleLogin} className="login-form-modern">
                        <div className="input-group-login">
                            <label>Username</label>
                            <input 
                                type="text" 
                                className="input-login-pill"
                                placeholder="Masukkan username..."
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                                required 
                            />
                        </div>
                        
                        <div className="input-group-login">
                            <label>Password</label>
                            <input 
                                type="password" 
                                className="input-login-pill"
                                placeholder="Masukkan password..."
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                            />
                        </div>

                        <div className="lupa-password-container-modern">
                            <span className="link-lupa-password" onClick={() => setIsModalOpen(true)}>
                                Lupa Password?
                            </span>
                        </div>

                        <button type="submit" className="btn-login-pill">
                            Sign In
                        </button>
                    </form>
                </div>

            </div>

            {/* KOTAK POP-UP (MODAL) LUPA PASSWORD (Tetap Sama Konsisten ONE EKBANG) */}
            {isModalOpen && (
                <div className="login-modal-overlay">
                    <div className="login-modal-content">
                        <button className="btn-tutup-modal" onClick={() => setIsModalOpen(false)}>X</button>
                        
                        <h3 style={{ marginTop: 0, color: 'var(--text-utama)' }}>Lupa Password?</h3>
                        <p style={{ color: 'var(--text-redup)', fontSize: '14px', marginBottom: '20px' }}>
                            Masukkan username Anda. Sistem akan mengirimkan notifikasi ke Master Admin untuk mereset password akun Anda.
                        </p>
                        
                        <form onSubmit={handleLupaPassword}>
                            <input 
                                type="text" 
                                className="input-login-pill"
                                placeholder="Masukkan username Anda..." 
                                value={resetUsername}
                                onChange={(e) => setResetUsername(e.target.value)}
                                required
                                style={{ marginBottom: '15px' }}
                            />
                            <button type="submit" className="btn-login-pill">Kirim Permintaan Reset</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}