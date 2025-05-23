import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/Home';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import PerfilPage from './pages/Profile';
import FlightResultsPage from './pages/FlightResults'
import TripSuggestionPage from './pages/TripSuggestion'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<PerfilPage />} />
          <Route path="/FlightResults" element={<FlightResultsPage />} />
          <Route path="/TripSuggestion" element={<TripSuggestionPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;