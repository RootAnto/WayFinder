import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Profile.css';

function Profile() {
  const { currentUser, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [userData, setUserData] = useState(null); // Inicialmente null
  
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
    }
  }, [currentUser]);

  if (loading || !userData) {
    return <div>Cargando perfil...</div>;
  }

  const travelHistory = [
    {
      id: 1,
      route: 'MAD → BCN',
      date: '15 Jun 2023',
      airline: 'Vueling',
      flight: 'VY 1234',
      price: '€78.50',
      status: 'completed'
    },
    {
      id: 2,
      route: 'BCN → PMI',
      date: '22 Ago 2023',
      airline: 'Air Europa',
      flight: 'UX 4567',
      price: '€102.00',
      status: 'completed'
    },
    {
      id: 3,
      route: 'MAD → LIS',
      date: '05 Oct 2023',
      airline: 'Iberia',
      flight: 'IB 7890',
      price: '€89.00',
      status: 'upcoming'
    }
  ];

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
                    <div className="trip-main">
                      <div className="trip-route">
                        <span className="route">{trip.route}</span>
                        <span className="date">{trip.date}</span>
                      </div>
                      <div className="trip-airline">
                        <span>{trip.airline}</span>
                        <span className="flight">{trip.flight}</span>
                      </div>
                    </div>
                    <div className="trip-footer">
                      <span className="price">{trip.price}</span>
                      <button className="trip-details-btn">
                        Ver detalles <i className="fas fa-chevron-right"></i>
                      </button>
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

