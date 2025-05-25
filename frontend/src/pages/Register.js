import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthdate: '',
    acceptTerms: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return false;
    }
    if (!formData.acceptTerms) {
      setError('Debes aceptar los términos y condiciones');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const userData = {
        email: formData.email,
        password: formData.password,
        nombre: `${formData.firstName} ${formData.lastName}`,
        birthdate: formData.birthdate,
        acceptTerms: formData.acceptTerms
      };

      const response = await axios.post('http://localhost:8000/auth/register', userData);

      console.log('Usuario registrado:', response.data);
      navigate('/login', {
        state: {
          registrationSuccess: true,
          email: formData.email
        }
      });

    } catch (err) {
      console.error('Error en el registro:', err);
      setError(err.response?.data?.detail || 'Error al registrar el usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <header className="register-header">
        <Link to="/" className="register-logo">VuelaBarato</Link>
      </header>

      <div className="register-content">
        <div className="register-card">
          <h1 className="register-title">Crear una cuenta</h1>

          {error && <div className="register-error">{error}</div>}

          <form onSubmit={handleSubmit} className="register-form">
            <div className="register-name-fields">
              <div className="register-form-group">
                <label htmlFor="firstName" className="register-label">Nombre</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  className="register-input"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="register-form-group">
                <label htmlFor="lastName" className="register-label">Apellidos</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  className="register-input"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="register-form-group">
              <label htmlFor="email" className="register-label">Correo electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                className="register-input"
                value={formData.email}
                onChange={handleChange}
                placeholder="tucorreo@ejemplo.com"
                required
              />
            </div>

            <div className="register-form-group">
              <label htmlFor="password" className="register-label">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                className="register-input"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                minLength="8"
              />
            </div>

            <div className="register-form-group">
              <label htmlFor="confirmPassword" className="register-label">Confirmar contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="register-input"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                minLength="8"
              />
            </div>

            <div className="register-form-group">
              <label htmlFor="birthdate" className="register-label">Fecha de nacimiento</label>
              <input
                type="date"
                id="birthdate"
                name="birthdate"
                className="register-input"
                value={formData.birthdate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="register-terms">
              <input
                type="checkbox"
                id="acceptTerms"
                name="acceptTerms"
                className="register-checkbox"
                checked={formData.acceptTerms}
                onChange={handleChange}
                required
              />
              <label htmlFor="acceptTerms" className="register-terms-label">
                Acepto los <Link to="/terms" className="register-link">Términos y condiciones</Link> y la
                <Link to="/privacy" className="register-link">Política de privacidad</Link>
              </label>
            </div>

            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Registrarse'}
            </button>
          </form>

          <div className="register-divider">
            <span className="register-divider-text">o continuar con</span>
          </div>

          <div className="register-social">
            <button type="button" className="register-social-button">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" />
              Continuar con Google
            </button>
            <button type="button" className="register-social-button">
              <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple" />
              Continuar con Apple
            </button>
          </div>

          <div className="register-footer">
            ¿Ya tienes una cuenta? <Link to="/login" className="register-link">Inicia sesión</Link>
          </div>
        </div>
      </div>

      <footer className="register-page-footer">
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

export default Register;