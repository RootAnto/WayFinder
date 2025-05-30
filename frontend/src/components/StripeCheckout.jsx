import { useEffect, useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate, useLocation } from 'react-router-dom';

function StripeCheckout() {
  const stripe = useStripe();
  const elements = useElements();
  const { currentUser } = useAuth();
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Extraer tripId de la URL
  const queryParams = new URLSearchParams(location.search);
  const tripId = queryParams.get('tripId');

  useEffect(() => {
    const fetchClientSecret = async () => {
      console.log('tripId from URL:', tripId);
      if (!tripId) {
        console.warn('No tripId found in URL, skipping client secret fetch.');
        return;
      }

      try {
        const res = await fetch(`http://localhost:8000/payments/payment-intent?trip_id=${tripId}`, {
          method: 'POST',
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.detail || 'Error al obtener client secret');
        }

        setClientSecret(data.client_secret);
        console.log('Client secret set:', data.client_secret);
      } catch (err) {
        console.error('Error fetching client secret:', err.message);
        setError(err.message);
      }
    };

    fetchClientSecret();
  }, [tripId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('handleSubmit called');

    if (!stripe) {
      console.warn('Stripe has not loaded yet.');
      return;
    }
    if (!elements) {
      console.warn('Stripe Elements has not loaded yet.');
      return;
    }
    if (!clientSecret) {
      console.warn('Client secret is null, cannot proceed.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      console.log('Card element:', cardElement);

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: currentUser?.nombre || currentUser?.email,
          },
        },
      });

      if (result.error) {
        console.error('Payment error:', result.error.message);
        setError(result.error.message);
        setLoading(false);
      } else if (result.paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded!');
        clearCart();
        navigate('/PaymentSuccess');
      }
    } catch (err) {
      console.error('Error in payment processing:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="checkout-form-container">
      <h2>Pago con Tarjeta</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit} className="checkout-form">
        <div className="form-group">
          <CardElement />
        </div>

        <button type="submit" disabled={!stripe || loading} className="submit-payment-btn">
          {loading ? 'Procesando...' : 'Pagar con Tarjeta'}
        </button>
      </form>
    </div>
  );
}

export default StripeCheckout;
