import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FaCreditCard, FaCalendarAlt, FaUser, FaLock } from 'react-icons/fa';
import '../styles/Checkout.css';

function Checkout() {
  const { currentUser } = useAuth();
  const { cartItems, clearCart } = useCart(); // Añade clearCart
  const [cardData, setCardData] = useState({
    name: '',
    number: '',
    expiry: '',
    cvc: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCardData({ ...cardData, [name]: value });
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 3) {
      value = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
    }
    setCardData((prev) => ({ ...prev, expiry: value }));
  };

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(.{4})/g, '$1 ').trim();
    setCardData((prev) => ({ ...prev, number: value }));
  };

    const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  setError(null);

  try {
    // 1. Obtener elementos del carrito
    const flight = cartItems.find(item => item.type === 'flight');
    const hotel = cartItems.find(item => item.type === 'hotel');
    const vehicle = cartItems.find(item => item.type === 'vehicle');

    if (!flight || !hotel) {
      throw new Error('Debes tener al menos un vuelo y un hotel en tu carrito');
    }

    // 2. Calcular fechas y duración
    const departure = new Date(flight.departure);
    const returnDate = flight.returnDate ? new Date(flight.returnDate) : null;

    const hotelNights = hotel.nights || (
      returnDate ? Math.ceil((returnDate - departure) / (1000 * 60 * 60 * 24)) : 1
    );

    const vehicleDays = vehicle?.days || hotelNights;

    // 3. Convertir precios a float y asegurar consistencia
    const flightPrice = parseFloat(flight.price || 0);
    const hotelPrice = parseFloat(hotel.price || 0);
    const vehiclePrice = vehicle ? parseFloat(vehicle.price || 0) : 0;

    const totalPrice = parseFloat((flightPrice + hotelPrice + vehiclePrice).toFixed(2));

    // 4. Construir tripPayload seguro
    const tripPayload = {
      user_id: String(currentUser.id),
      origin: flight.origin,
      destination: flight.destination,
      departure_date: flight.departure,
      return_date: flight.returnDate || null,
      adults: 1,
      children: 0,
      user_email: currentUser.email || '',
      user_name: currentUser.nombre || '',

      flight_id: String(flight.id || ''),
      hotel_id: String(hotel.hotelId || ''),
      vehicle_id: vehicle?.vehicleId ? String(vehicle.vehicleId) : '',

      flight_price: parseFloat(flight.price),
      flight_name: flight.airline || '',

      hotel_name: hotel.name || '',
      hotel_price: parseFloat(hotel.price),
      hotel_nights: hotel.nights,

      vehicle_model: vehicle?.name || vehicle?.model || vehicle?.brand || '',
      vehicle_price: vehicle ? parseFloat(vehicle.price) : 0,
      vehicle_days: vehicle?.days || hotel.nights,

      total_price: parseFloat((parseFloat(flight.price) + parseFloat(hotel.price) + (vehicle ? parseFloat(vehicle.price) : 0)).toFixed(2)),
      currency: flight.currency || hotel.currency || vehicle?.currency || 'EUR',
    };


    console.log('🚀 tripPayload listo para enviar:', tripPayload);

    // 5. Realizar petición
    const url = new URL('http://localhost:8000/trips/');
    url.searchParams.append('user_email', currentUser.email);

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tripPayload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error del servidor:', errorData);
      throw new Error(errorData.detail || 'Error al crear el viaje');
    }

    const data = await response.json();
    console.log('✅ Respuesta recibida:', data);

    // 6. Vaciar carrito y redirigir
    clearCart();
    navigate('/PaymentSuccess');

  } catch (err) {
    console.error('🛑 Error en handleSubmit:', err);
    setError('Error al procesar el pago: ' + err.message);
    setIsSubmitting(false);
  }
};


  return (
    <div className="checkout-form-container">
      <h2>Información de Pago</h2>
      <form className="checkout-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name"><FaUser /> Titular de la tarjeta</label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Juan Pérez"
            value={cardData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="number"><FaCreditCard /> Número de tarjeta</label>
          <input
            type="text"
            id="number"
            name="number"
            placeholder="1234 5678 9012 3456"
            value={cardData.number}
            onChange={handleCardNumberChange}
            pattern="(?:\d{4} ){3}\d{4}"
            maxLength={19}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="expiry"><FaCalendarAlt /> Fecha de expiración</label>
            <input
              type="text"
              id="expiry"
              name="expiry"
              placeholder="MM/AA"
              value={cardData.expiry}
              onChange={handleExpiryChange}
              pattern="\d{2}/\d{2}"
              maxLength={5}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="cvc"><FaLock /> CVC</label>
            <input
              type="text"
              id="cvc"
              name="cvc"
              placeholder="123"
              value={cardData.cvc}
              onChange={handleChange}
              pattern="\d{3}"
              maxLength={3}
              required
            />
          </div>
        </div>

        <button type="submit" className="submit-payment-btn" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="spinner" /> Confirmando pago...
            </>
          ) : (
            'Confirmar Pago'
          )}
        </button>
      </form>
    </div>
  );
}

export default Checkout;
