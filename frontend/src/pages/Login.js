import React, { useState } from 'react';
import { auth, provider } from '../services/firebase';
import { signInWithPopup } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, setCurrentUser } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const response = await axios.post('http://localhost:8000/auth/google-login', {
      email: user.email,
      nombre: user.displayName,
      uid: user.uid,
    });

    // Guardar sesión en localStorage
    const sessionData = {
      user: {
        email: user.email,
        nombre: user.displayName
      },
      expiresAt: new Date().getTime() + (60 * 60 * 1000) // 1 hora
    };
    localStorage.setItem('session', JSON.stringify(sessionData));

    // Actualizar contexto
    setCurrentUser(sessionData.user);

    console.log('Inicio de sesión con Google exitoso:', response.data);
    navigate('/');

  } catch (error) {
    console.error('Error al iniciar sesión con Google:', error);
    setError('Error al iniciar sesión con Google');
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
  
    try {
      const user = await login(email, password);
      
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
      }
      
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Correo o contraseña incorrectos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <header className="login-header">
        <Link to="/" className="login-logo">VuelaBarato</Link>
      </header>
      
      <div className="login-content">
        <div className="login-card">
          <h1 className="login-title">Iniciar sesión</h1>
          
          {error && <div className="login-error">{error}</div>}
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-form-group">
              <label htmlFor="email" className="login-label">Correo electrónico</label>
              <input
                type="email"
                id="email"
                className="login-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tucorreo@ejemplo.com"
                required
              />
            </div>
            
            <div className="login-form-group">
              <label htmlFor="password" className="login-label">Contraseña</label>
              <input
                type="password"
                id="password"
                className="login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            
            <div className="login-options">
              <div className="login-remember">
                <input
                  type="checkbox"
                  id="remember"
                  className="login-checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember">Recordarme</label>
              </div>
              <Link to="/ForgotPassword" className="login-link">¿Olvidaste tu contraseña?</Link>
            </div>
            
            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>
          
          <div className="login-divider">
            <span className="login-divider-text">o continuar con</span>
          </div>
          
          <div className="login-social">
            <button
              type="button"
              className="login-social-button"
              onClick={handleGoogleLogin}
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" />
              Continuar con Google
            </button>

            <button type="button" className="login-social-button">
              <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple" />
              Continuar con Apple
            </button>
          </div>
          
          <div className="login-footer">
            ¿No tienes una cuenta? <Link to="/register" className="login-link">Regístrate</Link>
          </div>
        </div>
      </div>
      
      <footer className="login-page-footer">
        <div className="footer-columns">
          <div className="footer-column">
            <h3>Compañía</h3>
            <ul>
              <li><Link to="/assistance">Asistencia</Link></li>
              <li><Link to="/resources">Recursos</Link></li>
              <li><Link to="/subscribe">Suscríbete</Link></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h3>Sobre nosotros</h3>
            <ul>
              <li><Link to="/careers">Carreras</Link></li>
              <li><Link to="/press">Prensa</Link></li>
              <li><Link to="/blog">Blog</Link></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h3>Centro de ayuda</h3>
            <ul>
              <li><Link to="/contact">Contáctanos</Link></li>
              <li><Link to="/privacy">Política de privacidad</Link></li>
              <li><Link to="/terms">Términos y condiciones</Link></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h3>Guías de viaje</h3>
            <ul>
              <li><Link to="/airlines">Aerolíneas</Link></li>
              <li><Link to="/airports">Aeropuertos</Link></li>
              <li><Link to="/sitemap">Mapa del sitio</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-newsletter">
          <h3>Recibe ofertas exclusivas en tu correo</h3>
          <form className="newsletter-form">
            <input type="email" placeholder="Tu email" className="newsletter-input" />
            <button type="submit" className="newsletter-button">Suscribirse</button>
          </form>
        </div>
        
        <div className="footer-copyright">
          © 2023 VuelaBarato. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
};

export default Login;