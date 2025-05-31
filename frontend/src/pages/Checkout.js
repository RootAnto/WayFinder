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

  const buildTripPayload = ({
    user,
    flight,
    hotel,
    vehicle,
    isPackage = false,
    totalPrice = 0,
    currency = 'EUR',
  }) => {
    const departure = new Date(flight.departure);
    const returnDate = flight.returnDate ? new Date(flight.returnDate) : null;
    const hotelNights = hotel.nights || (returnDate ? Math.ceil((returnDate - departure) / (1000 * 60 * 60 * 24)) : 1);
    const vehicleDays = vehicle?.days || hotelNights;

    return {
      user_id: String(user.id),
      origin: flight.origin,
      destination: flight.destination,
      departure_date: flight.departure,
      return_date: flight.returnDate || null,
      adults: 1,
      children: 0,
      user_email: user.email || '',
      user_name: user.nombre || '',

      flight_id: String(flight.id || ''),
      hotel_id: String(hotel.id || hotel.hotelId || ''),
      vehicle_id: vehicle ? String(vehicle.id || vehicle.vehicleId) : '',

      flight_price: parseFloat(flight.price),
      flight_name: flight.airline || '',

      hotel_name: hotel.name || '',
      hotel_price: parseFloat(hotel.price),
      hotel_nights: hotelNights,

      vehicle_model: vehicle?.model || vehicle?.name || vehicle?.brand || '',
      vehicle_price: vehicle ? parseFloat(vehicle.price) : 0,
      vehicle_days: vehicleDays,

      total_price: parseFloat(totalPrice),
      currency: currency,
      is_package: isPackage
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const urlBase = 'http://localhost:8000/trips/';
      const emailParam = `?user_email=${currentUser.email}`;

      const packageItems = cartItems.filter(item => item.isPackage);
      const individualItems = cartItems.filter(item => !item.isPackage);

      const payloads = [];

      // 1. Paquetes
      for (const pkg of packageItems) {
        const payload = buildTripPayload({
          user: currentUser,
          flight: pkg.details.flight,
          hotel: pkg.details.hotel,
          vehicle: pkg.details.vehicle,
          isPackage: true,
          totalPrice: pkg.price,
          currency: pkg.currency || 'EUR'
        });
        payloads.push(payload);
      }

      // 2. Individuales
      const flight = individualItems.find(i => i.type === 'flight');
      const hotel = individualItems.find(i => i.type === 'hotel');

      if (flight && hotel) {
        const vehicle = individualItems.find(i => i.type === 'vehicle');
        const totalPrice =
          parseFloat(flight.price) +
          parseFloat(hotel.price) +
          (vehicle ? parseFloat(vehicle.price) : 0);

        const payload = buildTripPayload({
          user: currentUser,
          flight,
          hotel,
          vehicle,
          isPackage: false,
          totalPrice,
          currency: flight.currency || hotel.currency || vehicle?.currency || 'EUR'
        });

        payloads.push(payload);
      }

      // 3. Enviar todos los payloads
      for (const tripPayload of payloads) {
        const response = await fetch(urlBase + emailParam, {
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
        console.log('✅ Viaje registrado:', data);
      }

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
