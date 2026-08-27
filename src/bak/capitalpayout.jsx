import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { IoSend } from 'react-icons/io5';
import { FaCreditCard, FaRegCopy } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useUser } from '../../../context/UserContext';
import apiClient from '../../../api/apiClient';
import CustomTable from '../CustomTable/CustomTable';
import './CapitalPayout.css';

// Currency Configuration
const currencyRates = {
    USD: 1,
    INR: 90,
    EUR: 0.92,
    GBP: 0.78
};

const currencySymbols = {
    USD: "$",
    INR: "₹",
    EUR: "€",
    GBP: "£"
};

const CapitalWithdrawalRequest = () => {
    const [searchParams] = useSearchParams();
    const rid = searchParams.get('Capital');

    const { userData, loading: userLoading, refreshData } = useUser();

    // Currency State
    const [selectedCurrency, setSelectedCurrency] = useState(() => {
        return sessionStorage.getItem("selectedCurrency") || "USD";
    });

    // Helper to get loginid
    const getLoginId = () => {
        const storedUserData = sessionStorage.getItem('userData');
        if (storedUserData) {
            try {
                const parsed = JSON.parse(storedUserData);
                if (parsed.loginid) return parsed.loginid;
                if (parsed.me) return parsed.me;
            } catch (e) { }
        }
        const user = JSON.parse(sessionStorage.getItem('user'));
        if (user?.loginid) return user.loginid;
        if (user?.me) return user.me;
        return 'india';
    };
    const loginid = getLoginId();

    // Get regno
    const regno =
        userData?.regno ||
        userData?.Regno ||
        JSON.parse(sessionStorage.getItem('user'))?.Regno ||
        JSON.parse(sessionStorage.getItem('user'))?.regno ||
        sessionStorage.getItem('regno');

    // State
    const [capitalRecord, setCapitalRecord] = useState(null);
    const [loading, setLoading] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [selectedMethod, setSelectedMethod] = useState('BANK CARD');
    const [submitting, setSubmitting] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    const [otpTimer, setOtpTimer] = useState(0);
    const [otpIntervalId, setOtpIntervalId] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successAmount, setSuccessAmount] = useState(0);

    // Saved addresses
    const accountNumber = sessionStorage.getItem('accountNumber') || '';
    const bep20Wallet = sessionStorage.getItem('bep20Wallet') || '';

    // Format currency function
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return `${currencySymbols[selectedCurrency]}0.00`;
        const converted = amount * currencyRates[selectedCurrency];
        return `${currencySymbols[selectedCurrency]}${converted.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    // Update all currency elements
    const changeCurrency = (currency) => {
        sessionStorage.setItem("selectedCurrency", currency);
        document.querySelectorAll(".currency1").forEach(function (el) {
            let amount = parseFloat(el.getAttribute("data-value"));
            if (isNaN(amount)) {
                let text = el.innerText;
                let match = text.match(/(\d+(?:\.\d+)?)/);
                amount = match ? parseFloat(match[1]) : 0;
            }
            if (!isNaN(amount)) {
                let converted = amount * currencyRates[currency];
                el.innerHTML = currencySymbols[currency] + converted.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
            }
        });
    };

    // Listen for currency changes from Header
    useEffect(() => {
        const handleCurrencyChange = () => {
            let newCurrency = sessionStorage.getItem("selectedCurrency") || "USD";
            setSelectedCurrency(newCurrency);
            changeCurrency(newCurrency);
        };
        window.addEventListener('currencyChanged', handleCurrencyChange);
        return () => window.removeEventListener('currencyChanged', handleCurrencyChange);
    }, []);

    // Initialize currency on mount
    useEffect(() => {
        let savedCurrency = sessionStorage.getItem("selectedCurrency") || "USD";
        setSelectedCurrency(savedCurrency);
        setTimeout(() => changeCurrency(savedCurrency), 100);
    }, []);

    // Check if withdraw button should be disabled
    const isWithdrawDisabled = () => {
        const amountNum = parseFloat(withdrawAmount);
        return (
            submitting ||
            verifyingOtp ||
            !otpSent ||
            capitalRecord?.remainingCapital <= 0 ||
            !withdrawAmount ||
            isNaN(amountNum) ||
            amountNum <= 0 ||
            !otp ||
            otp.length !== 6 ||
            (selectedMethod === 'BANK CARD' && !accountNumber) ||
            (selectedMethod === 'USDT TRC20' && !bep20Wallet)
        );
    };

    // Check if OTP button should be disabled
    const isOtpButtonDisabled = () => {
        return otpTimer > 0 || sendingOtp || submitting || verifyingOtp;
    };

    // Cleanup timer
    useEffect(() => {
        return () => {
            if (otpIntervalId) clearInterval(otpIntervalId);
        };
    }, [otpIntervalId]);

    // Fetch capital record
    useEffect(() => {
        if (!regno || !rid) {
            if (!regno && !userLoading) toast.error('User registration number not found');
            if (!rid) toast.error('No capital record specified');
            return;
        }

        const fetchRecord = async () => {
            setLoading(true);
            try {
                const res = await apiClient.get(`/IncomePayout/capital-withdrawal-report/${rid}`);
                if (res.data?.success && res.data?.response?.data?.length > 0) {
                    const item = res.data.response.data[0];
                    setCapitalRecord({
                        id: item.Rid,
                        investmentDate: item.Rdate ? new Date(item.Rdate).toLocaleDateString('en-GB') : '-',
                        amount: item.Rkprice || 0,
                        profit: item.Rpayid || 0,
                        withdrawal: 0,
                        remainingCapital: item.payout || 0,
                        remainingDays: item.Remainingdays ?? '-',
                        withdrawalChargePercent: item.PayoutCharge || 10,
                    });
                } else {
                    toast.error('Capital record not found');
                }
            } catch (err) {
                console.error(err);
                toast.error('Error fetching capital data');
            } finally {
                setLoading(false);
            }
        };
        fetchRecord();
    }, [regno, rid, userLoading]);

    // Send OTP
    const sendOtp = async () => {
        if (isOtpButtonDisabled()) return;

        if (!regno) {
            toast.error('Registration number not found. Please login again.');
            return;
        }

        setSendingOtp(true);
        try {
            const response = await apiClient.post(`/User/genrate-otp?loginid=${loginid}&regno=${regno}`, {});

            if (response.data.success || response.data.status === 'success') {
                toast.success(response.data.message || 'OTP sent successfully!');
                setOtpSent(true);
                setOtpTimer(300);

                const interval = setInterval(() => {
                    setOtpTimer((prev) => {
                        if (prev <= 1) {
                            clearInterval(interval);
                            setOtpIntervalId(null);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);

                setOtpIntervalId(interval);
            } else {
                toast.error(response.data.message || 'Failed to send OTP');
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Error sending OTP');
        } finally {
            setSendingOtp(false);
        }
    };

    // Verify OTP and withdraw
    const verifyOtpAndWithdraw = async () => {
        const amountNum = parseFloat(withdrawAmount);

        if (!withdrawAmount || isNaN(amountNum) || amountNum <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }
        if (!capitalRecord || amountNum > capitalRecord.remainingCapital) {
            toast.error(`Amount cannot exceed available balance ${formatCurrency(capitalRecord?.remainingCapital)}`);
            return;
        }
        if (!otp || otp.length !== 6) {
            toast.error('Please enter a valid 6-digit OTP');
            return;
        }

        let wallet_address = '';
        let pay_mode = '';
        if (selectedMethod === 'BANK CARD') {
            if (!accountNumber) {
                toast.error('No bank card added. Please add a card first.');
                return;
            }
            wallet_address = accountNumber;
            pay_mode = 'inr';
        } else if (selectedMethod === 'USDT TRC20') {
            if (!bep20Wallet) {
                toast.error('No USDT TRC20 address added. Please add an address first.');
                return;
            }
            wallet_address = bep20Wallet;
            pay_mode = 'usdt';
        } else {
            toast.error('Invalid payment method');
            return;
        }

        setVerifyingOtp(true);
        try {
            const verifyRes = await apiClient.post('/User/verify-otp', null, {
                params: {
                    loginid: loginid,
                    regno: regno,
                    otp: String(otp)
                }
            });

            if (!verifyRes.data?.success) {
                toast.error(verifyRes.data?.message || 'Invalid OTP');
                setVerifyingOtp(false);
                return;
            }

            setSubmitting(true);
            const payload = {
                regno: parseInt(regno),
                amount: amountNum,
                wallet_address: wallet_address,
                pay_mode: pay_mode,
                rid: parseInt(rid),
            };
            const withdrawalRes = await apiClient.post('/IncomePayout/capital-payout-withdrawal', payload);

            const responseMessage = withdrawalRes.data?.message;

            if (withdrawalRes.data?.success) {
                toast.success(responseMessage || `Withdrawal request of ${formatCurrency(amountNum)} submitted successfully!`);

                setSuccessAmount(amountNum);
                setShowSuccessModal(true);
                setTimeout(() => setShowSuccessModal(false), 3000);

                setCapitalRecord(prev => ({ ...prev, remainingCapital: prev.remainingCapital - amountNum }));
                setWithdrawAmount('');
                setOtp('');
                setOtpSent(false);
                setOtpTimer(0);
                if (otpIntervalId) clearInterval(otpIntervalId);
                setOtpIntervalId(null);

                await refreshData();

            } else {
                toast.error(responseMessage || 'Withdrawal failed. Please try again.');
            }
        } catch (err) {
            console.error('Withdrawal error:', err.response?.data || err);
            const errorMsg = err.response?.data?.message || err.message || 'Server error. Please try again later.';
            toast.error(errorMsg);
        } finally {
            setVerifyingOtp(false);
            setSubmitting(false);
        }
    };

    const quickAmounts = [100, 300, 500, 1000, 5000, 10000];
    const validQuickAmounts = capitalRecord
        ? quickAmounts.filter(amt => amt <= capitalRecord.remainingCapital)
        : [];

    const columns = [
        'Investment Date',
        'Invested Amount',
        'Profit',
        'Withdrawal',
        'Withdrawal Charge %',
        'Remaining Days'
    ];

    const tableRow = capitalRecord && (
        <tr>
            <td className="text-center">{capitalRecord.investmentDate}</td>
            <td className="text-center amount-cell">
                <span className="currency1" data-value={capitalRecord.amount}>
                    {formatCurrency(capitalRecord.amount)}
                </span>
            </td>
            <td className="text-center profit-cell">
                <span className="currency1" data-value={capitalRecord.profit}>
                    {formatCurrency(capitalRecord.profit)}
                </span>
            </td>
            <td className="text-center">
                <span className="currency1" data-value={capitalRecord.withdrawal}>
                    {formatCurrency(capitalRecord.withdrawal)}
                </span>
            </td>
            <td className="text-center">{capitalRecord.withdrawalChargePercent}%</td>
            <td className="text-center">{capitalRecord.remainingDays}</td>
        </tr>
    );

    if (loading) {
        return (
            <div className="ww-page p-4">
                <CustomTable columns={columns} loading={true} loaderText="Loading capital details..." />
            </div>
        );
    }

    if (!capitalRecord) {
        return (
            <div className="ww-page p-4 text-center">
                <p className="text-danger">No capital record found or invalid request.</p>
            </div>
        );
    }

    return (
        <div className="downline-main-wrapper ww-page p-4 mb-5">
            <div className="ww-modal">
                <div className="ww-header modal-header">
                    <h4>Capital Withdrawal Request</h4>
                </div>

                <div className="ww-body">
                    <CustomTable columns={columns} loading={false}>
                        {tableRow}
                    </CustomTable>

                    <div className='ww-modal-contant'>
                        <div className="ww-content meddle01">
                            <div className="ww-balance balance-info mt-3">
                                <span>Available balance (Remaining Capital)</span>
                                <strong>
                                    <span className="currency1" data-value={capitalRecord.remainingCapital}>
                                        {formatCurrency(capitalRecord.remainingCapital)}
                                    </span>
                                </strong>
                            </div>

                            {/* Payment Methods */}
                            <div className="ww-methods methods-grid mt-3">
                                <div
                                    className={`method-chip ${selectedMethod === 'BANK CARD' ? 'active' : ''}`}
                                    onClick={() => !submitting && !verifyingOtp && setSelectedMethod('BANK CARD')}
                                    style={{ cursor: submitting || verifyingOtp ? 'not-allowed' : 'pointer', opacity: submitting || verifyingOtp ? 0.6 : 1 }}
                                >
                                    <FaCreditCard />
                                    <span>BANK CARD</span>
                                </div>
                                <div
                                    className={`method-chip ${selectedMethod === 'USDT TRC20' ? 'active' : ''}`}
                                    onClick={() => !submitting && !verifyingOtp && setSelectedMethod('USDT TRC20')}
                                    style={{ cursor: submitting || verifyingOtp ? 'not-allowed' : 'pointer', opacity: submitting || verifyingOtp ? 0.6 : 1 }}
                                >
                                    <span>₿</span>
                                    <span>USDT TRC20</span>
                                </div>
                            </div>

                            {/* Method Details */}
                            {selectedMethod === 'BANK CARD' && (
                                <div className="ww-method-detail method-details">
                                    <div className="bank-card-display d-flex justify-content-between align-items-center">
                                        <div className="card-number">{accountNumber || 'No card added'}</div>
                                        {accountNumber && (
                                            <FaRegCopy
                                                className="copy-icon"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => {
                                                    navigator.clipboard.writeText(accountNumber);
                                                    toast.success('Bank card number copied!');
                                                }}
                                            />
                                        )}
                                    </div>
                                    {!accountNumber && (
                                        <small className="text-danger">⚠️ Please add a bank card first</small>
                                    )}
                                </div>
                            )}

                            {selectedMethod === 'USDT TRC20' && (
                                <div className="ww-method-detail method-details">
                                    <div className="bank-card-display d-flex justify-content-between align-items-center">
                                        <div className="address-value">{bep20Wallet || 'No address added'}</div>
                                        {bep20Wallet && (
                                            <FaRegCopy
                                                className="copy-icon"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => {
                                                    navigator.clipboard.writeText(bep20Wallet);
                                                    toast.success('USDT address copied!');
                                                }}
                                            />
                                        )}
                                    </div>
                                    {!bep20Wallet && (
                                        <small className="text-danger">⚠️ Please add a USDT address first</small>
                                    )}
                                </div>
                            )}

                            {/* Amount Input */}
                            <div className="ww-amount-area amount-area mb-3">
                                <div className="amount-input-wrapper">
                                    <span className="currency-symbol">{currencySymbols[selectedCurrency]}</span>
                                    <input
                                        type="number"
                                        className="amount-input"
                                        placeholder="Enter amount"
                                        value={withdrawAmount}
                                        onChange={(e) => setWithdrawAmount(e.target.value)}
                                        disabled={submitting || verifyingOtp}
                                    />
                                </div>
                            </div>

                            {/* Quick Amount Buttons */}
                            {validQuickAmounts.length > 0 && (
                                <div className="ww-quick-amounts quick-amounts">
                                    {validQuickAmounts.map((amt) => (
                                        <button
                                            key={amt}
                                            className={`quick-amount-btn ${parseFloat(withdrawAmount) === amt ? 'active' : ''}`}
                                            onClick={() => setWithdrawAmount(amt.toString())}
                                            disabled={submitting || verifyingOtp}
                                        >
                                            {formatCurrency(amt)}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* OTP Section */}
                            <div className="ww-otp-wrapper input-container01 mt-3">
                                <span className="currency-symbol1">OTP</span>
                                <span className="divider">|</span>
                                <input
                                    type="text"
                                    className="amount-input"
                                    placeholder="Enter 6-digit OTP"
                                    maxLength="6"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    disabled={submitting || verifyingOtp}
                                />
                                <button
                                    className="clear-btn"
                                    onClick={sendOtp}
                                    disabled={isOtpButtonDisabled()}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: isOtpButtonDisabled() ? 'not-allowed' : 'pointer',
                                        opacity: isOtpButtonDisabled() ? 0.6 : 1
                                    }}
                                    title={otpTimer > 0 ? `Wait ${Math.floor(otpTimer / 60)}:${(otpTimer % 60).toString().padStart(2, '0')}` : "Send OTP"}
                                >
                                    {sendingOtp ? (
                                        <span className="otp-spinner-small"></span>
                                    ) : otpTimer > 0 ? (
                                        `${Math.floor(otpTimer / 60)}:${(otpTimer % 60).toString().padStart(2, '0')}`
                                    ) : (
                                        <IoSend />
                                    )}
                                </button>
                            </div>

                            {otpSent && otpTimer === 0 && (
                                <small className="text-warning">⚠️ OTP expired. Please send again.</small>
                            )}

                            {/* Withdraw Button */}
                            <button
                                className="ww-button modal-button mt-3"
                                onClick={verifyOtpAndWithdraw}
                                disabled={isWithdrawDisabled()}
                                style={{
                                    opacity: isWithdrawDisabled() ? 0.6 : 1,
                                    cursor: isWithdrawDisabled() ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {verifyingOtp ? 'Verifying OTP...' : submitting ? 'Processing...' : 'Withdraw Now'}
                            </button>

                            {/* Validation messages */}
                            {capitalRecord.remainingCapital <= 0 && (
                                <small className="text-danger d-block mt-2">⚠️ No remaining capital available for withdrawal</small>
                            )}
                            {(!accountNumber && selectedMethod === 'BANK CARD') && (
                                <small className="text-danger d-block mt-2">⚠️ Please add a bank card to withdraw</small>
                            )}
                            {(!bep20Wallet && selectedMethod === 'USDT TRC20') && (
                                <small className="text-danger d-block mt-2">⚠️ Please add a USDT address to withdraw</small>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="success-modal-overlay">
                    <div className="success-modal">
                        <div className="checkmark-circle">
                            <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className="success-title">Withdrawal Request Submitted</div>
                        <div className="success-amount currency1" data-value={successAmount}>
                            {formatCurrency(successAmount)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CapitalWithdrawalRequest;