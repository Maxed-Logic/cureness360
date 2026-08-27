import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaRegCopy } from "react-icons/fa";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiClient from '../../../api/apiClient';
import { useUser } from '../../../context/UserContext';

const AgreementForm = ({ open, onClose, loginId }) => {
  const { userData, refreshData } = useUser();

  const passedLoginId = (loginId || userData?.me || "GUEST").toUpperCase();
  const regno = userData?.regno || userData?.Regno || sessionStorage.getItem('regno');
  const userReg = sessionStorage.getItem('userregno'); 

  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreementId, setAgreementId] = useState("");

  const [formData, setFormData] = useState({
    fullName: '',
    emailID: '',
    dob: '',
    phone: '',
    motherMaidenName: '',
    address: '',
    amountUSDT: '',
    wallet: '',
    signature: '',
    walletType: 'totalWallet' // 'totalWallet' = 0 (Income), 'Smart_Wallet' = 1 (Smart)
  });

  // Auto-fill when modal opens
  useEffect(() => {
    if (!open) return;
    if (userData) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || userData.name || '',
        emailID: prev.emailID || userData.email || '',
        phone: prev.phone || userData.MobileNo || '',
        wallet: prev.wallet || userData.walletid || '',
      }));
    } else {
      const stored = sessionStorage.getItem('userData');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setFormData(prev => ({
            ...prev,
            fullName: prev.fullName || parsed.name || '',
            emailID: prev.emailID || parsed.email || '',
            phone: prev.phone || parsed.MobileNo || '',
            wallet: prev.wallet || parsed.walletid || '',
          }));
        } catch (e) { }
      }
    }
  }, [open, userData]);

  useEffect(() => {
    if (!open) {
      setShowSuccess(false);
      setAgreementId("");
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "amountUSDT" && value < 0) return;
    setFormData({ ...formData, [name]: value });
  };

  const handleCopy = (id) => {
    navigator.clipboard.writeText(id);
    toast.success("Agreement ID copied!");
  };

  // Get available balance based on selected wallet type
  const getAvailableBalance = () => {
    if (!userData) return 0;
    if (formData.walletType === 'Smart_Wallet') {
      return userData.Smart_Wallet || 0;
    }
    return userData.Depositfund || 0;
  };

  // Get wallet label
  const getWalletLabel = () => {
    if (formData.walletType === 'Smart_Wallet') {
      return 'Smart Wallet';
    }
    return 'Deposit Wallet';
  };

  // Get wallet value for API (0 = Income, 1 = Smart)
  const getWalletValue = () => {
    return formData.walletType === 'Smart_Wallet' ? 1 : 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.fullName || !formData.amountUSDT || !formData.emailID || !formData.phone) {
      toast.error("Please fill in all required fields.");
      return;
    }
    
    const amount = Number(formData.amountUSDT);
    if (amount < 100) {
      toast.error("Minimum investment of $100.00 is required.");
      return;
    }

    // Check if user has sufficient balance in selected wallet
    const availableBalance = getAvailableBalance();
    if (amount > availableBalance) {
      toast.error(`Insufficient balance in ${getWalletLabel()}. Available: $${availableBalance.toFixed(2)}`);
      return;
    }

    setLoading(true);

    // -------------------- 1. AGREEMENT API --------------------
    const agreementPayload = {
      regno: parseInt(regno),
      emailId: formData.emailID,
      fName: formData.fullName.split(' ')[0] || formData.fullName,
      mobile: formData.phone,
      motherName: formData.motherMaidenName,
      dateOfBirth: formData.dob,
      address: formData.address,
      amount: amount,
      usdt: amount,
      fullName: formData.fullName,
      signature: formData.signature || "Digital Signature",
      otherValue: "",
      wallet: formData.wallet,
    };

    try {
      // Submit Agreement
      const agreementRes = await apiClient.post('/Dashboard/member-aggrement', agreementPayload);

      if (!agreementRes.data?.success) {
        toast.error(agreementRes.data?.message || "Agreement submission failed.");
        setLoading(false);
        return;
      }

      const newAgreementId = agreementRes.data.data;
      setAgreementId(newAgreementId);
      sessionStorage.setItem('formData', JSON.stringify(formData));

      // -------------------- 2. INVESTMENT API --------------------
      // wallet: 0 = Income Wallet, 1 = Smart Wallet
      const walletValue = getWalletValue();
      
      const investmentPayload = {
        regno: parseInt(userReg),
        rkprice: amount,
        uRegno: parseInt(regno),
        pkg: "INV",
        aggrement: String(newAgreementId),
        wallet: Number(walletValue) 
      };
      console.log("📤 Investment Payload:", investmentPayload);

      const investmentRes = await apiClient.post('/Dashboard/investment', investmentPayload);


      if (investmentRes.data?.success) {
        toast.success(`Investment successful from ${getWalletLabel()}!`);
        setShowSuccess(true);
        await refreshData();
      } else {
        console.warn("⚠️ Investment API failed, but agreement saved.");
        toast.warning("Investment registration failed, but agreement saved. Please contact support.");
        setShowSuccess(true);
      }
    } catch (err) {
      console.error("❌ Error in agreement or investment API:", err);
      const errorMsg = err.response?.data?.message || "Server error. Please try again later.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="agreement-overlay">
        {!showSuccess ? (
          <form onSubmit={handleSubmit} className="form-container">
            <div className="form-card-wrapper">
              <button onClick={onClose} type="button" className="close-modal-btn">✖</button>

              <div className="form-card">
                <div className="form-header">
                  <div className="logo-section">
                    <div className="logo-text">
                      <span className="brand-name">Cureness</span>
                    </div>
                  </div>
                  <h2 className="form-title">Customer Investment Agreement Form</h2>
              </div>

                {/* Personal information section */}
                <section className="form-section">
                  <h3 className="section-heading">Personal information</h3>
                  <div className="grid-row">
                    <div className="input-group">
                      <label>Full name</label>
                      <input type="text" name="fullName" className="readonly-input" value={formData.fullName} readOnly required />
                    </div>
                    <div className="input-group">
                      <label>User Login ID</label>
                      <input type="text" value={passedLoginId} readOnly className="readonly-input" />
                    </div>
                  </div>
                  <div className="grid-row">
                    <div className="input-group">
                      <label>Email address</label>
                      <input type="email" name="emailID" className="readonly-input" value={formData.emailID} readOnly required />
                    </div>
                    <div className="input-group">
                      <label>Phone number</label>
                      <input type="text" name="phone" className="readonly-input" value={formData.phone} readOnly required />
                    </div>
                  </div>
                  <div className="grid-row">
                    <div className="input-group">
                      <label>Date of birth</label>
                      <input className='readonly-input' type="date" name="dob" value={formData.dob} onChange={handleChange} required />
                      <span className="input-hint">Format: YYYY-MM-DD</span>
                    </div>
                    <div className="input-group">
                      <label>Mother's maiden name</label>
                      <input className='readonly-input' type="text" name="motherMaidenName" placeholder="Mother's maiden name" value={formData.motherMaidenName} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="input-group full-width">
                    <label>Residential Address</label>
                    <input className='readonly-input' type="text" name="address" placeholder="Residential Address" value={formData.address} onChange={handleChange} required />
                  </div>
                </section>

                {/* Investment details section - WITH WALLET DROPDOWN */}
                <section className="form-section">
                  <h3 className="section-heading">Investment details</h3>
                  
                  {/* Wallet Selection Dropdown */}
                  <div className="grid-row">
                    <div className="input-group">
                      <label style={{ fontSize: "16px", fontWeight: "600" }}> Select Wallet</label>
                      <select
                        name="walletType"
                        value={formData.walletType}
                        onChange={handleChange}
                        className="wallet-select"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '10px',
                          border: '2px solid #dcdde1',
                          fontSize: '14px',
                          fontWeight: '500',
                          backgroundColor: '#f5f6fa',
                          color: "#1a1a2e",
                          appearance: 'none',
                          WebkitAppearance: 'none',
                          MozAppearance: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")",
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 14px center',
                          backgroundSize: '14px',
                          paddingRight: '40px'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#6c5ce7';
                          e.target.style.boxShadow = '0 0 0 4px rgba(108, 92, 231, 0.1)';
                          e.target.style.backgroundColor = '#ffffff';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#dcdde1';
                          e.target.style.boxShadow = 'none';
                          e.target.style.backgroundColor = '#f5f6fa';
                        }}
                      >
                        <option value="totalWallet">
                           Deposit (Balance: ${(userData?.Depositfund || 0).toFixed(2)})
                        </option>
                        <option value="Smart_Wallet">
                           Smart Wallet (Balance: ${(userData?.Smart_Wallet || 0).toFixed(2)})
                        </option>
                      </select>
                      
                    </div>
                  </div>

                  <div className="grid-row">
                    <div className="input-group">
                      <label>Investment amount (USDT)</label>
                      <input 
                        type="number" 
                        name="amountUSDT" 
                        value={formData.amountUSDT} 
                        placeholder="Enter Invest Amount (min $100)" 
                        onChange={handleChange} 
                        required 
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '2px solid #dcdde1',
                          fontSize: '14px',
                          backgroundColor: '#ffffff',
                          color: '#1a1a2e',
                          transition: 'all 0.3s ease',
                          cursor: 'text'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#6c5ce7';
                          e.target.style.boxShadow = '0 0 0 4px rgba(108, 92, 231, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#dcdde1';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    <div className="input-group">
                      <label>Amount in INR</label>
                      <input 
                        type="text" 
                        value={(formData.amountUSDT * 92 || 0).toFixed(2)} 
                        readOnly 
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '2px solid #dcdde1',
                          fontSize: '14px',
                          backgroundColor: '#f5f5f5',
                          color: '#1a1a2e',
                          cursor: 'default'
                        }}
                      />
                    </div>
                  </div>
                  
                </section>

                {/* Trading bot subscription */}
                <section className="info-box">
                  <div className="info-box-header">Trading bot subscription</div>
                  <div className="info-box-content">
                    <div className="checkbox-row">
                      <input type="checkbox" required className="checkbox-input" />
                      <p className="checkbox-label">
                        I agree to purchase the mandatory annual subscription for <strong>INR 9200</strong>, payable in advance, to participate in the investment program.
                      </p>
                    </div>
                    <ul className="info-list">
                      <li>Payment instructions will be provided upon signing the Investment Agreement.</li>
                      <li>The subscription is non-refundable and must be renewed annually.</li>
                    </ul>
                  </div>
                </section>

                {/* Investment terms acknowledgment */}
                <section className="info-box">
                  <div className="info-box-header">Investment terms acknowledgment</div>
                  <div className="info-box-content terms-content">
                    <div className="term-item"><span className="term-icon">✓</span><p><strong>Portfolio Return:</strong> expected annual portfolio return ranging between 72% to 84%, subject to market performance and company policy.</p></div>
                    <div className="term-item"><span className="term-icon">✓</span><p><strong>Lock-In Period:</strong> I acknowledge that the investment has a No Lock-in Period, during which the Investment Amount can be withdrawn except as outlined below.</p></div>
                    <div className="term-item"><span className="term-icon">✓</span><p><strong>Early Withdrawal Terms:</strong> Withdrawals between 1–11 months: 6% to 7% monthly return, subject to a 10% processing charge on the return provided.</p></div>
                    <div className="term-item"><span className="term-icon">✓</span><p><strong>Confidentiality:</strong> I agree to keep the terms of the Investment Agreement and any proprietary information provided by CURENESSFX LIMITED confidential, except as required by law.</p></div>
                  </div>
                </section>

                {/* Investment Adjustment Policy */}
                <section className="info-box">
                  <div className="info-box-header">Investment Adjustment Policy</div>
                  <div className="info-box-content policy-content">
                    <div className="policy-item"><span className="policy-bullet">•</span><p>When the Investor's total payout becomes equal to or exceeds 100% of the invested principal amount, 25% of the principal amount shall be adjusted towards returns.</p></div>
                    <div className="policy-item"><span className="policy-bullet">•</span><p>When the Investor's total accumulated returns reach 200% (2X) of the invested principal amount, 50% of the principal amount shall be adjusted towards returns.</p></div>
                    <div className="policy-item"><span className="policy-bullet">•</span><p>When the Investor's total earnings reach 300% (3X) of the principal amount, the investment term shall be considered completed. Any further participation shall require execution of a new investment agreement.</p></div>
                  </div>
                </section>

                {/* Consent and authorization */}
                <section className="info-box">
                  <div className="info-box-header">Consent and authorization</div>
                  <div className="info-box-content consent-content">
                    <div className="term-item"><span className="term-icon">✓</span><p>I consent to CURENESSFX LIMITED processing my personal information (Name, Email, Phone Number, Date of Birth, Mother's Maiden Name, Address, Wallet Address and Bank Account Details) in accordance with its Privacy Policy and applicable data protection laws.</p></div>
                    <div className="term-item"><span className="term-icon">✓</span><p>I authorize CURENESSFX LIMITED to send me the Investment Agreement via DocuSign to the email address provided, where I will fill in any additional details and apply my digital signature.</p></div>
                    <div className="term-item"><span className="term-icon">✓</span><p>I confirm that I have read, understood, and agree to be bound by the terms outlined in this form and the forthcoming Investment Agreement.</p></div>
                  </div>
                </section>

                {/* Signature section */}
                <section className="info-box signature-box">
                  <div className="info-box-header">Signature</div>
                  <div className="signature-grid">
                    <div className="company-signature">
                      <p className="signature-title">For CURENESS</p>
                      <p>Name: CureNess </p>
                      <p>Title: Invest For Multi Asset Trading</p>
                      <p className="signature-label">Digital Signature:</p>
                      <div className="digital-signature">CureNess </div>
                    </div>
                    <div className="investor-signature">
                      <p className="signature-title">For the Investor</p>
                      <div className="signature-field">
                        <label>Name:</label>
                        <input type="text" value={formData.fullName} readOnly className="signature-readonly" />
                      </div>
                      <div className="signature-field">
                        <label>Investor signature (digital):</label>
                        <input type="text" name="signature" placeholder="signature" value={formData.signature} onChange={handleChange} className="signature-input" required />
                      </div>
                    </div>
                  </div>
                  <div className="signature-date">
                    <p className="signature-title">Date</p>
                    <div>{new Date().toLocaleDateString()}</div>
                  </div>
                </section>

                <div className="button-group02">
                  <button type="button" onClick={() => window.print()} className="btn btn-primary">PRINT</button>
                  <button type="submit" disabled={loading} className="btn btn-primary" style={{
                    opacity: loading ? 0.7 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}>
                    {loading ? " Submitting..." : "SUBMIT"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="success-popup">
            <button onClick={onClose} className="close-success-btn">✖</button>
            <div className="success-icon">✓</div>
            <h2>Investment Successfully!</h2>
            <p>Your agreement has been submitted</p>
            <div className="success-details">
              <div><span>Investor Name</span><strong>{formData.fullName}</strong></div>
              {/* <div><span>Login ID</span><strong>{passedLoginId}</strong></div> */}
              <div><span>Invest Amount</span><strong>${formData.amountUSDT}</strong></div>
              <div><span>Wallet Used</span><strong>{getWalletLabel()}</strong></div>
              <div><span>Agreement ID</span><strong>{agreementId} <FaRegCopy className="copy-icon" onClick={() => handleCopy(agreementId)} /></strong></div>
            </div>
          </div>
        )}
      </div>
    </>,
    document.body
  );
};

export default AgreementForm;