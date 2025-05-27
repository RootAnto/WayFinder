import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCreditCard, FaCalendarAlt, FaUser, FaLock } from 'react-icons/fa';
import '../styles/Checkout.css';

function Checkout() {
  const [cardData, setCardData] = useState({
    name: '',
    number: '',
    expiry: '',
    cvc: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      navigate('/PaymentSuccess');
    }, 2000); // Simula una carga de 2 segundos
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
