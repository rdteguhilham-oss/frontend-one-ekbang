import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { loginAdmin, kirimLupaPassword } from "../services/api";
import './Login.css';

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [resetUsername, setResetUsername] = useState("");
    
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault(); 
        try {
            const respons = await loginAdmin(username, password);
            if (respons && respons.status === 'sukses') {
                await Swal.fire({ 
                    title: 'Success', 
                    text: respons.pesan, 
                    icon: 'success', 
                    confirmButtonColor: '#4f46e5' 
                });
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
            
            {/* LOGO DI LUAR KARTU */}
            <div className="login-brand-top">
                <span className="icon-brand">✦</span> ONE EKBANG
            </div>

            {/* KARTU TENGAH */}
            <div className="login-card-centered">
                <h3>Welcome Back</h3>
                <p>Silakan masuk untuk mengelola data kelurahan</p>

                <form onSubmit={handleLogin}>
                    <input 
                        type="text" 
                        className="input-login-pill"
                        placeholder="Username"
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        required 
                    />
                    
                    <input 
                        type="password" 
                        className="input-login-pill"
                        placeholder="Password"
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />

                    <span className="link-forgot" onClick={() => setIsModalOpen(true)}>
                        Forgot Password?
                    </span>

                    <button type="submit" className="btn-login-pill">
                        Login
                    </button>
                </form>
            </div>

            {/* MODAL LUPA PASSWORD */}
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