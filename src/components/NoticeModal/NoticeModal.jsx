// src/components/NoticeModal/NoticeModal.jsx
import React, { useState, useEffect } from 'react';
import { FaTimes, FaCheckCircle } from 'react-icons/fa';

const NoticeModal = ({ isOpen, onClose }) => {
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsChecked(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUnderstand = () => {
    if (isChecked) {
      sessionStorage.setItem('noticeSeen', 'true');
      onClose();
    } else {
      alert('Please check "I Understand" to proceed.');
    }
  };

  return (
    <div className="notice-modal-overlay">
      <div className="notice-modal-dialog">
        <div className="notice-modal-content">
          
          {/* Header */}
          <div className="notice-modal-header">
            <h5 className="notice-modal-title">
              📢 Important Notice to All Account Holders
            </h5>
            {/* <button className="notice-modal-close" onClick={onClose}>
              <FaTimes />
            </button> */}
          </div>

          {/* Body */}
          <div className="notice-modal-body">
            
            <div className="text-center mb-3">
              <h4 className="notice-heading">Monthly Closing Cycle Updated</h4>
            </div>

            <p className="notice-text">
              Dear <strong>Valued Members</strong>,
            </p>

            <p className="notice-text">
              As part of our long-term strategic improvements, we have updated our
              <strong> monthly closing calendar</strong>.
            </p>

            <div className="notice-table-wrapper">
              <table className="notice-table">
                <thead>
                  <tr>
                    <th>Previous Cycle</th>
                    <th>New Cycle</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>5th to 5th of every month</td>
                    <td>1st to the last day of every month</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="notice-text">
              As always, we remain committed to timely operations. All monthly
              closings have been completed on schedule, and payouts are being
              credited as per the withdrawal requests submitted.
            </p>

            <div className="notice-note-box">
              <strong>Please Note:</strong>
              <ul className="notice-note-list">
                <li>
                  <strong>July's previous payout</strong> was calculated for the period
                  <strong> 6th June to 5th July</strong>.
                </li>
                <li>
                  <strong>This month's payout</strong> has been calculated for the period
                  <strong> 6th July to 31st July (26 days only)</strong>.
                </li>
              </ul>
            </div>

            <div className="notice-warning-box">
              As a result, the payout amount for this month may differ from your
              usual expected amount due to the shorter calculation period.
            </div>

            <div className="notice-cycle-box">
              <p className="notice-cycle-text">
                <div>Going forward, all income calculations will follow the new monthly cycle:</div>
              </p>
              <div className="notice-cycle-arrow">
                1st of the Month → Last Day of the Same Month
              </div>
            </div>

            <p className="notice-text mt-2">
              We appreciate your understanding and cooperation as we continue
              enhancing our services to provide a smoother and more efficient
              experience.
            </p>

            <p className="notice-thanks">
              Thank you for your continued trust and support.
            </p>

            <p className="notice-healthy">
              💚 Stay Healthy. Stay Happy.
            </p>

            {/* Checkbox */}
            <div className="notice-checkbox">
              <input
                type="checkbox"
                id="understand"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
              />
              <label htmlFor="understand">
                I have read and understood the notice.
              </label>
            </div>

          </div>

          {/* Footer */}
          <div className="notice-modal-footer">
            <button
              type="button"
              className={`notice-modal-btn ${isChecked ? 'active' : ''}`}
              onClick={handleUnderstand}
              disabled={!isChecked}
            > I Understand
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default NoticeModal;