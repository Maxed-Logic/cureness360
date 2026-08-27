import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaRegCopy } from "react-icons/fa";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; //  Capital R, T
import apiClient from '../../../api/apiClient';
import { useUser } from '../../../context/UserContext';

const AgreementForm = ({ open, onClose, loginId }) => {
  const { userData, updateUserData } = useUser();

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
    walletType: 'totalWallet'
  });



  const InvestuserName = sessionStorage.getItem("InvestuserName")
  // Auto-fill when modal opens
  useEffect(() => {
    if (!open) return;
    if (userData) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || InvestuserName,
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
            fullName: prev.fullName || InvestuserName,
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

  const handleWalletSelect = (walletType) => {
    setFormData({
      ...formData,
      walletType: walletType
    });
  };

  const handleCopy = (id) => {
    navigator.clipboard.writeText(id);
    toast.success("Agreement ID copied!");
  };

  const getAvailableBalance = () => {
    if (!userData) return 0;
    if (formData.walletType === 'Smart_Wallet') {
      return userData.Smart_Wallet || 0;
    }
    return userData.Depositfund || 0;
  };

  const getWalletLabel = () => {
    if (formData.walletType === 'Smart_Wallet') {
      return 'Smart Wallet';
    }
    return 'Deposit Wallet';
  };

  const getWalletValue = () => {
    return formData.walletType === 'Smart_Wallet' ? 1 : 0;
  };

  const getErrorMessage = (error) => {
    if (!error) return "Server error. Please try again.";
    if (Array.isArray(error)) return error.join(". ");
    if (typeof error === 'object' && error.message) {
      if (Array.isArray(error.message)) return error.message.join(". ");
      return error.message;
    }
    if (typeof error === 'string') return error;
    return "Server error. Please try again.";
  };

  //  COMPLETE BALANCE UPDATE - Sab fields update karo
  const updateBalanceInContext = (amount, walletType) => {
    if (!userData) return;
    
    const updatedData = { ...userData };
    
    //  Wallet balance update
    if (walletType === 'Smart_Wallet') {
      const oldBalance = updatedData.Smart_Wallet || 0;
      updatedData.Smart_Wallet = oldBalance - amount;
      updatedData.totalWallet = (updatedData.totalWallet || 0) - amount;
    } else {
      const oldBalance = updatedData.Depositfund || 0;
      updatedData.Depositfund = oldBalance - amount;
      updatedData.topupwallet = (updatedData.topupwallet || 0) - amount;
    }
    
    //  Invest amount update
    updatedData.Invest = (updatedData.Invest || 0) + amount;
    
    //  Context + SessionStorage update
    updateUserData(updatedData);
    
    //  Force UI update - Dispatch event
    window.dispatchEvent(new Event('userDataUpdated'));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.amountUSDT || !formData.emailID || !formData.phone) {
      toast.error("Please fill in all required fields.");
      return;
    }
    
    const amount = Number(formData.amountUSDT);
    if (amount < 100) {
      toast.error("Minimum investment of ₹100.00 is required.");
      return;
    }

    const availableBalance = getAvailableBalance();
    if (amount > availableBalance) {
      toast.error(`Insufficient balance in ${getWalletLabel()}. Available:  ₹${availableBalance.toFixed(2)}`);
      return;
    }

    setLoading(true);

    const mainRegno = parseInt(regno) || parseInt(sessionStorage.getItem('regno'));
    const userRegno = parseInt(userReg) || parseInt(sessionStorage.getItem('userregno')) || mainRegno;

    //  Agreement Payload
    const agreementPayload = {
      regno: mainRegno,
      emailId: formData.emailID,
      fName: formData.fullName.split(' ')[0] || formData.fullName,
      mobile: formData.phone,
      motherName: formData.motherMaidenName || "N/A",
      dateOfBirth: formData.dob || "2000-01-01",
      address: formData.address || "N/A",
      amount: amount,
      usdt: amount,
      fullName: formData.fullName,
      signature: formData.signature || "Digital Signature",
      otherValue: "",
      wallet: formData.wallet || "",
    };

    try {
      //  Agreement API
      const agreementRes = await apiClient.post('/Dashboard/member-aggrement', agreementPayload);

      if (!agreementRes.data?.success) {
        const errorMsg = getErrorMessage(agreementRes.data?.message);
        toast.error(errorMsg || "Agreement submission failed.");
        setLoading(false);
        return;
      }

      const newAgreementId = agreementRes.data.data;
      setAgreementId(newAgreementId);
      sessionStorage.setItem('formData', JSON.stringify(formData));

      //  Investment Payload
      const walletValue = getWalletValue();
      const investmentPayload = {
        regno: userRegno,
        rkprice: amount,
        uRegno: mainRegno,
        pkg: "inv",
        aggrement: String(newAgreementId),
        wallet: Number(walletValue)
      };
    
      //  Investment API Call
      const investmentRes = await apiClient.post('/Dashboard/investment', investmentPayload);
      
      if (investmentRes.data?.success) {
        toast.success(` Investment successful from ${getWalletLabel()}!`);
        setShowSuccess(true);
        
        //  AUTO BALANCE CUT - No manual refresh needed!
        updateBalanceInContext(amount, formData.walletType);
        
      } else {
        const errorMsg = getErrorMessage(investmentRes.data?.message);
        const lowerMsg = errorMsg.toLowerCase();
        
        if (lowerMsg.includes("already") || 
            lowerMsg.includes("you can activate bot only one time") ||
            lowerMsg.includes("cannot upgrade") ||
            lowerMsg.includes("bot is already active")) {
          toast.success(" BOT is already active for this user!");
          setShowSuccess(true);
          
          //  AUTO BALANCE CUT - No manual refresh needed!
          updateBalanceInContext(amount, formData.walletType);
          
        } else {
          console.warn(" Investment API failed, but agreement saved.");
          toast.warning(errorMsg || "Investment registration failed, but agreement saved. Please contact support.");
          setShowSuccess(true);
        }
      }
    } catch (err) {
      console.error(" Error:", err);
      
      let errorMsg = "Server error. Please try again later.";
      
      if (err.code === 'ERR_NETWORK') {
        errorMsg = " Network error! Please check your connection.";
        toast.error(errorMsg);
        setLoading(false);
        return;
      }
      
      if (err.response) {
        
        if (err.response.status === 401) {
          errorMsg = " Session expired! Please login again.";
          toast.error(errorMsg);
          setLoading(false);
          return;
        }
        
        if (err.response.data?.message) {
          errorMsg = getErrorMessage(err.response.data.message);
        } else if (err.response.data?.error) {
          errorMsg = getErrorMessage(err.response.data.error);
        } else if (typeof err.response.data === 'string') {
          errorMsg = err.response.data;
        } else {
          errorMsg = `Server Error (${err.response.status})`;
        }
        
        const lowerMsg = errorMsg.toLowerCase();
        if (lowerMsg.includes("already") || 
            lowerMsg.includes("you can activate bot only one time") ||
            lowerMsg.includes("cannot upgrade") ||
            lowerMsg.includes("bot is already active")) {
          toast.success(" BOT is already active for this user!");
          setShowSuccess(true);
          
          //  AUTO BALANCE CUT - No manual refresh needed!
          updateBalanceInContext(amount, formData.walletType);
          
          setLoading(false);
          return;
        }
      } else if (err.request) {
        errorMsg = " No response from server. Please check your connection.";
      }
      
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
                      <span className="brand-name">Cureness360</span>
                    </div>
                  </div>
                  <h2 className="form-title"> Investment Form</h2>
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
                  
                  {/* Hidden fields required by API */}
                  <div style={{ display: 'none' }}>
                    <input type="text" name="motherMaidenName" value={formData.motherMaidenName || "N/A"} onChange={handleChange} />
                    <input type="text" name="address" value={formData.address || "N/A"} onChange={handleChange} />
                    <input type="date" name="dob" value={formData.dob || "2000-01-01"} onChange={handleChange} />
                  </div>
                </section>

                {/* Investment details */}
                <section className="form-section">
                  <h3 className="section-heading">Investment details</h3>                 
                  
                  <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <div 
                      style={{
                        flex: 1,
                        minWidth: '140px',
                        padding: '15px 20px',
                        borderRadius: '12px',
                        border: formData.walletType === 'totalWallet' ? '3px solid #6c5ce7' : '2px solid #dcdde1',
                        backgroundColor: formData.walletType === 'totalWallet' ? '#f0edff' : '#f5f6fa',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        textAlign: 'center',
                        boxShadow: formData.walletType === 'totalWallet' ? '0 4px 15px rgba(108, 92, 231, 0.2)' : 'none'
                      }}
                      onClick={() => handleWalletSelect('totalWallet')}
                    >
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a2e' }}> Deposit Wallet</div>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#6c5ce7' }}>
                        ${(userData?.Depositfund || 0).toFixed(2)}
                      </div>
                    </div>

                    <div 
                      style={{
                        flex: 1,
                        minWidth: '140px',
                        padding: '15px 20px',
                        borderRadius: '12px',
                        border: formData.walletType === 'Smart_Wallet' ? '3px solid #6c5ce7' : '2px solid #dcdde1',
                        backgroundColor: formData.walletType === 'Smart_Wallet' ? '#f0edff' : '#f5f6fa',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        textAlign: 'center',
                        boxShadow: formData.walletType === 'Smart_Wallet' ? '0 4px 15px rgba(108, 92, 231, 0.2)' : 'none'
                      }}
                      onClick={() => handleWalletSelect('Smart_Wallet')}
                    >
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a2e' }}>Smart Wallet</div>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#6c5ce7' }}>
                        ${(userData?.Smart_Wallet || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="grid-row">
                    <div className="input-group">
                      <label>Investment amount (USD)</label>
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
                    <div className="input-group ">
                      <label>Amount in INR</label>
                      <input 
                        type="text" 
                        value={(formData.amountUSDT * 90 || 0).toFixed(2)} 
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
                        I agree to purchase the mandatory annual subscription for <strong>INR 9000</strong>, payable in advance, to participate in the investment program.
                      </p>
                    </div>
                    <ul className="info-list">
                      <li>Payment instructions will be provided upon signing the Investment Agreement.</li>
                      <li>The subscription is non-refundable and must be renewed annually.</li>
                    </ul>
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
              <div><span>Invest Amount</span><strong> ${formData.amountUSDT}</strong></div>
              <div><span>Wallet Used</span><strong>{getWalletLabel()}</strong></div>
            </div>
          </div>
        )}
      </div>
    </>,
    document.body
  );
};

export default AgreementForm;