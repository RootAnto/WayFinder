import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import '../styles/FlightResults.css';

function FlightResults() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('flights');
  const location = useLocation();
  const { addToCart } = useCart();
  
  // Extraer datos de location.state o usar valores por defecto
  const { 
    searchParams = {
      from: 'MAD',
      to: 'NYC',
      departure: '2025-06-15',
      return: '2025-06-25',
      passengers: '1 Adulto, Turista'
    },
    flightResults = [],
    hotelResults = [],
    vehicleResults = []
  } = location.state || {};

  // Estado para los datos mostrados
  const [flights, setFlights] = useState(flightResults);
  const [hotels, setHotels] = useState(hotelResults.data || hotelResults);
  const [vehicles, setVehicles] = useState(vehicleResults.data || vehicleResults);
  
  const [loading, setLoading] = useState({
    flights: false,
    hotels: false,
    vehicles: false
  });
  const [error, setError] = useState(null);

  // Verificar estructura de datos al montar el componente
    useEffect(() => {
      console.log('Datos recibidos:', {
        flightResults,
        hotelResults: hotelResults.data || hotelResults,
        vehicleResults: vehicleResults.data || vehicleResults
      });
    }, []);

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

  // Función para cargar datos de vuelos
  const fetchFlights = async () => {
    try {
      const response = await fetch('http://localhost:8000/flight-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originLocationCode: searchParams.from,
          destinationLocationCode: searchParams.to,
          departureDate: searchParams.departure,
          returnDate: searchParams.return,
          adults: 1,
          max: 5
        })
      });

      if (!response.ok) throw new Error('Error al cargar vuelos');
      const data = await response.json();
      setFlights(data.offers || []);
    } catch (err) {
      setError(`Error en vuelos: ${err.message}`);
    } finally {
      setLoading(prev => ({ ...prev, flights: false }));
    }
  };

  // Función para cargar datos de hoteles
  const fetchHotels = async () => {
    try {
      const response = await fetch('http://localhost:8000/hotel-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cityCode: searchParams.to, // Usamos el destino del cliente
          radius: 10,
          checkInDate: searchParams.departure,
          checkOutDate: searchParams.return || searchParams.departure,
          limit: 10,
          defaultPrice: 100
        })
      });

      if (!response.ok) throw new Error('Error al cargar hoteles');
      const data = await response.json();
      setHotels(data.data || []);
    } catch (err) {
      setError(`Error en hoteles: ${err.message}`);
    } finally {
      setLoading(prev => ({ ...prev, hotels: false }));
    }
  };

  // Función para cargar datos de vehículos
  const fetchVehicles = async () => {
    try {
      const response = await fetch('http://localhost:8000/vehicle-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: searchParams.to, // Usamos el destino del cliente
          pickUpDate: searchParams.departure,
          dropOffDate: searchParams.return || searchParams.departure,
          vehicleType: "economy",
          limit: 10,
          defaultPrice: 50
        })
      });

      if (!response.ok) throw new Error('Error al cargar vehículos');
      const data = await response.json();
      setVehicles(data.data || []);
    } catch (err) {
      setError(`Error en vehículos: ${err.message}`);
    } finally {
      setLoading(prev => ({ ...prev, vehicles: false }));
    }
  };

  // Cargar datos cuando cambia la pestaña activa
  useEffect(() => {
    if (activeTab === 'flights' && flights.length === 0) {
      setLoading(prev => ({ ...prev, flights: true }));
      fetchFlights();
    }
    if (activeTab === 'hotels' && hotels.length === 0) {
      setLoading(prev => ({ ...prev, hotels: true }));
      fetchHotels();
    }
    if (activeTab === 'vehicles' && vehicles.length === 0) {
      setLoading(prev => ({ ...prev, vehicles: true }));
      fetchVehicles();
    }
  }, [activeTab]);

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
                  <Link to="/cart">
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
                  </Link>
              </div>
            </div>
          
          {/* Navegación entre secciones */}
          <div className="results-navigation">
            <button 
              className={`nav-link ${activeTab === 'flights' ? 'active' : ''}`}
              onClick={() => setActiveTab('flights')}
            >
              Vuelos ({flights.length})
            </button>
            <button 
              className={`nav-link ${activeTab === 'hotels' ? 'active' : ''}`}
              onClick={() => setActiveTab('hotels')}
            >
              Hoteles ({hotels.length})
            </button>
            <button 
              className={`nav-link ${activeTab === 'vehicles' ? 'active' : ''}`}
              onClick={() => setActiveTab('vehicles')}
            >
              Vehículos ({vehicles.length})
            </button>
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

          {/* Mensajes de error */}
          {error && <div className="error">{error}</div>}

          {/* Contenido de cada sección */}
          <div className="tab-content">
            {/* Sección de Vuelos */}
            {activeTab === 'flights' && (
              <div className="flights-section">
                {loading.flights ? (
                  <div className="loading">Cargando vuelos...</div>
                ) : flights.length === 0 ? (
                  <div className="no-results">No se encontraron vuelos</div>
                ) : (
                  <div className="flights-list">
                    {flights.map((flight, index) => {
                      const firstSegment = flight.itineraries[0].segments[0];
                      const lastSegment = flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1];
                      
                      return (
                        <div key={index} className="flight-card">
                          <div className="flight-header">
                            <span className="airline">{firstSegment.carrierCode}</span>
                            <span className="price">{flight.price.total} {flight.price.currency}</span>
                          </div>
                          
                          <div className="flight-details">
                            <div className="time-block">
                              <span className="time">{formatTime(firstSegment.departureTime)}</span>
                              <span className="airport">{firstSegment.departureAirport}</span>
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
                              <span className="time">{formatTime(lastSegment.arrivalTime)}</span>
                              <span className="airport">{lastSegment.arrivalAirport}</span>
                            </div>
                          </div>
                          
                          <div className="flight-footer">
                            {/* temporal el boton hasta tener la base de datos */}
                            <button 
                              className="select-btn"
                              onClick={() => addToCart({
                                type: 'flight',
                                ...flight,
                                origin: searchParams.from,
                                destination: searchParams.to,
                                price: flight.price.total,
                                currency: flight.price.currency
                              })}
                            >
                              Seleccionar
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'hotels' && (
              <div className="hotels-section">
                {loading.hotels ? (
                  <div className="loading">Cargando hoteles...</div>
                ) : hotels.length === 0 ? (
                  <div className="no-results">No se encontraron hoteles</div>
                ) : (
                  <div className="hotels-list">
                    {hotels.map((hotel) => (
                      <div key={hotel.hotelId} className="hotel-card">
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
                            {hotel.price} {hotel.currency}
                            {hotel.nights && ` x ${hotel.nights} noches`}
                          </div>
                        </div>
                        {/* temporal el boton hasta tener la base de datos */}
                        <button 
                          className="select-btn"
                          onClick={() => {
                            const checkIn = new Date(searchParams.departure);
                            const checkOut = new Date(searchParams.return || searchParams.departure);
                            const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
                            
                            addToCart({
                              type: 'hotel',
                              ...hotel,
                              price: hotel.price * nights,
                              currency: hotel.currency,
                              nights: nights
                            })
                          }}
                        >
                          Reservar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Sección de Vehículos */}
            {activeTab === 'vehicles' && (
              <div className="vehicles-section">
                {loading.vehicles ? (
                  <div className="loading">Cargando vehículos...</div>
                ) : vehicles.length === 0 ? (
                  <div className="no-results">No se encontraron vehículos</div>
                ) : (
                  <div className="vehicles-list">
                    {vehicles.map((vehicle) => (
                      <div key={vehicle.vehicleId} className="vehicle-card">
                        <div className="vehicle-image">
                          <img 
                            src={`https://source.unsplash.com/random/300x200/?car,${vehicle.brand}`} 
                            alt={vehicle.name} 
                          />
                        </div>
                        <div className="vehicle-info">
                          <h3>{vehicle.name} ({vehicle.year})</h3>
                          <div className="type">{vehicle.vehicleType || 'Economy'}</div>
                          <div className="price">
                            {vehicle.pricePerDay} {vehicle.currency} /día
                          </div>
                          <div className="features">
                            <span>✔️ {vehicle.seats} asientos</span>
                            <span>✔️ {vehicle.transmission}</span>
                            <span>✔️ {vehicle.fuelType}</span>
                            <span>✔️ {vehicle.doors} puertas</span>
                          </div>
                        </div>
                        <button 
                          className="select-btn"
                          onClick={() => {
                            const pickUp = new Date(searchParams.departure);
                            const dropOff = new Date(searchParams.return || searchParams.departure);
                            const days = Math.ceil((dropOff - pickUp) / (1000 * 60 * 60 * 24));
                            
                            addToCart({
                              type: 'vehicle',
                              ...vehicle,
                              price: vehicle.pricePerDay * days, // Precio total
                              currency: vehicle.currency,
                              days: days,
                              pricePerDay: vehicle.pricePerDay // Guardamos el precio por día
                            })
                          }}
                        >
                          Alquilar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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

export default FlightResults;