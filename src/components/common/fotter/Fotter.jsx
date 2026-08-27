import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaFacebookF,
  FaTwitter,
  FaPinterestP,
  FaInstagram,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaArrowRight
} from 'react-icons/fa';

import logoImg from '../../../assets/images/logo.png';

const Footer = () => {
  return (
    <footer className="main-footer main-footer--one">
      <div className="main-footer__inner">
        <div className="container">
          <div className="row">
            {/* Column 1 - Info & Newsletter */}
            <div className="col-md-6 col-xl-3">
              <div className="footer-widget footer-widget--info">
                <Link to="/">
                  <img src={logoImg} alt="logo" width="160" className="main-menu-eight__logo mb-3" />
                </Link>
                <p className="footer-widget__text">
                  Cureness specializes in healthcare and pharmaceutical investments, combining financial expertise with deep sector knowledge to build resilient, growth-oriented portfolios in the essential healthcare sector.
                </p>
                <div className="footer-widget__newsletter mc-form">
                  <input type="email" name="EMAIL" placeholder="Email" />
                  <button type="submit" className="laboix-btn laboix-btn--submite">
                    <FaArrowRight />
                  </button>
                </div>
                <div className="mc-form__response"></div>
              </div>
            </div>

            {/* Column 2 - Links */}
            <div className="col-md-6 col-xl-3">
              <div className="footer-widget footer-widget--link">
                <h4 className="footer-widget__title">Healthcare Investment Areas</h4>
                <ul className="list-unstyled footer-widget__links">
                  <li className="footer-widget__links__item">
                    <Link to="/about">Hospital Infrastructure</Link>
                  </li>
                  <li className="footer-widget__links__item">
                    <Link to="/contact">Pharmaceuticals</Link>
                  </li>
                  <li className="footer-widget__links__item">
                    <Link to="/blog-list">Biotechnology</Link>
                  </li>
                  <li className="footer-widget__links__item">
                    <Link to="/services">Medical Devices</Link>
                  </li>
                  <li className="footer-widget__links__item">
                    <Link to="/packages">Healthcare Technology</Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Column 3 - Contact */}
            <div className="col-md-6 col-xl-3">
              <div className="footer-widget footer-widget--about">
                <h4 className="footer-widget__title">Explore</h4>
                <ul className="list-unstyled footer-widget__links">
                  <li className="footer-widget__links__item">
                    <Link to="/">Home</Link>
                  </li>
                  <li className="footer-widget__links__item">
                    <Link to="/why-healthcare">Why Healthcare?</Link>
                  </li>
                  <li className="footer-widget__links__item">
                    <Link to="/our-approach">Our Approach</Link>
                  </li>
                  <li className="footer-widget__links__item">
                    <Link to="/certifications">Certifications</Link>
                  </li>
                  <li className="footer-widget__links__item">
                    <Link to="/contact">Contact</Link>
                  </li>
                </ul>
              </div>
            </div>
            {/* Column 4 - Opening Hours */}
            <div className="col-md-6 col-xl-3">
              <div className="footer-widget footer-widget--time">
                <h4 className="footer-widget__title">Contact Our Healthcare Team</h4>
                {/* Ground Floor, The Sotheby Building, Rodney Village, Rodney Bay, Gros-Islet, Saint Lucia */}

                <ul className="list-unstyled footer-widget__info">
                  <li className="footer-widget__info__item">

                    <a href="mailto:michael.mitc@example.com">healthcare@Cureness360.com</a>
                  </li>
                </ul>
                <div className="footer-widget__social">
                  <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer">
                    <FaFacebookF />
                    <span className="sr-only">Facebook</span>
                  </a>
                  <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer">
                    <FaTwitter />
                    <span className="sr-only">Twitter</span>
                  </a>
                  <a href="https://pinterest.com/" target="_blank" rel="noopener noreferrer">
                    <FaPinterestP />
                    <span className="sr-only">Pinterest</span>
                  </a>
                  <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer">
                    <FaInstagram />
                    <span className="sr-only">Instagram</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Bottom Bar */}
      <div className="main-footer__bottom">
        <div className="container">
          <div className="main-footer__bottom__inner">
            <p className="main-footer__copyright">
              &copy; Copyright <span className="dynamic-year"></span> ©2026 Cureness - Healthcare Investment Specialists
            </p>
          </div>
        </div>
      </div>
      {/* Decorative Shapes */}
      <div className="main-footer__shape">
        <img src="assets/images/shapes/footer-shape-1-1.html" alt="" />
      </div>
      <div className="main-footer__shape main-footer__shape--two">
        <img src="assets/images/shapes/footer-shape-1-2.png" alt="" />
      </div>


    </footer>
  );
};

export default Footer;