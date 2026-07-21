import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import toast from "react-hot-toast";
import AgreementForm from "../InvestmentForm/AgreementForm";
import apiClient from "../../../api/apiClient";
import { useUser } from "../../../context/UserContext"

// CSS injection – ek baar head mein daal do
const injectStyles = () => {
  if (document.getElementById("stake-popup-styles")) return;
  const style = document.createElement("style");
  style.id = "stake-popup-styles";
  style.textContent = `
    .popup-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(10px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      animation: fadeIn 0.3s ease;
    }
    .popup-container-3d {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(20px);
      width: 90%;
      max-width: 460px;
      border-radius: 24px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.6);
      overflow: hidden;
      animation: popupScale 0.35s ease;
    }
    @keyframes popupScale {
      0% { transform: scale(0.8); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .popup-header-3d {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 18px 24px;
      border-bottom: 1px solid rgba(99,102,241,0.2);
    }
    .popup-header-3d h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      background: linear-gradient(135deg, #6366f1, #a855f7);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
    .close-btn-3d {
      border: none;
      background: transparent;
      font-size: 28px;
      cursor: pointer;
      color: #64748b;
      transition: 0.2s;
    }
    .close-btn-3d:hover {
      color: #ef4444;
      transform: rotate(90deg);
    }
    .popup-body-3d {
      padding: 24px;
      font-size: 14px;
      color: #334155;
      text-align: center;
      line-height: 1.6;
    }
    .popup-footer-3d {
      display: flex;
      gap: 12px;
      padding: 20px;
    }
    .btn-confirm-3d {
      flex: 1;
      padding: 12px;
      border-radius: 10px;
      border: none;
      background: linear-gradient(135deg, #6366f1, #a855f7);
      color: white;
      font-weight: 600;
      cursor: pointer;
      transition: 0.25s;
      box-shadow: 0 6px 15px rgba(99,102,241,0.4);
    }
    .btn-confirm-3d:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(99,102,241,0.5);
    }
    .btn-cancel-3d {
      flex: 1;
      padding: 12px;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      color: #334155;
      font-weight: 500;
      cursor: pointer;
      transition: 0.2s;
    }
    .btn-cancel-3d:hover {
      background: #e2e8f0;
    }
    .activation-badge {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 30px;
      font-size: 12px;
      font-weight: 600;
      background: linear-gradient(135deg, #6366f1, #a855f7);
      color: white;
      margin-bottom: 10px;
      box-shadow: 0 4px 10px rgba(99,102,241,0.3);
    }
    .amount-highlight {
      color: #ef4444;
      font-size: 20px;
      font-weight: 700;
    }
    .username-highlight {
      color: #6366f1;
      font-weight: 700;
      font-size: 16px;
    }
  `;
  document.head.appendChild(style);
};

