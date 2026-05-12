import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUsuario } from '../services/authService';
import axios from 'axios';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginUsuario(email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.usuario));
      navigate('/dashboard');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || err.response?.data?.message || 'Credenciales incorrectas');
      } else {
        setError('Ocurrió un error inesperado al intentar conectar');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #0d0f14;
          background-image:
            radial-gradient(ellipse 80% 60% at 20% 10%, rgba(0,86,179,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 90%, rgba(0,180,140,0.10) 0%, transparent 55%);
          font-family: 'DM Sans', sans-serif;
          padding: 24px;
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 48px 44px;
          backdrop-filter: blur(16px);
          animation: fadeUp 0.5s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .login-eyebrow {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #4e9eff;
          margin-bottom: 10px;
        }

        .login-title {
          font-family: 'DM Serif Display', serif;
          font-size: 32px;
          color: #f0f4ff;
          line-height: 1.15;
          margin-bottom: 36px;
        }

        .login-title em {
          font-style: italic;
          color: #89c2ff;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 28px;
        }

        .field-label {
          display: block;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          margin-bottom: 7px;
        }

        .field-input {
          width: 100%;
          background: rgba(255,255,255,0.055);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 13px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          color: #e8efff;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }

        .field-input::placeholder {
          color: rgba(255,255,255,0.2);
        }

        .field-input:focus {
          border-color: rgba(78,158,255,0.6);
          background: rgba(78,158,255,0.07);
          box-shadow: 0 0 0 3px rgba(78,158,255,0.12);
        }

        .error-box {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,80,80,0.1);
          border: 1px solid rgba(255,80,80,0.25);
          border-radius: 10px;
          padding: 12px 14px;
          margin-bottom: 20px;
          font-size: 13.5px;
          color: #ff9a9a;
          animation: fadeUp 0.25s ease both;
        }

        .error-icon {
          flex-shrink: 0;
          width: 16px;
          height: 16px;
          opacity: 0.8;
        }

        .submit-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #0056b3 0%, #0072e4 100%);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(0,86,179,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .submit-btn:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 6px 28px rgba(0,86,179,0.45);
        }

        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .login-footer {
          margin-top: 28px;
          text-align: center;
          font-size: 12.5px;
          color: rgba(255,255,255,0.22);
          letter-spacing: 0.02em;
        }
      `}</style>

      <div className="login-root">
        <div className="login-card">
          <p className="login-eyebrow">Portal CRM</p>
          <h1 className="login-title">Bienvenido<br />de <em>vuelta</em></h1>

          {error && (
            <div className="error-box">
              <svg className="error-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="8" cy="8" r="7" stroke="#ff9a9a" strokeWidth="1.5"/>
                <path d="M8 4.5V8.5" stroke="#ff9a9a" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="8" cy="11" r="0.75" fill="#ff9a9a"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="field-group">
              <div>
                <label className="field-label" htmlFor="email">Correo electrónico</label>
                <input
                  id="email"
                  className="field-input"
                  type="email"
                  placeholder="tu@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="field-label" htmlFor="password">Contraseña</label>
                <input
                  id="password"
                  className="field-input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? <><span className="spinner" /> Verificando...</> : 'Ingresar'}
            </button>
          </form>

          <p className="login-footer">Acceso restringido · Solo usuarios autorizados</p>
        </div>
      </div>
    </>
  );
};

export default Login;