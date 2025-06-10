import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Profile.css';

function Profile() {
  const { currentUser, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [userData, setUserData] = useState(null);
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
    return <div aria-live="polite">Cargando perfil...</div>;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="profile-app">
      {/* Header */}
      <header className="profile-header" role="banner" aria-label="Encabezado de perfil">
        <div className="profile-avatar">
          <div className="avatar-circle" aria-hidden="true">
            {currentUser?.nombre.charAt(0).toUpperCase()}
          </div>
          <div className="avatar-info">
            <h1>{currentUser?.nombre}</h1>
            <p>Miembro desde {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
        <div className="profile-actions">
          <button className="action-btn primary" aria-label="Buscar vuelos">
            <i className="fas fa-ticket-alt" aria-hidden="true"></i> Buscar vuelos
          </button>
          <button className="action-btn secondary" aria-label="Configuración">
            <i className="fas fa-cog" aria-hidden="true"></i> Configuración
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="profile-content">
        {/* Navigation Tabs */}
        <nav className="profile-nav" role="navigation" aria-label="Navegación de perfil">
          <button
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
            aria-label="Ver resumen del perfil"
          >
            <i className="fas fa-user-circle" aria-hidden="true"></i> Resumen
          </button>
          <button
            className={`nav-item ${activeTab === 'travel' ? 'active' : ''}`}
            onClick={() => setActiveTab('travel')}
            aria-label="Ver historial de viajes"
          >
            <i className="fas fa-plane" aria-hidden="true"></i> Mis viajes
          </button>
          <button
            className={`nav-item ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
            aria-label="Ver preferencias"
          >
            <i className="fas fa-sliders-h" aria-hidden="true"></i> Preferencias
          </button>
          <button
            className={`nav-item ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
            aria-label="Ver métodos de pago"
          >
            <i className="fas fa-credit-card" aria-hidden="true"></i> Pagos
          </button>
        </nav>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'overview' && (
            <section className="overview-section" role="region" aria-label="Sección de información personal">
              <div className="section-header">
                <h2>Información personal</h2>
                <button
                  className="edit-toggle"
                  onClick={() => setEditMode(!editMode)}
                  aria-label={editMode ? 'Guardar cambios' : 'Editar información'}
                >
                  {editMode ? (
                    <><i className="fas fa-check" aria-hidden="true"></i> Guardar</>
                  ) : (
                    <><i className="fas fa-pen" aria-hidden="true"></i> Editar</>
                  )}
                </button>
              </div>

              <div className="info-grid">
                {[
                  { label: 'Nombre completo', name: 'name', type: 'text' },
                  { label: 'Correo electrónico', name: 'email', type: 'email' },
                  { label: 'Teléfono', name: 'phone', type: 'tel' },
                  { label: 'Pasaporte', name: 'passport', type: 'text' },
                  { label: 'Nacionalidad', name: 'nationality', type: 'text' },
                ].map(({ label, name, type }) => (
                  <div className="info-field" key={name}>
                    <label htmlFor={name}>{label}</label>
                    {editMode ? (
                      <input
                        id={name}
                        type={type}
                        name={name}
                        value={userData[name]}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <p id={`${name}-text`}>{userData[name]}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'travel' && (
            <section className="travel-section" role="region" aria-label="Historial de viajes">
              <div className="section-header">
                <h2>Historial de viajes</h2>
                <div className="travel-filters" role="group" aria-label="Filtros de viajes">
                  <button className="filter-btn active" aria-pressed="true">Todos</button>
                  <button className="filter-btn" aria-pressed="false">Próximos</button>
                  <button className="filter-btn" aria-pressed="false">Pasados</button>
                </div>
              </div>

              <div className="travel-list">
                {travelHistory.map(trip => (
                  <article key={trip.id} className={`trip-card ${trip.status}`} role="region" aria-label={`Viaje de ${trip.origin} a ${trip.destination}`}>
                    <div className="flight-header">
                      <h3>{trip.origin} → {trip.destination}</h3>
                      <span className="trip-status" aria-label={`Estado: ${trip.status}`}>{trip.status.toUpperCase()}</span>
                    </div>

                    <div className="trip-details">
                      <p><strong>Fechas:</strong> {trip.departure_date} – {trip.return_date || 'N/A'}</p>
                      <p><strong>Hotel:</strong> {trip.hotel_name}</p>
                      <p><strong>Total:</strong> {trip.total_price} {trip.currency}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default Profile;
