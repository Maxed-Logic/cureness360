import React, { useState, useEffect, useRef } from "react";
import { 
  FaUser, FaEnvelope, FaPhone, FaWallet, FaUniversity, FaCode, 
  FaCreditCard, FaLock, FaSave, FaEye, FaEyeSlash, FaRegIdCard,
  FaArrowLeft, FaBell, FaShieldAlt, FaCheckCircle, FaCopy,
  FaPenAlt, FaUserCircle
} from "react-icons/fa";
import { useUser } from "../../../../context/UserContext";
import apiClient from "../../../../api/apiClient";
import toast from "react-hot-toast";
import "./Profile.css";

const ProfilePage = () => {
  const { userData, user, updateUserData, refreshData } = useUser();
  const [saveStatus, setSaveStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState("");
  const [isUpdatingPersonal, setIsUpdatingPersonal] = useState(false);
  const [isUpdatingBank, setIsUpdatingBank] = useState(false);

  // Password visibility states
  const [showPersonalPassword, setShowPersonalPassword] = useState(false);
  const [showBankPassword, setShowBankPassword] = useState(false);
  const walletRegex = /^0x[a-fA-F0-9]{40}$/;

  
  const [formData, setFormData] = useState({
    loginId: "",
    fullName: "",
    emailId: "",
    mobileNumber: "",
    regNo: "", // ✅ ADDED - MISSING THA
    masterPassword: "",
    wallwtaddresh: "",
    accountHolderName: "",
    bankName: "",
    ifscCode: "",
    accountNumber: "",
    bankMasterPassword: ""
  });

  // LOAD DATA DIRECTLY FROM userData (API se)
  useEffect(() => {
    if (userData) {
      console.log("📊 User Data:", userData);
      
      setFormData(prev => ({
        ...prev,
        loginId: userData?.loginid || userData?.LoginID || userData?.me || "",
        fullName: userData?.fName || userData?.Name || userData?.name || "",
        emailId: userData?.emailID || userData?.email || userData?.emailId || "",
        mobileNumber: userData?.mobile || userData?.MobileNo || userData?.mobileNumber || "",
        regNo: userData?.regNo || userData?.regno || userData?.RegNo || "",
        wallwtaddresh: userData?.accountNo || "",
        accountNumber: userData?.upiNumber || "",
        accountHolderName: userData?.NameOnAccount ,
        bankName: userData?.bankName || "",
        ifscCode: userData?.ifsccode || userData?.ifscCode || ""
      }));    
      setLoading(false);
    }  
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // API call to update personal profile
  const updateProfileAPI = async (profileData) => {
    try {
      const response = await apiClient.post('/User/update-profile', {
        regNo: parseInt(profileData.regNo) || parseInt(userData?.regno),
        fName: profileData.fullName,
        emailID: profileData.emailId,
        mobile: profileData.mobileNumber,
        masterPasword: formData.masterPassword,
      });
            
      if (response.data?.success) {
        if (updateUserData) {
          updateUserData({
            name: profileData.fullName,
            emailID: profileData.emailId,
            mobile: profileData.mobileNumber
          });
        }
        setFormData(prev => ({ ...prev, masterPassword: "" }));
        return true;
      } else {
        toast.error(response.data?.message || "Failed to update profile");
        return false;
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.response?.data?.message || "Error updating profile. Please try again.");
      return false;
    }
  };

  // ✅ API call to update bank details - FIXED
  const updateBankDetailsAPI = async (bankData) => {
    try {
      const payload = {
        regNo: parseInt(bankData.regNo) || parseInt(userData?.regno),
        accountNo: bankData.wallwtaddresh, // ✅ FORM SE WALLET ADDRESS
        accountHolderName: bankData.accountHolderName,
        bankName: bankData.bankName,
        ifscCode: bankData.ifscCode,
        wallwtaddresh: bankData.wallwtaddresh, // ✅ FORM SE
        upiNumber: bankData.accountNumber, // ✅ FORM SE ACCOUNT NUMBER
        masterPasword: formData.bankMasterPassword,
      };

      console.log("📤 Sending Bank Data:", payload);

      const response = await apiClient.post('/User/update-details', payload);
      
      console.log("📥 API Response:", response.data);
      
      if (response.data?.success) {
        // toast.success("Bank details updated successfully!");
        return true;
      } else {
        toast.error(response.data?.message || "Failed to update bank details");
        return false;
      }
    } catch (error) {
      console.error("❌ Bank details update error:", error);
      console.error("❌ Error Response:", error.response?.data);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors).flat();
        toast.error(errors[0] || "Validation error");
      } else {
        toast.error("Error updating bank details. Please try again.");
      }
      return false;
    }
  };

  // Personal Details Submit Handler
  const handlePersonalSubmit = async (e) => {
    e.preventDefault();
    
    if (isUpdatingPersonal) return;
    
    if (!formData.masterPassword || formData.masterPassword.length < 4) {
      toast.error("Please enter your Master Password (minimum 4 characters)");
      return;
    }
    
    setIsUpdatingPersonal(true);
    
    try {
      const profileUpdateData = {
        fullName: formData.fullName,
        emailId: formData.emailId,
        mobileNumber: formData.mobileNumber,
        regNo: formData.regNo || userData?.regno || user?.regno
      };
      
      const apiSuccess = await updateProfileAPI(profileUpdateData);
      
      if (apiSuccess) {
        setSaveStatus("Profile updated successfully!");
        setTimeout(() => setSaveStatus(""), 3000);
        await refreshData();
        setFormData(prev => ({ ...prev, masterPassword: "" }));
      }
    } finally {
      setTimeout(() => {
        setIsUpdatingPersonal(false);
      }, 2000);
    }
  };

  // Bank Details Submit Handler - FIXED
  const handleBankSubmit = async (e) => {
    e.preventDefault();
    
    if (isUpdatingBank) return;
    
    if (!formData.bankMasterPassword || formData.bankMasterPassword.length < 4) {
      toast.error("Please enter your Master Password (minimum 4 characters)");
      return;
    }
    
    setIsUpdatingBank(true);
    
    try {
      const bankData = {
        accountNumber: formData.accountNumber, // ✅ Form se
        accountHolderName: formData.accountHolderName,
        bankName: formData.bankName,
        ifscCode: formData.ifscCode,
        wallwtaddresh: formData.wallwtaddresh, // ✅ ✅ ✅ FIX: Form se lo
        regNo: formData.regNo || userData?.regno || user?.regno
      };
      
      console.log("📤 Bank Data being sent:", bankData);
      
      const apiSuccess = await updateBankDetailsAPI(bankData);
      
      if (apiSuccess) {
        setSaveStatus("Bank details updated successfully!");
        setTimeout(() => setSaveStatus(""), 3000);
        await refreshData();
        setFormData(prev => ({ ...prev, bankMasterPassword: "" }));
      }
    } catch (error) {
      console.error("Error in bank submit:", error);
      toast.error("Failed to update bank details");
    } finally {
      setTimeout(() => {
        setIsUpdatingBank(false);
      }, 2000);
    }
  };

  const handleCopyWallet = () => {
    if (formData.wallwtaddresh) { // ✅ formData se check karo
      navigator.clipboard.writeText(formData.wallwtaddresh);
      setCopySuccess("Copied!");
      setTimeout(() => setCopySuccess(""), 2000);
    } else {
      toast.error("No wallet address to copy!");
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loader"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page-wrapper">
      {/* Header Section */}
      <header className="profile-header-modern">
        <div className="header-bg-shape"></div>
        <div className="header-container">
          <div className="header-top-row">
            <div className="header-logo-area">
            </div>
          </div>
        
          <div className="header-stats-cards">
            <div className="stat-card">
              <div className="stat-icon">
                <FaRegIdCard />
              </div>
              <div className="stat-info">
                <span className="stat-label">Login ID</span>
                <span className="stat-value">{formData.loginId}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <FaEnvelope />
              </div>
              <div className="stat-info">
                <span className="stat-label">Email</span>
                <span className="stat-value">{formData.emailId}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <FaPhone />
              </div>
              <div className="stat-info">
                <span className="stat-label">Mobile</span>
                <span className="stat-value">{formData.mobileNumber}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Profile Content */}
      <div className="profile-page-main">
        <div className="profile-container">
          {saveStatus && (
            <div className="save-status-toast">
              <FaCheckCircle />
              {saveStatus}
            </div>
          )}
          
          <div className="profile-grid">
            {/* Personal Details Card */}
            <form onSubmit={handlePersonalSubmit} className="profile-card personal-card">
              <div className="card-header01">
                <div className="header-icon-wrapper">
                  <FaUser className="card-icon" />
                </div>
                <div className="Personal-Details">Personal Details</div>
              </div>
              
              <div className="card-body p-3">
                <div className="form-group">
                  <label className="text"><FaUser className="input-icon" />Login ID</label>
                  <input 
                    type="text" 
                    name="loginId" 
                    value={formData.loginId} 
                    className="text" 
                    disabled 
                    style={{ backgroundColor: "#d3e8fc", cursor: "not-allowed", color: "#070356", fontSize: "18px" }}
                  />
                </div>

                <div className="form-group">
                  <label className="text"><FaUser className="input-icon" /> Full Name</label>
                  <input 
                    type="text" 
                    name="fullName" 
                    value={formData.fullName} 
                    onChange={handleChange}
                    className="text" 
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="text"><FaEnvelope className="input-icon" /> Email ID</label>
                  <input 
                    type="email" 
                    name="emailId" 
                    value={formData.emailId} 
                    onChange={handleChange}
                    className="text" 
                    required
                  />
                </div>

   <div className="form-group">
  <label className="text"><FaPhone className="input-icon" /> Mobile Number</label>
  <input 
    type="tel" 
    name="mobileNumber" 
    value={formData.mobileNumber} 
    onChange={(e) => {
      const value = e.target.value.replace(/\D/g, '');
      setFormData({ ...formData, mobileNumber: value });
    }} 
    className="text" 
    placeholder="Enter mobile number (minimum 10 digits)"
    required
    minLength="10"
  />
</div>

                <div className="form-group">
                  <label className="text">
                    <FaLock className="input-icon" /> Master Password <span style={{ color: 'red' }}>*</span>
                  </label>
                  <div className="password-wrapper">
                    <input 
                      type={showPersonalPassword ? "text" : "password"} 
                      name="masterPassword" 
                      value={formData.masterPassword} 
                      onChange={handleChange} 
                      placeholder="Enter Master Password" 
                      required
                    />
                    <button 
                      type="button" 
                      className="password-toggle" 
                      onClick={() => setShowPersonalPassword(!showPersonalPassword)}
                    >
                      {showPersonalPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="card-actions">
                  <button 
                    type="submit" 
                    className="btn btn-primary update-btn" 
                    disabled={isUpdatingPersonal}
                  >
                    {isUpdatingPersonal ? " UPDATING..." : " UPDATE PROFILE"}
                  </button>
                </div>
              </div>
            </form>

            {/* Bank Account Details Card */}
            <form onSubmit={handleBankSubmit} className="profile-card bank-card">
              <div className="card-header01">
                <div className="header-icon-wrapper">
                  <FaUniversity className="card-icon" />
                </div>
                <div className="Personal-Details">Bank Account Details</div>
              </div>
              
              <div className="card-body p-3">
                {/* BEP20 Wallet Address */}
         <div className="form-group wallet-group">
  <label className="text">
    <FaWallet className="input-icon" /> BEP20 Wallet Address
  </label>
  <div className="wallet-input-wrapper">
    <input 
      type="text" 
      name="wallwtaddresh" 
      value={formData.wallwtaddresh} 
      onChange={handleChange} 
      placeholder="0x... Enter BEP20 Wallet Address" 
      className="wallet-input-field"
      pattern="^0x[a-fA-F0-9]{40}$"  
      title="Bank Account" 
      required // ✅ Yeh add karo (optional)
    />
    <button type="button" className="copy-wallet-btn" onClick={handleCopyWallet} title="Copy address">
      <FaCopy />
    </button>
  </div>
  {copySuccess && <span className="copy-feedback">{copySuccess}</span>}
</div>

                <div className="form-group">
                  <label className="text"><FaUser className="input-icon" /> Account Holder Name</label>
                  <input 
                    type="text" 
                    name="accountHolderName" 
                    value={formData.accountHolderName} 
                    onChange={handleChange} 
                    placeholder="Enter Account Holder Name" 
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group half">
                    <label className="text"><FaUniversity className="input-icon" /> Bank Name</label>
                    <input 
                      type="text" 
                      name="bankName" 
                      value={formData.bankName} 
                      onChange={handleChange} 
                      placeholder="Bank Name" 
                      required
                    />
                  </div>

                  <div className="form-group half">
                    <label className="text"><FaCode className="input-icon" /> IFSC Code</label>
                    <input 
                      type="text" 
                      name="ifscCode" 
                      value={formData.ifscCode} 
                      onChange={handleChange} 
                      placeholder="IFSC Code" 
                      required
                    />
                  </div>
                </div>

   <div className="form-group">
  <label className="text"><FaWallet className="input-icon" /> Account / UPI Number</label>
  <input 
    type="text" 
    name="accountNumber" 
    value={formData.accountNumber} 
    onChange={(e) => {
      const value = e.target.value.replace(/\D/g, '');
      setFormData({ ...formData, accountNumber: value });
    }} 
    placeholder="Enter Account / UPI Number" 
    required
  />
</div>

                {/* MASTER PASSWORD - Bank Form */}
                <div className="form-group">
                  <label className="text">
                    <FaLock className="input-icon" /> Master Password <span style={{ color: 'red' }}>*</span>
                  </label>
                  <div className="password-wrapper">
                    <input 
                      type={showBankPassword ? "text" : "password"} 
                      name="bankMasterPassword" 
                      value={formData.bankMasterPassword} 
                      onChange={handleChange} 
                      placeholder="Enter Master Password" 
                      required
                    />
                    <button 
                      type="button" 
                      className="password-toggle" 
                      onClick={() => setShowBankPassword(!showBankPassword)}
                    >
                      {showBankPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="card-actions">
                  <button 
                    type="submit" 
                    className="btn btn-primary update-btn" 
                    disabled={isUpdatingBank}
                  >
                    {isUpdatingBank ? " UPDATING..." : " UPDATE BANK DETAILS"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;