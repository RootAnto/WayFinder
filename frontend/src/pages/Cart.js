import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import '../styles/Cart.css';
import { FaTrash, FaPlane, FaHotel, FaCar, FaLock, FaBox } from 'react-icons/fa';
import SuccessModal from '../components/SuccessModal';

export default function CartPage() {
  const { cartItems, removeFromCart, clearCart } = useCart();
  const { currentUser } = useAuth();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => acc + Number(item.price), 0);
  };

  // Cálculo de totales
  const subtotal = cartItems.reduce((sum, item) => sum + Number(item.price), 0);
  const tax = subtotal * 0.21;
  const total = subtotal + tax;

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
      user_name: user.nombre || user.name || '',

      flight_id: String(flight.id || ''),
      hotel_id: String(hotel.id || ''),
      vehicle_id: vehicle ? String(vehicle.id) : '',

      flight_price: parseFloat(flight.price),
      flight_name: flight.airline || flight.name || '',

      hotel_name: hotel.name || '',
      hotel_price: parseFloat(hotel.price),
      hotel_nights: hotelNights,

      vehicle_model: vehicle?.model || vehicle?.name || '',
      vehicle_price: vehicle ? parseFloat(vehicle.price) : 0,
      vehicle_days: vehicleDays,

      total_price: parseFloat(totalPrice),
      currency: currency,
      is_package: isPackage
    };
  };

  const handleCheckout = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (!currentUser?.email) {
        throw new Error('Debes iniciar sesión para completar la reserva');
      }

      const urlBase = 'http://localhost:8000/trips/';
      const emailParam = `?user_email=${currentUser.email}`;

      const packageItems = cartItems.filter(item => item.isPackage);
      const individualItems = cartItems.filter(item => !item.isPackage);

      const payloads = [];

      // Procesar paquetes
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

      // Procesar items individuales (vuelo + hotel + vehículo)
      const flight = individualItems.find(i => i.type === 'flight');
      const hotel = individualItems.find(i => i.type === 'hotel');
      const vehicle = individualItems.find(i => i.type === 'vehicle');

      if (flight && hotel) {
        const totalPrice = parseFloat(flight.price) + 
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

      // Enviar todas las reservas al backend
      for (const tripPayload of payloads) {
        const response = await fetch(urlBase + emailParam, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tripPayload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Error al crear la reserva');
        }
      }

      clearCart();
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error en checkout:', err);
      setError('Error al procesar la reserva: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1>Resumen de tu Reserva</h1>
        <div className="cart-stats">
          <span>{cartItems.length} elemento{cartItems.length !== 1 && 's'}</span>
          <Link to="/" className="continue-shopping">← Seguir comprando</Link>
        </div>
      </div>

      <div className="cart-container">
        <div className="cart-items">
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <h2>Tu carrito está vacío</h2>
              <p>Comienza a agregar elementos desde nuestros servicios</p>
            </div>
          ) : (
            cartItems.map(item => (
              item.isPackage ? (
                <div key={item.id} className="cart-item package-item">
                  <div className="item-icon">
                    <FaBox />
                  </div>

                  <div className="item-details">
                    <div className="package-header">
                      <h3 className="item-title">{item.name}</h3>
                      <span className="package-badge">Paquete</span>
                    </div>

                    <div className="package-details">
                      <div className="package-component">
                        <span className="package-component-title"><FaPlane /> Vuelo:</span>
                        <span>{item.details.flight.origin} → {item.details.flight.destination}</span>
                        <span className="package-component-price">
                          {item.details.flight.price} {item.currency}
                        </span>
                      </div>

                      <div className="package-component">
                        <span className="package-component-title"><FaHotel /> Hotel:</span>
                        <span>{item.details.hotel.name} ({item.details.hotel.nights} noches)</span>
                        <span className="package-component-price">
                          {item.details.hotel.price} {item.currency}
                        </span>
                      </div>

                      {item.details.vehicle && (
                        <div className="package-component">
                          <span className="package-component-title"><FaCar /> Vehículo:</span>
                          <span>{item.details.vehicle.model} ({item.details.vehicle.days} días)</span>
                          <span className="package-component-price">
                            {item.details.vehicle.price} {item.currency}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="item-price">
                    <span className="package-total">{item.price} {item.currency}</span>
                    <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ) : (
                <div key={item.id} className="cart-item">
                  <div className="item-icon">
                    {item.type === 'flight' && <FaPlane />}
                    {item.type === 'hotel' && <FaHotel />}
                    {item.type === 'vehicle' && <FaCar />}
                  </div>

                  <div className="item-details">
                    <h3 className="item-title">
                      {item.type === 'flight'
                        ? `${item.origin} → ${item.destination}`
                        : item.name}
                    </h3>

                    {item.type === 'flight' && (
                      <div className="flight-detailss">
                        <span>{item.departure}</span>
                        {item.returnDate && <span> - {item.returnDate}</span>}
                      </div>
                    )}

                    {item.type === 'hotel' && (
                      <div className="hotel-details">
                        <span>{item.nights} noches ({item.pricePerDay} {item.currency}/noche)</span>
                      </div>
                    )}

                    {item.type === 'vehicle' && (
                      <div className="vehicle-details">
                        <span>{item.days} días ({item.pricePerDay} {item.currency}/día)</span>
                        <span> Tipo: {item.vehicleType}</span>
                      </div>
                    )}
                  </div>

                  <div className="item-price">
                    <span>{Number(item.price).toFixed(2)} {item.currency}</span>
                    <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                      <FaTrash />
                    </button>
                  </div>
                </div>
              )
            ))
          )}
        </div>
      

      {cartItems.length > 0 && (
        <div className="cart-summary">
          <h3>Resumen del Pedido</h3>
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>{calculateTotal().toFixed(2)} €</span>
            </div>
            <div className="summary-row">
              <span>Impuestos:</span>
              <span>{(calculateTotal() * 0.21).toFixed(2)} €</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>{(calculateTotal() * 1.21).toFixed(2)} €</span>
            </div>
          <button className="checkout-btn" onClick={handleCheckout}>
            Finalizar Reserva
            <span className="secure-checkout">
              <FaLock /> Pago seguro
            </span>
          </button>
        </div>
      )}

      {showSuccessModal && (
        <SuccessModal
          onClose={() => setShowSuccessModal(false)}
          onPay={() => navigate('/pago')}
        />
      )}
      </div>
    </div>
  );
}
