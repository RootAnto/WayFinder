import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/Home';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';

function App() {
<<<<<<< Updated upstream
=======
  const [mensaje, setMensaje] = useState('');
  const [resultados, setResultados] = useState([]);
  const [searchParams, setSearchParams] = useState({
    from: 'Madrid-Barajas (MAD)',
    to: '',
    departure: '',
    return: '',
    passengers: '1 Adulto, Turista',
    nearbyFrom: false,
    nearbyTo: false,
    directOnly: false
  });

  useEffect(() => {
    fetch('http://localhost:8001/')
      .then(res => res.json())
      .then(data => setMensaje(data.message));
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSearchParams({
      ...searchParams,
      [name]: type === 'checkbox' ? checked : value
    });
  };






  const handleSubmit = (e) => {
    e.preventDefault();

    const data = {
      origin: searchParams.from,
      destination: searchParams.to,
      departure_date: searchParams.departure,
      return_date: searchParams.return || "",
      adults: 1,
      max_results: 5
    };

    fetch("http://localhost:8001/travel/buscarViaje", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(res => {
      console.log("Estado HTTP:", res.status);
      return res.json();
    })
    .then(data => {
      console.log("📦 Respuesta de la API:", data); // <-- ¿Viene vacío? ¿O con estructura rara?
      setResultados(data);
    })
    .catch(err => {
      console.error("Error al obtener los vuelos:", err);
      setMensaje("Hubo un error al obtener los vuelos. Por favor, intenta nuevamente.");
    });

  };


>>>>>>> Stashed changes
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;