import { useState } from "react";
import {
  FaWallet,
  FaCopy,
  FaInstagram,
  FaFacebookF,
  FaWhatsapp,
  FaTelegramPlane,
} from "react-icons/fa";
import { useUser } from "../../context/UserContext";
import { MdAccountBalance } from "react-icons/md";


const ProUserCard = () => {
  const { userData } = useUser();
  const [copied, setCopied] = useState(false);

  const baseUrl = "https://cureness360.com/";
  const referralLink = userData?.me
    ? `${baseUrl}signup?ref=${userData.me}`
    : baseUrl;



  // FIXED: Copy referral link to clipboard with fallback method
  const handleCopy = async () => {
    try {
      // Try using the modern Clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback method for non-HTTPS or older browsers
        const textArea = document.createElement("textarea");
        textArea.value = referralLink;

        // Make the textarea out of viewport
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);

        textArea.focus();
        textArea.select();

        try {
          const successful = document.execCommand('copy');
          if (successful) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } else {
            // If copy fails, show the link in an alert
            alert("Copy this link: " + referralLink);
          }
        } catch (err) {
          console.error('Copy failed:', err);
          alert("Copy this link: " + referralLink);
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (err) {
      console.error('Copy failed:', err);
      // Ultimate fallback - show alert with link
      alert("Copy this link: " + referralLink);
    }
  };

  return (
    <div className="pro-card">
      {/* ========== TOP BAR ========== */}
      <div className="top-bar">
        <div className="user-left">
          <div>
            <span className="role">Pro Member</span>
          </div>
        </div>
        <div className="mint-box">
          <MdAccountBalance />
        </div>
      </div>

      {/* ========== WALLET SECTION ========== */}
      <div className="wallet-strip">
        <FaWallet className="mt-2" />
        <div>
          <span>Total Wallet Balance</span>
          <div className="card-Balance currency1" data-value={userData?.Depositfund || 0}>
            ${userData?.Depositfund || 0}
          </div>
        </div>
      </div>

      {/* ========== REFERRAL + SHARE SECTION ========== */}
      <div className="bottom-section">
        {/* Referral link box */}
        <div className="referral-box">
          <label className="refer-link">Referral Link</label>
          <div className="referral-input">
            <input value={referralLink} readOnly />
            <button onClick={handleCopy}>
              {copied ? "Copied" : <FaCopy />}
            </button>
          </div>
        </div>

        {/* Social share box */}
        <div className="share-box">
          <p>Share with others</p>
          <div className="social-icons">
            <span
              className="ig"
              onClick={() =>
                window.open(
                  `https://www.instagram.com/sharer/?u=${encodeURIComponent(
                    referralLink
                  )}`,
                  "_blank"
                )
              }
            >
              <FaInstagram />
            </span>

            {/* Facebook - opens share dialog */}
            <span
              className="fb"
              onClick={() =>
                window.open(
                  `https://www.facebook.com/#/?u=${encodeURIComponent(
                    referralLink
                  )}`,
                  "_blank"
                )
              }
            >
              <FaFacebookF />
            </span>

            {/* WhatsApp - opens WhatsApp with prefilled message */}
            <span
              className="wa"
              onClick={() =>
                window.open(
                  `https://wa.me/?text=${encodeURIComponent(
                    "Join using my referral link: " + referralLink
                  )}`,
                  "_blank"
                )
              }
            >
              <FaWhatsapp />
            </span>

            {/* Telegram - share URL dialog */}
            <span
              className="tg"
              onClick={() =>
                window.open(
                  `https://t.me/share/url?url=${encodeURIComponent(
                    referralLink
                  )}&text=${encodeURIComponent(
                    "Join using my referral link"
                  )}`,
                  "_blank"
                )}
            >
              <FaTelegramPlane />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProUserCard;