import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom'
import { GiProfit } from "react-icons/gi";
import { FaCreditCard, FaEye, FaMintbit, FaRegCopy } from "react-icons/fa6";
import { RiErrorWarningLine } from "react-icons/ri";
import { MdAddCard } from "react-icons/md";
import toast from "react-hot-toast";
import Stake from "./Stake";
import { useUser } from "../../../context/UserContext";
import apiClient from "../../../api/apiClient"
import '../../../assets/dashboardcss/css/Dashboard.css';
import { IoSend } from 'react-icons/io5';
import NoticeModal from "../../../components/NoticeModal/NoticeModal";
import KycStatusModal from "../../../components/NoticeModal/KycStatusModal";
import Swal from 'sweetalert2';

const Dashboard = () => {
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successAmount, setSuccessAmount] = useState(0);
    const [withdrawLoading, setWithdrawLoading] = useState(false); // ✅ Add this

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
    const [showNotice, setShowNotice] = useState(false);
    const [showKycModal, setShowKycModal] = useState(false);

    const [walletAddress, setWalletAddress] = useState('');
    const [accountNumber, setAccountNumber] = useState('');

    const [payoutAmount, setPayoutAmount] = useState('');
    const [minimumWithdraw, setMinimumWithdraw] = useState(0);
    const [payoutApiBalance, setPayoutApiBalance] = useState(0);
    const [payoutLoading, setPayoutLoading] = useState(false);

    const [otpStep, setOtpStep] = useState('send'); // 'send' | 'verify' | 'withdraw'
    const [otpVerifyTimer, setOtpVerifyTimer] = useState(0);
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [verifyOtpLoading, setVerifyOtpLoading] = useState(false); // ✅ Add this

    const { userData, stakeData, refreshData } = useUser();
    const kycStatus = userData?.kycstatus;

    const STORAGE_KEY = "bankDetails";
    const kycCheckedRef = useRef(false);

    const handleNoticeClose = () => {
        setShowNotice(false);
        sessionStorage.setItem('noticeSeen', 'true');
    };

    const handleKycModalClose = () => {
        setShowKycModal(false);
        sessionStorage.setItem('kycModalClosed', 'true');
    };
    const payoutStatus = useMemo(() => {

        const userPayout = userData?.userPayoutOnOff;
        const teamPayout = userData?.teamIdPayoutOnOff;
        const adminPayout = userData?.payoutOnOffByAdmin;

        console.log("userPayout", userPayout);
        console.log("teamPayout", teamPayout);
        console.log("adminPayout", adminPayout);

        let status = 'active'; // Default

        // Determine status based on priority
        if (teamPayout === 0) status = 'team_off';
        else if (adminPayout === 1) status = 'admin_off';
        else if (userPayout === 0) status = 'user_off';

        // Switch case on status
        switch (status) {
            case 'team_off':
                return { active: false, message: "Team payout has been turned off, Please contact support." };
            case 'admin_off':
                return { active: false, message: "Payout has been turned off by admin, Please contact support." };
            case 'user_off':
                return { active: false, message: "User payout has been turned off, Please contact support." };
            default:
                return { active: true };
        }
    }, [userData]);
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
    const regno = userData?.regno || userData?.Regno || sessionStorage.getItem('regno');

    const [isActivationVisible, setIsActivationVisible] = useState(false);
    const [isCovered, setIsCovered] = useState(false);
    const handleToggle = () => setIsCovered(!isCovered);

    const copyReferral = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("Sponsor ID Copied!");
    };

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

    const fetchMinimumWithdrawLimit = async () => {
        try {
            const response = await apiClient.get(`/IncomePayout/minimun-withdraw-limit`);
            if (response.data?.success === true) {
                const minLimit = response.data?.data || 100;
                setMinimumWithdraw(minLimit);
            } else {
                setMinimumWithdraw(100);
            }
        } catch (error) {
            console.error("Error fetching minimum withdraw limit:", error);
            setMinimumWithdraw(100);
        }
    };

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
            setUsdToInrRate(90);
            toast.error('Using default rate. Live rate unavailable.');
        } finally {
            setFetchingRate(false);
        }
    };

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
            (selectedMethod === 'USDT TRC20' && !usdToInrRate) ||
            !payoutStatus.active
        );
    };

    const isOtpButtonDisabled = () => {
        return otpTimer > 0 || sendingOtp || verifyingOtp;
    };

    const displayBalance = payoutApiBalance > 0 ? payoutApiBalance : (userData?.Remaining || 0);

    // Fetch data on mount
    useEffect(() => {
        if (regno) {
            fetchPayoutBalance();
            fetchMinimumWithdrawLimit();
        }
    }, [regno, userData?.Remaining]);

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

    useEffect(() => {
        if (showWithdrawModal) {
            fetchUsdToInrRate();
        }
    }, [showWithdrawModal]);

    const sendOtp = async () => {
        if (!regno) {
            toast.error('Registration number not found');
            return;
        }

        setSendingOtp(true);
        try {
            const response = await apiClient.post(`/User/genrate-otp?loginid=${loginid}&regno=${regno}`, {});

            // ✅ API ka exact message print karo
            if (response.data.success || response.data.status === 'success') {
                const msg = response.data.message || 'OTP sent successfully!';
                toast.success(msg);  // ✅ API ka message print
                setOtpSent(true);
                setOtpTimer(300);
                setOtpStep('verify');
                setIsOtpVerified(false);
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

    const verifyOtp = async () => {
        if (!withdrawOtp || withdrawOtp.length !== 6) {
            toast.error('Please enter a valid 6-digit OTP');
            return;
        }

        setVerifyOtpLoading(true);
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
                setVerifyOtpLoading(false);
                return;
            }

            // ✅ Success - API ka exact message
            toast.success(verifyRes.data?.message || 'OTP Verified Successfully!');
            setIsOtpVerified(true);
            setOtpStep('verified');

        } catch (err) {
            console.error('OTP Verification error:', err);
            toast.error(err.response?.data?.message || 'OTP verification failed');
        } finally {
            setVerifyOtpLoading(false);
        }
    };

    const handleWithdraw = async () => {
        // ✅ Check if OTP is verified
        if (!isOtpVerified) {
            toast.error('Please verify OTP first');
            return;
        }

        const amountNum = parseFloat(withdrawAmount);

        // Validations
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

        let walletAddr = '';
        let payMode = '';
        let liveRate = 0;

        if (selectedMethod === 'BANK CARD') {
            const card = userData?.upiNumber;
            if (!card) {
                toast.error('No bank card added. Please add a card first.');
                return;
            }
            walletAddr = card;
            payMode = 'inr';
            liveRate = usdToInrRate || 90;
        } else if (selectedMethod === 'USDT TRC20') {
            const address = userData?.walletid;
            if (!address) {
                toast.error('No USDT TRC20 address added. Please add an address first.');
                return;
            }
            walletAddr = address;
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
            const payload = {
                regNo: parseInt(regno),
                amount: amountNum,
                liveRate: liveRate,
                payMode: payMode,
                walletAddress: walletAddr
            };
            console.log("payload", payload);

            const withdrawalRes = await apiClient.post('/IncomePayout/withdraw-request', payload);
            console.log("response", withdrawalRes);

            if (withdrawalRes.data?.success) {
                Swal.fire({
                    icon: 'success',
                    title: '✅ Withdrawal Submitted!',
                    html: `
                    <div style="text-align: center; padding: 10px 0;">
                        <div style="font-size: 40px; margin-bottom: 10px;">🎉</div>
                        <div style="font-size: 22px; font-weight: 700; color: #28a745; margin-bottom: 8px;">
                            $${amountNum.toFixed(2)}
                        </div>
                        <div style="font-size: 15px; color: #6c757d;">
                            Your withdrawal request has been submitted successfully!
                        </div>
                    </div>
                `,
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#28a745',
                    timer: 3000,
                    timerProgressBar: true,
                    showCloseButton: true,
                    background: '#f0fdf4',
                    backdrop: 'rgba(0,0,0,0.6)',
                    zIndex: 9999999,
                });

                setSuccessAmount(amountNum);
                setShowSuccessModal(true);

                await refreshData();
                await fetchPayoutBalance();

                setTimeout(() => {
                    setShowWithdrawModal(false);
                    setWithdrawAmount('');
                    setWithdrawOtp('');
                    setPayoutAmount('');
                    setOtpSent(false);
                    setOtpTimer(0);
                    setOtpStep('send');
                    setOtpVerifyTimer(0);
                    setIsOtpVerified(false);
                    setVerifyOtpLoading(false);
                    if (otpIntervalId) clearInterval(otpIntervalId);
                    setOtpIntervalId(null);
                }, 500);

            } else {
                toast.error(withdrawalRes.data?.message || 'Withdrawal failed');
            }
        } catch (err) {
            console.error('Withdrawal error:', err.response?.data || err);
            const errorMsg = err.response?.data?.message || err.message;
            toast.error(errorMsg);
        } finally {
            setVerifyingOtp(false);
        }
    };

    return (
        <>
            <NoticeModal
                isOpen={showNotice}
                onClose={handleNoticeClose}
            />

            <KycStatusModal
                isOpen={showKycModal}
                onClose={handleKycModalClose}
                kycStatus={kycStatus}
            />

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
                                    <h6 className='mt-1'>Rank : <span className="cus-badge green-badge0">{userData?.rank || "User"}</span></h6>
                                </div>
                            </div>

                            <div className="c-box">
                                <div className="d-flex align-items-center justify-content-between w-100">
                                    <p className="mb-0">
                                        <strong>Name:</strong>&nbsp;
                                        <span style={{ color: 'green' }}>{userData?.name || "N/A"}</span>
                                    </p>
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

                   <div className="d-flex flex-column flex-sm-row justify-content-between">
    <div>
        <div className='' style={{ marginTop: "-6px" }}>
            <p className="mb-1">
                <strong>Login Id :</strong>&nbsp;
                <span style={{ color: 'green' }}>{userData?.me || "N/A"}</span>
            </p>
            <p className="mb-1">
                <strong>
                    Sponsor id : &nbsp;
                    <span style={{ color: 'green' }}>{userData?.referral}</span>
                    <FaRegCopy 
                        style={{ cursor: 'pointer', marginLeft: '5px' }} 
                        onClick={() => copyReferral(userData?.referral)} 
                    />
                </strong>
            </p>
        </div>
    </div>
  <div className=" align-items-center ">
        <div className='countdown-time '>
            {timeLeft && (
                <div 
                    className="countdown-timer fw-bold" 
                    style={{
                        fontSize: '14px',
                        color: '#ffffff',
                        boxShadow: '0 4px 12px rgba(33, 33, 33, 0.2)',
                        padding: '8px 10px',
                        margin: "0 auto",
                        justifyContent: "center",
                        display: "flex "
                    }}
                >
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
                                    <div
                                        className="animate__animated animate__fadeIn text-sm-start"
                                        style={{ marginTop: "-20px" }}
                                    >

                                        {/* ===== Row 1: Deposit Fund + Smart Wallet ===== */}
                                        <div className="row g-2 g-md-3">
                                            <div className="col-6">
                                                <Link to="/dashboard/depositHistory" className="text-decoration-none">
                                                    <p className="mb-1 d-flex flex-column flex-sm-row ">
                                                        <strong title='Deposit History' className="me-sm-1">
                                                            Deposit Fund :
                                                        </strong>
                                                        <span className='Investment-text currency1' data-value={userData?.topupwallet || 0}>
                                                            ${userData?.topupwallet?.toFixed(2) || '0.00'}
                                                        </span>
                                                    </p>
                                                </Link>
                                            </div>

                                            <div className="col-6">
                                                <Link to="/dashboard/Smartwallethistory" className="text-decoration-none">
                                                    <p className="mb-1 d-flex flex-column flex-sm-row">
                                                        <strong title='Smart Wallet History' className="me-sm-1">
                                                            Smart Wallet :
                                                        </strong>
                                                        <span className='Investment-text currency1' data-value={userData?.Smart_Wallet || 0}>
                                                            ${userData?.Smart_Wallet?.toFixed(2) || '0.00'}
                                                        </span>
                                                    </p>
                                                </Link>
                                            </div>
                                        </div>

                                        {/* ===== Row 2: Subscription + Real Inv ===== */}
                                        <div className="row g-2 g-md-3">
                                            <div className="col-6">
                                                <Link to="/dashboard/investmenthistory" className="text-decoration-none">
                                                    <p className="mb-0 d-flex flex-column flex-sm-row ">
                                                        <strong title='Subscription History' className="me-sm-1">
                                                            Subscription :
                                                        </strong>
                                                        <span className='Investment-text currency1' data-value={userData?.BotAmount || 0}>
                                                            ${userData?.BotAmount?.toFixed(2) || '0.00'}
                                                        </span>
                                                    </p>
                                                </Link>
                                            </div>

                                            <div className="col-6">
                                                <Link to="/dashboard/investmenthistory" className="text-decoration-none">
                                                    <p className="mb-0 d-flex flex-column flex-sm-row ">
                                                        <strong title='Investment History' className="me-sm-1">
                                                            Real Inv :
                                                        </strong>
                                                        <span className='Investment-text currency1' data-value={userData?.Invest || 0}>
                                                            ${userData?.Invest?.toFixed(2) || '0.00'}
                                                        </span>
                                                    </p>
                                                </Link>
                                            </div>
                                        </div>

                                        {/* ===== Row 3: Investment + Virtual Inv ===== */}
                                        <div className="row g-2 g-md-3">
                                            <div className="col-6">
                                                <Link to="/dashboard/investmenthistory" className="text-decoration-none">
                                                    <p className="mb-0 d-flex flex-column flex-sm-row ">
                                                        <strong title='Investment History' className="me-sm-1">
                                                            Investment :
                                                        </strong>
                                                        <span className='Investment-text currency1' data-value={userData?.Invest || 0}>
                                                            ${userData?.Invest?.toFixed(2) || '0.00'}
                                                        </span>
                                                    </p>
                                                </Link>
                                            </div>

                                            <div className="col-6">
                                                <Link to="/dashboard/investmenthistory" className="text-decoration-none">
                                                    <p className="mb-0 d-flex flex-column flex-sm-row ">
                                                        <strong title='Virtual Investment History align-items-center' className="me-sm-1">
                                                            Virtual Inv :
                                                        </strong>
                                                        <span className='Investment-text currency1' data-value={userData?.BotAmount || 0}>
                                                            ${userData?.BotAmount?.toFixed(2) || '0.00'}
                                                        </span>
                                                    </p>
                                                </Link>
                                            </div>
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
  type="text"
  inputMode="numeric"
  className="custom-pay-form form-control mb-2"
  placeholder="Enter Amount"
  value={payoutAmount}
  onChange={(e) => setPayoutAmount(e.target.value.replace(/\D/g, ""))}
  style={{ padding: "10px" }}
/>
                                    <div className="d-flex align-items-center justify-content-between">
                                        <Link to="/dashboard/WithdrawalHistory">
                                            <h6 className=' small-text mb-1' title='WithdrawalHistory'>
                                                Payout Amt :
                                                <span className="pay-badge pay-bg">
                                                    <strong className='hover-text mt-2 currency1' data-value={displayBalance}>
                                                        ${displayBalance?.toFixed(2) || '0.00'}
                                                    </strong>
                                                </span>
                                            </h6>
                                        </Link>
                                        <button
                                            type="button"
                                            className="wallet-buttton"
                                            onClick={() => {
                                                const amountNum = parseFloat(payoutAmount);

                                                if (!payoutAmount || isNaN(amountNum) || amountNum <= 0) {
                                                    Swal.fire({
                                                        icon: 'warning',
                                                        title: ' Invalid Amount!',
                                                        text: 'Please enter a valid amount.',
                                                        confirmButtonColor: '#667eea',
                                                        confirmButtonText: 'OK',
                                                        backdrop: 'rgba(0,0,0,0.6)',
                                                        zIndex: 9999999,
                                                    });
                                                    return;
                                                }

                                                if (amountNum >= 1 && amountNum < 30) {
                                                    Swal.fire({
                                                        icon: 'warning',
                                                        title: ' Minimum Withdrawal $30!',
                                                        html: `
                                                            <div style="text-align: center; padding: 5px 0;">
                                                                <div style="font-size: 15px; color: #6c757d; margin-bottom: 5px;">
                                                                    You entered <strong style="color: #e74c3c;">$${amountNum}</strong>. 
                                                                    Minimum withdrawal amount is <strong style="color: #28a745;">$30</strong>.
                                                                </div>
                                                            </div>
                                                        `,
                                                        showConfirmButton: true,
                                                        confirmButtonText: 'OK, Got it!',
                                                        confirmButtonColor: '#667eea',
                                                        background: '#fff',
                                                        showCloseButton: true,
                                                        backdrop: 'rgba(0,0,0,0.6)',
                                                        zIndex: 9999999,
                                                    });
                                                    return;
                                                }
                                                if (amountNum > displayBalance) {
                                                    Swal.fire({
                                                        icon: 'error',
                                                        title: 'Insufficient Balance!',
                                                        text: `Available balance is $${displayBalance.toFixed(2)}. Please enter a valid amount.`,
                                                        confirmButtonColor: '#d33',
                                                        confirmButtonText: 'OK',
                                                        backdrop: 'rgba(0,0,0,0.6)',
                                                        zIndex: 9999999,
                                                    });
                                                    return;
                                                }

                                                setWithdrawAmount(payoutAmount);
                                                setShowWithdrawModal(true);
                                            }}
                                        // disabled={payoutLoading || displayBalance <= 0}
                                        >
                                            Payout
                                        </button>
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        <div className='d-flex align-items-center gap-2'>
                                            <span style={{ color: "green", fontWeight: "bold" }}>Note :</span>
                                            <p style={{ margin: 0, color: "#666", fontSize: "13px" }}>
                                                Min Withdrawal ${minimumWithdraw}
                                            </p>
                                        </div>
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
                            <h4>Income Payout</h4>
                            <button
                                className="modal-close"
                                onClick={() => {
                                    setShowWithdrawModal(false);
                                    setWithdrawAmount('');
                                    setWithdrawOtp('');
                                    setOtpSent(false);
                                    setOtpTimer(0);
                                    setIsOtpVerified(false);
                                    setOtpStep('send');
                                    if (otpIntervalId) clearInterval(otpIntervalId);
                                    setOtpIntervalId(null);
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="modal-body">
                            {/* Balance Info */}
                            <div className="balance-info">
                                <span>Available balance</span>
                                <strong className='currency1' data-value={displayBalance}>
                                    ${displayBalance?.toFixed(2) || '0.00'}
                                </strong>
                            </div>

                            <div className='meddle'>
                                {/* Payment Methods */}
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
                                        <FaCreditCard />
                                        <span>Wallet Address</span>
                                    </div>

                                    <input
                                        type="text"
                                        placeholder={walletAddress ? walletAddress : "No wallet found"}
                                        value={selectedMethod === 'USDT TRC20' ? userData?.accountNo : (selectedMethod === 'BANK CARD' ? userData?.upiNumber : '')}
                                        readOnly
                                        className="amount-input-wrapper wallet-address-input"
                                        style={{
                                            backgroundColor: '#f5f5f5',
                                            border: '1px solid #ddd',
                                            fontWeight: 'normal',
                                            cursor: 'not-allowed',
                                            width: '100%',
                                            padding: '12px 15px',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            marginTop: '10px',
                                            color: 'green',
                                        }}
                                    />
                                </div>

                                {/* Amount Input */}
                                <div className="amount-area mb-3 mt-3">
                                    <div className="amount-label">Enter Amount</div>
                                    <div className="amount-input-wrapper">
                                        <span className="currency-symbol">$</span>
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

                                {/* ✅ OTP Section - Tumhare Project Jaisa */}
                                <div className="amount-area mb-3 mt-3">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="amount-input-wrapper w-100">
                                            <input
                                                type="text"
                                                className="amount-input"
                                                placeholder="Enter OTP"
                                                value={withdrawOtp}
                                                onChange={(e) => setWithdrawOtp(e.target.value.replace(/\D/g, ''))}
                                                disabled={!otpSent}
                                                maxLength="6"
                                            />
                                        </div>

                                        {!otpSent ? (
                                            <button
                                                className=" btn btn-primary py-2 px-4 text-nowrap"
                                                onClick={sendOtp}
                                                disabled={sendingOtp || !payoutStatus.active}
                                            >
                                                {sendingOtp ? "Sending..." : "Send OTP"}
                                            </button>
                                        ) : (
                                            <button
                                                className="btn btn-success py-2 px-4 text-nowrap"
                                                onClick={verifyOtp}
                                                disabled={verifyOtpLoading || withdrawOtp.length !== 6}
                                            >
                                                {verifyOtpLoading ? "Verifying..." : "Verify OTP"}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* ✅ Withdraw Button  */}
                                <button
                                    className="modal-button mt-3"
                                    onClick={handleWithdraw}
                                    disabled={withdrawLoading || !isOtpVerified}
                                    style={{
                                        opacity: (withdrawLoading || !isOtpVerified) ? 0.6 : 1,
                                        cursor: (withdrawLoading || !isOtpVerified) ? 'not-allowed' : 'pointer',
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: (withdrawLoading || !isOtpVerified) ? '#6c757d' : '#667eea',
                                        color: 'white',
                                        fontWeight: '600',
                                        fontSize: '15px'
                                    }}
                                >
                                    {withdrawLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                            Processing...
                                        </>
                                    ) : !isOtpVerified ? (
                                        "Withdraw (Verify OTP First)"
                                    ) : (
                                        "Withdraw Now"
                                    )}
                                </button>

                                {/* Payout Status Message */}
                                {!payoutStatus.active && (
                                    <div
                                        style={{
                                            color: '#dc3545',
                                            padding: '0px 15px',
                                            fontSize: '16px',
                                            fontWeight: '800',
                                            textAlign: 'center',
                                            marginTop: '5px',
                                        }}
                                    >
                                        <span>{payoutStatus.message}</span>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Dashboard;   