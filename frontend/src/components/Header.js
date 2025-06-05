import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMenuOpen && !e.target.closest('.user-menu-container')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen]);

  return (
    <header className="header">
      <div className="container">
        <div className="logo">WayFinder</div>
        <nav className="nav">
          <Link to="/" className="nav-link">Inicio</Link>
          <Link to="/flights" className="nav-link">Vuelos</Link>
          <Link to="/hotels" className="nav-link">Hoteles</Link>
          <Link to="/offers" className="nav-link">Ofertas</Link>
          <Link to="/contact" className="nav-link">Contacto</Link>
        </nav>
        <div className="auth-buttons">
          {currentUser ? (
            <div className="user-menu-container">
              <button
                className="user-menu-trigger"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <span className="user-avatar">
                  {currentUser.nombre.charAt(0).toUpperCase()}
                </span>
                <span className="user-welcome">{currentUser.nombre}</span>
                <span className={`dropdown-arrow ${isMenuOpen ? 'open' : ''}`}>▼</span>
              </button>

              {isMenuOpen && (
                <div className="user-dropdown">
                  <Link to="/profile" className="perfil" onClick={() => setIsMenuOpen(false)}>
                    Mi perfil
                  </Link>
                  <Link to="/my-bookings" className="perfil" onClick={() => setIsMenuOpen(false)}>
                    Mis reservas
                  </Link>
                  <button className="logout-btn" onClick={logout}>
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="login-btn">Iniciar sesión</Link>
              <Link to="/register" className="register-btn">Registrarse</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
