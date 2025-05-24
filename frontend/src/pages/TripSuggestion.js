import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/TripSuggestion.css';

function TripSuggestion() {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
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

  // Extraer datos de location.state
  const { 
    searchParams = {
      from: 'MAD',
      to: 'NYC',
      departure: '2025-06-15',
      return: '2025-06-25',
      passengers: '1 Adulto, Turista'
    },
    tripData
  } = location.state || {};

  // Verificar si hay datos de viaje
  if (!tripData) {
    return (
      <div className="flight-results-app">
        <header className="header">
          {/* ... (header igual que en FlightResults) ... */}
        </header>
        <main className="results-container">
          <div className="container">
            <div className="breadcrumb">
              <Link to="/">Inicio</Link> &gt; <span>Sugerencia de viaje</span>
            </div>
            <div className="error">No se encontraron datos de viaje. Por favor, inténtalo de nuevo.</div>
          </div>
        </main>
        <footer className="footer">
          {/* ... (footer igual que en FlightResults) ... */}
        </footer>
      </div>
    );
  }

  // Extraer componentes del viaje
  const flight = tripData.flights[0];
  const hotel = tripData.hotels[0];
  const vehicle = tripData.vehicles[0];
  const summary = tripData.summary;

  // Función para formatear fechas
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    return new Date(dateStr).toLocaleDateString('es-ES', options);
  };

  // Función para formatear horas
  const formatTime = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    return new Date(dateTimeStr).toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Función para formatear duración
  const formatDuration = (duration) => {
    if (!duration) return '';
    return duration.replace('PT', '').replace('H', 'h ').replace('M', 'm').trim();
  };

  

  return (
    <div className="flight-results-app">
      <header className="header">
        <div className="container">
          <div className="logo"><Link to="/" style={{textDecoration:'none', color: 'white'}}>VuelaBarato</Link></div>
          <nav className="nav">
            <a href="/" className="nav-link">Inicio</a>
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
      
      <main className="results-container">
        <div className="container">
            {/* Breadcrumb */}
            <div className="breadcrumb">
                <div> <Link to="/">Inicio</Link> &gt; <span>Sugerencia de viaje completo</span></div>
                <div className="cart-icon">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </div>
            </div>
            
            {/* Resumen de búsqueda */}
            <div className="search-summary">
                <h2>{searchParams.from} → {searchParams.to}</h2>
                <p>
                {formatDate(searchParams.departure)} - 
                {searchParams.return && ` ${formatDate(searchParams.return)}`} | 
                {searchParams.passengers}
                </p>
            </div>

            

            {/* Detalles del vuelo */}
            <div className="flight-card">
                <h3>Vuelo seleccionado</h3>
                {flight && (
                <>
                    <div className="flight-header">
                    <span className="airline">{flight.itineraries[0].segments[0].carrierCode}</span>
                    <span className="price">{flight.price.total} {flight.price.currency}</span>
                    </div>
                    
                    <div className="flight-details">
                    <div className="time-block">
                        <span className="time">{formatTime(flight.itineraries[0].segments[0].departureTime)}</span>
                        <span className="airport">{flight.itineraries[0].segments[0].departureAirport}</span>
                    </div>
                    
                    <div className="duration-block">
                        <div className="duration-line">
                        <span className="duration">{formatDuration(flight.itineraries[0].duration)}</span>
                        </div>
                        <span className="stops">
                        {flight.itineraries[0].segments.length === 1 ? 'Directo' : `${flight.itineraries[0].segments.length - 1} escala(s)`}
                        </span>
                    </div>
                    
                    <div className="time-block">
                        <span className="time">{formatTime(flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1].arrivalTime)}</span>
                        <span className="airport">{flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1].arrivalAirport}</span>
                    </div>
                    </div>
                </>
                )}
            </div>

            {/* Detalles del hotel */}
            <div className="hotel-card">
                <h3>Hotel seleccionado</h3>
                {hotel && (
                <>
                    <div className="hotel-image">
                    <img 
                        src={`https://source.unsplash.com/random/300x200/?hotel,${hotel.name}`} 
                        alt={hotel.name} 
                    />
                    </div>
                    <div className="hotel-info">
                    <h3>{hotel.name}</h3>
                    <div className="location">{hotel.cityCode}</div>
                    <div className="price">
                        {hotel.price} {hotel.currency} ({hotel.nights} noches)
                    </div>
                    </div>
                </>
                )}
            </div>

            {/* Detalles del vehículo */}
            <div className="vehicle-card">
                <h3>Vehículo seleccionado</h3>
                {vehicle && (
                <>
                    <div className="vehicle-image">
                    <img 
                        src={`https://source.unsplash.com/random/300x200/?car,${vehicle.brand}`} 
                        alt={vehicle.name} 
                    />
                    </div>
                    <div className="vehicle-info">
                    <h3>{vehicle.name} ({vehicle.year})</h3>
                    <div className="price">
                        {vehicle.pricePerDay} {vehicle.currency} / día
                    </div>
                    </div>
                </>
                )}
            </div>

            {/* Resumen del costo total */}
            <div className="trip-summary-card">
                <h3>Tu paquete de viaje completo</h3>
                <div className="trip-cost-summary">
                <div className="cost-item">
                    <span>Vuelo:</span>
                    <span>{summary.currency} {summary.flightTotal}</span>
                </div>
                <div className="cost-item">
                    <span>Hotel ({hotel.nights} noches):</span>
                    <span>{summary.currency} {summary.hotelTotal}</span>
                </div>
                <div className="cost-item">
                    <span>Vehículo:</span>
                    <span>{summary.currency} {summary.vehicleTotal}</span>
                </div>
                <div className="cost-total">
                    <span>Total:</span>
                    <span>{summary.currency} {summary.grandTotal}</span>
                </div>
                </div>
            </div>

            {/* Botón de reserva */}
            <div className="book-trip-button">
                <button className="select-btn">Reservar paquete completo</button>
            </div>
        </div>
      </main>

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

export default TripSuggestion;