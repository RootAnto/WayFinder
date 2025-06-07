import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import '../styles/FlightResults.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

function FlightResults() {
  const { currentUser, logout } = useAuth();
  const { addToCart } = useCart();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('flights');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const [flights, setFlights] = useState(flightResults);
  const [hotels, setHotels] = useState(hotelResults.data || hotelResults);
  const [vehicles, setVehicles] = useState(vehicleResults.data || vehicleResults);
  const [hotelImages, setHotelImages] = useState({});
  const [vehicleImages, setVehicleImages] = useState({});
  const [loading, setLoading] = useState({ flights: false, hotels: false, vehicles: false });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHotelImages = async () => {
      for (const hotel of hotels) {
        if (!hotelImages[hotel.hotelId]) {
          try {
            const response = await fetch(`http://localhost:8000/hotel-image/?query=${encodeURIComponent(hotel.name)}`);
            if (!response.ok) continue;
            const data = await response.json();
            setHotelImages(prev => ({ ...prev, [hotel.hotelId]: data.image_url }));
          } catch {}
        }
      }
    };
    if (hotels.length > 0) fetchHotelImages();
  }, [hotels]);

  useEffect(() => {
    const fetchVehicleImages = async () => {
      for (const vehicle of vehicles) {
        const key = `${vehicle.brand}-${vehicle.model}`;
        if (!vehicleImages[key]) {
          try {
            const response = await fetch(`http://localhost:8000/vehicle-image/?brand=${encodeURIComponent(vehicle.brand)}&model=${encodeURIComponent(vehicle.model)}`);
            if (!response.ok) continue;
            const data = await response.json();
            setVehicleImages(prev => ({ ...prev, [key]: data.image_url }));
          } catch {}
        }
      }
    };
    if (vehicles.length > 0) fetchVehicleImages();
  }, [vehicles]);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
  const formatTime = (dateTimeStr) =>
    new Date(dateTimeStr).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const formatDuration = (duration) =>
    duration?.replace('PT', '').replace('H', 'h ').replace('M', 'm').trim();

  const fetchFlights = async () => {
    try {
      const res = await fetch('http://localhost:8000/flight-search', {
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
      if (!res.ok) throw new Error('Error al cargar vuelos');
      const data = await res.json();
      setFlights(data.offers || []);
    } catch (err) {
      setError(`Error en vuelos: ${err.message}`);
    } finally {
      setLoading(prev => ({ ...prev, flights: false }));
    }
  };

  const fetchHotels = async () => {
    try {
        const res = await fetch('http://localhost:8000/hotel-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cityCode: searchParams.to,
            checkInDate: searchParams.departure,
            checkOutDate: searchParams.return || searchParams.departure,
            adults: 1,
            max: 10
          })
        });
        if (!res.ok) throw new Error('Error al cargar hoteles');
        const data = await res.json();
        const hotelsList = data.data || [];
        setHotels(hotelsList);

        // Ahora por cada hotel, pedimos la imagen
        for (const hotel of hotelsList) {
          const hotelQuery = `${hotel.name} hotel ${hotel.cityCode || ''}`.trim();
          try {
            const response = await fetch(`http://localhost:8000/hotel-image/?query=${encodeURIComponent(hotelQuery)}`);
            if (!response.ok) continue;
            const imgData = await response.json();
            setHotelImages(prev => ({ ...prev, [hotel.hotelId]: imgData.image_url }));
          } catch {
            // fallbacks silenciosos si falla la imagen
          }
        }

      } catch (err) {
        setError(`Error en hoteles: ${err.message}`);
      } finally {
        setLoading(prev => ({ ...prev, hotels: false }));
      }
    };

  const fetchVehicles = async () => {
    try {
      const res = await fetch('http://localhost:8000/vehicle-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: searchParams.to,
          pickUpDate: searchParams.departure,
          dropOffDate: searchParams.return || searchParams.departure,
          vehicleType: "economy",
          limit: 10,
          defaultPrice: 50
        })
      });
      if (!res.ok) throw new Error('Error al cargar vehículos');
      const data = await res.json();
      setVehicles(data.data || []);
    } catch (err) {
      setError(`Error en vehículos: ${err.message}`);
    } finally {
      setLoading(prev => ({ ...prev, vehicles: false }));
    }
  };

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
      <Header /> {/* Header agregado */}

      <main className="results-container">
        <div className="container">
          <div className="breadcrumb">
            <div><Link to="/">Inicio</Link> &gt; <span>Sugerencia de viaje completo</span></div>
            <div className="cart-icon">
              <Link to="/cart">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </Link>
            </div>
          </div>

          <div className="results-navigation">
            <button className={`nav-link ${activeTab === 'flights' ? 'active' : ''}`} onClick={() => setActiveTab('flights')}>Vuelos</button>
            <button className={`nav-link ${activeTab === 'hotels' ? 'active' : ''}`} onClick={() => setActiveTab('hotels')}>Hoteles</button>
            <button className={`nav-link ${activeTab === 'vehicles' ? 'active' : ''}`} onClick={() => setActiveTab('vehicles')}>Vehículos</button>
          </div>

          <div className="search-summary">
            <h2>{searchParams.from} → {searchParams.to}</h2>
            <p>{formatDate(searchParams.departure)} - {searchParams.return && ` ${formatDate(searchParams.return)}`} | {searchParams.passengers}</p>
          </div>

          {error && <div className="error">{error}</div>}

          <div className="tab-content">
            {activeTab === 'flights' && (
              <div className="flights-section">
                {loading.flights ? <div className="loading">Cargando vuelos...</div> :
                  flights.length === 0 ? <div className="no-results">No se encontraron vuelos</div> :
                    <div className="flights-list">
                      {flights.map((flight, index) => {
                        const firstSegment = flight.itineraries[0].segments[0];
                        const lastSegment = flight.itineraries[0].segments.at(-1);
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
                                <div className="duration-line"><span className="duration">{formatDuration(flight.itineraries[0].duration)}</span></div>
                                <span className="stops">{flight.itineraries[0].segments.length === 1 ? 'Directo' : `${flight.itineraries[0].segments.length - 1} escala(s)`}</span>
                              </div>
                              <div className="time-block">
                                <span className="time">{formatTime(lastSegment.arrivalTime)}</span>
                                <span className="airport">{lastSegment.arrivalAirport}</span>
                              </div>
                            </div>
                            <div className="flight-footer">
                              <button 
                                className="select-btn" 
                                onClick={() => {
                                  // Alert antes de agregar
                                  alert(`¡Vuelo agregado al carrito!`);
                                  
                                  addToCart({
                                    type: 'flight',
                                    id: flight.id,
                                    airline: firstSegment.carrierCode,
                                    origin: searchParams.from,
                                    destination: searchParams.to,
                                    departure: searchParams.departure,
                                    returnDate: searchParams.return,
                                    price: flight.price.total,
                                    currency: flight.price.currency,
                                    duration: flight.itineraries[0].duration
                                  });
                                }}
                              >
                                Seleccionar
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>}
              </div>
            )}

            {activeTab === 'hotels' && (
              <div className="hotels-section">
                {loading.hotels ? <div className="loading">Cargando hoteles...</div> :
                  hotels.length === 0 ? <div className="no-results">No se encontraron hoteles</div> :
                    <div className="hotels-list">
                      {hotels.map((hotel) => (
                        <div key={hotel.hotelId} className="hotel-card">
                          <div className="hotel-image">
                            <img src={hotelImages[hotel.hotelId] || `https://source.unsplash.com/300x200/?hotel,${hotel.cityCode}`} alt={hotel.name} />
                          </div>
                          <div className="hotel-info">
                            <h3>{hotel.name}</h3>
                            <p>{hotel.cityCode}</p>
                            <p>Precio: {hotel.price} {hotel.currency}</p>
                          </div>
                          <button 
                            className="select-btn" 
                            onClick={() => {
                              alert("¡Hotel agregado al carrito!");
                              addToCart({
                                type: 'hotel',
                                id: hotel.hotelId,
                                name: hotel.name,
                                city: hotel.cityCode,
                                price: hotel.price,
                                currency: hotel.currency
                              });
                            }}
                          >
                            Reservar
                          </button>
                        </div>
                      ))}
                    </div>}
              </div>
            )}

            {activeTab === 'vehicles' && (
              <div className="vehicles-section">
                {loading.vehicles ? <div className="loading">Cargando vehículos...</div> :
                  vehicles.length === 0 ? <div className="no-results">No se encontraron vehículos</div> :
                    <div className="vehicles-list">
                      {vehicles.map((vehicle) => (
                        <div key={vehicle.vehicleId} className="vehicle-card">
                          <div className="vehicle-image">
                            <img
                              src={vehicleImages[`${vehicle.brand}-${vehicle.model}`] || `https://source.unsplash.com/300x200/?car,${vehicle.brand}`}
                              alt={vehicle.name}
                            />
                          </div>
                          <div className="vehicle-info">
                            <h3>{vehicle.name} ({vehicle.year})</h3>
                            <div className="type">{vehicle.vehicleType || 'Economy'}</div>
                            <div className="price">{vehicle.pricePerDay} {vehicle.currency} /día</div>
                            <div className="features">
                              <span>✔️ {vehicle.seats} asientos</span>
                              <span>✔️ {vehicle.transmission}</span>
                              <span>✔️ {vehicle.fuelType}</span>
                              <span>✔️ {vehicle.doors} puertas</span>
                            </div>
                          </div>
                          <button className="select-btn" onClick={() => {
                            const pickUp = new Date(searchParams.departure);
                            const dropOff = new Date(searchParams.return || searchParams.departure);
                            const days = Math.ceil((dropOff - pickUp) / (1000 * 60 * 60 * 24));
                            alert("Vehiculo agregado al carrito!");
                            addToCart({
                              type: 'vehicle',
                              vehicleId: vehicle.vehicleId,
                              name: vehicle.name,
                              model: vehicle.name,
                              brand: vehicle.brand,
                              price: vehicle.pricePerDay * days,
                              pricePerDay: vehicle.pricePerDay,
                              currency: vehicle.currency,
                              days: days,
                              vehicleType: vehicle.vehicleType,
                              pickUpDate: searchParams.departure,
                              dropOffDate: searchParams.return || searchParams.departure
                            });
                          }}>
                            Alquilar
                          </button>
                        </div>
                      ))}
                    </div>}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer /> {/* Footer agregado */}
    </div>
  );
}

export default FlightResults;
