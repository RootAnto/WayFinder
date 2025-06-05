import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/MyBookings.css';

function MyBookings() {
  const { currentUser } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;

    const fetchReservations = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/trips/');
        if (!res.ok) throw new Error('Error en la respuesta del servidor');
        const data = await res.json();

        const userTrips = data
          .filter(trip => trip.user_email === currentUser.email)
          .sort((a, b) => new Date(b.departure_date) - new Date(a.departure_date));

        setReservations(userTrips);
      } catch (error) {
        console.error("Error al obtener reservas:", error);
        setMensaje('No se pudieron cargar las reservas.');
      }
    };

    fetchReservations();
  }, [currentUser]);

  const handleReject = async (trip) => {
    try {
      const url = `http://127.0.0.1:8000/trips/reservations/${trip.id}/reject?user_name=${currentUser.nombre}&user_email=${currentUser.email}`;
      const res = await fetch(url, { method: 'GET' });
      if (!res.ok) throw new Error('Error al rechazar la reserva');
      setReservations(prev =>
        prev.map(t => t.id === trip.id ? { ...t, status: 'rechazada' } : t)
      );
    } catch (error) {
      console.error("Error al rechazar reserva:", error);
      setMensaje('No se pudo rechazar la reserva.');
    }
  };

  const handleConfirm = (trip) => {
    if (trip.status === 'aceptada' || trip.status === 'rechazada') {
      setMensaje(`No se puede confirmar la reserva porque ya está ${trip.status}.`);
      return;
    }
    navigate(`/pago?tripId=${trip.id}`);
  };

  const handleModify = (trip) => {
    if (trip.status !== 'pendiente') {
      setMensaje('Solo puedes modificar reservas pendientes.');
      return;
    }
    navigate(`/modificar-reserva?tripId=${trip.id}`);
  };

  const formatCurrency = (amount) => {
    return amount ? `${amount.toFixed(2)} EUR` : 'N/A';
  };

  const formatStatus = (status) => {
    switch (status) {
      case 'aceptada': return 'Aceptada';
      case 'rechazada': return 'Rechazada';
      case 'pendiente': return 'Pendiente';
      default: return status;
    }
  };

  return (
    <div className="app">
      <Header />

      <main className="main-content">
        <div className="mybookings-container">
          <h2>Mis reservas</h2>
          <br />

          {mensaje && (
            <div className="mybookings-message">{mensaje}</div>
          )}

          {reservations.length === 0 ? (
            <p className="mybookings-no-reservations">No tienes reservas pendientes.</p>
          ) : (
            <div className="mybookings-reservation-list">
              {reservations.map(trip => (
                <div key={trip.id} className="mybookings-reservation-card">
                  <h3>{trip.origin} → {trip.destination}</h3>
                  <p><strong>Fecha de salida:</strong> {trip.departure_date}</p>
                  <p><strong>Fecha de regreso:</strong> {trip.return_date || 'N/A'}</p>
                  <p><strong>Adultos:</strong> {trip.adults}</p>
                  <p><strong>Niños:</strong> {trip.children}</p>

                  {trip.hotel_price > 0 && (
                    <>
                      <p><strong>Noches de hotel:</strong> {trip.total_days || 'N/A'}</p>
                      <p><strong>Precio hotel:</strong> {formatCurrency(trip.hotel_price)}</p>
                    </>
                  )}

                  {trip.vehicle_price > 0 && (
                    <>
                      <p><strong>Días de alquiler:</strong> {trip.total_days || 'N/A'}</p>
                      <p><strong>Precio vehículo:</strong> {formatCurrency(trip.vehicle_price)}</p>
                    </>
                  )}

                  {trip.flight_id && (
                    <>
                      <p><strong>Vuelo:</strong> {trip.flight_id}</p>
                      <p><strong>Precio vuelo:</strong> {formatCurrency(trip.flight_price)}</p>
                    </>
                  )}

                  <p><strong>Precio total:</strong> {formatCurrency(trip.total_price)}</p>
                  <p><strong>Estado de la reserva:</strong> {formatStatus(trip.status)}</p>
                  <p><strong>ID de reserva:</strong> {trip.id}</p>

                  <div className="mybookings-reservation-actions">
                    {trip.status === 'pendiente' ? (
                      <>
                        <button
                          className="suggest-button"
                          onClick={() => handleConfirm(trip)}
                        >
                          Confirmar reserva
                        </button>
                        <button
                          className="suggest-button"
                          onClick={() => handleReject(trip)}
                        >
                          Rechazar
                        </button>
                        <button
                          className="suggest-button"
                          onClick={() => handleModify(trip)}
                        >
                          Modificar reserva
                        </button>
                      </>
                    ) : (
                      <p className="mybookings-status-message">
                        No puedes modificar esta reserva porque ya está <strong>{formatStatus(trip.status)}</strong>.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default MyBookings;
