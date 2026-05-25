import { useState } from 'react';
import './Login.css';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  /*const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login intent (bypass):', { email, password });
    // Por ahora omitimos la validación real y simplemente dejamos pasar al usuario
    if (onLogin) onLogin();
  };*/

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        'http://localhost:3000/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            correo: email,
            contrasena: password
          })
        }
    );

    const data = await response.json();

    console.log(data);

    // Login correcto
    if (data.ok) {

      alert('Bienvenido ' + data.usuario.nombre);

      // Guardar usuario
      localStorage.setItem(
        'usuario',
        JSON.stringify(data.usuario)
      );

      // Ir al dashboard
      if (onLogin) {
        onLogin(data.usuario);
      }

    } else {

      alert(data.mensaje);
    }

  } catch (error) {

    console.log(error);

    alert('Error conectando servidor');
  }
};

  return (
    <div className="login-container">
      <div className="login-glass-card">
        <div className="login-header">
          <div className="logo-icon">🌍</div>
          <h1>TinyEarthLab</h1>
          <p>Welcome back, explorer.</p>
        </div>
        
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="input-group">
            <input 
              type="email" 
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" "
              required 
            />
            <label htmlFor="email">Email Address</label>
          </div>
          
          <div className="input-group">
            <input 
              type="password" 
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=" "
              required 
            />
            <label htmlFor="password">Password</label>
          </div>

          <div className="form-actions">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>
          
          <button type="submit" className="login-button">
            Sign In
          </button>
        </form>
        
        <div className="login-footer">
          Don't have an account? <a href="#">Create one</a>
        </div>
      </div>
      
    </div>
  );
}
