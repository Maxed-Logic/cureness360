import React from 'react';

// Import images (adjust paths as needed)
import subscribeImg from '../assets/images/resource/subscribe.png';
import callImg from '../assets/images/resource/call.png';

const Customer = () => {
  return (
    <>
      <div className="mediic-subscribe">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-5 col-md-4">
              <div className="subscribe-content">
                <div className="subscribe-icon cursor-scale">
                  <img style={{width: "50px"}} src={subscribeImg} alt="subscribe" />
                </div>
                <div className="subscribe-title">
                  <h1 className="cursor-scale small mb-3">
                    Cureness Experience.
                  </h1>
                </div>
              </div>
            </div>
            <div className="col-lg-5 col-md-2">
              <div className="subscribe-right">
                <div className="call-icon">
                  <img src={callImg} alt="call" style={{width: "50px"}}/>
                </div>

              <div className="mediic-btn text-right cursor-scale small" style={{ width: "10px",}}>
     <a href="mailto:healthcare@Cureness360.com">
    <span className="mediic-btn__hover"></span>
    <span className="mediic-btn__hover"></span>
    <span className="mediic-btn__hover"></span>
    <span className="mediic-btn__hover"></span>
    <span className="mediic-btn__hover"></span>
    <span className="mediic-btn__hover"></span>
    <span style={{fontSize: "10px"}}>
    healthcare@Cureness360.com
    </span>
  </a>
</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Customer;