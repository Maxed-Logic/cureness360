import React from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineMail } from "react-icons/hi";
import { FaTrophy, FaBullseye, FaPhoneAlt } from 'react-icons/fa';

import secTitleImg from '../assets/images01/shapes/sec-title-s-1.png';
import aboutImage from '../assets/images01/resource/testi.png'



const WhyChoose = () => {

  return (
    <section className="about-fore" id="about">
      <div className="container">
        <div className="row">
          <div className="col-lg-6 mb-5 ">
            <div className="about-fore__left">
              <div className="about-fore__top">
                <div className="sec-title text-start wow fadeInUp" data-wow-duration="700ms">
                  <h6 className="sec-title__tagline">
                    <img src={secTitleImg} alt="About Us" className="sec-title__img" />
                    Choose Healthcare
                  </h6>
                  <h3 className="sec-title__title">
                    Why Choose Cureness for Healthcare?
                  </h3>
                </div>
                <p className="about-fore__top__text">
                  There are many variations of passages of Lorem Ipsum available, bu the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable.
                </p>
              </div>
              <ul className="about-fore__feature list-unstyled">
                <li className="about-fore__feature__item">
                  <div className="about-fore__feature__icon">
                    <i className="icon-trophy-1"></i>
                  </div>
                  <div className="about-fore__feature__content">
                    <h4 className="about-fore__feature__title">Sector Specialization</h4>
                    <p className="about-fore__feature__text">
                      Our team includes healthcare analysts, former pharmaceutical executives, and hospital administrators who understand industry dynamics.
                    </p>
                  </div>
                </li>
                <li className="about-fore__feature__item">
                  <div className="about-fore__feature__icon">
                    <i className="icon-target-1"></i>
                  </div>
                  <div className="about-fore__feature__content">
                    <h4 className="about-fore__feature__title">Due Diligence Excellence</h4>
                    <p className="about-fore__feature__text">
                      We conduct thorough FDA approval tracking, clinical trial analysis, and regulatory pathway assessments for all investments.
                    </p>
                  </div>
                </li>
              </ul>
              <div className="about-fore__link">
                <Link
                  to="/login"
                  className="laboix-btn m"
                  state={{ fromHome: true }}
                  onClick={() => window.scrollTo(0, 0)}
                >
                  Discover More
                </Link>
              </div>
            </div>
          </div>
          <div className="col-lg-6 mb-4">
            <div className="about-fore__right wow fadeInRight" data-wow-duration="700ms" data-wow-delay="500ms">
              <div className="about-fore__item">
                <div className="about-fore__item__image">
                  <img src={aboutImage} alt="laboix image" />
                </div>
                <div className="about-fore__item__call">
                  <div className="about-fore__item__icon">
                    <HiOutlineMail style={{ color: "#fff" }} />
                  </div>
                  <div className="about-fore__item__content">
                    <span className="about-fore__item__subtitle">Contact to anytime</span>
                    <h5 className="about-fore__item__number">
                      <a href="">healthcare@Cureness360.com</a>
                    </h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;