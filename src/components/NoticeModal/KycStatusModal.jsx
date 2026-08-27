// src/components/KycStatusModal/KycStatusModal.jsx
import React, { useState, useEffect } from 'react';
import {FaExclamationTriangle, FaCheckCircle, FaClock } from 'react-icons/fa';
import { Link } from 'react-router-dom';


const KycStatusModal = ({ isOpen, onClose, kycStatus }) => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // 🔥 SIRF TAB SHOW KARO JAB KYC STATUS 3 (PENDING) HO
    if (isOpen && kycStatus === 3) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [isOpen, kycStatus]);

  if (!showModal) return null;

  const handleClose = () => {
    setShowModal(false);
    onClose();
  };

  return (
    <div className="kyc-modal-overlay">
      <div className="kyc-modal-dialog">
        <div className="kyc-modal-content">
          
          {/* Header */}
          <div className="kyc-modal-header bg-warning">
            <h5 className="kyc-modal-title">
              <FaExclamationTriangle className="kyc-modal-icon" /> 
               KYC Update 
            </h5>
          </div>

          {/* Body */}
          <div className="kyc-modal-body text-center">
            <h4 className="kyc-modal-heading text-danger">
              Complete Your KYC Verification
            </h4>
            <p className="kyc-modal-text">
              Your KYC is pending.<br /><br />
              To access withdrawals, bonuses and other financial services,
              please complete your KYC verification immediately.
            </p>
          </div>

          {/* Footer */}
          <div className="kyc-modal-footer">
            <Link to="/dashboard/UpdateKyc" className="kyc-modal-btn-primary">
              Update KYC Now
            </Link>
            <button 
              type="button" 
              className="kyc-modal-btn-secondary"
              onClick={handleClose}
            >
              Later
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default KycStatusModal;