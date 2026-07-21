import React, { useState, useRef, useEffect } from "react";
import { FaHome, FaKey, FaLockOpen, FaSignOutAlt, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../context/UserContext";
import "../../../assets/dashboardcss/css/Dashboard.css";
import { MdSupportAgent } from "react-icons/md";

// ✅ Currency Configuration
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

const Header = () => {
  const navigate = useNavigate();
  const { logoutUser } = useUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ✅ Currency State
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    return localStorage.getItem("selectedCurrency") || "USD";
  });

  // ✅ Function to change currency
  const changeCurrency = (currency) => {
    localStorage.setItem("selectedCurrency", currency);
    
    document.querySelectorAll(".currency1").forEach(function(el) {
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
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('currencyChanged', { detail: currency }));
  };

  // ✅ Handle currency change
  const handleCurrencyChange = (e) => {
    const newCurrency = e.target.value;
    setSelectedCurrency(newCurrency);
    changeCurrency(newCurrency);
  };

  // ✅ Toggle dropdown function
  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // ✅ Initialize currency on mount
  useEffect(() => {
    let savedCurrency = localStorage.getItem("selectedCurrency") || "USD";
    setSelectedCurrency(savedCurrency);
    
    setTimeout(() => {
      changeCurrency(savedCurrency);
    }, 100);
  }, []);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logoutUser();
    navigate("/");
  };

  return (
    <header className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px' }}>
    
      <div className="left" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <FaHome className="Dasboard-icon" style={{ cursor: 'pointer' }} />
        <h4>Dashboard</h4>
      </div>
 
      {/* Dropdown Container */}
      <div className="right" ref={dropdownRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '15px' }}>
        
        {/* ✅ Currency Dropdown - SIRF YEH ADD KIYA HAI */}
        <select 
          value={selectedCurrency}
          onChange={handleCurrencyChange}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            cursor: 'pointer',
            fontSize: '14px',
            backgroundColor: '#fff',
            outline: 'none'
          }}
        >
          <option value="USD">USDT ($)</option>
          <option value="INR">INR (₹)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
        </select>

        <button
          className="logout-btn"
          onClick={toggleDropdown}
          style={{
            background: "linear-gradient(to right, var(--primary-clr), var(--secondary-clr))",
            border: 'none',
            cursor: 'pointer',
            padding: '10px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <FaUser fontSize={"22px"} />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '10px',
              background: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              minWidth: '180px',
              zIndex: 9999,
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
              animation: 'dropdownOpen 0.2s ease-out'
            }}
          >
            {/* Profile */}
            <div
              onClick={() => {
                setIsDropdownOpen(false);
                navigate("/dashboard/profile");
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#e2e8f0";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#f8fafc";
              }}
              style={{
                padding: '12px 16px',
                backgroundColor: '#f8fafc',
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              <p style={{
                margin: 0,
                fontWeight: '500',
                fontSize: '14px',
                color: '#1e293b',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FaUser /> Profile
              </p>
            </div>

            {/* Change Password */}
            <div
              onClick={() => {
                setIsDropdownOpen(false);
                navigate("/dashboard/changepassword");
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#e2e8f0";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#f8fafc";
              }}
              style={{
                padding: '12px 16px',
                backgroundColor: '#f8fafc',
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              <p style={{
                margin: 0,
                fontWeight: '500',
                fontSize: '14px',
                color: '#1e293b',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FaLockOpen /> Change Password
              </p>
            </div>

            {/* Active With ePin */}
            <div
              onClick={() => {
                setIsDropdownOpen(false);
                navigate("/dashboard/epin");
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#e2e8f0";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#f8fafc";
              }}
              style={{
                padding: '12px 16px',
                backgroundColor: '#f8fafc',
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              <p style={{
                margin: 0,
                fontWeight: '500',
                fontSize: '14px',
                color: '#1e293b',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FaKey /> Active With ePin
              </p>
            </div>

            {/* Support */}
            <div
              onClick={() => {
                setIsDropdownOpen(false);
                navigate("/dashboard/Support");
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#e2e8f0";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#f8fafc";
              }}
              style={{
                padding: '12px 16px',
                backgroundColor: '#f8fafc',
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              <p style={{
                margin: 0,
                fontWeight: '500',
                fontSize: '14px',
                color: '#1e293b',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <MdSupportAgent size={16} /> Support
              </p>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: 'none',
                background: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '14px',
                color: '#ef4444',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => e.target.style.background = '#fef2f2'}
              onMouseLeave={(e) => e.target.style.background = 'white'}
            >
              <FaSignOutAlt size={16} />
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Simple Animation Keyframes */}
      <style>{`
        @keyframes dropdownOpen {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

    </header>
  );
};

export default Header;