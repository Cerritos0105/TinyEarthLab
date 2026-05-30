import { useState } from "react";
import "./Login.css";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: email, contrasena: password }),
      });

      const data = await response.json();

      if (data.ok) {
        localStorage.setItem("usuario", JSON.stringify(data.usuario));
        if (onLogin) onLogin(data.usuario);
      } else {
        setError(data.mensaje || "Credenciales incorrectas. Intenta de nuevo.");
      }
    } catch {
      setError("No se pudo conectar con el servidor. Verifica tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">

      {/* LADO IZQUIERDO — HERO CON KIRBY */}
      <div className="login-hero">
        {/* Cuadrícula de fondo */}
        <div className="hero-grid" />

        {/* Orbe de luz detrás de Kirby */}
        <div className="hero-orb" />

        <div className="hero-content">
          <div className="hero-kirby-wrap">
            <img
              src="/kirby.png"
              alt="Kirby mascota TinyEarthLab"
              className="hero-kirby"
              draggable="false"
            />
            {/* Sombra / reflejo en el suelo */}
            <div className="hero-kirby-shadow" />
          </div>

          <h2 className="hero-title">TinyEarthLab</h2>
          <p className="hero-subtitle">
            Sistema de reservación de laboratorios del ITSSG
          </p>

          <div className="hero-badges">
            <span className="hero-badge">🔬 Laboratorios</span>
            <span className="hero-badge">📅 Reservaciones</span>
            <span className="hero-badge">👥 Equipos</span>
          </div>
        </div>
      </div>

      {/* LADO DERECHO — FORMULARIO */}
      <div className="login-right">
        <div className="login-glass-card">
          <div className="login-header">
            <span className="logo-icon">🌍</span>
            <h1>Iniciar Sesión</h1>
            <p>Bienvenido de vuelta, explorador.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {/* Error */}
            {error && <div className="login-error">⚠️ {error}</div>}

            {/* Email */}
            <div className="input-group">
              <span className="input-icon">✉️</span>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
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
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder=" "
                required
                autoComplete="current-password"
                disabled={loading}
              />
              <label htmlFor="password">Contraseña</label>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? (
                <>
                  <span className="btn-spinner" />
                  Verificando...
                </>
              ) : (
                "Iniciar Sesión →"
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
