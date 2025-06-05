import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from './stripePromise';

import HomePage from './pages/Home';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import PerfilPage from './pages/Profile';
import FlightResultsPage from './pages/FlightResults';
import TripSuggestionPage from './pages/TripSuggestion';
import CartPage from './pages/Cart';
import CheckoutPage from './pages/Checkout';
import PaymentSuccessPage from './pages/PaymentSuccess';
import StripeCheckout from './components/StripeCheckout';

import PrivateRoute from './components/PrivateRoute';
import MyBookings from './pages/MyBookings';

// Importa el nuevo componente de modificar reserva
import ModifyBooking from './pages/ModifyBooking';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<PerfilPage />} />
            <Route path="/FlightResults" element={<FlightResultsPage />} />
            <Route path="/TripSuggestion" element={<TripSuggestionPage />} />
            <Route path="/Cart" element={<CartPage />} />

            <Route
              path="/my-bookings"
              element={
                <PrivateRoute>
                  <MyBookings />
                </PrivateRoute>
              }
            />

            {/* Nueva ruta para modificar reserva */}
            <Route
              path="/modificar-reserva"
              element={
                <PrivateRoute>
                  <ModifyBooking />
                </PrivateRoute>
              }
            />

            <Route
              path="/pago"
              element={
                <Elements stripe={stripePromise}>
                  <StripeCheckout />
                </Elements>
              }
            />

            <Route
              path="/Checkout"
              element={
                <Elements stripe={stripePromise}>
                  <CheckoutPage />
                </Elements>
              }
            />

            <Route path="/PaymentSuccess" element={<PaymentSuccessPage />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
