import React, { useState, useEffect } from 'react';
import {
  FaUser, FaEnvelope, FaPhone, FaIdCard, FaCalendarAlt,
  FaMapMarkerAlt, FaUpload, FaCheckCircle, FaTimesCircle,
  FaSpinner, FaEye, FaEyeSlash, FaLock, FaSave, FaCamera,
  FaFileUpload, FaUserCheck, FaUserTimes, FaClock, FaInfoCircle,
  FaCreditCard, FaCode, FaWallet, FaBuilding, FaArrowRight,
  FaArrowLeft, FaUniversity, FaRegIdCard, FaCity, FaFlag,
  FaGlobe, FaHome, FaAddressCard, FaUserCircle, FaCheckDouble,
  FaFileAlt, FaHandshake, FaRupeeSign, FaDollarSign, FaFileInvoice,
  FaUpload as FaUploadIcon
} from 'react-icons/fa';
// 🔥 REMOVED: import { useUser } from '../../../context/UserContext';
import apiClient from '../../../api/apiClient';
import toast from 'react-hot-toast';
import 'bootstrap/dist/css/bootstrap.min.css';

import logo from '../../../assets/images/logo.png'

const UpdateKyc = () => {
  // 🔥 REMOVED: const { updateUserData } = useUser();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [kycStatus, setKycStatus] = useState('not_submitted');
  const [declarationAccepted, setDeclarationAccepted] = useState(false);

  const [formData, setFormData] = useState({
    loginId: '',
    fullName: '',
    dateOfJoining: '',
    country: 'India',
    mobileNumber: '',
    email: '',
    streetAddress: '',
    city: '',
    state: '',
    pincode: '',
    panNumber: '',
    aadharNumber: '',
    dob: '',
    gender: '',
    nationality: 'Indian',
    bankAccountNumber: '',
    ifscCode: '',
    bankName: '',
    accountHolderName: '',
    walletAddress: '',
    upiNumber: '',
    investmentFund: '',
    realInvestmentFund: '',
    supportFund: '',
    leverageFund: '',
    overallIncome: '',
    description: '',
  });

  const [files, setFiles] = useState({
    panCard: null,
    aadharFront: null,
    aadharBack: null,
    passportPhoto: null,
    bankSlip: null,
    signature: null,
  });

  const [filePreviews, setFilePreviews] = useState({
    panCard: null,
    aadharFront: null,
    aadharBack: null,
    passportPhoto: null,
    bankSlip: null,
    signature: null,
  });

  // 🔥 API SE DATA LO
  const fetchKycDetails = async () => {
    try {
      const regno = sessionStorage.getItem('regno');

      // if (!regno) {
      //   toast.error('Please login again');
      //   setLoading(false);
      //   return;
      // }

      const response = await apiClient.get(`/User/user-kyc-details/${regno}`);

      if (response.data?.success) {
        const data = response.data.response;

        setFormData({
          loginId: data?.LoginID || '',
          fullName: data?.fName || data?.Name || '',
          dateOfJoining: data?.regDate ? new Date(data.regDate).toLocaleString() : '',
          country: data?.oCountry || 'India',
          mobileNumber: data?.mobile || '',
          email: data?.emailID || '',
          streetAddress: data?.address || '',
          city: data?.oCity || '',
          state: data?.oState || '',
          pincode: data?.pinCode || '',
          panNumber: data?.panNumber || '',
          aadharNumber: data?.aadharNumber || '',
          dob: data?.dob ? data.dob.split('T')[0] : '',
          gender: data?.gender === 1 ? 'Male' : data?.gender === 2 ? 'Female' : '',
          nationality: data?.oCountry || 'Indian',
          bankAccountNumber: data?.upiNumber || '',
          ifscCode: data?.ifsccode || '',
          bankName: data?.bankName || '',
          accountHolderName: data?.NameOnAccount || '',
          walletAddress: data?.walletid || '',
          upiNumber: data?.upiNumber || '',
          investmentFund: data?.CurrentInvest || '',
          realInvestmentFund: data?.realInvestmentFund || '',
          supportFund: data?.supportFund || '',
          leverageFund: data?.leverageFund || '',
          overallIncome: data?.currentIncome || '',
          description: data?.UserRemark || '',
        });

        if (data?.kycstatus) {
          setKycStatus(data.kycstatus);
        }
      }
    } catch (error) {
      console.error(' Error fetching KYC details:', error);
      toast.error('Error loading KYC data');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 SIRF EK BAAR CHALEGA - PAGE LOAD PE
  useEffect(() => {
    fetchKycDetails();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload JPEG, PNG, or PDF file');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size should be less than 10MB');
        return;
      }

      setFiles({ ...files, [field]: file });

      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreviews({ ...filePreviews, [field]: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = (field) => {
    setFiles({ ...files, [field]: null });
    setFilePreviews({ ...filePreviews, [field]: null });
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.fullName || !formData.mobileNumber || !formData.email) {
          toast.error('Please fill Name, Mobile & Email');
          return false;
        }
        return true;

      case 2:
        if (!formData.accountHolderName || !formData.bankName || !formData.ifscCode || !formData.bankAccountNumber) {
          toast.error('Please fill all bank details');
          return false;
        }
        if (!files.bankSlip) {
          toast.error('Please upload Bank Slip');
          return false;
        }
        if (!declarationAccepted) {
          toast.error('Please accept the Terms & Conditions');
          return false;
        }
        return true;

      case 3:
        if (!formData.panNumber || !formData.aadharNumber) {
          toast.error('Please enter PAN & Aadhaar Number');
          return false;
        }
        if (!files.panCard || !files.aadharFront || !files.aadharBack) {
          toast.error('Please upload all documents');
          return false;
        }
        return true;

      case 4:
        if (!declarationAccepted) {
          toast.error('Please accept the declaration');
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      nextStep();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.fullName || !formData.mobileNumber || !formData.email) {
      toast.error('Please fill Name, Mobile & Email');
      return;
    }

    if (!formData.accountHolderName || !formData.bankName || !formData.ifscCode || !formData.bankAccountNumber) {
      toast.error('Please fill all bank details');
      return;
    }
    if (!files.bankSlip) {
      toast.error('Please upload Bank Slip');
      return;
    }

    if (!formData.panNumber) {
      toast.error('Please enter PAN Number');
      return;
    }
    if (!formData.aadharNumber) {
      toast.error('Please enter Aadhaar Number');
      return;
    }
    if (!files.panCard) {
      toast.error('Please upload PAN Card');
      return;
    }
    if (!files.aadharFront) {
      toast.error('Please upload Aadhaar Card (Front)');
      return;
    }
    if (!files.aadharBack) {
      toast.error('Please upload Aadhaar Card (Back)');
      return;
    }

    if (!declarationAccepted) {
      toast.error('Please accept the declaration');
      return;
    }

    setSubmitting(true);

    try {
      const regno = sessionStorage.getItem('regno');

      // if (!regno) {
      //   toast.error('Please login again');
      //   setSubmitting(false);
      //   return;
      // }

      const formDataToSend = new FormData();

      formDataToSend.append('RegNo', regno);
      formDataToSend.append('LoginId', formData.loginId || '');
      formDataToSend.append('FullName', formData.fullName || '');
      formDataToSend.append('StreetAddress', formData.streetAddress || '');
      formDataToSend.append('City', formData.city || '');
      formDataToSend.append('StateName', formData.state || '');
      formDataToSend.append('PinCode', formData.pincode || '');
      formDataToSend.append('MobileNo', formData.mobileNumber || '');
      formDataToSend.append('EmailId', formData.email || '');
      formDataToSend.append('AccountHolderName', formData.accountHolderName || '');
      formDataToSend.append('AccountNo', formData.bankAccountNumber || '');
      formDataToSend.append('BankName', formData.bankName || '');
      formDataToSend.append('IFSCCode', formData.ifscCode || '');
      formDataToSend.append('InvestmentFund', formData.investmentFund || 0);
      formDataToSend.append('OverallIncome', formData.overallIncome || 0);
      formDataToSend.append('RealInvestmentFund', formData.realInvestmentFund || 0);
      formDataToSend.append('SupportFund', formData.supportFund || 0);
      formDataToSend.append('LeverageFund', formData.leverageFund || 0);
      formDataToSend.append('PanNo', formData.panNumber || '');
      formDataToSend.append('AadhaarNo', formData.aadharNumber || '');
      formDataToSend.append('Description', formData.description || '');
      formDataToSend.append('DeclarationAccepted', declarationAccepted);

      if (files.panCard) formDataToSend.append('PanImage', files.panCard);
      if (files.aadharFront) formDataToSend.append('AadhaarFrontImage', files.aadharFront);
      if (files.aadharBack) formDataToSend.append('AadhaarBackImage', files.aadharBack);
      if (files.bankSlip) formDataToSend.append('BankSlipImage', files.bankSlip);

      const response = await apiClient.post('/User/update-user-kyc-details', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data?.success) {
        toast.success(response.data?.message || 'KYC submitted successfully!');
        setKycStatus('pending');
        setCurrentStep(1);

        // Reset files only
        setFiles({
          panCard: null,
          aadharFront: null,
          aadharBack: null,
          passportPhoto: null,
          bankSlip: null,
          signature: null,
        });
        setFilePreviews({
          panCard: null,
          aadharFront: null,
          aadharBack: null,
          passportPhoto: null,
          bankSlip: null,
          signature: null,
        });
        setDeclarationAccepted(false);

        // 🔥 FORM DATA WAHI RAHEGA - RESET NAHI HOGA

      } else {
        toast.error(response.data?.message || 'KYC submission failed');
      }
    } catch (error) {
      console.error(' KYC submission error:', error);
      toast.error(error.response?.data?.message || 'Error submitting KYC. Please try again.');
    }
  };

  const getStepTitle = (step) => {
    const titles = {
      1: 'Personal',
      2: 'Bank',
      3: 'Documents',
      4: 'Review'
    };
    return titles[step] || 'Step';
  };

  const StepIndicator = () => {
    return (
      <div className="step-indicator">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`step-item ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
            onClick={() => currentStep > step && setCurrentStep(step)}
          >
            <div className="step-number">
              {currentStep > step ? <FaCheckCircle /> : step}
            </div>
            <div className="step-label">{getStepTitle(step)}</div>
            {step < 4 && <div className="step-line"></div>}
          </div>
        ))}
      </div>
    );
  };

  // ==================== STEP 1: PERSONAL INFORMATION ====================
  const renderStep1 = () => {
    return (
      <div className="step-content">
        <div className="kyc-card">
          <div className="kyc-card-header">
            <FaUser className="card-icon" />
            <h3>Personal Information</h3>
          </div>
          <div className="kyc-card-body " >
            <div className="row g-3">
              <div className="col-md-4">
                <label className=" form-label fw-bold small text-uppercase text-muted ">Login ID</label>
                <div className="form-control fw-bold curs">{formData.loginId || 'N/A'}</div>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold small text-uppercase text-muted ">Full Name <span className="text-danger">*</span></label>
                <input clas
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="form-control curs"
                  placeholder="Enter full name"
                  readOnly
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold small text-uppercase text-muted">Date Of Joining</label>
                <div className="form-control fw-bold curs">{formData.dateOfJoining || 'N/A'}</div>
              </div>
            </div>

            <div className="row g-3 mt-1 mt-sm-0 mt-md-0 mt-lg-1">
              <div className="col-md-6">
                <label className="form-label fw-bold small text-uppercase text-muted ">Mobile Number <span className="text-danger">*</span></label>
                <input
                  type="text"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  className="form-control curs"
                  placeholder="Enter mobile number"
                  readOnly
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold small text-uppercase text-muted">Email ID <span className="text-danger">*</span></label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-control curs"
                  placeholder="Enter email"
                  readOnly
                />
              </div>
            </div>

            <div className="row g-3 mt-1">
              <div className="col-12">
                <label className="form-label fw-bold small text-uppercase text-muted">Street Address</label>
                <input
                  type="text"
                  name="streetAddress"
                  value={formData.streetAddress}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter street address"
                />
              </div>
            </div>

            <div className="row g-3 mt-1">
              <div className="col-md-4">
                <label className="form-label fw-bold small text-uppercase text-muted">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter city"
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold small text-uppercase text-muted">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter state"
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold small text-uppercase text-muted">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter pincode"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==================== STEP 2: BANK VERIFICATION DETAILS ====================
  const renderStep2 = () => {
    return (
      <div className="step-content">
        <div className="kyc-card">
          <div className="kyc-card-header">
            <FaUniversity className="card-icon" />
            <h3>Bank Verification Details</h3>
          </div>
          <div className="kyc-card-body">
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label fw-bold small text-uppercase text-muted">BEP 20 Wallet Address</label>
                <input
                  type="text"
                  name="walletAddress"
                  onChange={handleChange}
                  value={formData.walletAddress}
                  className="form-control curs"
                  placeholder="Enter BEP 20 wallet address"
                  readOnly
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold small text-uppercase text-muted">Account Holder Name <span className="text-danger">*</span></label>
                <input
                  type="text"
                  name="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={handleChange}
                  className="form-control curs"
                  placeholder="Enter account holder name"
                  readOnly
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold small text-uppercase text-muted">Account Number <span className="text-danger">*</span></label>
                <input
                  type="text"
                  name="bankAccountNumber"
                  value={formData.bankAccountNumber}
                  onChange={handleChange}
                  className="form-control curs"
                  placeholder="Enter account number"
                  readOnly
                />
              </div>
            </div>

            <div className="row g-3 mt-1">
              <div className="col-md-4">
                <label className="form-label fw-bold small text-uppercase text-muted">Bank Name <span className="text-danger">*</span></label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  className="form-control curs"
                  placeholder="Enter bank name"
                  readOnly
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold small text-uppercase text-muted">IFSC Code <span className="text-danger">*</span></label>
                <input
                  type="text"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleChange}
                  className="form-control curs"
                  placeholder="Enter IFSC code"
                  readOnly
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold small text-uppercase text-muted">Investment Fund</label>
                <input
                  type="text"
                  name="investmentFund"
                  value={formData.investmentFund}
                  onChange={handleChange}
                  className="form-control curs"
                  placeholder="Enter amount in USD"
                  readOnly
                />
              </div>
            </div>

            <div className="row g-3 mt-1">
              <div className="col-md-4">
                <label className="form-label fw-bold small text-uppercase text-muted">Over All Income</label>
                <input
                  type="text"
                  name="overallIncome"
                  value={formData.overallIncome}
                  onChange={handleChange}
                  className="form-control curs"
                  placeholder="Enter overall income"
                  readOnly
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold small text-uppercase text-muted">Real Investment Fund</label>
                <input
                  type="text"
                  name="realInvestmentFund"
                  value={formData.realInvestmentFund}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter amount in USD"
                />
                <small className="text-muted d-block mt-1">Note: Amount ₹90 = 1 USD</small>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold small text-uppercase text-muted">Support Fund (if any)</label>
                <input
                  type="text"
                  name="supportFund"
                  value={formData.supportFund}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter amount in USD"
                />
              </div>
            </div>

            <div className="row g-3 mt-1">
              <div className="col-md-4">
                <label className="form-label fw-bold small text-uppercase text-muted">Leverage Fund (if any)</label>
                <input
                  type="text"
                  name="leverageFund"
                  value={formData.leverageFund}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter amount in USD"
                />
                <small className="text-muted d-block mt-1">Note: Amount ₹90 = 1 USD</small>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold small text-uppercase text-muted">Upload Bank Slip <span className="text-danger">*</span></label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="form-control"
                  onChange={(e) => handleFileChange(e, 'bankSlip')}
                />
                {filePreviews.bankSlip && (
                  <div className="mt-1 d-flex align-items-center gap-2">
                    <img src={filePreviews.bankSlip} alt="Bank Slip" className="img-thumbnail" style={{ maxHeight: '60px' }} />
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => removeFile('bankSlip')}>✕</button>
                  </div>
                )}
                <small className="text-muted">JPG, JPEG, PNG, PDF (Max 10 MB)</small>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold small text-uppercase text-muted">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter description"
                  rows="3"
                />
              </div>
            </div>

            {/* Declaration */}
            <div className="row mt-4">
              <div className="col-12">
                <div className="declaration-box">
                  <p className="declaration-text">
                    I hereby declare that all information provided by me in this KYC and Bank Verification Form is true, complete, and accurate to the best of my knowledge. I confirm that the bank account details submitted by me, including Account Holder Name, Account Number, IFSC Code, Bank Name, and supporting Bank Slip/Cancelled Cheque, belong solely to me and will be used for receiving all commissions, bonuses, incentives, rewards, withdrawals, and other company-related payments. I further confirm that the Investment Fund, Real Investment Fund, Support Fund, and Leverage Fund information displayed in my account is correct as per my knowledge and records. I understand that submission of false, misleading, forged, manipulated, or unauthorized information or documents may result in rejection of my KYC application, suspension of withdrawals, withholding of commissions, termination of membership, and legal action as per company policies and applicable laws. I authorize the company to verify my submitted documents, bank details, and identity information through internal verification processes or authorized third-party agencies whenever required. I accept and agree to abide by all company policies, compliance requirements, and KYC verification procedures.
                  </p>

                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="declaration"
                      checked={declarationAccepted}
                      onChange={(e) => setDeclarationAccepted(e.target.checked)}
                    />
                    <label className="form-check-label small text-dark" htmlFor="declaration">
                      I have carefully read, understood and accepted the above declaration. I confirm that all information and documents submitted by me are genuine and belong to me. <span className="text-danger">*</span>
                    </label>
                  </div>

                  <div className="form-check mt-1">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="declarationHindi"
                      checked={declarationAccepted}
                      onChange={(e) => setDeclarationAccepted(e.target.checked)}
                    />
                    <label className="form-check-label small text-dark" htmlFor="declarationHindi">
                      मैंने उपरोक्त घोषणा को ध्यानपूर्वक पढ़ लिया है, समझ लिया है तथा स्वीकार करता/करती हूं। मैं पुष्टि करता/करती हूं कि मेरे द्वारा प्रस्तुत सभी जानकारी एवं दस्तावेज वास्तविक हैं और मेरे ही हैं।
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==================== STEP 3: DOCUMENT VERIFICATION ====================
  const renderStep3 = () => {
    return (
      <div className="step-content">
        <div className="kyc-card">
          <div className="kyc-card-header">
            <FaUploadIcon className="card-icon" />
            <h3>Document Verification</h3>
          </div>
          <div className="kyc-card-body">
            <div className="row g-4">
              <div className="col-md-6">
                <label className="form-label fw-bold small text-uppercase text-muted">PAN Number <span className="text-danger">*</span></label>
                <input
                  type="text"
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter PAN number"
                />

                <label className="form-label fw-bold small text-uppercase text-muted mt-3">Upload PAN Card <span className="text-danger">*</span></label>
                <div className="file-upload-wrapper">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="form-control"
                    onChange={(e) => handleFileChange(e, 'panCard')}
                  />
                  {filePreviews.panCard ? (
                    <div className="mt-1 d-flex align-items-center gap-2">
                      <img src={filePreviews.panCard} alt="PAN Card" className="img-thumbnail" style={{ maxHeight: '60px' }} />
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => removeFile('panCard')}>✕</button>
                    </div>
                  ) : (
                    <div className="file-upload-placeholder">
                      <FaFileUpload className="text-muted" />
                      <p className="mb-0 small">Choose File</p>
                      <span className="text-muted small">No file chosen</span>
                    </div>
                  )}
                </div>
                <small className="text-muted">JPG, JPEG, PNG, PDF (Max 10 MB)</small>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold small text-uppercase text-muted">Aadhaar Number <span className="text-danger">*</span></label>
                <input
                  type="text"
                  name="aadharNumber"
                  value={formData.aadharNumber}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter Aadhaar number"
                />

                <label className="form-label fw-bold small text-uppercase text-muted mt-3">Upload Aadhaar Front <span className="text-danger">*</span></label>
                <div className="file-upload-wrapper">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="form-control"
                    onChange={(e) => handleFileChange(e, 'aadharFront')}
                  />
                  {filePreviews.aadharFront ? (
                    <div className="mt-1 d-flex align-items-center gap-2">
                      <img src={filePreviews.aadharFront} alt="Aadhaar Front" className="img-thumbnail" style={{ maxHeight: '60px' }} />
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => removeFile('aadharFront')}>✕</button>
                    </div>
                  ) : (
                    <div className="file-upload-placeholder">
                      <FaFileUpload className="text-muted" />
                      <p className="mb-0 small">Choose File</p>
                      <span className="text-muted small">No file chosen</span>
                    </div>
                  )}
                </div>

                <label className="form-label fw-bold small text-uppercase text-muted mt-3">Upload Aadhaar Back <span className="text-danger">*</span></label>
                <div className="file-upload-wrapper">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="form-control"
                    onChange={(e) => handleFileChange(e, 'aadharBack')}
                  />
                  {filePreviews.aadharBack ? (
                    <div className="mt-1 d-flex align-items-center gap-2">
                      <img src={filePreviews.aadharBack} alt="Aadhaar Back" className="img-thumbnail" style={{ maxHeight: '60px' }} />
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => removeFile('aadharBack')}>✕</button>
                    </div>
                  ) : (
                    <div className="file-upload-placeholder">
                      <FaFileUpload className="text-muted" />
                      <p className="mb-0 small">Choose File</p>
                      <span className="text-muted small">No file chosen</span>
                    </div>
                  )}
                </div>
                <small className="text-muted">JPG, JPEG, PNG, PDF (Max 10 MB)</small>
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-12">
                <div className="important-note">
                  <FaInfoCircle className="text-warning" />
                  <strong>Important:</strong> Please upload clear and readable document images. Blurred, edited or invalid documents may cause KYC rejection.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==================== STEP 4: REVIEW ====================
  const renderStep4 = () => {
    return (
      <div className="step-content">
        <div className="kyc-card">
          <div className="kyc-card-header">
            <FaCheckCircle className="card-icon" />
            <h3>Review & Declaration</h3>
          </div>
          <div className="kyc-card-body">
            <div className="row">
              <div className="col-12">
                <div className="declaration-box">
                  <p className="declaration-text">
                    I hereby declare that all information provided by me in this KYC and Bank Verification Form is true, complete, and accurate to the best of my knowledge. I confirm that the bank account details submitted by me, including Account Holder Name, Account Number, IFSC Code, Bank Name, and supporting Bank Slip/Cancelled Cheque, belong solely to me and will be used for receiving all commissions, bonuses, incentives, rewards, withdrawals, and other company-related payments. I further confirm that the Investment Fund, Real Investment Fund, Support Fund, and Leverage Fund information displayed in my account is correct as per my knowledge and records. I understand that submission of false, misleading, forged, manipulated, or unauthorized information or documents may result in rejection of my KYC application, suspension of withdrawals, withholding of commissions, termination of membership, and legal action as per company policies and applicable laws. I authorize the company to verify my submitted documents, bank details, and identity information through internal verification processes or authorized third-party agencies whenever required. I accept and agree to abide by all company policies, compliance requirements, and KYC verification procedures.
                  </p>

                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="declarationReview"
                      checked={declarationAccepted}
                      onChange={(e) => setDeclarationAccepted(e.target.checked)}
                    />
                    <label className="form-check-label small text-dark" htmlFor="declarationReview">
                      I have carefully read, understood and accepted the above declaration. I confirm that all information and documents submitted by me are genuine and belong to me. <span className="text-danger">*</span>
                    </label>
                  </div>

                  <div className="form-check mt-1">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="declarationHindiReview"
                      checked={declarationAccepted}
                      onChange={(e) => setDeclarationAccepted(e.target.checked)}
                    />
                    <label className="form-check-label small text-dark" htmlFor="declarationHindiReview">
                      मैंने उपरोक्त घोषणा को ध्यानपूर्वक पढ़ लिया है, समझ लिया है तथा स्वीकार करता/करती हूं। मैं पुष्टि करता/करती हूं कि मेरे द्वारा प्रस्तुत सभी जानकारी एवं दस्तावेज वास्तविक हैं और मेरे ही हैं।
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return null;
    }
  };

  const getKycStatusBadge = () => {
    switch (kycStatus) {
      case 'approved':
        return <span className="kyc-status-badge approved"><FaCheckCircle /> Verified</span>;
      case 'rejected':
        return <span className="kyc-status-badge rejected"><FaTimesCircle /> Rejected</span>;
      case 'pending':
        return <span className="kyc-status-badge pending"><FaClock /> Pending</span>;
      default:
        return <span className="kyc-status-badge not-submitted"><FaInfoCircle /> Not Submitted</span>;
    }
  };

  if (loading) {
    return (
      <div className="kyc-loading">
        <div className="loader"></div>
        <p>Loading KYC details...</p>
      </div>
    );
  }

  return (
    <div className="downline-main-wrapper kyc-page-wrapper mb-5">
      <div className='header-kyc'>
        <img src={logo} alt='logo' className='dashboard-logo01' />
        <div className="kyc-header01">
          KYC Verification
        </div>
      </div>

      <StepIndicator />

      <form onSubmit={handleSubmit} className="kyc-form-container">
        {renderStepContent()}

        <div className="step-navigation">
          {currentStep > 1 && (
            <button type="button" className="btn-prev" onClick={prevStep}>
              <FaArrowLeft /> Previous
            </button>
          )}

          {currentStep < 4 ? (
            <button type="button" className="btn-next" onClick={handleNext}>
              Next <FaArrowRight />
            </button>
          ) : (
            <button
              type="submit"
              className="btn-submit"
              disabled={submitting || kycStatus === 'approved'}
            >
              {submitting ? (
                <>
                  <FaSpinner className="spinner" />
                  Submitting...
                </>
              ) : kycStatus === 'approved' ? (
                <>
                  <FaCheckDouble />
                  KYC Verified
                </>
              ) : (
                <>
                  <FaSave />
                  Submit KYC
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default UpdateKyc; 