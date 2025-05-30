// src/pages/CartPage.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import '../styles/Cart.css';
import { FaTrash, FaPlane, FaHotel, FaCar, FaLock } from 'react-icons/fa';
import SuccessModal from '../components/SuccessModal';

export default function CartPage() {
  const { cartItems, removeFromCart, clearCart } = useCart();
  const { currentUser } = useAuth();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  // Cálculo de totales
  const subtotal = cartItems.reduce((sum, item) => sum + Number(item.price), 0);
  const tax      = subtotal * 0.21;
  const total    = subtotal + tax;

  const handleCheckout = async () => {
    try {
      // 1️⃣ Asegurarnos de que hay usuario autenticado
      if (!currentUser?.email) {
        throw new Error('Usuario no autenticado');
      }

      // 2️⃣ Extraer ítems reales del carrito
      const flight  = cartItems.find(i => i.type === 'flight');
      const hotel   = cartItems.find(i => i.type === 'hotel');
      const vehicle = cartItems.find(i => i.type === 'vehicle');

      // 3️⃣ Calcular duraciones dinámicamente
      const hotelNights = hotel?.nights ?? (
        flight?.returnDate && flight?.departure
          ? Math.ceil((new Date(flight.returnDate) - new Date(flight.departure)) / (1000*60*60*24))
          : 1
      );
      const vehicleDays = vehicle?.days ?? hotelNights;

      // 4️⃣ Construir tripPayload usando SOLO datos reales
      const tripPayload = {
        user_id:        String(currentUser.id),
        user_email:     currentUser.email,
        user_name:      currentUser.nombre ?? currentUser.name ?? '',
        origin:         flight?.origin  ?? '',
        destination:    flight?.destination ?? '',
        departure_date: flight?.departure ?? '',
        return_date:    flight?.returnDate ?? null,
        adults:         1,
        children:       0,
        hotel_limit:    5,
        vehicle_limit:  5,
        max_price:      null,

        flight_id:     flight?.id ? String(flight.id) : null,
        flight_name:   flight?.airline ?? flight?.name ?? '',
        flight_price:  parseFloat(flight?.price ?? 0),

        hotel_id:      hotel?.id ? String(hotel.id) : null,
        hotel_name:    hotel?.name ?? '',
        hotel_price:   parseFloat(hotel?.price ?? 0),
        hotel_nights:  hotelNights,

        vehicle_id:     vehicle?.id ? String(vehicle.id) : null,
        vehicle_model:  vehicle?.model ?? vehicle?.name ?? '',
        vehicle_price:  parseFloat(vehicle?.price ?? 0),
        vehicle_days:   vehicleDays,

        total_price: parseFloat((
          Number(flight?.price  ?? 0) +
          Number(hotel?.price   ?? 0) +
          Number(vehicle?.price ?? 0)
        ).toFixed(2)),
        currency: flight?.currency ?? hotel?.currency ?? vehicle?.currency ?? 'EUR'
      };

      // 5️⃣ Enviar al backend con query param user_email
      const url = new URL('http://localhost:8000/trips/');
      url.searchParams.append('user_email', currentUser.email);

      const response = await fetch(url.toString(), {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(tripPayload),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error backend:', errorText);
        throw new Error('Error al crear la reserva');
      }
      await response.json();

      // 6️⃣ Limpieza y modal de éxito
      clearCart();
      setShowSuccessModal(true);

    } catch (err) {
      console.error('Error en checkout:', err);
      alert('Hubo un error al procesar tu reserva: ' + err.message);
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
          {cartItems.length === 0
            ? (
              <div className="empty-cart">
                <h2>Tu carrito está vacío</h2>
                <p>Agrega servicios para reservar.</p>
              </div>
            )
            : cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <div className="item-icon">
                  {item.type === 'flight'  && <FaPlane />}
                  {item.type === 'hotel'   && <FaHotel />}
                  {item.type === 'vehicle' && <FaCar />}
                </div>
                <div className="item-details">
                  <h3>
                    {item.type === 'flight'
                      ? `${item.origin} → ${item.destination}`
                      : item.name
                    }
                  </h3>
                  {item.type === 'flight' && (
                    <p>
                      {item.departure}
                      {item.returnDate && ` - ${item.returnDate}`}
                    </p>
                  )}
                  {item.type === 'hotel' && (
                    <p>{item.nights} noches ({item.pricePerDay} {item.currency}/noche)</p>
                  )}
                  {item.type === 'vehicle' && (
                    <p>{item.days} días ({item.pricePerDay} {item.currency}/día)</p>
                  )}
                </div>
                <div className="item-price">
                  <span>{item.price} {item.currency}</span>
                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))
          }
        </div>

        {cartItems.length > 0 && (
          <div className="cart-summary">
            <h3>Resumen del Pedido</h3>
            <div className="summary-row"><span>Subtotal:</span><span>{subtotal.toFixed(2)} €</span></div>
            <div className="summary-row"><span>Impuestos (21%):</span><span>{tax.toFixed(2)} €</span></div>
            <div className="summary-row total"><span>Total:</span><span>{total.toFixed(2)} €</span></div>
            <button onClick={handleCheckout} className="checkout-btn">
              Reservar
              <span className="secure-checkout"><FaLock /> Pago seguro</span>
            </button>
          </div>
        )}
      </div>

      {showSuccessModal && (
        <SuccessModal
          onClose={() => setShowSuccessModal(false)}
          onPay={() => navigate('/pago')}
        />
      )}
    </div>
  );
}
