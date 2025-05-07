import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Home.css';

function App() {
  const [mensaje, setMensaje] = useState('');
  const [resultados, setResultados] = useState([]);
  const [searchParams, setSearchParams] = useState({
    from: 'Madrid-Barajas (MAD)',
    to: '',
    departure: '',
    return: '',
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






  const handleSubmit = (e) => {
    e.preventDefault();

    const data = {
      origin: searchParams.from,
      destination: searchParams.to,
      departure_date: searchParams.departure,
      return_date: searchParams.return || "",
      adults: 1,
      max_results: 5
    };

    fetch("http://localhost:8001/buscarViaje", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(res => {
      console.log("Estado HTTP:", res.status);
      return res.json();
    })
    .then(data => {
      console.log("📦 Respuesta de la API:", data); 
      setResultados(data);
    })
    .catch(err => {
      console.error("Error al obtener los vuelos:", err);
      setMensaje("Hubo un error al obtener los vuelos. Por favor, intenta nuevamente.");
    });

  };

  const { currentUser } = useAuth();

  return (
    <div className="app">
      <Header />

      <main className="main-content">
        <div className="container">
          <h1>Millones de vuelos baratos. Tu eligues tu proximo destino.</h1>
          <br/>

          <SearchForm
            searchParams={searchParams}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
          />

          <ServicesSection />

          {resultados.length > 0 && (
            <div className="flight-results">
              <h3>Vuelos disponibles</h3>
              <ul>
                {resultados.map((vuelo, index) => (
                  <li key={index}>
                    <strong>Desde:</strong> {vuelo.itineraries[0].segments[0].departure.iataCode} -
                    <strong>Hasta:</strong> {vuelo.itineraries[0].segments.slice(-1)[0].arrival.iataCode} <br />
                    <strong>Precio:</strong> {vuelo.price.total} EUR
                  </li>
                ))}
              </ul>
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
            <>
              <span className="user-welcome">Hola, {currentUser.nombre}</span>
              <button onClick={logout} className="logout-btn">Cerrar sesión</button>
            </>
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