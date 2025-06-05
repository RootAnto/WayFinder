const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer-columns">
        <div className="footer-column">
          <h4>Compañía</h4>
          <ul>
            <li><a href="#">Sobre nosotros</a></li>
            <li><a href="#">Carreras</a></li>
            <li><a href="#">Prensa</a></li>
            <li><a href="#">Blog</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Asistencia</h4>
          <ul>
            <li><a href="#">Centro de ayuda</a></li>
            <li><a href="#">Contáctanos</a></li>
            <li><a href="#">Política de privacidad</a></li>
            <li><a href="#">Términos y condiciones</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Recursos</h4>
          <ul>
            <li><a href="#">Guías de viaje</a></li>
            <li><a href="#">Aerolíneas</a></li>
            <li><a href="#">Aeropuertos</a></li>
            <li><a href="#">Mapa del sitio</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Suscríbete</h4>
          <p>Recibe ofertas exclusivas en tu correo</p>
          <div className="newsletter-form">
            <input type="email" placeholder="Tu email" />
            <button>Suscribirse</button>
          </div>
          <div className="social-links">
            <a href="#"><i className="fab fa-facebook"></i></a>
            <a href="#"><i className="fab fa-twitter"></i></a>
            <a href="#"><i className="fab fa-instagram"></i></a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2023 VuelaBarato. Todos los derechos reservados.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
