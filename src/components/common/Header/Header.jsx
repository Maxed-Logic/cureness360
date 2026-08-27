// src/components/ui/Header/Header.jsx
import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import logoImg from '../../../assets/images/logo.png';
import '../../../assets/Css/laboix.css';

// Import React Icons
import {
  FaTwitter,
  FaFacebookF,
  FaPinterestP,
  FaInstagram,
  FaMapMarkerAlt,
  FaEnvelope,
  FaTimes
} from 'react-icons/fa';
import { HiBars3BottomRight } from "react-icons/hi2";
import { HiOutlineMail } from 'react-icons/hi';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

// Header.jsx - scrollToSection function
const scrollToSection = (sectionId) => {
  const section = document.getElementById(sectionId);
  if (section) {
    const headerOffset = 100; 
    const elementPosition = section.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};

  // ✅ Handle navigation with scroll
  const handleNavClick = (sectionId) => {
    if (location.pathname === '/') {
      // Agar home page par hai toh section par scroll karo
      scrollToSection(sectionId);
    } else {
      // Agar home page nahi hai toh home par jao aur section par scroll
      window.location.href = `/#${sectionId}`;
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Topbar One Start */}
      <div className="topbar-one">
        <div className="topbar-one__inner px-4">
          {/* <ul className="list-unstyled topbar-one__info">
            <li className="topbar-one__info__item">
              <FaMapMarkerAlt className="topbar-one__info__icon" />
              <span className="topbar-one__info__item__location">
                Ground Floor, The Sotheby Building, Rodney Village, Rodney Bay, Gros-Islet, Saint Lucia
              </span>
            </li>
          </ul> */}

          <ul className="list-unstyled topbar-one__info">
            <li className="topbar-one__info__item">
              <FaEnvelope className="topbar-one__info__icon" />
              <a className="topbar-one__info__item__email" href="mailto:healthcare@Cureness360.com">
                healthcare@Cureness360.com
              </a>
            </li>
          </ul>

          <div className="topbar-one__social">
            <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer">
              <FaTwitter />
              <span className="sr-only">Twitter</span>
            </a>
            <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer">
              <FaFacebookF />
              <span className="sr-only">Facebook</span>
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

      {/* Main Header Start */}
      <header>
        <div className="main-header__inner">
          <div className="main-header__logo logo-laboix">
            <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <img src={logoImg} alt="logo" width="80" className="main-menu-eight__logo" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="main-header__nav main-menu d-none d-lg-block">
            <ul className="main-menu__list">
              <li>
                <NavLink 
                  to="/" 
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  Home
                </NavLink>
              </li>
              <li>
                <a 
                  href="#about" 
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick('about');
                  }}
                >
                  Why Healthcare?
                </a>
              </li>
              <li>
                <a 
                  href="#approach" 
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick('approach');
                  }}
                >
                  Our Approach
                </a>
              </li>
              <li>
                <a 
                  href="#certifications" 
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick('certifications');
                  }}
                >
                  Certifications
                </a>
              </li>
            </ul>
          </nav>

          <div className="main-header__right">
            <div className="main-header__link d-none d-md-block">
              <Link to="/login" className="laboix-btn main-header__btn">
                Login
              </Link>
            </div>
            <div className="main-header__link d-none d-md-block">
              <Link to="/signup" className="laboix-btn main-header__btn">
                Signup
              </Link>
            </div>

            <a href="" className="main-header__right__call d-none d-lg-flex">
              <div className="main-header__right__icon">
                <HiOutlineMail />
              </div>
              <div className="main-header__right__content">
                <span className="main-header__right__content__text">Contact to anytime</span>
                <h6 className="main-header__right__content__number">healthcare@Cureness360.com</h6>
              </div>
            </a>

            <div className="mobile-nav-toggler d-lg-none" onClick={() => setIsMobileMenuOpen(true)}>
              <HiBars3BottomRight className="menu-icon" />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Nav Wrapper */}
      <div className={`mobile-nav__wrapper ${isMobileMenuOpen ? 'expanded' : ''}`}>
        <div className="mobile-nav__overlay mobile-nav__toggler" onClick={() => setIsMobileMenuOpen(false)}></div>
        <div className="mobile-nav__content">
          <span className="mobile-nav__close mobile-nav__toggler" onClick={() => setIsMobileMenuOpen(false)}>
            <FaTimes />
          </span>

          <div className="logo-box">
            <Link 
              to="/" 
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setIsMobileMenuOpen(false);
              }} 
              aria-label="logo image"
            >
              <img src={logoImg} width="65" alt="labiox" />
            </Link>
          </div>

          <div className="mobile-nav__container">
            <ul className="mobile-menu__list">
              <li>
                <NavLink 
                  to="/" 
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Home
                </NavLink>
              </li>
              <li>
                <a 
                  href="#about" 
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick('about');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Why Healthcare?
                </a>
              </li>
              <li>
                <a 
                  href="#approach" 
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick('approach');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Our Approach
                </a>
              </li>
              <li>
                <a 
                  href="#certifications" 
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick('certifications');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Certifications
                </a>
              </li>
            </ul>
          </div>

          <div className='d-flex gap-2 mb-4'>
            <div className="main-header__link01">
              <Link 
                to="/login" 
                className="laboix-btn main-header__btn01"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
            </div>
            <div className="main-header__link01">
              <Link 
                to="/signup" 
                className="laboix-btn main-header__btn001"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Signup
              </Link>
            </div>
          </div>

          <div className="mobile-nav__social">
            <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer">
              <FaTwitter />
              <span className="sr-only">Twitter</span>
            </a>
            <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer">
              <FaFacebookF />
              <span className="sr-only">Facebook</span>
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
    </>
  );
};

export default Header;