import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/TripSuggestion.css';

function TripSuggestion() {
  const { currentUser } = useAuth();
  const { addToCart, cartItems } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMenuOpen && !e.target.closest('.user-menu-container')) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen]);

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

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    return new Date(dateStr).toLocaleDateString('es-ES', options);
  };

  const formatTime = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    return new Date(dateTimeStr).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (duration) => {
    if (!duration) return '';
    return duration.replace('PT', '').replace('H', 'h ').replace('M', 'm').trim();
  };

  const handleBookTrip = async () => {
    setErrorMessage('');

    if (!currentUser) {
      setErrorMessage("Debes iniciar sesión para reservar un viaje.");
      return;
    }

    const existingPackage = cartItems?.find(item => item.isPackage);
    if (existingPackage) {
      setErrorMessage("Ya tienes un paquete en el carrito.");
      return;
    }

    setLoading(true);
    try {
      const flight = tripData.flights?.[0];
      const hotel = tripData.hotels?.[0];
      const vehicle = tripData.vehicles?.[0];

      const departure = new Date(searchParams.departure);
      const returnDate = searchParams.return ? new Date(searchParams.return) : null;

      const hotelNights = hotel?.nights || (
        returnDate
          ? Math.ceil((returnDate - departure) / (1000 * 60 * 60 * 24))
          : 1
      );

      const vehicleDays = hotelNights;

      const flightPrice = flight?.price?.total ? parseFloat(flight.price.total) : 0;
      const hotelPrice = typeof hotel?.price === "number" ? hotel.price : 0;
      const vehiclePrice =
        typeof vehicle?.pricePerDay === "number" && vehicleDays
          ? parseFloat((vehicle.pricePerDay * vehicleDays).toFixed(2))
          : 0;

      const packageItem = {
        id: `package-${Date.now()}`,
        type: 'package',
        name: `Paquete Completo: ${searchParams.from} → ${searchParams.to}`,
        price: parseFloat((flightPrice + hotelPrice + vehiclePrice).toFixed(2)),
        currency: flight?.price?.currency || hotel?.currency || vehicle?.currency || "EUR",
        details: {
          flight: {
            id: flight?.id,
            airline: flight?.itineraries[0]?.segments[0]?.carrierCode,
            origin: searchParams.from,
            destination: searchParams.to,
            departure: searchParams.departure,
            returnDate: searchParams.return || null,
            price: flightPrice
          },
          hotel: {
            id: hotel?.hotelId,
            name: hotel?.name,
            nights: hotelNights,
            price: hotelPrice,
            checkIn: searchParams.departure,
            checkOut: searchParams.return || searchParams.departure
          },
          vehicle: vehicle ? {
            id: vehicle?.vehicleId,
            model: vehicle?.name,
            days: vehicleDays,
            price: vehiclePrice,
            pickUpDate: searchParams.departure,
            dropOffDate: searchParams.return || searchParams.departure
          } : null
        },
        isPackage: true
      };

      addToCart(packageItem);
      navigate('/cart');
    } catch (error) {
      setErrorMessage('Error al reservar el paquete. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (!tripData) {
    return (
      <div className="flight-results-app">
        <Header />
        <main className="results-container">
          <div className="container">
            <div className="breadcrumb">
              <Link to="/">Inicio</Link> &gt; <span>Sugerencia de viaje</span>
            </div>
            <div className="error">No se encontraron datos de viaje. Por favor, inténtalo de nuevo.</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const flight = tripData.flights?.[0];
  const hotel = tripData.hotels?.[0];
  const vehicle = tripData.vehicles?.[0];

  const departure = new Date(searchParams.departure);
  const returnDate = searchParams.return ? new Date(searchParams.return) : null;

  const hotelNights = hotel?.nights || (returnDate ? Math.ceil((returnDate - departure) / (1000 * 60 * 60 * 24)) : 1);
  const vehicleDays = hotelNights;

  const flightPrice = flight?.price?.total ? parseFloat(flight.price.total) : 0;
  const hotelPrice = typeof hotel?.price === "number" ? hotel.price : 0;
  const vehiclePrice = vehicle?.pricePerDay ? vehicle.pricePerDay * vehicleDays : 0;

  const currency = flight?.price?.currency || hotel?.currency || vehicle?.currency || "EUR";

  return (
    <div className="flight-results-app">
      <Header />
      {loading && (
        <div className="loading-overlay">
          <div className="spinner" />
          <p>Procesando tu reserva...</p>
        </div>
      )}
      <main className="results-container" style={{ opacity: loading ? 0.5 : 1, pointerEvents: loading ? 'none' : 'auto' }}>
        <div className="container">
          <div className="breadcrumb">
            <div>
              <Link to="/">Inicio</Link> &gt; <span>Sugerencia de viaje completo</span>
            </div>
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

          <div className="search-summary">
            <h2>{searchParams.from} → {searchParams.to}</h2>
            <p>
              {formatDate(searchParams.departure)} -
              {searchParams.return && ` ${formatDate(searchParams.return)}`} |
              {searchParams.passengers}
            </p>
          </div>

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
                    <span className="time">{formatTime(flight.itineraries[0].segments.slice(-1)[0].arrivalTime)}</span>
                    <span className="airport">{flight.itineraries[0].segments.slice(-1)[0].arrivalAirport}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="hotel-card">
            <h3>Hotel seleccionado</h3>
            {hotel && (
              <>
                <div className="hotel-header">
                  <h4>{hotel.name}</h4>
                  <span className="price">{hotel.price} EUR</span>
                </div>
                <p>{hotel.address}</p>
                <p>Estrellas: {hotel.stars}</p>
                <p>Noches: {hotelNights}</p>
              </>
            )}
          </div>

          {vehicle && (
            <div className="vehicle-card">
              <h3>Coche de alquiler</h3>
              <p>Modelo: {vehicle.name}</p>
              <p>Días: {vehicleDays}</p>
              <p>Precio por día: {vehicle.pricePerDay} EUR</p>
              <p>Precio total: {(vehicle.pricePerDay * vehicleDays).toFixed(2)} EUR</p>
            </div>
          )}

          <div className="total-price">
            <h3>Precio total paquete:</h3>
            <p>{(flightPrice + hotelPrice + vehiclePrice).toFixed(2)} {currency}</p>
          </div>

          <button
            className="select-btn"
            onClick={handleBookTrip}
            disabled={loading}
          >
            {loading ? 'Reservando...' : 'Reservar paquete completo'}
          </button>

          {errorMessage && (
            <div className="error-message">
              <strong>{errorMessage}</strong>
              {cartItems?.find(item => item.isPackage) && (
                <div className="package-warning">
                  <p style={{ marginTop: '10px' }}>
                    Ya tienes un viaje en el carrito. Para seleccionar uno nuevo, primero <strong>reserva</strong> o <strong>elimina</strong> el viaje actual.
                  </p>
                  <Link to="/cart" className="go-to-cart-link">
                    <button className="go-to-cart-btn">Ir al carrito</button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default TripSuggestion;
