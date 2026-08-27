import React, { useState, useEffect, useMemo } from "react";
import { RiP2pFill } from "react-icons/ri";
import { FaHistory } from "react-icons/fa";
import { IoSend, IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../context/UserContext";
import apiClient from "../../../api/apiClient";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./UserDetails.css";

// Currency Configuration
const currencyRates = {
    USD: 1,
    INR: 90,

};

const currencySymbols = {
    USD: "$",
    INR: "₹",
};

export const Deposit2Deposit = () => {
    const { userData, refreshData } = useUser();
    const navigate = useNavigate();

    // Currency State
    const [selectedCurrency, setSelectedCurrency] = useState(() => {
        return sessionStorage.getItem("selectedCurrency") || "USD";
    });

    // ---------- Helper: get loginid & regno ----------
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
    const regno = Number(
        JSON.parse(sessionStorage.getItem('user'))?.Regno ||
        JSON.parse(sessionStorage.getItem('user'))?.regno ||
        sessionStorage.getItem('regno')
    );

    // ---------- State for P2P Transfer (Smart Wallet to Smart Wallet) ----------
    const [amount1, setAmount1] = useState("");
    const [investUserId1, setInvestUserId1] = useState("");
    const [checkingUser1, setCheckingUser1] = useState(false);
    const [validUser1, setValidUser1] = useState(false);
    const [userName1, setUserName1] = useState("");
    const [loading1, setLoading1] = useState(false);

    // ---------- State for Self Transfer (Income Wallet to Deposit Wallet) ----------
    const [amount2, setAmount2] = useState(100);
    const [otp, setOtp] = useState("");
    const [loading2, setLoading2] = useState(false);
    const [otpTimer, setOtpTimer] = useState(0);
    const [otpIntervalId, setOtpIntervalId] = useState(null);
    const [isSendingOtp, setIsSendingOtp] = useState(false);

    const depositOptions = [100, 300, 500, 1000, 10000, 50000];
    const isLoading = !userData;

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

        return () => {
            window.removeEventListener('currencyChanged', handleCurrencyChange);
        };
    }, []);

    // Initialize currency on mount
    useEffect(() => {
        let savedCurrency = sessionStorage.getItem("selectedCurrency") || "USD";
        setSelectedCurrency(savedCurrency);

        setTimeout(() => {
            changeCurrency(savedCurrency);
        }, 100);
    }, []);

    const formatBalance = (amount) => {
        if (amount === undefined || amount === null) return `${currencySymbols[selectedCurrency]}0.00`;
        const num = Number(amount);
        if (isNaN(num)) return `${currencySymbols[selectedCurrency]}0.00`;
        return formatCurrency(num);
    };

    // Button disable condition for P2P Transfer
    const isP2PButtonDisabled = useMemo(() => {
        return !validUser1 || loading1 || amount1 <= 0 || !investUserId1 || investUserId1.trim() === "";
    }, [validUser1, loading1, amount1, investUserId1]);

    // Button disable condition for Self Transfer
    const isSelfTransferDisabled = useMemo(() => {
        return loading2 || !otp || otp.trim() === "" || amount2 <= 0;
    }, [loading2, otp, amount2]);

    // ---------- P2P user check ----------
    const checkUser1 = async (id) => {
        if (!id || id.trim() === "") {
            setValidUser1(false);
            setUserName1("");
            return;
        }

        setCheckingUser1(true);
        try {
            const res = await apiClient.get(`/User/check-user?loginid=${id}`);
            const data = res.data;
            const name = data?.data?.Name || data?.data?.name || "";

            if (data?.success && data.data) {
                setValidUser1(true);
                setUserName1(name);
                toast.success(`User found: ${name}`);
            } else {
                setValidUser1(false);
                setUserName1("");
                toast.error("User ID not found");
            }
        } catch (err) {
            console.error("Error checking user:", err);
            setValidUser1(false);
            setUserName1("");
            toast.error("Error checking user");
        } finally {
            setCheckingUser1(false);
        }
    };

    // ---------- P2P TRANSFER: Smart Wallet to Smart Wallet ----------
    const handleSmartWalletTransfer = async () => {
        if (!investUserId1 || investUserId1.trim() === "") {
            toast.error("Please enter User ID");
            return;
        }
        if (!amount1 || amount1 <= 0) {
            toast.error("Please enter valid amount");
            return;
        }
        if (!validUser1) {
            toast.error("Please enter a valid User ID");
            return;
        }
        if (amount1 > userData.Smart_Wallet) {
            toast.error(`Insufficient Smart Wallet balance. Available: ${formatBalance(userData.Smart_Wallet)}`);
            return;
        }

        setLoading1(true);

        try {
            const token = sessionStorage.getItem("token");
            const response = await apiClient.post(
                "/IncomePayout/deposit-to-deposit",
                {
                    regno: regno,
                    reciveId: investUserId1,
                    amount: amount1,
                    wallet: 1
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                toast.success(response.data.message || "Transfer successful!");

                setAmount1(100);
                setInvestUserId1("");
                setUserName1("");
                setValidUser1(false);

                await refreshData();
            } else {
                toast.error(response.data.message || "Transfer failed");
            }
        } catch (err) {
            console.error("Transfer error:", err);
            const errorMsg = err.response?.data?.message || err.message || "Error processing transfer";
            toast.error(errorMsg);
        } finally {
            setLoading1(false);
        }
    };

    // ---------- SEND OTP for Self Transfer ----------
    const sendOtp = async () => {
        if (isSendingOtp || otpTimer > 0) {
            return;
        }

        if (!regno) {
            toast.error("Registration number not found. Please login again.");
            return;
        }

        setIsSendingOtp(true);

        try {
            const response = await apiClient.post(`/User/genrate-otp?loginid=${loginid}&regno=${regno}`, {});

            if (response.data.success || response.data.status === 'success') {
                toast.success("OTP sent successfully!");
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
                toast.error(response.data.message || "Failed to send OTP");
            }
        } catch (error) {
            console.error("OTP send error:", error);
            toast.error(error.response?.data?.message || "Network error");
        } finally {
            setIsSendingOtp(false);
        }
    };

    // ---------- SELF TRANSFER: Income Wallet to Deposit Wallet ----------
    const handleSelfTransfer = async () => {
        if (!amount2 || amount2 <= 0) {
            toast.error("Please enter valid amount");
            return;
        }
        if (amount2 > userData.totalWallet) {
            toast.error(`Insufficient Income Wallet balance. Available: ${formatBalance(userData.totalWallet)}`);
            return;
        }
        if (!otp || otp.trim() === "") {
            toast.error("Please enter OTP");
            return;
        }

        setLoading2(true);

        try {
            // Verify OTP
            const verifyResponse = await apiClient.post('/User/verify-otp', null, {
                params: { loginid, regno, otp }
            });

            if (!verifyResponse.data.success) {
                toast.error(verifyResponse.data.message || "Invalid OTP");
                setLoading2(false);
                return;
            }

            // Fund Transfer
            const transferPayload = {
                regno: regno,
                reciveId: loginid,
                amount: amount2,
                wallet: 0,
            };

            const transferResponse = await apiClient.post("/IncomePayout/fund-transfer", transferPayload);

            if (transferResponse.data.success) {
                toast.success(transferResponse.data.message || "Transfer successful!");

                setAmount2(100);
                setOtp("");
                setOtpTimer(0);
                if (otpIntervalId) {
                    clearInterval(otpIntervalId);
                    setOtpIntervalId(null);
                }

                await refreshData();
            } else {
                toast.error(transferResponse.data.message || "Transfer failed");
            }
        } catch (err) {
            console.error("Transfer error:", err);
            const errorMsg = err.response?.data?.message || err.message || "Network error";
            toast.error(errorMsg);
        } finally {
            setLoading2(false);
        }
    };

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (otpIntervalId) clearInterval(otpIntervalId);
        };
    }, [otpIntervalId]);

    // ---------- Render ----------
    return (
        <>
            <ToastContainer />
            <div className="mb-5">
                {isLoading ? (
                    <div className="loading">Loading Wallet...</div>
                ) : (
                    <div className="deposit-col d-flex flex-lg-nowrap flex-wrap justify-content-between align-items-start p-1">
                        
                        {/* ====== CARD 1: INCOME WALLET TO DEPOSIT WALLET (Self Transfer) ====== */}
                        <div className="deposit-card">
                            <div className="d-flex justify-content-between ">
                                <div className="deposit-title">
                                    <RiP2pFill size={22} />
                                    <h2>Income Wallet To Smart Wallet</h2>
                                </div>
                                <div className="d-flex gap-2">
                                    <FaHistory
                                        size={22}
                                        style={{ cursor: "pointer", color: "#333" }}
                                        onClick={() =>
                                            navigate("/dashboard/Smartwallethistory", {
                                                state: { transtype: "fundtransfer" }
                                            })
                                        }
                                        onMouseOver={(e) => (e.target.style.color = "#f909f9")}
                                        onMouseOut={(e) => (e.target.style.color = "#333")}
                                        title="Income Wallet To Deposit Wallet History"
                                    />
                                </div>
                            </div>

                            <div className="summary-section">
                                <div className="summary-row main">
                                    <span className="label-box">Income Wallet</span>
                                    <span className="value currency1" data-value={userData.totalWallet}>
                                        {formatBalance(userData.totalWallet)}
                                    </span>
                                </div>

                                <div className="deposit2deposit-color">
                                    <div className="summary-row">
                                        <span className="label-light" style={{ fontWeight: "bold" }}>SELF TRANSFER</span>
                                        <div className="input-container1">
                                            <span className="currency-symbol">{currencySymbols[selectedCurrency]}</span>
                                            <span className="divider">|</span>
                                            <input
                                                type="number"
                                                className="amount-input"
                                                value={amount2}
                                                onChange={(e) => setAmount2(Number(e.target.value))}
                                            />
                                            <button className="clear-btn" onClick={() => setAmount2(0)}>
                                                <IoClose />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="summary-row">
                                        <span className="label-light" style={{ fontWeight: "bold" }}>USER ID</span>
                                        <div className="input-container1">
                                            <input
                                                type="text"
                                                value={userData.me || loginid}
                                                readOnly
                                                style={{ color: "#4f4949", cursor: "not-allowed" }}
                                            />
                                        </div>
                                    </div>

                                    <div className="options-grid">
                                        {depositOptions.map((opt) => (
                                            <button
                                                key={opt}
                                                className={`opt-button ${amount2 === opt ? "active" : ""}`}
                                                onClick={() => setAmount2(opt)}
                                            >
                                                {currencySymbols[selectedCurrency]} {opt}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="input-container">
                                        <span className="currency-symbol1">ENTER OTP</span>
                                        <span className="divider">|</span>
                                        <input
                                            type="number"
                                            className="amount-input"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            placeholder="Enter OTP"
                                        />
                                        <button
                                            className="clear-btn"
                                            onClick={sendOtp}
                                            disabled={isSendingOtp || otpTimer > 0}
                                            title={isSendingOtp ? "Sending OTP..." : (otpTimer > 0 ? `Wait ${Math.floor(otpTimer / 60)}:${(otpTimer % 60).toString().padStart(2, "0")}` : "Send OTP")}
                                        >
                                            {isSendingOtp ? (
                                                <span className="otp-spinner"></span>
                                            ) : otpTimer > 0 ? (
                                                `${Math.floor(otpTimer / 60)}:${(otpTimer % 60).toString().padStart(2, "0")}`
                                            ) : (
                                                <IoSend />
                                            )}
                                        </button>
                                    </div>

                                    <button
                                        className="deposit-btn"
                                        onClick={handleSelfTransfer}
                                        disabled={isSelfTransferDisabled}
                                    >
                                        {loading2 ? "Processing..." : "Transfer"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ====== CARD 2: SMART WALLET TO SMART WALLET (P2P Transfer) ====== */}
                        <div className="deposit-card">
                            <div className="d-flex justify-content-between ">
                                <div className="deposit-title">
                                    <RiP2pFill size={22} />
                                    <h2>Smart Wallet To Smart Wallet Transfer</h2>
                                </div>
                                <div className="d-flex gap-2">
                                    <FaHistory
                                        size={22}
                                        style={{ cursor: "pointer", color: "#333" }}
                                        onClick={() =>
                                            navigate("/dashboard/Smartwallethistory", {
                                                state: { type: "P2P", tab: "deposit" }
                                            })
                                        }
                                        onMouseOver={(e) => (e.target.style.color = "#f909f9")}
                                        onMouseOut={(e) => (e.target.style.color = "#333")}
                                        title="Smart Wallet Transfer History"
                                    />
                                </div>
                            </div>

                            <div className="summary-section">
                                <div className="summary-row main">
                                    <span className="label-box">Smart Wallet Balance</span>
                                    <span className="value currency1" data-value={userData.Smart_Wallet} style={{ fontWeight: "800" }}>
                                        {formatBalance(userData.Smart_Wallet)}
                                    </span>
                                </div>

                                <div className="deposit2deposit-color">
                                    {/* <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
                                        <span className="label-light" style={{ fontWeight: "bold" }}>P2P AMOUNT</span>
                                        <input
                                            type="range"
                                            className="slider"
                                            min="0"
                                            max={userData.Smart_Wallet}
                                            step="1"
                                            value={amount1}
                                            onChange={(e) => setAmount1(Number(e.target.value))}
                                            style={{ width: "60%", margin: "0 10px" }}
                                        />
                                        <span className="value-light currency1" data-value={amount1}>
                                            {formatCurrency(amount1)}
                                        </span>
                                    </div> */}

                                    <div className="summary-row">
                                        <span className="label-light" style={{ fontWeight: "bold" }}>USER ID</span>
                                        <div className="input-container1">
                                            <input
                                                type="text"
                                                value={investUserId1}
                                                onChange={(e) => {
                                                    setInvestUserId1(e.target.value);
                                                    if (validUser1) {
                                                        setValidUser1(false);
                                                        setUserName1("");
                                                    }
                                                }}
                                                onBlur={() => {
                                                    if (investUserId1 && investUserId1.trim() !== "") {
                                                        checkUser1(investUserId1);
                                                    } else {
                                                        setValidUser1(false);
                                                        setUserName1("");
                                                    }
                                                }}
                                                placeholder="Enter User ID"
                                            />
                                        </div>
                                    </div>

                                    {checkingUser1 && <small className="text-muted">Checking user...</small>}
                                    {validUser1 && <small className="success-msg" style={{ color: "green" }}>✓ {userName1}</small>}
                                    {investUserId1 && !validUser1 && !checkingUser1 && (
                                        <small style={{ color: "red", display: "block", marginTop: "5px" }}>
                                            ✗ Please enter a valid User ID
                                        </small>
                                    )}

                                    <div className="options-grid">
                                        {depositOptions.map((opt) => (
                                            <button
                                                key={opt}
                                                className={`opt-button ${amount1 === opt ? "active" : ""}`}
                                                onClick={() => setAmount1(opt)}
                                            >
                                                {currencySymbols[selectedCurrency]} {opt}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="input-container">
                                        <span className="currency-symbol">{currencySymbols[selectedCurrency]}</span>
                                        <span className="divider">|</span>
                                        <input
                                            type="number"
                                            className="amount-input"
                                            value={amount1}
                                            onChange={(e) => setAmount1(Number(e.target.value))}
                                        />
                                        <button className="clear-btn" onClick={() => setAmount1(0)}>
                                            <IoClose />
                                        </button>
                                    </div>

                                    <button
                                        className="deposit-btn"
                                        onClick={handleSmartWalletTransfer}
                                        disabled={isP2PButtonDisabled}
                                    >
                                        {loading1 ? "Processing..." : "Transfer"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};