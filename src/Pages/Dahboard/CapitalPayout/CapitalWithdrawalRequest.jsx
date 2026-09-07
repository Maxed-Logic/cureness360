import React, { useState, useEffect } from 'react';
import { FiCopy} from 'react-icons/fi';
import CustomTable from '../CustomTable/CustomTable';
import Pagination from '../../../components/ui/Pagination';
import { useUser } from '../../../context/UserContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiClient from '../../../api/apiClient';
import CapAgreeModel from './CapAgreeModel';
import './CapitalPayout.css';

const CapitalWithdrawalRequest = () => {
    const [selectedMethod, setSelectedMethod] = useState('');
    const [otp, setOtp] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);
    const { userData } = useUser();
    
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSendingOTP, setIsSendingOTP] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);

    const [showCapAgreeModel, setShowCapAgreeModel] = useState(true);

    const [walletAddress, setWalletAddress] = useState('');
    const [accountNumber, setAccountNumber] = useState('');


    const investmentBalance = userData?.Invest;
    const incomeBalance = (userData?.Working || 0) + (userData?.Smart_Wallet || 0);

    let withdrawalBalance = 0;
    if (investmentBalance <= incomeBalance) {
        withdrawalBalance = 0;
    } else {
        withdrawalBalance = investmentBalance - incomeBalance;
    }

    // 🔥 Body scroll ko freeze/unfreeze karo
    useEffect(() => {
        if (showCapAgreeModel) {
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        } else {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        };
    }, [showCapAgreeModel]);

    const fetchTransactionData = async () => {
        setLoading(true);
        try {
            const regno = userData?.regno;
            const response = await apiClient.get(`/IncomePayout/capital-payout-history/${regno}`);

            if (response.data && response.data.success) {
                const apiData = response.data.response?.data || [];
                
                const mappedData = apiData.map((item) => ({
                    id: item.ACID || item.payid || Math.random(),
                    debit: item.debit || 0,
                    credit: item.credit || 0,
                    date: item.TransDate ? new Date(item.TransDate).toLocaleDateString('en-GB') : '-',
                    type: item.transType || 'Withdrawal',
                    remark: item.Remark || 'Capital withdrawal request',
                    status: item.Status || 'Pending',
                    payMode: item.payMode,
                    trAmount: item.trAmount,
                    netPayable: item.netPayable,
                    othercharge: item.othercharge,
                    AccountNo: item.AccountNo,
                    trStatus: item.trStatus,
                    TransDate: item.TransDate
                }));

                setTableData(mappedData);
                setTotalRecords(mappedData.length);
            } else {
                setTableData([]);
                setTotalRecords(0);
                toast.info('No withdrawal history found');
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error('Failed to load transaction history');
            setTableData([]);
            setTotalRecords(0);
        } finally {
            setLoading(false);
        }
    };

    const loadBankDetailsFromSession = () => {
        try {
            const savedData = sessionStorage.getItem("bankDetails");
            if (savedData) {
                const bankDetails = JSON.parse(savedData);
                if (bankDetails.wallwtaddresh) {
                    setWalletAddress(bankDetails.wallwtaddresh);
                }
                if (bankDetails.accountNumber) {
                    setAccountNumber(bankDetails.accountNumber);
                }
                return bankDetails;
            } else {
                console.warn("No bank details found in sessionStorage");
                return null;
            }
        } catch (error) {
            console.error("Error loading bank details from session:", error);
            return null;
        }
    };

    useEffect(() => {
        loadBankDetailsFromSession();
    }, []);

    const handleOTPAction = async () => {
        if (!otpSent) {
            if (!selectedMethod) {
                toast.warning('Please select a payment mode first');
                return;
            }

            if (withdrawalBalance <= 0) {
                toast.warning('No withdrawal balance available');
                return;
            }

            setIsSendingOTP(true);

            try {
                const loginid = userData?.me;
                const regno = userData?.regno;

                const response = await apiClient.post(
                    '/User/genrate-otp',
                    null,
                    {
                        params: {
                            loginid: loginid,
                            regno: regno
                        }
                    }
                );

                if (response.data && response.data.success) {
                    toast.success(` ${response.data.message || 'OTP sent successfully!'}`);
                    setOtpSent(true);
                    setOtpVerified(false);
                } else {
                    toast.error(response.data.message || 'Failed to send OTP');
                }
            } catch (error) {
                console.error('OTP Error:', error);
                
                if (error.response) {
                    const data = error.response.data;
                    toast.error(data.message || 'Failed to send OTP. Please try again.');
                } else {
                    toast.error('Please check your connection.');
                }
            } finally {
                setIsSendingOTP(false);
            }
        } else {
            if (!otp || otp.length < 4) {
                toast.warning('Please enter the OTP sent to your email/phone');
                return;
            }

            setIsSendingOTP(true);

            try {
                const loginid = userData?.me;
                const regno = userData?.regno;

                const response = await apiClient.post(
                    '/User/verify-otp',
                    null,
                    {
                        params: {
                            loginid: loginid,
                            regno: regno,
                            otp: otp
                        }
                    }
                );

                if (response.data && response.data.success) {
                    toast.success(' OTP verified successfully!');
                    setOtpVerified(true);
                    setOtpSent(false);
                    
                    console.log("Opening CapAgreeModel...");
                    setShowCapAgreeModel(true);
                    
                } else {
                    toast.error(response.data.message || 'Invalid OTP. Please try again.');
                    setOtpVerified(false);
                }
            } catch (error) {
                console.error('OTP Verification Error:', error);
                
                if (error.response) {
                    const data = error.response.data;
                    toast.error(data.message || 'OTP verification failed. Please try again.');
                } else {
                    toast.error('Please check your connection.');
                }
                setOtpVerified(false);
            } finally {
                setIsSendingOTP(false);
            }
        }
    };

    const handleWithdrawAll = async () => {
        if (!selectedMethod) {
            toast.warning('Please select a payment mode');
            return;
        }

        if (withdrawalBalance <= 0) {
            toast.warning('No withdrawal balance available');
            return;
        }

        if (!otpVerified) {
            toast.warning('Please verify OTP first');
            return;
        }

        if (!agreeTerms) {
            toast.warning('Please agree to terms and conditions');
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                regno: userData?.RegNo || 1,
                amount: parseFloat(withdrawalBalance),
                wallet_address: selectedMethod === 'USDT' ? walletAddress : (accountNumber),
                pay_mode: selectedMethod.toLowerCase(),
                rid: 0
            };

            const response = await apiClient.post(
                '/IncomePayout/capital-payout-withdrawal',
                payload
            );

            if (response.data && response.data.success) {
                toast.success(` Full withdrawal of $${withdrawalBalance.toFixed(2)} submitted successfully!`);
                setOtp('');
                setSelectedMethod('');
                setAgreeTerms(false);
                setOtpVerified(false);
                setOtpSent(false);
                await fetchTransactionData();
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                toast.error(response.data.message || 'Failed to submit withdrawal request');
            }
        } catch (error) {
            console.error('Withdrawal API Error:', error);
            
            if (error.response) {
                const status = error.response.status;
                const data = error.response.data;
                
                if (status === 422) {
                    toast.error(data.message || 'Cannot process withdrawal due to validation error');
                } else if (status === 401) {
                    toast.error('Session expired. Please login again.');
                } else if (status === 400) {
                    toast.error(data.message || 'Bad request. Please check your details.');
                } else {
                    toast.error(data.message || 'Something went wrong. Please try again.');
                }
            } else if (error.request) {
                toast.error('📡 No response from server. Please check your connection.');
            } else {
                toast.error('Error submitting request. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setOtp('');
        setSelectedMethod('');
        setAgreeTerms(false);
        setOtpVerified(false);
        setOtpSent(false);
        toast.info('Form has been reset');
    };

    useEffect(() => {
        if (userData?.RegNo) {
            fetchTransactionData();
        }
    }, [userData]);

    const filteredRecords = tableData.filter((row) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (row.type && row.type.toLowerCase().includes(searchLower)) ||
            (row.remark && row.remark.toLowerCase().includes(searchLower)) ||
            (row.date && row.date.toLowerCase().includes(searchLower)) ||
            (row.status && row.status.toLowerCase().includes(searchLower)) ||
            (row.payMode && row.payMode.toLowerCase().includes(searchLower))
        );
    });

    const totalItems = filteredRecords.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (pageIndex - 1) * pageSize;
    const currentRecords = filteredRecords.slice(startIndex, startIndex + pageSize);

    useEffect(() => {
        setPageIndex(1);
    }, [searchTerm]);

    const columns = ['S.I.No.', 'Debit', 'Date', 'Type', 'Remark', 'Status'];

    const getStatusColor = (status) => {
        const colors = {
            'Pending': '#f59e0b',
            'Approved': '#10b981',
            'Completed': '#10b981',
            'Failed': '#ef4444',
            'Rejected': '#ef4444',
            'Cancelled': '#6b7280'
        };
        return colors[status] || '#6b7280';
    };

    return (
        <div className="capital-payout-page mb-5" style={{ 
            padding: '20px', 
            maxWidth: '1400px', 
            margin: '0 auto',
            fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
            position: 'relative'
        }}>
            <ToastContainer
                position="top-right"
                autoClose={4000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />

            {/* CapAgreeModel Modal - Background freeze ke sath */}
            {showCapAgreeModel && (
                <div 
                    className="modal-overlay" 
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 99999,
                        overflow: 'hidden', // 🔥 Important - scroll nahi hoga
                        padding: '20px'
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowCapAgreeModel(false);
                        }
                    }}
                >
                    <div 
                        className="modal-content000" 
                        style={{
                            maxWidth: '900px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflow: 'auto',
                            position: 'relative',
                            msOverflowStyle: 'none',
                            scrollbarWidth: 'none'
                        }}
                    >
                        {/* Hide scrollbar for modal content */}
                        <style>
                            {`
                                .modal-content000::-webkit-scrollbar {
                                    display: none;
                                }
                                .modal-content000 {
                                    -ms-overflow-style: none;
                                    scrollbar-width: none;
                                }
                            `}
                        </style>
                        <div style={{ padding: '0 20px 20px 20px' }}>
                            <CapAgreeModel />
                        </div>
                    </div>
                </div>
            )}

            {/* Rest of your component remains same... */}
            <h3 style={{ 
                marginBottom: '20px', 
                fontWeight: 'bold',
                fontSize: '22px',
                color: '#333'
            }}>
                Capital Withdrawal Request
            </h3>

            {/* Balance Cards */}
            <div className="balance-cards" style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '15px',
                marginBottom: '20px'
            }}>
                <div className="balance-card" style={{
                    background: '#f8f9fa',
                    padding: '15px 20px',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                }}>
                    <div style={{ fontSize: '14px', color: '#6c757d' }}>Investment Balance</div>
                    <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#28a745' }}>
                        <span className="currency1" data-value={investmentBalance}>
                            ${investmentBalance?.toFixed(2) || '0.00'}
                        </span>
                    </div>
                </div>
                <div className="balance-card" style={{
                    background: '#f8f9fa',
                    padding: '15px 20px',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                }}>
                    <div style={{ fontSize: '14px', color: '#6c757d' }}>Income Balance</div>
                    <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#17a2b8' }}>
                        <span className="currency1" data-value={incomeBalance}>
                            ${incomeBalance?.toFixed(2) || '0.00'}
                        </span>
                    </div>
                </div>
                <div className="balance-card" style={{
                    background: '#f8f9fa',
                    padding: '15px 20px',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                }}>
                    <div style={{ fontSize: '14px', color: '#6c757d' }}>Withdrawal Balance</div>
                    <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#ffc107' }}>
                        <span className="currency1" data-value={withdrawalBalance}>
                            ${withdrawalBalance?.toFixed(2) || '0.00'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Row - 2 Columns */}
            <div className="main-row" style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '25px',
                marginBottom: '20px'
            }}>
                {/* Left Column - Form */}
                <div className="left-column">
                    <div className="capital-form" style={{
                        background: 'white',
                        padding: '20px',
                        borderRadius: '12px',
                        border: '1px solid #e9ecef'
                    }}>
                        <div className="withdrawal-display" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px 15px',
                            background: '#f0f4ff',
                            borderRadius: '8px',
                            marginBottom: '20px'
                        }}>
                            <span style={{ fontWeight: 'bold', fontSize: '15px', color: '#333' }}>Withdrawal Balance</span>
                            <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#667eea' }}>
                                <span className="currency1" data-value={withdrawalBalance}>
                                    ${withdrawalBalance?.toFixed(2) || '0.00'}
                                </span>
                            </span>
                        </div>

                        {/* Payment Mode */}
                        <div className="payment-mode" style={{ marginBottom: '15px' }}>
                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', fontSize: '14px', color: '#333' }}>
                                Select Payment Mode
                            </label>
                            <select
                                value={selectedMethod}
                                onChange={(e) => {
                                    setSelectedMethod(e.target.value);
                                    setOtpVerified(false);
                                    setOtpSent(false);
                                    setOtp('');
                                }}
                                style={{
                                    width: '100%',
                                    padding: '10px 15px',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    fontSize: '14px',
                                    background: '#f8f9fa'
                                }}
                            >
                                <option value="">-- Select Mode --</option>
                                <option value="INR">INR</option>
                                <option value="USDT">USDT</option>
                            </select>
                        </div>

                        {/* Show actual wallet details from session */}
                        {selectedMethod === 'INR' && accountNumber && (
                            <div className="method-details" style={{
                                padding: '10px 15px',
                                background: '#f8f9fa',
                                borderRadius: '8px',
                                marginBottom: '15px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                border: '1px solid #e9ecef'
                            }}>
                                <span style={{ fontSize: '13px', color: '#555' }}>
                                    Account: {accountNumber}
                                </span>
                                <FiCopy 
                                    onClick={() => {
                                        navigator.clipboard.writeText(accountNumber);
                                        toast.success('Account number copied!');
                                    }}
                                    style={{ cursor: 'pointer', color: '#667eea' }} 
                                />
                            </div>
                        )}

                        {selectedMethod === 'USDT' && walletAddress && (
                            <div className="method-details" style={{
                                padding: '10px 15px',
                                background: '#f8f9fa',
                                borderRadius: '8px',
                                marginBottom: '15px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                border: '1px solid #e9ecef'
                            }}>
                                <span style={{ fontSize: '13px', color: '#555' }}>
                                    Wallet: {walletAddress}
                                </span>
                                <FiCopy 
                                    onClick={() => {
                                        navigator.clipboard.writeText(walletAddress);
                                        toast.success('Wallet address copied!');
                                    }}
                                    style={{ cursor: 'pointer', color: '#667eea' }} 
                                />
                            </div>
                        )}

                        {/* OTP Section */}
                        <div className="otp-section">
                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', fontSize: '14px', color: '#333' }}>
                                Enter OTP
                            </label>
                            <div style={{
                                display: 'flex',
                                gap: '10px',
                                alignItems: 'center'
                            }}>
                                <input
                                    type="text"
                                    className="otp-input"
                                    placeholder={otpSent ? "Enter OTP" : "Enter OTP"}
                                    value={otp}
                                    onChange={(e) => {
                                        setOtp(e.target.value);
                                        if (otpVerified) setOtpVerified(false);
                                    }}
                                    disabled={!otpSent}
                                    style={{
                                        flex: 1,
                                        padding: '10px 15px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        fontSize: '15px',
                                        background: otpSent ? 'white' : '#f8f9fa',
                                        cursor: otpSent ? 'text' : 'not-allowed'
                                    }}
                                />
                                <button
                                    onClick={handleOTPAction}
                                    disabled={isSendingOTP || withdrawalBalance <= 0}
                                    style={{
                                        padding: '10px 25px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: (isSendingOTP || withdrawalBalance <= 0) ? '#6c757d' : 
                                                   (otpSent ? '#28a745' : '#667eea'),
                                        color: 'white',
                                        fontWeight: 'bold',
                                        cursor: (isSendingOTP || withdrawalBalance <= 0) ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontSize: '14px',
                                        whiteSpace: 'nowrap',
                                        minWidth: '120px',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {isSendingOTP ? (
                                        'PROCESSING...'
                                    ) : otpSent ? (
                                        ' VERIFY OTP'
                                    ) : (
                                        ' SEND OTP'
                                    )}
                                </button>
                            </div>
                            {otpSent && !otpVerified && (
                                <div style={{ color: '#ffc107', fontSize: '12px', marginTop: '5px' }}>
                                    OTP sent! Please check your email.
                                </div>
                            )}
                            {otpVerified && (
                                <div style={{ color: '#28a745', fontSize: '13px', marginTop: '5px', fontWeight: 'bold' }}>
                                    OTP Verified Successfully!
                                </div>
                            )}
                        </div>

                        {/* Note */}
                        <div className="note" style={{
                            fontSize: '13px',
                            color: "red"
                        }}>
                            <strong>Note:</strong> Capital Payout Temporarily Suspended
                        </div>

                        {/* Terms */}
                        <div className="terms" style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '10px', 
                            marginBottom: '15px' 
                        }}>
                            <input
                                type="checkbox"
                                id="agreeTerms"
                                checked={agreeTerms}
                                onChange={(e) => setAgreeTerms(e.target.checked)}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <label htmlFor="agreeTerms" style={{ fontSize: '14px', color: '#333', cursor: 'pointer' }}>
                                I agree to the terms and conditions
                            </label>
                        </div>

                        {/* Buttons */}
                        <div className="action-buttons" style={{
                            display: 'flex',
                            gap: '12px'
                        }}>
                            <button
                                onClick={handleWithdrawAll}
                                disabled={isSubmitting || !otpVerified || withdrawalBalance <= 0}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: (isSubmitting || !otpVerified || withdrawalBalance <= 0) ? '#6c757d' : '#28a745',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '16px',
                                    cursor: (isSubmitting || !otpVerified || withdrawalBalance <= 0) ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                {isSubmitting ? 'PROCESSING...' : ' SUBMIT'}
                            </button>
                            <button
                                onClick={handleCancel}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: '#dc3545',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '16px',
                                    cursor: 'pointer'
                                }}
                            >
                                CANCEL
                            </button>
                        </div>
                    </div>

                    <div className="note-bottom" style={{
                        background: '#fff3cd',
                        color: '#ff0000',
                        padding: '10px 15px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        border: '1px solid #ffc107',
                        marginTop: '15px'
                    }}>
                        <strong>Note:</strong> If the investment amount falls below $100, both IB income and level income must stop immediately
                    </div>
                </div>

                {/* Right Column - Notice */}
                <div className="right-column">
                    <div className="notice-to-investors" style={{
                        background: '#f8d7da',
                        color: '#721c24',
                        padding: '20px',
                        borderRadius: '8px',
                        border: '1px solid #f5c6cb',
                        height: '100%'
                    }}>
                        <h5 style={{ 
                            fontWeight: 'bold', 
                            marginBottom: '15px',
                            fontSize: '16px',
                            borderBottom: '1px solid #f5c6cb',
                            paddingBottom: '10px'
                        }}>
                            Notice to Investors
                        </h5>
                        <p style={{ marginBottom: '10px', fontSize: '14px' }}>
                            <strong>Dear Investor,</strong>
                        </p>
                        <p style={{ marginBottom: '10px', fontSize: '14px', lineHeight: '1.6', color: "#000" }}>
                            As per the Investment Agreement executed between you and the Company, the investment plan was structured for a fixed tenure, with returns and other benefits intended to be realized upon successful completion of the agreed maturity period.
                        </p>
                        <p style={{ marginBottom: '10px', fontSize: '14px', lineHeight: '1.6', color: "#000" }}>
                            Requests for premature termination or withdrawal before the contractual maturity date may materially affect the Company's financial planning, as invested funds may have already been allocated to long-term healthcare projects, infrastructure, operations, and other revenue-generating business activities.
                        </p>
                        <p style={{ marginBottom: '10px', fontSize: '14px', lineHeight: '1.6', color: "#000" }}>
                            Accordingly, where an investor elects to terminate the agreement before maturity, the settlement of the account shall be carried out strictly in accordance with the terms and conditions of the executed Investment Agreement.
                        </p>

                        <div style={{padding: "15px", background: "#f9c79f"}}>
                            <p style={{ marginBottom: '10px', fontSize: '13px', fontWeight: 'bold' }}>
                                Settlement calculation shall take into account:
                            </p>
                            <ul style={{ marginBottom: '10px', marginLeft: "15px", fontSize: '13px', lineHeight: '1.6' }}>
                                <li>The total amount invested by the investor;</li>
                                <li>The total amount already received by the investor from the Company; and</li>
                                <li>Any deductions, adjustments, charges, or other consequences expressly provided under the Investment Agreement and applicable law.</li>
                            </ul>
                        </div>

                        <p style={{ marginBottom: '10px', fontSize: '13px', lineHeight: '1.6', fontStyle: 'italic' }}>
                            The final settlement amount, if any, will be determined after verification of the investor's account and contractual obligations. Such settlement shall not be construed as a waiver of any rights or obligations of either party under the Investment Agreement or applicable law.
                        </p>
                        <hr style={{ margin: '10px 0' }} />
                        <p style={{ marginBottom: '0', fontSize: '12px', fontWeight: 'bold' }}>
                            <strong>Important:</strong> This notice should be read together with the executed Investment Agreement, which shall prevail in the event of any inconsistency.
                        </p>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="table-section" style={{
                background: 'white',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #e9ecef',
                marginTop: '10px'
            }}>
                <div className="entries-search-bar entries-control" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '15px',
                    flexWrap: 'wrap',
                    gap: '10px'
                }}>
                    <div className="entries-control" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <label style={{ fontSize: '14px', color: '#4a5568' }}>Show entries:</label>
                        <select 
                            className="form-select" 
                            value={pageSize} 
                            onChange={e => {
                                setPageSize(Number(e.target.value));
                                setPageIndex(1);
                            }}
                            style={{
                                padding: '6px 32px 6px 12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                minWidth: '70px'
                            }}
                        >
                            {[10, 25, 50, 75, 100].map(n => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                    </div>
                    <div className="search-wrapper" style={{ position: 'relative' }}>
                        <input
                            className="form-control search-input"
                            placeholder="Search records..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{
                                padding: '8px 38px 8px 14px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                width: '260px'
                            }}
                        />
                    </div>
                </div>

                <CustomTable columns={columns} loading={loading} emptyMessage="No withdrawal history found">
                    {currentRecords.length > 0 ? (
                        currentRecords.map((item, index) => {
                            return (
                                <tr key={item.id || index}>
                                    <td style={{ 
                                        padding: '10px 12px', 
                                        textAlign: 'center', 
                                        border: '1px solid #e9ecef',
                                        fontSize: '13px'
                                    }}>
                                        {startIndex + index + 1}
                                    </td>
                                    <td style={{ 
                                        padding: '10px 12px', 
                                        textAlign: 'center', 
                                        border: '1px solid #e9ecef',
                                        fontSize: '13px',
                                        fontWeight: 'bold',
                                        color: '#dc3545'
                                    }}>
                                        <span className="currency1" data-value={item.debit}>
                                            ${item.debit?.toFixed(2) || '0.00'}
                                        </span>
                                    </td>
                                    <td style={{ 
                                        padding: '10px 12px', 
                                        textAlign: 'center', 
                                        border: '1px solid #e9ecef',
                                        fontSize: '13px'
                                    }}>
                                        {item.date}
                                    </td>
                                    <td style={{ 
                                        padding: '10px 12px', 
                                        textAlign: 'center', 
                                        border: '1px solid #e9ecef',
                                        fontSize: '13px'
                                    }}>
                                        {item.type}
                                    </td>
                                    <td style={{ 
                                        padding: '10px 12px', 
                                        textAlign: 'center', 
                                        border: '1px solid #e9ecef',
                                        fontSize: '13px'
                                    }}>
                                        {item.remark}
                                    </td>
                                    <td style={{ 
                                        padding: '10px 12px', 
                                        textAlign: 'center', 
                                        border: '1px solid #e9ecef',
                                        fontSize: '13px'
                                    }}>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            background: getStatusColor(item.status),
                                            color: 'white',
                                            fontSize: '12px',
                                            fontWeight: '500',
                                            display: 'inline-block'
                                        }}>
                                            {item.status}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={columns.length} style={{
                                padding: '30px',
                                textAlign: 'center',
                                color: '#6c757d',
                                border: '1px solid #e9ecef',
                                fontSize: '14px'
                            }}>
                                {loading ? "Loading..." : "No withdrawal history found"}
                            </td>
                        </tr>
                    )}
                </CustomTable>

                {totalPages > 1 && (
                    <Pagination
                        pageIndex={pageIndex}
                        totalPages={totalPages}
                        onPageChange={setPageIndex}
                        siblingCount={1}
                        showFirstLast={true}
                    />
                )}
            </div>
        </div>
    );
};

export default CapitalWithdrawalRequest;