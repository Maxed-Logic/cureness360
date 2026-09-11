import { useEffect, useState } from "react";
import { FaUsers, FaUserPlus } from "react-icons/fa";
import { RiUserSharedFill } from "react-icons/ri";
import 'bootstrap/dist/css/bootstrap.min.css';
import "../../assets/Css/bootstrap.css"
import apiClient from "../../api/apiClient";
import LeveUserCard from "./LeveUserCard";
import '../../assets/dashboardcss/css/Dashboard.css'
import Income from "./income";
import { useUser } from "../../context/UserContext";

const LevelIncome = () => {
  const [open, setOpen] = useState(false);
  const [op, setop] = useState(false);
  const [show, setShow] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [levels, setLevels] = useState([]);
  const { userData } = useUser();

  // 🔥 SCROLL FIX - Lock html, body and all scrollable parents
  useEffect(() => {
    const isAnyModalOpen = open || show || op;
    
    // Find any scrollable parent containers that might still scroll
    const scrollableParents = document.querySelectorAll(
      ".activity-container, .card1-body, .flow-wrapper, .row"
    );

    if (isAnyModalOpen) {
      // Lock html and body
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      
      // Lock each scrollable parent temporarily
      scrollableParents.forEach(el => {
        const computed = getComputedStyle(el);
        if (computed.overflow === "auto" || computed.overflow === "scroll" || computed.overflowY === "auto") {
          el.style.overflow = "hidden";
        }
      });
    } else {
      // Restore everything
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      scrollableParents.forEach(el => {
        el.style.overflow = "";
      });
    }

    // Cleanup on unmount
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      scrollableParents.forEach(el => {
        el.style.overflow = "";
      });
    };
  }, [open, show, op]);


  // Animation control for Team modal
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => setAnimate(true), 50);
      return () => clearTimeout(timer);
    } else {
      setAnimate(false);
    }
  }, [show]);

  //const teamData = levels[0] || {};
const menuItems = [
  { 
    name: "Total Team", 
    icon: <FaUserPlus />, 
    value: userData?.teamcount ?? 0  // ✅ Fixed
  },
  { 
    name: "DirectId", 
    icon: <FaUsers />, 
    value: userData?.directId ?? 0   // ✅ Already fixed
  },
  { 
    name: "Active Team", 
    icon: <FaUsers />, 
    value: userData?.activeteam ?? 0, // ✅ Fixed
    color: "#22C55E"
  },
  { 
    name: "Inactive Team", 
    icon: <RiUserSharedFill />, 
    value: userData?.inactiveteam ?? 0, // ✅ Fixed
    color: "#EF4444"
  }
];
  return (
    <>
      <div className="activity-container col-lg-12 p-3 mb-5">
        <div className="card1 no-animate py-1 custom-card1 rounded_5">
          <div className="card1-body">
            <div className="row">
              <div className="col-lg-6">
                <div className="">
                  <div className="activites">Activities</div>
                  <div className="flow-wrapper d-flex justify-content-center align-items-center">
                    <div className="d-flex align-items-center gap-3">

                      {/* BUSINESS MODAL */}
                      <div className="level-box">
                        <button className={`circle-btn ${open ? "active" : ""}`} onClick={() => { setOpen(true); }}>
                          Business
                        </button>
                        {open && (
                          <>
                            <div className="popup-backdrop" onClick={() => setOpen(false)} />
                            <div className="popup-modal modal-a">
                              <div className="level-counts-wrapper">
                                <button className="close-btn-line" onClick={() => setOpen(false)}>✕</button>
                                <div className="coins">

                                    <div className="level-card">
                                    <span className="stext">Invest Business</span>
                                    <span>${userData?.MiningTeamBusiness || 0}</span>
                                  </div>
                                  <div className="level-card">
                                    <span className="stext">Strong/Weaker Leg</span>
                                    <span>{userData?.strongLeg} / {userData?.weakerLeg}</span>
                                  </div>
                                  <div className="level-card">
                                    <span className="stext">Team Carryforward</span>
                                    <span>{userData?.leftCarry} / {userData?.rightCarry || 0}</span>
                                  </div>
                                  <div className="level-card">
                                    <span className="stext">Current Month Business</span>
                                    <span> ${userData?.LeftPerMonth} / {userData?.RightPerMonth}</span>
                                  </div>
                                  <div className="level-card">
                                    <span className="stext">Total Overall Business</span>
                                    <span>${userData?.LeftBusiness} / {userData?.RightBusiness}</span>
                                  </div>
                                </div>
                              </div>
                              <button className={`circle-btn1 ${open ? "active" : ""}`} onClick={() => setOpen(true)}>
                                Business
                              </button>
                              <div>
                                <svg className="lines">
                                  <line x1="140" y1="200" x2="400" y2="95" />
                                  <line x1="140" y1="200" x2="400" y2="150" />
                                  <line x1="140" y1="200" x2="400" y2="205" />
                                  <line x1="140" y1="200" x2="400" y2="260" />
                                  <line x1="140" y1="200" x2="400" y2="315" />
                                </svg>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {/* TEAM MODAL */}
                      <div className="team-box">
                        <button className={`circle-btn ${show ? "active" : ""}`} onClick={() => setShow(true)}>
                          Team
                        </button>
                        {show && (
                          <>
                            <div className="popup-backdrop" onClick={() => setShow(false)} />
                            <div className="popup-modal">
                              <button className="close-btn1" onClick={() => setShow(false)}>✕</button>
                              <div className="menu-container">
                                <div className={`ring-menu ${animate ? "open" : ""}`}>
                                  {menuItems.map((item, index) => (
                                    <div key={index} className="menu-item" style={{ "--i": index }}>
                                      <div className="icon">{item.icon}</div>
                                      <div className="text1">
                                        <h4>{item.name}</h4>
                                        {item.value !== undefined && <p>{item.value}</p>}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <button className="circle-btn2">Team</button>
                            </div>
                          </>
                        )}
                      </div>

                      {/* INCOME MODAL */}
                      <div className="income-box text-center">
                        <button className="circle-btn" onClick={() => setop(true)}>
                          Income
                        </button>
                        {op && (
                          <>
                            <div className="popup-backdrop" onClick={() => setop(false)} />
                            <div className="popup-modal">
                              <button className="close-btn" onClick={() => setop(false)}>✕</button>
                              <Income op={op} setop={setop} />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-6 p-0">
                <LeveUserCard />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LevelIncome;