import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Profile.css';

function Profile() {
  const { currentUser, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [userData, setUserData] = useState(null); // Inicialmente null
  const [travelHistory, setTravelHistory] = useState([]);
  
  useEffect(() => {
    if (currentUser) {
      setUserData({
        name: currentUser.nombre || '',
        email: currentUser.email || '',
        birthdate: currentUser.birthdate || '',
        phone: '+34 600 000 000',
        passport: 'AB1234567',
        nationality: 'Española'
      });
      fetch(`http://localhost:8000/trips/user/${encodeURIComponent(currentUser.email)}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTravelHistory(data);
        } else {
          console.warn("La respuesta no es un array:", data);
          setTravelHistory([]);
        }
      })
      .catch(err => {
        console.error("Error al cargar viajes:", err);
        setTravelHistory([]);
      });
    }
  }, [currentUser]);

  if (loading || !userData) {
    return <div>Cargando perfil...</div>;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="profile-app">
      {/* Header */}
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar-circle">
            {currentUser?.nombre.charAt(0).toUpperCase()}
          </div>
          <div className="avatar-info">
            <h1>{currentUser?.nombre}</h1>
            <p>Miembro desde {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
        <div className="profile-actions">
          <button className="action-btn primary">
            <i className="fas fa-ticket-alt"></i> Buscar vuelos
          </button>
          <button className="action-btn secondary">
            <i className="fas fa-cog"></i> Configuración
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="profile-content">
        {/* Navigation Tabs */}
        <nav className="profile-nav">
          <button 
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="fas fa-user-circle"></i> Resumen
          </button>
          <button 
            className={`nav-item ${activeTab === 'travel' ? 'active' : ''}`}
            onClick={() => setActiveTab('travel')}
          >
            <i className="fas fa-plane"></i> Mis viajes
          </button>
          <button 
            className={`nav-item ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            <i className="fas fa-sliders-h"></i> Preferencias
          </button>
          <button 
            className={`nav-item ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            <i className="fas fa-credit-card"></i> Pagos
          </button>
        </nav>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-section">
              <div className="section-header">
                <h2>Información personal</h2>
                <button 
                  className="edit-toggle"
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? (
                    <><i className="fas fa-check"></i> Guardar</>
                  ) : (
                    <><i className="fas fa-pen"></i> Editar</>
                  )}
                </button>
              </div>
              
              <div className="info-grid">
                <div className="info-field">
                  <label>Nombre completo</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="name"
                      value={userData.name}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p>{userData.name}</p>
                  )}
                </div>
                
                <div className="info-field">
                  <label>Correo electrónico</label>
                  {editMode ? (
                    <input
                      type="email"
                      name="email"
                      value={userData.email}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p>{userData.email}</p>
                  )}
                </div>
                
                <div className="info-field">
                  <label>Teléfono</label>
                  {editMode ? (
                    <input
                      type="tel"
                      name="phone"
                      value={userData.phone}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p>{userData.phone}</p>
                  )}
                </div>
                
                <div className="info-field">
                  <label>Pasaporte</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="passport"
                      value={userData.passport}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p>{userData.passport}</p>
                  )}
                </div>
                
                <div className="info-field">
                  <label>Nacionalidad</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="nationality"
                      value={userData.nationality}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p>{userData.nationality}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'travel' && (
            <div className="travel-section">
              <div className="section-header">
                <h2>Historial de viajes</h2>
                <div className="travel-filters">
                  <button className="filter-btn active">Todos</button>
                  <button className="filter-btn">Próximos</button>
                  <button className="filter-btn">Pasados</button>
                </div>
              </div>
              
              <div className="travel-list">
                {travelHistory.map(trip => (
                  <div key={trip.id} className={`trip-card ${trip.status}`}>
                    <div className="flight-header">
                      <h3>{trip.origin} → {trip.destination}</h3>
                      <span className="trip-status">{trip.status.toUpperCase()}</span>
                    </div>

                    <div className="trip-details">
                      <p><strong>Fechas:</strong> {trip.departure_date} – {trip.return_date || 'N/A'}</p>
                      <p><strong>Hotel:</strong> {trip.hotel_name}</p>
                      <p><strong>Total:</strong> {trip.total_price} {trip.currency}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;

