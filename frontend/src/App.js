import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import HomePage from './pages/Home';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import PerfilPage from './pages/Profile';
import FlightResultsPage from './pages/FlightResults';
import TripSuggestionPage from './pages/TripSuggestion';
import CartPage from './pages/Cart';
import CheckoutPage from './pages/Checkout';
import PaymentSuccessPage from './pages/PaymentSuccess';

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
            <Route path="/Checkout" element={<CheckoutPage />} />
            <Route path="/PaymentSuccess" element={<PaymentSuccessPage />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;