import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'
import { GiProfit } from "react-icons/gi";
import { FaCreditCard, FaMintbit, FaRegCopy } from "react-icons/fa6";
import { MdAddCard } from "react-icons/md";
import toast from "react-hot-toast";
import Stake from "./Stake";
import { useUser } from "../../../context/UserContext";
import apiClient from "../../../api/apiClient"
import '../../../assets/dashboardcss/css/Dashboard.css';
import { IoSend } from 'react-icons/io5';

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

const Cards = () => {
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successAmount, setSuccessAmount] = useState(0);

    // Withdraw modal states
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawOtp, setWithdrawOtp] = useState('');
    const [selectedMethod, setSelectedMethod] = useState('BANK CARD');
    const [otpSent, setOtpSent] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    const [otpTimer, setOtpTimer] = useState(0);
    const [otpIntervalId, setOtpIntervalId] = useState(null);
    const [usdToInrRate, setUsdToInrRate] = useState(null);
    const [fetchingRate, setFetchingRate] = useState(false);
    const [rateError, setRateError] = useState(null);
    const [timeLeft, setTimeLeft] = useState("");
    const [copied, setCopied] = useState(false);

    // Payout input amount state
    const [payoutAmount, setPayoutAmount] = useState('');
    const [minimumWithdraw, setMinimumWithdraw] = useState(0);
    const [payoutApiBalance, setPayoutApiBalance] = useState(0);
    const [payoutLoading, setPayoutLoading] = useState(false);

    // Currency State
    const [selectedCurrency, setSelectedCurrency] = useState(() => {
        return localStorage.getItem("selectedCurrency") || "USD";
    });

    // Context data
    const { userData, stakeData, loading, refreshData } = useUser();

    const baseUrl = "https://mango01.netlify.app/";
    const referralLink = userData?.me
        ? `${baseUrl}signup?ref=${userData.me}`
        : baseUrl;

    // Function to format currency
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return `${currencySymbols[selectedCurrency]}0.00`;
        const converted = amount * currencyRates[selectedCurrency];
        return `${currencySymbols[selectedCurrency]}${converted.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    // Function to update all currency elements
    const changeCurrency = (currency) => {
        localStorage.setItem("selectedCurrency", currency);

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

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Referral link copied!");
    };

    // Helper to get loginid
    const getLoginId = () => {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
            try {
                const parsed = JSON.parse(storedUserData);
                if (parsed.loginid) return parsed.loginid;
                if (parsed.me) return parsed.me;
            } catch (e) { }
        }
        const user = JSON.parse(localStorage.getItem('user'));
        if (user?.loginid) return user.loginid;
        if (user?.me) return user.me;
        return 'india';
    };

    const loginid = getLoginId();
    const regno = userData?.regno || userData?.Regno || localStorage.getItem('regno');

    const [isActivationVisible, setIsActivationVisible] = useState(false);
    const [isCovered, setIsCovered] = useState(false);
    const handleToggle = () => setIsCovered(!isCovered);

    const copyReferral = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("Sponsor ID Copied!");
    };

    // Helper function to clean API message
    const cleanApiMessage = (message, defaultMsg) => {
        if (!message) return defaultMsg;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isEmail = emailRegex.test(message.trim());
        const hasEmail = message.includes('@') && (message.includes('.com') || message.includes('.in') || message.includes('.net'));

        if (isEmail || hasEmail) {
            return defaultMsg;
        }
        return message;
    };

    // Fetch Payout Balance
    const fetchPayoutBalance = async () => {
        if (!regno) return;
        setPayoutLoading(true);
        try {
            const response = await apiClient.get(`/IncomePayout/balance/${regno}`);
            if (response.data?.success === true) {
                const balance = response.data?.response || 0;
                setPayoutApiBalance(balance);
            } else {
                setPayoutApiBalance(0);
            }
        } catch (error) {
            console.error("Error fetching payout balance:", error);
            setPayoutApiBalance(0);
        } finally {
            setPayoutLoading(false);
        }
    };

    // Fetch Minimum Withdraw Limit
    const fetchMinimumWithdrawLimit = async () => {
        try {
            const response = await apiClient.get(`/IncomePayout/minimun-withdraw-limit`);
            if (response.data?.success === true) {
                const minLimit = response.data?.data || 20;
                setMinimumWithdraw(minLimit);
            } else {
                setMinimumWithdraw(20);
            }
        } catch (error) {
            console.error("Error fetching minimum withdraw limit:", error);
            setMinimumWithdraw(20);
        }
    };

    // Fetch live USD/INR rate
    const fetchUsdToInrRate = async () => {
        setFetchingRate(true);
        setRateError(null);
        try {
            let rate = null;
            try {
                const response = await fetch('https://api.budjet.org/fiat/USD/INR');
                const data = await response.json();
                rate = data.conversion_result || data.rate;
            } catch (err) {
                const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
                const data = await response.json();
                rate = data.rates?.INR;
            }

            if (rate && typeof rate === 'number' && rate > 0) {
                setUsdToInrRate(rate);
            } else {
                throw new Error('Invalid rate format');
            }
        } catch (err) {
            console.error('Rate fetch error:', err);
            setRateError('Unable to fetch live conversion rate');
            setUsdToInrRate(84.5);
            toast.error('Using default rate. Live rate unavailable.');
        } finally {
            setFetchingRate(false);
        }
    };

    // Check if withdraw button should be disabled
    const isWithdrawDisabled = () => {
        const amountNum = parseFloat(withdrawAmount);
        return (
            verifyingOtp ||
            !otpSent ||
            !withdrawAmount ||
            isNaN(amountNum) ||
            amountNum <= 0 ||
            amountNum < minimumWithdraw ||
            amountNum > displayBalance ||
            !withdrawOtp ||
            withdrawOtp.length !== 6 ||
            (selectedMethod === 'USDT TRC20' && !usdToInrRate)
        );
    };

    // Check if OTP button should be disabled
    const isOtpButtonDisabled = () => {
        return otpTimer > 0 || sendingOtp || verifyingOtp;
    };

    // Fetch data on mount
    useEffect(() => {
        if (regno) {
            fetchPayoutBalance();
            fetchMinimumWithdrawLimit();
        }
    }, [regno, userData?.Remaining]);

    // Apply currency conversion on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            let savedCurrency = localStorage.getItem("selectedCurrency") || "USD";
            setSelectedCurrency(savedCurrency);
            changeCurrency(savedCurrency);
        }, 100);

        return () => clearTimeout(timer);
    }, [userData]);

    // ✅ Listen for currency changes from Header
    useEffect(() => {
        const handleCurrencyChange = () => {
            let newCurrency = localStorage.getItem("selectedCurrency") || "USD";
            setSelectedCurrency(newCurrency);
            changeCurrency(newCurrency);
        };

        window.addEventListener('currencyChanged', handleCurrencyChange);

        return () => {
            window.removeEventListener('currencyChanged', handleCurrencyChange);
        };
    }, []);

    // Countdown timer effect
    useEffect(() => {
        const DateString = userData?.topupdate;
        if (!DateString) {
            setTimeLeft("No activation date found");
            return;
        }

        const targetDate = new Date(DateString);
        if (isNaN(targetDate.getTime())) {
            setTimeLeft("Invalid date");
            return;
        }

        targetDate.setDate(targetDate.getDate() + 365);
        targetDate.setHours(0, 0, 0, 0);

        const updateCountdown = () => {
            const now = new Date().getTime();
            const targetTime = targetDate.getTime();
            const timeDiff = targetTime - now;

            if (timeDiff <= 0) {
                setTimeLeft("Subscription expired");
                return;
            }

            const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((timeDiff / (1000 * 60)) % 60);
            const seconds = Math.floor((timeDiff / 1000) % 60);

            setTimeLeft(`Remaining Days: ${days}d ${hours}h ${minutes}m ${seconds}s`);
        };

        updateCountdown();
        const timer = setInterval(updateCountdown, 1000);
        return () => clearInterval(timer);
    }, [userData?.topupdate]);

    // Fetch rate when modal opens
    useEffect(() => {
        if (showWithdrawModal) {
            fetchUsdToInrRate();
        }
    }, [showWithdrawModal]);

    // Handle Payout Button Click
    const handlePayoutClick = () => {
        if (payoutAmount && parseFloat(payoutAmount) > 0) {
            setWithdrawAmount(payoutAmount);
        }
        setShowWithdrawModal(true);
    };

    // Send OTP
    const sendOtp = async () => {
        if (isOtpButtonDisabled()) return;

        if (!regno) {
            toast.error('Registration number not found');
            return;
        }

        setSendingOtp(true);
        try {
            const response = await apiClient.post(`/User/genrate-otp?loginid=${loginid}&regno=${regno}`, {});

            if (response.data.success || response.data.status === 'success') {
                const cleanMessage = cleanApiMessage(
                    response.data.message,
                    'OTP sent successfully to your registered email!'
                );

                toast.success(cleanMessage);
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

    // Withdraw function
    const handleWithdraw = async () => {
        const amountNum = parseFloat(withdrawAmount);

        if (!withdrawAmount || isNaN(amountNum) || amountNum <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }
        if (amountNum < minimumWithdraw) {
            toast.error(`Minimum withdrawal amount is $${minimumWithdraw.toFixed(2)}`);
            return;
        }
        if (amountNum > displayBalance) {
            toast.error(`Amount exceeds available balance $${displayBalance.toFixed(2)}`);
            return;
        }
        if (!withdrawOtp || withdrawOtp.length !== 6) {
            toast.error('Please enter a valid 6-digit OTP');
            return;
        }
        if (!otpSent) {
            toast.error('Please request OTP first');
            return;
        }

        let walletAddress = '';
        let payMode = '';
        let liveRate = 0;

        if (selectedMethod === 'BANK CARD') {
            const card = localStorage.getItem('accountNumber');
            if (!card) {
                toast.error('No bank card added. Please add a card first.');
                return;
            }
            walletAddress = card;
            payMode = 'inr';
            liveRate = usdToInrRate || 92.5;
        } else if (selectedMethod === 'USDT TRC20') {
            const address = localStorage.getItem('bep20Wallet');
            if (!address) {
                toast.error('No USDT TRC20 address added. Please add an address first.');
                return;
            }
            walletAddress = address;
            payMode = 'usdt';
            if (!usdToInrRate) {
                toast.error('Live conversion rate not available. Please try again.');
                return;
            }
            liveRate = usdToInrRate;
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
                    otp: String(withdrawOtp)
                }
            });

            if (!verifyRes.data?.success) {
                toast.error(verifyRes.data?.message || 'Invalid OTP');
                setVerifyingOtp(false);
                return;
            }

            const payload = {
                regNo: parseInt(regno),
                amount: amountNum,
                liveRate: liveRate,
                payMode: payMode,
                walletAddress: walletAddress
            };

            const withdrawalRes = await apiClient.post('/IncomePayout/withdraw-request', payload);

            if (withdrawalRes.data?.success) {
                setSuccessAmount(amountNum);
                setShowSuccessModal(true);

                setTimeout(() => {
                    setShowSuccessModal(false);
                }, 3000);

                await refreshData();
                await fetchPayoutBalance();

                setTimeout(() => {
                    setShowWithdrawModal(false);
                    setWithdrawAmount('');
                    setWithdrawOtp('');
                    setPayoutAmount('');
                    setOtpSent(false);
                    setOtpTimer(0);
                    if (otpIntervalId) clearInterval(otpIntervalId);
                    setOtpIntervalId(null);
                }, 500);

            } else {
                toast.error(withdrawalRes.data?.message || 'Withdrawal failed');
            }
        } catch (err) {
            console.error('Withdrawal error:', err.response?.data || err);
            const errorMsg = err.response?.data?.message || err.message || 'Server error. Please try again.';
            toast.error(errorMsg);
        } finally {
            setVerifyingOtp(false);
        }
    };

    // Display balance
    const displayBalance = payoutApiBalance > 0 ? payoutApiBalance : (userData?.Remaining || 0);

    if (loading) return <div>Loading...</div>;

    return (
        <>
            {/* Dropdown removed - Using Header dropdown only */}

            <div className="row p-3">
                {/* 1. User Info Card */}
                <div className="col-lg-5 col-md-9">
                    <div className="card1 no-animate custom-card1 p-0 rounded_5">
                        <div className="card1-body px-3 py-3">
                            <div className="top-box mb-2">
                                <div className='d-flex justify-content-between p-2'>
                                    <label className={`insurance-switch ${isCovered ? 'active' : ''}`}>
                                        <input type="checkbox" checked={isCovered} onChange={handleToggle} hidden />
                                        <div className="switch-slider">
                                            <div className="switch-knob"></div>
                                            <span className="switch-text">Insurance Covered</span>
                                        </div>
                                    </label>
                                    <h6 className='mt-1'>Rank : <span className="cus-badge green-badge">{userData?.rank || 0}</span></h6>
                                </div>
                            </div>

                            <div className="c-box">
                                <div className="d-flex align-items-center justify-content-between w-100">
                                    <p className="mb-0"><strong>Name:</strong>&nbsp; {userData?.name || "N/A"}</p>
                                    <div className="mb-2">
                                        {(() => {
                                            const botAmount = Number(userData?.BotAmount || 0);
                                            const regularAmount = Number(userData?.Invest || userData?.invest || 0);
                                            const isBotActive = botAmount >= 100;
                                            const hasInvest = regularAmount > 0;

                                            if (hasInvest && isBotActive) {
                                                return <span className="status-badge-green">Active 🟢</span>;
                                            } else if (hasInvest || isBotActive) {
                                                return <span className="status-badge">Active 🔵</span>;
                                            } else {
                                                return <span className="status-badge2">Inactive 🔴</span>;
                                            }
                                        })()}
                                    </div>
                                </div>

                                <div className="d-flex justify-content-between align-items-center flex-wrap">
                                    <div>
                                        <div className=''>
                                            <p className="mb-1"><strong>Me :</strong>&nbsp; {userData?.me || "N/A"}</p>
                                            <p className="mb-1">
                                                <strong>
                                                    Sponsor : &nbsp; {userData?.referral || "No Sponsor"}
                                                    <FaRegCopy style={{ cursor: 'pointer', marginLeft: '5px' }} onClick={() => copyReferral(userData?.referral)} />
                                                </strong>
                                            </p>
                                        </div>
                                    </div>
                                    <div className='justify-content-end align-items-center ms_auto'>
                                        <div className='countdown-time w-full'>
                                            {timeLeft && (
                                                <div className="countdown-timer fw-bold " style={{
                                                    fontSize: '14px',
                                                    color: '#ffffff',
                                                    boxShadow: '0 4px 12px rgba(33, 33, 33, 0.2)',
                                                    padding: '12px 15px',
                                                }}>
                                                    {timeLeft}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Stake Card */}
                <div className="col-lg-4 col-md-5">
                    <div className="card1 no-animate custom-card1 p-0 rounded_5">
                        <div className="card1-body px-3 py-3">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <h5 className='mb-0 fw-bold'>Subscription / Invest</h5>
                                <div className='mint-box'><FaMintbit /></div>
                            </div>

                            <div className="c-box py_1">
                                <Stake
                                    walletBalance={stakeData?.walletBalance || 0}
                                    onSuccess={refreshData}
                                    onActivationChange={(visible) => setIsActivationVisible(visible)}
                                />
                                {!isActivationVisible && (
                                    <div className="animate__animated animate__fadeIn">
                                        <div className="d-flex flex-wrap justify-content-between">
                                            <Link to="/dashboard/depositHistory">
                                                <p className="mb-1">
                                                    <strong title='Deposit History'>Deposit Fund : </strong>
                                                    <span className='Investment-text currency1' data-value={userData?.topupwallet || 0}>
                                                        {formatCurrency(userData?.topupwallet || 0)}
                                                    </span>
                                                </p>
                                            </Link>
                                            <div className='fundbtn'>
                                                <button type="button" title='fund-deposit' className="wallet-buttton b">
                                                    <MdAddCard size={20} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className='investment-wrapper d-flex gap-0 gap-md-4 flex-wrap'>
                                            <Link to="/dashboard/investmenthistory">
                                                <p className="mb-0">
                                                    <strong title='Subscription History'>Subscription : </strong>
                                                    <span className='Investment-text currency1' data-value={userData?.BotAmount || 0}>
                                                        {formatCurrency(userData?.BotAmount || 0)}
                                                    </span>
                                                </p>
                                            </Link>
                                            <Link to="/dashboard/investmenthistory">
                                                <p className="mb-0 ms-0 md:ms-4">
                                                    <strong title='Investment History'>Investment : </strong>
                                                    <span className='Investment-text currency1' data-value={userData?.Invest || 0}>
                                                        {formatCurrency(userData?.Invest || 0)}
                                                    </span>
                                                </p>
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Payout Card */}
                <div className="col-lg-3 col-md-12">
                    <div className="card1 no-animate custom-card1 p-0 rounded_5">
                        <div className="card1-body px-3 py-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <h5 className='mb-0 fw-bold'>Payout</h5>
                                <div className='mint-box'><GiProfit /></div>
                            </div>
                            <div className="c-box gap-3 py_3">
                                <div className="payout-input-box">
                                    <input
                                        type="number"
                                        className="custom-pay-form form-control mb-2"
                                        placeholder='Enter Amount'
                                        value={payoutAmount}
                                        onChange={(e) => setPayoutAmount(e.target.value)}
                                        style={{ padding: "10px" }}
                                    />
                                    <div className="d-flex align-items-center justify-content-between">
                                        <Link to="/dashboard/WithdrawalHistory">
                                            <h6 className='hover-text small-text mb-1' title='WithdrawalHistory'>
                                                Payout Amt :
                                                <span className="pay-badge pay-bg">
                                                    <strong className='mt-2 currency1' data-value={displayBalance}>
                                                        {formatCurrency(displayBalance)}
                                                    </strong>
                                                </span>
                                            </h6>
                                        </Link>
                                        <button
                                            type="button"
                                            className="wallet-buttton"
                                            onClick={handlePayoutClick}
                                            disabled={payoutLoading || displayBalance <= 0}
                                        >
                                            {payoutLoading ? "Processing..." : "Payout"}
                                        </button>
                                    </div>

                                    <div className='d-flex align-items-center gap-2'>
                                        <span style={{ color: "green", fontWeight: "bold" }}>Note :</span>
                                        <p style={{ margin: 0, color: "#666", fontSize: "13px" }}>
                                            Min Withdrawal <span className='currency1' data-value={minimumWithdraw}>
                                                {formatCurrency(minimumWithdraw)}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Withdraw Modal */}
            {showWithdrawModal && (
                <div className="modal-overlay">
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h4>Withdraw</h4>
                            <button
                                className="modal-close"
                                onClick={() => {
                                    setShowWithdrawModal(false);
                                    setWithdrawAmount('');
                                    setWithdrawOtp('');
                                    setOtpSent(false);
                                    setOtpTimer(0);
                                    if (otpIntervalId) clearInterval(otpIntervalId);
                                    setOtpIntervalId(null);
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="balance-info">
                                <span>Available balance</span>
                                <strong className='currency1' data-value={displayBalance}>
                                    {formatCurrency(displayBalance)}
                                </strong>
                            </div>

                            <div className='meddle'>
                                <div className="methods-grid mt-3">
                                    <div
                                        className={`method-chip ${selectedMethod === 'BANK CARD' ? 'active' : ''}`}
                                        onClick={() => !verifyingOtp && setSelectedMethod('BANK CARD')}
                                    >
                                        <FaCreditCard />
                                        <span>BANK CARD</span>
                                    </div>
                                    <div
                                        className={`method-chip ${selectedMethod === 'USDT TRC20' ? 'active' : ''}`}
                                        onClick={() => !verifyingOtp && setSelectedMethod('USDT TRC20')}
                                    >
                                        <div
                                        className={`method-chip ${selectedMethod === 'USDT TRC20' ? 'active' : ''}`}
                                        onClick={() => !verifyingOtp && setSelectedMethod('USDT TRC20')}
                                    >
                                        <span>₿</span>
                                        <span>USDT TRC20</span>
                                    </div>
                                    </div>
                                </div>
                                <div className="amount-area mb-3">
                                    <div className="amount-label">Enter Amount</div>
                                    <div className="amount-input-wrapper">
                                        <span className="currency-symbol currency1" data-value="1">
                                            {currencySymbols[selectedCurrency]}
                                        </span>
                                        <input
                                            type="number"
                                            className="amount-input"
                                            placeholder="Enter amount"
                                            value={withdrawAmount}
                                            onChange={(e) => setWithdrawAmount(e.target.value)}
                                            disabled={verifyingOtp}
                                        />
                                    </div>
                                </div>

                                <div className="input-container01 mt-3">
                                    <span className="currency-symbol1">OTP</span>
                                    <span className="divider">|</span>
                                    <input
                                        type="text"
                                        className="amount-input"
                                        placeholder="Enter 6-digit OTP"
                                        maxLength="6"
                                        value={withdrawOtp}
                                        onChange={(e) => setWithdrawOtp(e.target.value.replace(/\D/g, ''))}
                                        disabled={verifyingOtp}
                                    />
                                    <button
                                        className="clear-btn"
                                        onClick={sendOtp}
                                        disabled={isOtpButtonDisabled()}
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

                                <button
                                    className="modal-button mt-3"
                                    onClick={handleWithdraw}
                                    disabled={isWithdrawDisabled()}
                                >
                                    {verifyingOtp ? 'Verifying OTP...' : 'Withdraw Now'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
        </> 
    );
};

export default Cards;