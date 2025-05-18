import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/FlightResults.css';

function FlightResults() {
  const { currentUser } = useAuth();
  const [activeFilter, setActiveFilter] = useState('cheapest');
  
  // Datos de ejemplo de vuelos
  const [flights, setFlights] = useState([
    {
      id: 1,
      airline: 'Iberia',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Iberia_logo.svg/1200px-Iberia_logo.svg.png',
      departure: {
        time: '08:30',
        airport: 'MAD',
        date: 'Lun 15 Jun'
      },
      arrival: {
        time: '10:15',
        airport: 'BCN',
        date: 'Lun 15 Jun'
      },
      duration: '1h 45m',
      stops: 'Directo',
      price: 89,
      baggage: 'Incluida'
    },
    {
      id: 2,
      airline: 'Vueling',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Vueling_logo.svg/1200px-Vueling_logo.svg.png',
      departure: {
        time: '12:45',
        airport: 'MAD',
        date: 'Lun 15 Jun'
      },
      arrival: {
        time: '14:30',
        airport: 'BCN',
        date: 'Lun 15 Jun'
      },
      duration: '1h 45m',
      stops: 'Directo',
      price: 65,
      baggage: 'Incluida'
    },
    {
      id: 3,
      airline: 'Air Europa',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Air_Europa_logo.svg/1200px-Air_Europa_logo.svg.png',
      departure: {
        time: '18:20',
        airport: 'MAD',
        date: 'Lun 15 Jun'
      },
      arrival: {
        time: '20:05',
        airport: 'BCN',
        date: 'Lun 15 Jun'
      },
      duration: '1h 45m',
      stops: 'Directo',
      price: 78,
      baggage: 'Incluida'
    },
    {
      id: 4,
      airline: 'Ryanair',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Ryanair_logo_2013.svg/1200px-Ryanair_logo_2013.svg.png',
      departure: {
        time: '07:15',
        airport: 'MAD',
        date: 'Lun 15 Jun'
      },
      arrival: {
        time: '09:30',
        airport: 'BCN',
        date: 'Lun 15 Jun'
      },
      duration: '2h 15m',
      stops: 'Directo',
      price: 45,
      baggage: 'No incluida'
    },
    {
      id: 5,
      airline: 'Iberia',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Iberia_logo.svg/1200px-Iberia_logo.svg.png',
      departure: {
        time: '21:00',
        airport: 'MAD',
        date: 'Lun 15 Jun'
      },
      arrival: {
        time: '22:45',
        airport: 'BCN',
        date: 'Lun 15 Jun'
      },
      duration: '1h 45m',
      stops: 'Directo',
      price: 95,
      baggage: 'Incluida'
    }
  ]);

  // Filtrar vuelos según la opción seleccionada
  const filteredFlights = [...flights].sort((a, b) => {
    if (activeFilter === 'cheapest') return a.price - b.price;
    if (activeFilter === 'expensive') return b.price - a.price;
    if (activeFilter === 'fastest') {
      const durationA = parseInt(a.duration);
      const durationB = parseInt(b.duration);
      return durationA - durationB;
    }
    return 0;
  });

    const { logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    //cuando clicke fuera se cierra
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
    <div className="flight-results-app">
      {/* Header (puedes reutilizar el mismo de tu Home) */}
      <header className="header">
      <div className="container">
        <div className="logo"><Link to="/" style={{textDecoration:'none', color: 'white'}}>VuelaBarato</Link></div>
        <nav className="nav">
          <a href="#" className="nav-link">Inicio</a>
          <a href="#" className="nav-link">Vuelos</a>
          <a href="#" className="nav-link">Hoteles</a>
          <a href="#" className="nav-link">Ofertas</a>
          <a href="#" className="nav-link">Contacto</a>
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
                  <button className="logout-btn" onClick={logout}>
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="login-btn">Iniciar sesión</Link>
              <Link to="/Register" className="register-btn">Registrarse</Link>
            </>
          )}
        </div>
      </div>
    </header>

      {/* Contenido principal */}
      <main className="results-container">
        <div className="container">
          {/* Breadcrumb */}
          <div className="breadcrumb">
            <Link to="/">Inicio</Link> &gt; <span>Resultados de vuelos</span>
          </div>

          {/* Filtros */}
          <div className="filters">
            <button 
              className={`filter-btn ${activeFilter === 'cheapest' ? 'active' : ''}`}
              onClick={() => setActiveFilter('cheapest')}
            >
              <i className="fas fa-euro-sign"></i> Más baratos
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'expensive' ? 'active' : ''}`}
              onClick={() => setActiveFilter('expensive')}
            >
              <i className="fas fa-euro-sign"></i> Más caros
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'fastest' ? 'active' : ''}`}
              onClick={() => setActiveFilter('fastest')}
            >
              <i className="fas fa-bolt"></i> Más rápidos
            </button>
          </div>

          {/* Resumen de búsqueda */}
          <div className="search-summary">
            <h2>Madrid (MAD) → Barcelona (BCN)</h2>
            <p>Lunes, 15 de junio - 1 pasajero - Turista</p>
          </div>

          {/* Listado de vuelos */}
          <div className="flights-list">
            {filteredFlights.map(flight => (
              <div key={flight.id} className="flight-card">
                <div className="flight-header">
                  <img src={flight.logo} alt={flight.airline} className="airline-logo" />
                  <span className="airline-name">{flight.airline}</span>
                  <span className="flight-price">{flight.price} €</span>
                </div>
                
                <div className="flight-details">
                  <div className="time-block">
                    <span className="time">{flight.departure.time}</span>
                    <span className="airport">{flight.departure.airport}</span>
                    <span className="date">{flight.departure.date}</span>
                  </div>
                  
                  <div className="duration-block">
                    <div className="duration-line">
                      <span className="duration">{flight.duration}</span>
                    </div>
                    <span className="stops">{flight.stops}</span>
                  </div>
                  
                  <div className="time-block">
                    <span className="time">{flight.arrival.time}</span>
                    <span className="airport">{flight.arrival.airport}</span>
                    <span className="date">{flight.arrival.date}</span>
                  </div>
                </div>
                
                <div className="flight-footer">
                  <span className="baggage-info">
                    <i className="fas fa-suitcase"></i> {flight.baggage}
                  </span>
                  <button className="select-btn">
                    Seleccionar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer (puedes reutilizar el mismo de tu Home) */}
      <footer className="footer">
        <div className="container">
            <div className="footer-columns">
                <div className="footer-column">
                <h4>Compañía</h4>
                <ul>
                    <li><a href="#">Sobre nosotros</a></li>
                    <li><a href="#">Carreras</a></li>
                    <li><a href="#">Prensa</a></li>
                    <li><a href="#">Blog</a></li>
                </ul>
                </div>

                <div className="footer-column">
                <h4>Asistencia</h4>
                <ul>
                    <li><a href="#">Centro de ayuda</a></li>
                    <li><a href="#">Contáctanos</a></li>
                    <li><a href="#">Política de privacidad</a></li>
                    <li><a href="#">Términos y condiciones</a></li>
                </ul>
                </div>

                <div className="footer-column">
                <h4>Recursos</h4>
                <ul>
                    <li><a href="#">Guías de viaje</a></li>
                    <li><a href="#">Aerolíneas</a></li>
                    <li><a href="#">Aeropuertos</a></li>
                    <li><a href="#">Mapa del sitio</a></li>
                </ul>
                </div>

                <div className="footer-column">
                <h4>Suscríbete</h4>
                <p>Recibe ofertas exclusivas en tu correo</p>
                <div className="newsletter-form">
                    <input type="email" placeholder="Tu email" />
                    <button>Suscribirse</button>
                </div>
                <div className="social-links">
                    <a href="#"><i className="fab fa-facebook"></i></a>
                    <a href="#"><i className="fab fa-twitter"></i></a>
                    <a href="#"><i className="fab fa-instagram"></i></a>
                </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>© 2023 VuelaBarato. Todos los derechos reservados.</p>
            </div>
        </div>
      </footer>
    </div>
  );
}

export default FlightResults;