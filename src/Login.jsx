import { useState } from 'react';
import './Login.css';

// Componente de partículas de fondo
function Particles() {
  const items = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    duration: `${6 + Math.random() * 10}s`,
    delay: `${Math.random() * 8}s`,
    size: `${2 + Math.random() * 3}px`,
    opacity: 0.3 + Math.random() * 0.5,
  }));

  return (
    <div className="particles">
      {items.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            '--duration': p.duration,
            '--delay': p.delay,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
}

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: email, contrasena: password }),
      });

      const data = await response.json();

      if (data.ok) {
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        if (onLogin) onLogin(data.usuario);
      } else {
        setError(data.mensaje || 'Credenciales incorrectas. Intenta de nuevo.');
      }
    } catch {
      setError('No se pudo conectar con el servidor. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">

      {/* ── LADO IZQUIERDO: HERO ── */}
      <div className="login-hero">
        <Particles />
        <div className="hero-content">
          <div className="hero-globe">
            <div className="globe-ring" />
          </div>

          <h2 className="hero-title">TinyEarthLab</h2>
          <p className="hero-subtitle">
            Reserva laboratorios de forma rápida, segura y colaborativa con tu equipo.
          </p>

          <div className="hero-badges">
            <span className="hero-badge">🔬 Laboratorios</span>
            <span className="hero-badge">👥 Equipos</span>
            <span className="hero-badge">📅 Reservas</span>
          </div>
        </div>
      </div>

      {/* ── LADO DERECHO: FORMULARIO ── */}
      <div className="login-right">
        <div className="login-glass-card">

          <div className="login-header">
            <span className="logo-icon">🌍</span>
            <h1>Iniciar Sesión</h1>
            <p>Bienvenido de vuelta, explorador.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>

            {/* Error message */}
            {error && (
              <div className="login-error">
                ⚠️ {error}
              </div>
            )}

            {/* Email */}
            <div className="input-group">
              <span className="input-icon">✉️</span>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder=" "
                required
                autoComplete="email"
                disabled={loading}
              />
              <label htmlFor="email">Correo electrónico</label>
            </div>

            {/* Password */}
            <div className="input-group">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder=" "
                required
                autoComplete="current-password"
                disabled={loading}
              />
              <label htmlFor="password">Contraseña</label>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? (
                <><span className="btn-spinner" />Verificando...</>
              ) : (
                'Iniciar Sesión →'
              )}
            </button>

          </form>

          <div className="login-footer">
            Instituto Tecnológico Superior del Sur de Guanajuato
          </div>

        </div>
      </div>

    </div>
  );
}
