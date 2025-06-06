import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Home.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';  // IMPORTAR spinner componente

const Toast = ({ message, onClose }) => (
  <div className="toast">
    <span>{message}</span>
    <button onClick={onClose}>✖</button>
  </div>
);

const ChatBotWidget = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="chatbot-button" onClick={() => setOpen(!open)} title="¿Necesitas ayuda?">💬</div>
      {open && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <span>Asistente Virtual</span>
            <button onClick={() => setOpen(false)}>✖</button>
          </div>
          <div className="chatbot-content">
            <div className="chatbot-body">
              <p>¡Hola! ¿En qué puedo ayudarte?</p>
            </div>
            <div className="chatbot-input">
              <input type="text" placeholder="Escribe tu mensaje..." />
              <button>Enviar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

function App() {
  const navigate = useNavigate();
  const [mensaje, setMensaje] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(false);
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

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSearchParams({
      ...searchParams,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSuggestTrip = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/trip-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originLocationCode: searchParams.from,
          destinationLocationCode: searchParams.to,
          departureDate: searchParams.departure,
          returnDate: searchParams.return || searchParams.departure,
          adults: 1,
          max: 1,
          cityCode: searchParams.to,
          checkInDate: searchParams.departure,
          checkOutDate: searchParams.return || searchParams.departure,
          hotelLimit: 1,
          defaultHotelPrice: 100,
          vehicleLocation: searchParams.to,
          vehicleLimit: 1
        })
      });

      if (!response.ok) throw new Error('Error al obtener sugerencia de viaje');
      const data = await response.json();

      navigate('/TripSuggestion', {
        state: { searchParams, tripData: data }
      });

    } catch (error) {
      showToast(error.message || 'Error al obtener sugerencia');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const [flightsResponse, hotelsResponse, vehiclesResponse] = await Promise.all([
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

      if (!flightsResponse.ok || !hotelsResponse.ok || !vehiclesResponse.ok) {
        throw new Error('Error en una o más peticiones');
      }

      const [flightsData, hotelsData, vehiclesData] = await Promise.all([
        flightsResponse.json(),
        hotelsResponse.json(),
        vehiclesResponse.json()
      ]);

      navigate('/FlightResults', {
        state: {
          searchParams,
          flightResults: flightsData.offers || [],
          hotelResults: hotelsData.results || [],
          vehicleResults: vehiclesData.cars || []
        }
      });

    } catch (error) {
      showToast(error.message || 'Error al realizar búsqueda');
    } finally {
      setLoading(false);
    }
  };

  const { currentUser } = useAuth();

  return (
    <div className="app">
      {loading && <LoadingSpinner message="Procesando tu solicitud..." />}

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}

      <Header />

      <main className="main-content">
        <div className="container">
          <h1>Millones de vuelos baratos. Tú eliges tu próximo destino.</h1>
          <br />

          <SearchForm
            searchParams={searchParams}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onSuggestTrip={handleSuggestTrip}
            loading={loading}
          />

          <ServicesSection />

          {mensaje && <div className="alert alert-info">{mensaje}</div>}

          {currentUser && (
            <div className="user-greeting">
              <p>Bienvenido, <strong>{currentUser.nombre}</strong>!</p>
            </div>
          )}
        </div>
      </main>

      <ChatBotWidget />
      <Footer />
    </div>
  );
}

const SearchForm = ({ searchParams, onInputChange, onSubmit, onSuggestTrip, loading }) => {
  const navigate = useNavigate();
  const handleGoToBookings = () => navigate('/my-bookings');

  return (
    <>
      <h3>Crea una ruta con múltiples destinos</h3>
      <form className="search-form">
        <div className="form-row">
          <div className="form-group">
            <label>Desde</label>
            <input type="text" name="from" value={searchParams.from} onChange={onInputChange} />
          </div>
          <div className="form-group">
            <label>A</label>
            <input type="text" name="to" value={searchParams.to} onChange={onInputChange} />
          </div>
          <div className="form-group">
            <label>Ida</label>
            <input type="date" name="departure" value={searchParams.departure} onChange={onInputChange} />
          </div>
          <div className="form-group">
            <label>Vuelta</label>
            <input type="date" name="return" value={searchParams.return} onChange={onInputChange} />
          </div>
          <div className="form-group">
            <label>Viajeros y clase de cabina</label>
            <select name="passengers" value={searchParams.passengers} onChange={onInputChange}>
              <option>1 Adulto, Turista</option>
              <option>2 Adultos, Turista</option>
              <option>1 Adulto, Business</option>
              <option>Familia (2 Adultos + 2 Niños)</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="checkbox-group">
            <input type="checkbox" id="nearby-from" name="nearbyFrom" checked={searchParams.nearbyFrom} onChange={onInputChange} />
            <label htmlFor="nearby-from">Añade aeropuertos cercanos</label>
          </div>
          <div className="checkbox-group">
            <input type="checkbox" id="nearby-to" name="nearbyTo" checked={searchParams.nearbyTo} onChange={onInputChange} />
            <label htmlFor="nearby-to">Añade aeropuertos cercanos</label>
          </div>
          <div className="checkbox-group">
            <input type="checkbox" id="direct-only" name="directOnly" checked={searchParams.directOnly} onChange={onInputChange} />
            <label htmlFor="direct-only">Vuelos directos</label>
          </div>

          <div style={{ flexGrow: 1, justifyContent: 'right', display: 'flex', gap: '10px' }}>
            <button type="button" disabled={loading} className="my-bookings-button" onClick={handleGoToBookings}>
              Mis reservas
            </button>
            <button type="button" disabled={loading} className="suggest-button" onClick={onSuggestTrip}>
              Sugerir viaje completo
            </button>
            <button type="submit" disabled={loading} className="search-button" onClick={onSubmit}>
              Buscar vuelos
            </button>
          </div>
        </div>
      </form>
    </>
  );
};

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

export default App;
