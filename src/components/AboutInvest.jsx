import React from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineMail } from "react-icons/hi";


// Import images
import aboutImg1 from '../assets/images01/about/about-2-1.png';
import aboutImg2 from '../assets/images01/about/about-s-2-1.png';
import secTitleShape from '../assets/images01/shapes/sec-title-s-1.png';
import aboutShape1 from '../assets/images01/shapes/about-shape-2-1.png';
import aboutShape2 from '../assets/images01/shapes/about-shape-1-1.png';

// Import React Icons
import { FaCheckCircle, FaPhoneAlt } from 'react-icons/fa';
import { MdBloodtype, MdAnalytics } from 'react-icons/md';

const AboutTwo = () => {
  return (
    <section className="about-two">
      <div className="container">
        <div className="row">
          <div className="col-lg-6">
            <div className="about-two__left wow fadeInLeft" data-wow-duration="700ms" data-wow-delay="500ms">
              <div className="about-two__thumb">
                <div className="about-two__thumb__item">
                  <img className='about-one-img' src={aboutImg1} alt="laboix" />
                </div>
                <div className="about-two__thumb__item01 about-two__thumb__item--two">
                  <img src={aboutImg2} alt="laboix" />
                  <div className="about-two__items">
                    <div className="about-two__box">
                      <div className="about-two__box__icon">
                        <HiOutlineMail/>
                      </div>
                      <div className="about-two__box__content">
                        <span className="about-two__box__subtitle">Contact to anytime</span>
                        <a href="#" className="about-two__box__text">healthcare@Cureness360.com</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="about-two__right">
              <div className="about-two__top">
                <div className="sec-title text-start wow fadeInUp" data-wow-duration="1500ms">
                  <h6 className="sec-title__tagline">
                    <img src={secTitleShape} alt="About Us" className="sec-title__img" />
                    About Us
                  </h6>
                  <h3 className="sec-title__title">Why Invest in Healthcare?</h3>
                </div>
                <p className="about-two__top__text">
The healthcare sector offers a unique combination of recession-resistant growth, consistent long-term demand, and strong innovation potential, making it one of the most resilient and attractive industries for strategic investment and sustainable expansion.
                </p>
              </div>

              <div className="about-two__feature wow fadeInUp" data-wow-duration="700ms" data-wow-delay="500ms">
                <div className="about-two__feature__item">
                  <div className="about-two__feature__icon">
                    <MdBloodtype />
                  </div>
                  <h4 className="about-two__feature__title">
                    <Link to="/services">Infection Prevention</Link>
                  </h4>
                  <p className="about-two__feature__text">
                    Professional intellectual capital without enterprise users Seamlessly matrix value e-commerce
                  </p>
                </div>
                <div className="about-two__feature__item">
                  <div className="about-two__feature__icon">
                    <MdAnalytics />
                  </div>
                  <h4 className="about-two__feature__title">
                    <Link to="/services">High Return Potential</Link>
                  </h4>
                  <p className="about-two__feature__text">
                    With rising demand, healthcare investments often offer strong long-term returns.
                  </p>
                </div>
              </div>

             <ul
  className="about-two__list list-unstyled wow fadeInUp"
  data-wow-duration="700ms"
  data-wow-delay="500ms"
>
  <li className="about-two__list__item">
    <FaCheckCircle /> Recession-resistant sector with consistent long-term demand
  </li>

  <li className="about-two__list__item">
    <FaCheckCircle /> Strong growth opportunities in healthcare & pharmaceutical innovation
  </li>

  <li className="about-two__list__item">
    <FaCheckCircle /> Focused on building sustainable wealth through strategic investments
  </li>

</ul>

              <div className="about-two__link">
                <Link to="/login" className="about-two__link__btn laboix-btn">
                  Discover More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="about-two__shape">
        <img src={aboutShape1} alt="shape" />
      </div>
      <div className="about-two__shape--two">
        <img src={aboutShape2} alt="shape" />
      </div>
    </section>
  );
};

export default AboutTwo;