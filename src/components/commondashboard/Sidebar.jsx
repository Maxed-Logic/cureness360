import React, { useState, useEffect, useRef } from "react";
import {
  FaUsers,
  FaThLarge,
  FaChartBar,
  FaUndo,
  FaGift,
} from "react-icons/fa";
import { IoWalletSharp } from "react-icons/io5";
import { FaPlus} from "react-icons/fa6";
import { HiIdentification } from "react-icons/hi2";
import { AiOutlineLogout } from "react-icons/ai";
import { RiP2pFill } from "react-icons/ri";
import { PiTreeView, PiHandWithdrawBold } from "react-icons/pi";
import { useNavigate, useLocation } from "react-router-dom";
import { MdSupportAgent } from "react-icons/md";
import logo from "../../assets/images/logo.png"
import "../../assets/dashboardcss/css/Dashboard.css";

const menuItems = [
  { icon: <FaThLarge />, title: "Dashboard", path: "/dashboard" },
  { icon: <HiIdentification/> , title: "Update KYC", path: "/dashboard/UpdateKyc" },
  { icon: <IoWalletSharp/>, title: "Income", path: "/dashboard/accstatement" },
  { icon: <FaUsers />, title: "Downline", path: "/dashboard/downline-team" },
  { icon: <PiTreeView />, title: "Tree View", path: "/dashboard/TreeView" },
  { icon: <RiP2pFill />, title: "P2P", path: "/dashboard/deposit2deposit" },
  { icon: <FaChartBar />, title: "Royalty", path: "/dashboard/Royalty" },
  { icon: <FaGift/>, title: "Rewards", path: "/dashboard/rewards" },
  { icon: <PiHandWithdrawBold />, title: "Capital W", path: "/dashboard/CapitalWithdrawalRequest" },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const floatingRef = useRef(null);

  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const handleNavigate = (path) => {
    navigate(path);
    closeMenu();
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
    window.location.reload();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpen && floatingRef.current && !floatingRef.current.contains(event.target) && !event.target.closest(".center-btn")) {
        closeMenu();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="pro-sidebar">
          {/* Logo - Top Center */}
          <div className="pro-sidebar-header">
            <img src={logo} className="dashboard-logo" alt="logo"/>
          </div>
          
          {/* Menu Items - Center with scroll if needed but hidden scrollbar */}
          <div className="pro-menu-wrapper">
            <ul className="pro-menu">
              {menuItems.map((item, index) => (
                <li
                  key={index}
                  className={`pro-item ${location.pathname === item.path ? "active" : ""}`}
                  onClick={() => navigate(item.path)}
                  title={item.title}
                >
                  <div className="menu-icon">{item.icon}</div>
                  <span className="menu-label">{item.title}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Logout Button - Bottom Center */}
          <div className="sidebar-logout-wrapper">
            <div 
              className="pro-item logout-item"
              onClick={handleLogout}
              title="Logout"
            >
              <AiOutlineLogout className="logout-icon" />
              <span className="menu-label logout-text">Logout</span>
            </div>
          </div>
        </aside>
      )}

      {/* Mobile Bottom Navbar */}
      {isMobile && (
        <div className="mobile-bottom-nav">
          <div
            className={`pro-item ${location.pathname === "/dashboard" ? "active" : ""}`}
            onClick={() => handleNavigate("/dashboard")}
          >
            <FaThLarge />
            <span className="nav-text">Dashboard</span>
          </div>

          <div
            className={`pro-item ${location.pathname === "/dashboard/downline-team" ? "active" : ""} me-5`}
            onClick={() => handleNavigate("/dashboard/downline-team")}
          >
            <FaUsers />
            <span className="nav-text">Team</span>
          </div>

          <div ref={floatingRef} className={`floating-menu ${menuOpen ? "show" : ""}`}>
            <div
              className={`float-icon ${location.pathname === "/dashboard/deposit2deposit" ? "active" : ""}`}
              onClick={() => handleNavigate("/dashboard/deposit2deposit")}
            >
              <RiP2pFill />
              <span className="float-text">P2P</span>
            </div>
            <div
              className={`float-icon ${location.pathname === "/dashboard/Royalty" ? "active" : ""}`}
              onClick={() => handleNavigate("/dashboard/Royalty")}
            >
              <FaChartBar />
              <span className="float-text">Royalty</span>
            </div>
            <div
              className={`float-icon ${location.pathname === "/dashboard/rewards" ? "active" : ""}`}
              onClick={() => handleNavigate("/dashboard/rewards")}
            >
              <FaUndo />
              <span className="float-text">Rewards</span>
            </div>
            <div
              className={`float-icon ${location.pathname === "/dashboard/UpdateKyc" ? "active" : ""}`}
              onClick={() => handleNavigate("/dashboard/UpdateKyc")}
            >
              <HiIdentification />
              <span className="float-text">Update KYC</span>
            </div>
            <div
              className={`float-icon ${location.pathname === "/dashboard/accstatement" ? "active" : ""}`}
              onClick={() => handleNavigate("/dashboard/accstatement")}
            >
              <IoWalletSharp/>
              <span className="float-text">Income statment</span>
            </div>
          </div>
          
          <div className={`center-btn ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(!menuOpen)}>
            <button 
              className="modal-close01" 
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#ffffff',
                fontSize: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                margin: 0,
                width: 'auto',
                height: 'auto',
                transform: menuOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                transition: 'transform 0.35s ease'
              }}
            >
              <FaPlus />
            </button>
          </div>

          <div
            className={`pro-item ${location.pathname === "/dashboard/capitalpayout" ? "active" : ""}`}
            onClick={() => handleNavigate("/dashboard/CapitalWithdrawalRequest")}
          >
            <PiHandWithdrawBold />
            <span className="nav-text" style={{ whiteSpace: 'nowrap'  }}>
              Capital Withdraw
            </span>
          </div>

          <div
            className={`pro-item ${location.pathname === "/dashboard/TreeView" ? "active" : ""}`}
            onClick={() => handleNavigate("/dashboard/TreeView")}
          >
            <PiTreeView />
            <span className="nav-text">Tree</span>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;