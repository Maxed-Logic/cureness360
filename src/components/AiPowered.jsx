import React, {  useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';

// Import images
import testimonialBg from '../assets/images01/backgrounds/testimonial-bg-1.jpg';
import testiImg1 from '../assets/images01/resource/bot.png';


const TestimonialsSection = () => {
  const bgRef = useRef(null);


  return (
    <section className="testimonials-two">
      <div 
        ref={bgRef}
        className="testimonials-two__bg jarallax"  
        style={{ backgroundImage: `url(${testimonialBg})` }}
      ></div>
      <div className="container">
        <div className="testimonials-two__carousel laboix-owl__carousel laboix-owl__carousel--with-shadow">
          {/* Testimonials Two Item */}
          <div className="testimonials-two__item">
            <div className="row align-items-center">
              <div className="col-lg-4">
                <div className="testimonials-two__thumb">
                  <img src={testiImg1} alt="laboix image" className='bot-img' />
                
                </div>
              </div>
              <div className="col-lg-8">
                <div className="testimonials-two__content">
                  <div className="testimonials-two__star">
                   Real-time AI Insights
                  </div>
                  <p className="testimonials-two__text">CURENESS utilizes advanced AI algorithms to analyze healthcare markets, predict pharmaceutical approvals, and optimize hospital investment portfolios. Our proprietary Med-Analytica platform provides real-time insights into clinical trial data, regulatory changes, and healthcare spending trends.</p>
                  <div className="testimonials-two__author">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .testimonials-two {
          position: relative;
          padding: 100px 0;
          overflow: hidden;
        }
        
        .testimonials-two__bg {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-size: cover;
          background-position: center;
          z-index: 0;
          will-change: transform;
        }
        
        
        .testimonials-two__item {
          position: relative;
          z-index: 2;
        }
        
  
      `}</style>
    </section>
  );
};

export default TestimonialsSection;