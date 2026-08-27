// Index.jsx
import React, { useEffect } from 'react';
import Hero from '../components/Hero';
import About from '../components/AboutInvest';
import Investmentadvantages from '../components/Investmentadvantages';
import Choosehelthcare from '../components/Choosehelthcare';
import AiPowered from '../components/AiPowered';
import Investmentprocess from '../components/Investmentprocess';

const Landinglayout = () => {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const sectionId = hash.replace('#', '');
      const section = document.getElementById(sectionId);
      if (section) {
        setTimeout(() => {
          const headerOffset = 100; // Header ki height
          const elementPosition = section.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }, 500);
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  return (
    <>  
      <div className="midd-container">
        <section id="home" style={{ scrollMarginTop: '100px' }}>
          <Hero />
        </section>
        <section id="about" style={{ scrollMarginTop: '100px' }}>
          <About />
        </section>
        <section id="approach" style={{ scrollMarginTop: '100px' }}>
          <Investmentadvantages />
        </section>
        <section id="certifications" style={{ scrollMarginTop: '100px' }}>
          <Choosehelthcare />
        </section>
        <AiPowered />
        <Investmentprocess />
      </div>
    </>
  );
};

export default Landinglayout;