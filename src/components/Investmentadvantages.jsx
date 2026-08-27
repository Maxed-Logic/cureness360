import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeartbeat, FaFlask, FaGlobeAmericas, FaArrowRight } from 'react-icons/fa';

// Import images
import secTitleImg from '../assets/images01/shapes/sec-title-s-1.png';
import blogImg1 from '../assets/images01/blog/blog-1-1.png';
import blogImg2 from '../assets/images01/blog/blog-1-2.png';
import blogImg3 from '../assets/images01/blog/blog-1-3.png';
import serviceBg from '../assets/images01/shapes/service-shape-1-1.png';

const Investmentadvantages = () => {
  const blogPosts = [
    {
      id: 1,
      image: blogImg1,
      alt: "Healthcare essential services",
      icon: <FaHeartbeat />,
      authorName: "Essential Services",
      title: "Healthcare remains essential regardless of economic conditions, providing stable returns and consistent growth. The aging global population and rising chroni...",
      delay: "400ms"
    },
    {
      id: 2,
      image: blogImg2,
      alt: "Innovation driven",
      icon: <FaFlask />,
      authorName: "Innovation Driven",
      title: "Pharmaceutical R&D and biotech innovations create breakthrough investment opportunities. The global pharmaceutical market is projected to reach $1.5 trillion by 2025.",
      delay: "600ms"
    },
    {
      id: 3,
      image: blogImg3,
      alt: "Global expansion",
      icon: <FaGlobeAmericas />,
      authorName: "Global Expansion",
      title: "Emerging markets present significant growth opportunities as healthcare access expands. Developing countries are increasing healthcare spending at double-digit rates annual",
      delay: "800ms"
    }
  ];

  return (
    <section className="blog-one service-page service-page--one">
      <div
        className="service-page__bg"
        style={{ backgroundImage: `url(${serviceBg})` }}
      ></div>

      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="sec-title text-center wow fadeInUp" data-wow-duration="1500ms">
              <h6 className="sec-title__tagline">
                <img src={secTitleImg} alt="Article" className="sec-title__img" />
                Investment
              </h6>
              <h3 className="sec-title__title">
                Investment Advantages
              </h3>
            </div>
          </div>
        </div>
        <div className="row gutter-y-30">
          {blogPosts.map((post) => (
            <div className="col-md-6 col-lg-4" key={post.id}>
              <div
                className="blog-card wow fadeInUp animated"
                data-wow-duration="1500ms"
                data-wow-delay={post.delay}
                style={{ visibility: 'visible', animationDuration: '1500ms', animationDelay: post.delay, animationName: 'fadeInUp' }}
              >
                <div className="blog-card__image">
                  <div className="blog-card__image__item">
                    <img src={post.image} alt={post.alt} />
                    <Link to="/blog-details-right.html" className="blog-card__image__link"></Link>
                  </div>
                  <div className="blog-card__date" >
                    <span className="blog-card__date__icon " style={{fontSize: "22px",}}>{post.icon}</span>
                  </div>
                </div>
                <div className="blog-card__content">
                  <div className="blog-card__author">
                    
                      <div className="blog-card__author__content">
                        <h6 className="blog-card__author__name">{post.authorName}</h6>
                      </div>
                
                  </div>
                  <h3 className="blog-card__title">
                    <Link to="/blog-details-right.html" style={{ fontSize: "16px" }}>{post.title}</Link>
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Investmentadvantages