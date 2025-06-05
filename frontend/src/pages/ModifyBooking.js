import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/ModifyBooking.css';

function ModifyBooking() {
  const [tripData, setTripData] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const tripId = query.get('tripId');

  useEffect(() => {
    if (!tripId) {
      setMensaje('ID de reserva no proporcionado');
      return;
    }

    const fetchTrip = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/trips/${tripId}`);
        if (!res.ok) throw new Error('Error al obtener datos del viaje');
        const data = await res.json();
        setTripData(data);
      } catch (error) {
        setMensaje(error.message);
      }
    };

    fetchTrip();
  }, [tripId]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let val = value;

    if (type === 'number') {
      val = value === '' ? '' : Number(value);
    }

    setTripData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const bodyData = { ...tripData };
      delete bodyData.id; // si el backend no espera id en PUT

      const res = await fetch(`http://127.0.0.1:8000/trips/${tripId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });
      if (!res.ok) throw new Error('Error al actualizar reserva');
      navigate('/my-bookings');
    } catch (error) {
      setMensaje(error.message);
    }
  };

  return (
    <>
      <Header />

      {mensaje ? (
        <p>{mensaje}</p>
      ) : !tripData ? (
        <p>Cargando datos...</p>
      ) : (
        <div className="modifybooking-container">
          <h2>Modificar reserva</h2>

          <div className="modifybooking-summary">
            <h3>Resumen de reserva</h3>
            <p><strong>Origen:</strong> {tripData.origin}</p>
            <p><strong>Destino:</strong> {tripData.destination}</p>
            <p><strong>Fecha de salida:</strong> {tripData.departure_date ? tripData.departure_date.slice(0,10) : 'N/A'}</p>
            <p><strong>Fecha de regreso:</strong> {tripData.return_date ? tripData.return_date.slice(0,10) : 'N/A'}</p>
            <p><strong>Adultos:</strong> {tripData.adults}</p>
            <p><strong>Niños:</strong> {tripData.children}</p>
            <p><strong>Precio hotel:</strong> {tripData.hotel_price} EUR</p>
            <p><strong>Precio vehículo:</strong> {tripData.vehicle_price} EUR</p>
            <p><strong>ID vuelo:</strong> {tripData.flight_id || 'N/A'}</p>
            <p><strong>Precio vuelo:</strong> {tripData.flight_price} EUR</p>
            <p><strong>Precio total:</strong> {tripData.total_price} EUR</p>
            <p><strong>Estado:</strong> {tripData.status}</p>
          </div>

          <form onSubmit={handleSubmit} className="modifybooking-form">
            <label>
              Origen:
              <input
                type="text"
                name="origin"
                value={tripData.origin || ''}
                onChange={handleChange}
              />
            </label>

            <label>
              Destino:
              <input
                type="text"
                name="destination"
                value={tripData.destination || ''}
                onChange={handleChange}
              />
            </label>

            <label>
              Fecha de salida:
              <input
                type="date"
                name="departure_date"
                value={tripData.departure_date ? tripData.departure_date.slice(0,10) : ''}
                onChange={handleChange}
              />
            </label>

            <label>
              Fecha de regreso:
              <input
                type="date"
                name="return_date"
                value={tripData.return_date ? tripData.return_date.slice(0,10) : ''}
                onChange={handleChange}
              />
            </label>

            <label>
              Adultos:
              <input
                type="number"
                name="adults"
                min="0"
                value={tripData.adults || 0}
                onChange={handleChange}
              />
            </label>

            <label>
              Niños:
              <input
                type="number"
                name="children"
                min="0"
                value={tripData.children || 0}
                onChange={handleChange}
              />
            </label>

            <label>
              Precio hotel (EUR):
              <input
                type="number"
                name="hotel_price"
                min="0"
                step="0.01"
                value={tripData.hotel_price || 0}
                onChange={handleChange}
              />
            </label>

            <label>
              Precio vehículo (EUR):
              <input
                type="number"
                name="vehicle_price"
                min="0"
                step="0.01"
                value={tripData.vehicle_price || 0}
                onChange={handleChange}
              />
            </label>

            <label>
              ID vuelo:
              <input
                type="text"
                name="flight_id"
                value={tripData.flight_id || ''}
                onChange={handleChange}
              />
            </label>

            <label>
              Precio vuelo (EUR):
              <input
                type="number"
                name="flight_price"
                min="0"
                step="0.01"
                value={tripData.flight_price || 0}
                onChange={handleChange}
              />
            </label>

            <label>
              Precio total (EUR):
              <input
                type="number"
                name="total_price"
                min="0"
                step="0.01"
                value={tripData.total_price || 0}
                onChange={handleChange}
              />
            </label>

            <label>
              Estado de la reserva:
              <input
                type="text"
                name="status"
                value={tripData.status || ''}
                readOnly
              />
            </label>

            <button type="submit">Guardar cambios</button>
          </form>
        </div>
      )}

      <Footer />
      {/* <ChatBotWidget /> */}
    </>
  );
}

export default ModifyBooking;
