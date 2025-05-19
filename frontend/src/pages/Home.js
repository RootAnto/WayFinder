import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Home.css';

// Función para formatear la hora (añade esto fuera del componente App)
const formatTime = (dateTimeStr) => {
  if (!dateTimeStr) return '';
  const date = new Date(dateTimeStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

function App() {
  const navigate = useNavigate();
  const [mensaje, setMensaje] = useState('');
  const [searchParams, setSearchParams] = useState({
    from: 'MAD',
    to: 'NYC',
    departure: '2025-06-15',
    return: '2025-06-25',
    passengers: '1 Adulto, Turista',
    nearbyFrom: false,
    nearbyTo: false,
    directOnly: false
  });

  useEffect(() => {
    fetch('http://localhost:8000/')
      .then(res => res.json())
      .then(data => setMensaje(data.message));
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSearchParams({
      ...searchParams,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Datos comunes para las peticiones
      const commonData = {
        location: searchParams.to,
        departureDate: searchParams.departure,
        returnDate: searchParams.return || searchParams.departure,
        adults: 1
      };

      // Realizar las 3 peticiones simultáneamente con Promise.all
      const [flightsResponse, hotelsResponse, vehiclesResponse] = await Promise.all([
        // Petición de vuelos
        fetch("http://localhost:8000/flight-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            originLocationCode: searchParams.from,
            destinationLocationCode: searchParams.to,
            departureDate: searchParams.departure,
            returnDate: searchParams.return,
            adults: 1,
            max: 5
          })
        }),
        // Petición de hoteles
        fetch("http://localhost:8000/hotel-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cityCode: searchParams.to,
            radius: 10,
            checkInDate: searchParams.departure,
            checkOutDate: searchParams.return || searchParams.departure,
            limit: 10,
            defaultPrice: 100
          })
        }),
        // Petición de vehículos
        fetch("http://localhost:8000/vehicle-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: searchParams.to,
            pickUpDate: searchParams.departure,
            dropOffDate: searchParams.return || searchParams.departure,
            vehicleType: "economy",
            limit: 10,
            defaultPrice: 50
          })
        })
      ]);

      // Verificar que todas las respuestas sean OK
      if (!flightsResponse.ok || !hotelsResponse.ok || !vehiclesResponse.ok) {
        throw new Error('Error en una o más peticiones');
      }

      // Procesar las respuestas
      const [flightsData, hotelsData, vehiclesData] = await Promise.all([
        flightsResponse.json(),
        hotelsResponse.json(),
        vehiclesResponse.json()
      ]);

      // Redirigir a FlightResults con todos los datos
      navigate('/FlightResults', {
        state: {
          searchParams: searchParams,
          flightResults: flightsData.offers || [],
          hotelResults: hotelsData.results || [],
          vehicleResults: vehiclesData.cars || []
        }
      });
      
    } catch (error) {
      console.error("Error en la búsqueda:", error);
      setMensaje(error.message || 'Error al realizar la búsqueda');
    }
  };

  const { currentUser } = useAuth();

  return (
    <div className="app">
      <Header />

      <main className="main-content">
        <div className="container">
          <h1>Millones de vuelos baratos. Tu eligues tu próximo destino.</h1>
          <br/>

          <SearchForm
            searchParams={searchParams}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
          />

          <ServicesSection />

          {/* Mensajes de error */}
          {mensaje && (
            <div className="alert alert-error">
              {mensaje}
            </div>
          )}

          {currentUser && (
            <div className="user-greeting">
              <p>Bienvenido, <strong>{currentUser.nombre}</strong>!</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

const Header = () => {
  const { currentUser, logout } = useAuth();
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
    <header className="header">
      <div className="container">
        <div className="logo">VuelaBarato</div>
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
  );
};

const SearchForm = ({ searchParams, onInputChange, onSubmit }) => (
  <>
    <h3>Crea una ruta con múltiples destinos</h3>
    <form className="search-form" onSubmit={onSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label>Desde</label>
          <input
            type="text"
            name="from"
            value={searchParams.from}
            onChange={onInputChange}
          />
        </div>

        <div className="form-group">
          <label>A</label>
          <input
            type="text"
            name="to"
            value={searchParams.to}
            onChange={onInputChange}
            placeholder="País, ciudad o aeropuerto..."
          />
        </div>

        <div className="form-group">
          <label>Ida</label>
          <input
            type="date"
            name="departure"
            value={searchParams.departure}
            onChange={onInputChange}
          />
        </div>

        <div className="form-group">
          <label>Vuelta</label>
          <input
            type="date"
            name="return"
            value={searchParams.return}
            onChange={onInputChange}
          />
        </div>

        <div className="form-group">
          <label>Viajeros y clase de cabina</label>
          <select
            name="passengers"
            value={searchParams.passengers}
            onChange={onInputChange}
          >
            <option>1 Adulto, Turista</option>
            <option>2 Adultos, Turista</option>
            <option>1 Adulto, Business</option>
            <option>Familia (2 Adultos + 2 Niños)</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="checkbox-group">
          <input
            type="checkbox"
            id="nearby-airports-from"
            name="nearbyFrom"
            checked={searchParams.nearbyFrom}
            onChange={onInputChange}
          />
          <label htmlFor="nearby-airports-from">Añade aeropuertos cercanos</label>
        </div>

        <div className="checkbox-group">
          <input
            type="checkbox"
            id="nearby-airports-to"
            name="nearbyTo"
            checked={searchParams.nearbyTo}
            onChange={onInputChange}
          />
          <label htmlFor="nearby-airports-to">Añade aeropuertos cercanos</label>
        </div>

        <div className="checkbox-group">
          <input
            type="checkbox"
            id="direct-flights"
            name="directOnly"
            checked={searchParams.directOnly}
            onChange={onInputChange}
          />
          <label htmlFor="direct-flights">Vuelos directos</label>
        </div>

        <div style={{flexGrow: 1, textAlign: 'right'}}>
          <button type="submit" className="search-button">Buscar vuelos</button>
        </div>
      </div>
    </form>
  </>
);

const ServicesSection = () => (
  <>
    <hr className="divider" />

    <div className="options-section">
      <a href="#" className="option-link">Hoteles</a>
      <a href="#" className="option-link">Alquiler de coches</a>
      <a href="#" className="option-link">Explora cualquier lugar</a>
    </div>

    <hr className="divider" />
    
  </>
);

const Footer = () => (
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
);

export default App;