const Stake = () => {
  const { userData: loggedInUser } = useUser(); // 🔥 Logged-in user ka data
  const [openAgreement, setOpenAgreement] = useState(false);
  const [loginId, setLoginId] = useState("");
  const [isBotActive, setIsBotActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [isValidUser, setIsValidUser] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRegNo, setUserRegNo] = useState(null); // Bot owner ka regno (jo activate ho raha hai)

  const [subscriptionPopup, setSubscriptionPopup] = useState({
    visible: false,
    title: "🛡️ Activate Subscription",
    message: "",
    confirmText: "Yes, Activate",
    cancelText: "Cancel",
    onConfirm: null,
    onCancel: null,
  });

  useEffect(() => {
    injectStyles();
  }, []);

  const closeSubscriptionPopup = () => {
    setSubscriptionPopup((prev) => ({ ...prev, visible: false }));
  };

  const showActivationPopup = () => {
    setSubscriptionPopup({
      visible: true,
      title: "🛡️ Activate Subscription",
      message: (
        <>
          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            <span className="activation-badge">
              ⏱️ Activation Period: <strong>1 YEAR</strong>
            </span>
          </div>
          <p style={{ margin: "12px 0", fontSize: "14px", color: "#4b5563", textAlign: "center" }}>
            A deduction of <strong className="amount-highlight currency1">$100.00</strong> will be made for <br />
            <span className="username-highlight">{userName}'s Account Activation</span>.
          </p>
        </>
      ),
      confirmText: "Yes, Activate",
      cancelText: "Cancel",
      onConfirm: async () => {
        closeSubscriptionPopup();

        // 🔥 Get logged-in user's regno from context
        const loggedInRegNo = loggedInUser?.regno || localStorage.getItem("regno");
        console.log("🔐 Logged-in user regno:", loggedInRegNo);
        console.log("🤖 Bot being activated regno:", userRegNo);

        if (!loggedInRegNo) {
          toast.error("Logged-in user regno not found!");
          return;
        }

        try {
          const response = await apiClient.post("/Dashboard/investment", {
            regno: userRegNo,        // Bot being activated
            rkprice: 100,
            uRegno: loggedInRegNo,   // 🔥 Login user ka regno (from context)
            pkg: "BOT",             // ✅ as requested
            aggrement: ""                   // ✅ empty
          });
          console.log("📥 Activation response:", response);
          if (response.data?.success) {
            toast.success("Subscribed Successfully!");
            setIsBotActive(true);
            await checkUserBotStatus(loginId);
          } else {
            toast.error(response.data?.message || "Activation failed");
          }
        } catch (error) {
          console.error("🔥 Activation error:", error);
          toast.error("Activation failed. Please try again.");
        }
      },
      onCancel: closeSubscriptionPopup,
    });
  };

  const checkUserBotStatus = async (id) => {
    if (!id.trim()) return;
    setLoading(true);
    setHasChecked(false);
    try {
      const res = await apiClient.get(`/User/check-user-bot-status?loginid=${id}`);
      console.log("📥 Bot status response:", res.data);
      if (res.data?.success && res.data.data) {
        setIsValidUser(true);
        setUserName(res.data.data.name);
        const regno = res.data.data.regno;
        localStorage.setItem('userregno', regno)
        console.log("🔢 Extracted regno from API:", regno);
        setUserRegNo(regno);
        const activeStatus = res.data.data.BotStatus > 0;
        setIsBotActive(activeStatus);
      } else {
        setIsValidUser(false);
        setIsBotActive(false);
        setUserName("");
        setUserRegNo(null);
      }
    } catch (error) {
      console.error("Subscription Status Check Error:", error);
      setIsValidUser(false);
      setUserName("");
      setUserRegNo(null);
    } finally {
      setLoading(false);
      setHasChecked(true);
    }
  };

  useEffect(() => {
    if (loginId.trim() === "") {
      setIsBotActive(false);
      setHasChecked(false);
      setIsValidUser(false);
      setUserName("");
      setUserRegNo(null);
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      checkUserBotStatus(loginId);
    }, 800);
    return () => clearTimeout(delayDebounceFn);
  }, [loginId]);

  const handleButtonClick = () => {
    if (!loginId.trim()) {
      toast.error("Please enter User Login ID");
      return;
    }
    if (!isValidUser && hasChecked) {
      toast.error("User ID database does not access!");
      return;
    }
    if (isBotActive) {
      setOpenAgreement(true);
    } else {
      showActivationPopup();
    }
  };

  const renderPopup = () => (
    <div className="popup-overlay" onClick={closeSubscriptionPopup}>
      <div className="popup-container-3d" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header-3d">
          <h3>{subscriptionPopup.title}</h3>
          <button className="close-btn-3d" onClick={closeSubscriptionPopup}>
            &times;
          </button>
        </div>
        <div className="popup-body-3d">
          {typeof subscriptionPopup.message === "string"
            ? <p>{subscriptionPopup.message}</p>
            : subscriptionPopup.message}
        </div>
        <div className="popup-footer-3d">
          <button className="btn-cancel-3d" onClick={subscriptionPopup.onCancel}>
            {subscriptionPopup.cancelText}
          </button>
          <button className="btn-confirm-3d" onClick={subscriptionPopup.onConfirm}>
            {subscriptionPopup.confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="stake-card d-flex gap-3 align-items-center" style={{ marginBottom: "35px" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <input
            type="text"
            className="custom-pay-form form-control"
            placeholder="Enter Login ID"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            style={{ background: "#d9dbf3", padding: "11px"}}
          />
          {loading && (
            <small style={{ position: "absolute", bottom: "-22px", left: "5px", color: "#e67e22", fontSize: "11px" }}>
              Checking database...
            </small>
          )}
          {!loading && hasChecked && isValidUser && (
            <small style={{ position: "absolute", bottom: "-22px", left: "5px", fontSize: "11px", color: isBotActive ? "#27ae60" : "#f39c12", fontWeight: "600", whiteSpace: "nowrap" }}>
              {isBotActive
                ? `✓ Verified: ${userName} (Subs Active)`
                : `✓ Found: ${userName} (Subscription Needed)`}
            </small>
          )}
          {!loading && hasChecked && !isValidUser && (
            <small style={{ position: "absolute", bottom: "-22px", left: "5px", color: "#e74c3c", fontSize: "11px", fontWeight: "bold", whiteSpace: "nowrap", background: "transparent" }}>
              ✖ Invalid Login ID or User not found.
            </small>
          )}
        </div>
        <button
          type="button"
          className="wallet-buttton"
          disabled={loading}
          style={{
            backgroundColor: !isValidUser && hasChecked ? "#95a5a6" : isBotActive ? "#27ae60" : "#6366f1",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            minWidth: "130px",
            cursor: "pointer",
            transition: "0.3s",
          }}
          onClick={handleButtonClick}
        >
          {isBotActive ? "Investment" : "Subscription"}
        </button>
      </div>
      <AgreementForm open={openAgreement} onClose={() => setOpenAgreement(false)} />
      {subscriptionPopup.visible && ReactDOM.createPortal(renderPopup(), document.body)}
    </>
  );
};

export default Stake;