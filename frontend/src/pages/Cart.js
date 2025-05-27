import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../styles/Cart.css';
import { FaTrash, FaPlane, FaHotel, FaCar, FaLock } from 'react-icons/fa';

function CartPage() {
  const { cartItems, removeFromCart } = useCart();
  
  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => acc + Number(item.price), 0);
  };

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1>Resumen de tu Reserva</h1>
        <div className="cart-stats">
          <span>{cartItems.length} elementos</span>
          <Link to="/" className="continue-shopping">← Seguir comprando</Link>
        </div>
      </div>

      <div className="cart-container">
        <div className="cart-items">
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <h2>Tu carrito está vacío</h2>
              <p>Comienza a agregar elementos desde nuestros servicios</p>
            </div>
          ) : (
            cartItems.map(item => (
                <div key={item.id} className="cart-item">
                    <div className="item-icon">
                        {item.type === 'flight' && <FaPlane />}
                        {item.type === 'hotel' && <FaHotel />}
                        {item.type === 'vehicle' && <FaCar />}
                    </div>
                    
                    <div className="item-details">
                        <h3 className="item-title">
                            {item.type === 'flight' 
                            ? `${item.origin} → ${item.destination}`
                            : item.name}
                        </h3>
                        
                        {item.type === 'flight' && (
                            <div className="flight-details">
                            <span>{item.departure}</span>
                            {item.returnDate && <span> - {item.returnDate}</span>}
                            </div>
                        )}

                        {item.type === 'hotel' && (
                            <div className="hotel-details">
                            <span>{item.nights} noches ({item.pricePerDay} {item.currency}/noche)</span>
                            </div>
                        )}

                        {item.type === 'vehicle' && (
                            <div className="vehicle-details">
                            <span>{item.days} días ({item.pricePerDay} {item.currency}/día)</span>
                            <span> Tipo: {item.vehicleType}</span>
                            </div>
                        )}
                    </div>

                    <div className="item-price">
                        <span>{item.price} {item.currency}</span>
                        <button 
                            className="remove-btn"
                            onClick={() => removeFromCart(item.id)}
                        >
                            <FaTrash />
                        </button>
                    </div>
                </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-summary">
            <h3>Resumen del Pedido</h3>
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>{calculateTotal().toFixed(2)} €</span>
            </div>
            <div className="summary-row">
              <span>Impuestos:</span>
              <span>{(calculateTotal() * 0.21).toFixed(2)} €</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>{(calculateTotal() * 1.21).toFixed(2)} €</span>
            </div>
            
            <Link to="/Checkout" className="checkout-btn">
              Proceder al Pago
              <span className="secure-checkout">
                <FaLock /> Pago seguro
              </span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartPage;