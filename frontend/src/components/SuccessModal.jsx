import '../styles/Modal.css';

export default function SuccessModal({ onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>¡Reserva realizada con éxito!</h2>
        <p>Tu reserva ha sido registrada correctamente.</p>
        <button
          className="btn-close"
          onClick={() => {
            onClose();
            window.location.href = '/';  // Redirige directamente sin alert
          }}
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}

