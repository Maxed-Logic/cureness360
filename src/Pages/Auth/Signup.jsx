import React, { useState, useEffect } from "react";
import { useNavigate, Link, NavLink } from "react-router-dom";
import toast from "react-hot-toast";
import { CgMenuGridR } from "react-icons/cg";
import { FaCopy, FaCheck, FaUser, FaEnvelope, FaIdCard } from "react-icons/fa";
import "../../assets/Css/Auth.css";
import apiClient from "../../api/apiClient";

// Images

import signupImage from "../../assets/images/resource/appoinment.png";

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);

  // ADD THESE STATES - YEH MISSING THA
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  const [formData, setFormData] = useState({
    introRegNo: "",
    referrer_Id: "",
    sponsorName: "",
    fName: "",
    lName: " ",
    mobile: "",
    email: "",
    password: "",
    address: "India",
    private_Key: "N/A",
    affiliate_Level: 0,
    referrer: "",
    country: 91,
    introSide: "L",
  });

  // ========== 1. URL SE REF PARAM READ KARO AUR SPONSOR ID SET KARO ==========
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get("ref");

    if (refCode && !formData.referrer_Id) {
      setFormData(prev => ({
        ...prev,
        referrer_Id: refCode,
        introRegNo: refCode,
      }));
    }
  }, []);

  // 🔥 Check if sponsor is valid
  const isSponsorValid = formData.sponsorName &&
    formData.sponsorName !== "Invalid Sponsor" &&
    formData.sponsorName !== "Not Found" &&
    formData.sponsorName !== "";

  // 🔥 Check if form is complete
  const isFormComplete = formData.fName &&
    formData.email &&
    formData.mobile &&
    formData.password &&
    formData.mobile.length === 10;

  // ========== 2. JAB SPONSOR ID CHANGE HO, SPONSOR NAME FETCH KARO ==========
  useEffect(() => {
    const fetchSponsor = async () => {
      const loginId = formData.referrer_Id;
      if (loginId) {
        try {
          const res = await apiClient.get(`/User/check-user?loginid=${loginId}`);
          if (res.data?.success && res.data.data) {
            const sponsor = res.data.data.Name;
            const regno = res.data.data.regno;
            setFormData(prev => ({
              ...prev,
              sponsorName: sponsor,
              introRegNo: regno,
            }));
          } else {
            setFormData(prev => ({ ...prev, sponsorName: "Invalid Sponsor", introRegNo: "" }));
          }
        } catch (err) {
          console.error("Sponsor fetch error:", err);
          setFormData(prev => ({ ...prev, sponsorName: "Not Found", introRegNo: "" }));
        }
      } else {
        setFormData(prev => ({ ...prev, sponsorName: "", introRegNo: "" }));
      }
    };
    const timer = setTimeout(fetchSponsor, 500);
    return () => clearTimeout(timer);
  }, [formData.referrer_Id]);



  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      // 🔥 Jab introRegNo change ho toh dono fields update karo
      if (name === "introRegNo") {
        return {
          ...prev,
          introRegNo: value,
          referrer_Id: value,    // ✅ Dono ko sync karo
        };
      }
      return { ...prev, [name]: value };
    });
  };
  // ADD COPY FUNCTION
  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${field} copied!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // ADD MODAL CLOSE FUNCTION
  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigate("/dashboard");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!formData.sponsorName || formData.sponsorName === "Invalid Sponsor") {
      toast.error("Valid Sponsor ID daalein!");
      return;
    }
    setLoading(true);
    const payload = {
      IntroRegNo: formData.introRegNo,
      IntroSide: formData.introSide,
      FName: formData.fName,
      LName: formData.lName,
      Mobile: formData.mobile,
      Email: formData.email,
      LoginId: "###",
      Password: formData.password,
      Address: formData.address,
      Country: formData.country,
      Referrer: formData.referrer,
      Created_At: new Date().toISOString(),
      Private_Key: formData.private_Key,
      Affiliate_Level: formData.affiliate_Level,
      Referrer_Id: formData.referrer_Id,
    };

    // console.log("signup",payload)
    try {
      const response = await apiClient.post("/Authentication/register", payload);
      if (response.data.success === true || response.status === 200) {
        const userData = response.data.data;
        sessionStorage.setItem("token", response.data.token || "authenticated_via_signup");
        sessionStorage.setItem("user", JSON.stringify(userData));
        sessionStorage.setItem("regno", userData.Regno);
        sessionStorage.setItem("isLoggedIn", "true");

        // SET REGISTERED USER FOR MODAL - YEH IMPORTANT THA
        setRegisteredUser({
          regno: userData.Regno,
          loginId: userData.LoginId || userData.loginid || formData.mobile,
          name: userData.Name || formData.fName,
          email: userData.Email || formData.email,
          mobile: userData.Mobile || formData.mobile,
          sponsorId: formData.referrer_Id,
          sponsorName: formData.sponsorName,
          password: formData.password,
        });

        // SHOW MODAL - REDIRECT HATAYA
        setShowSuccessModal(true);
        toast.success("Registration Successful!");

        // NO NAVIGATE HERE - MODAL SHOW KARO
        // setTimeout(() => navigate("/dashboard"), 800); // YE HATANA HAI
      } else {
        toast.error(response.data.message || "Registration Failed");
      }
    } catch (error) {
      console.error("Signup Error:", error);
      toast.error(error.response?.data?.message || "Server Error");
    } finally {
      setLoading(false);
    }
  };

  // Scroll effects
  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.classList.add("loaded");
    return () => document.body.classList.remove("loaded");
  }, []);

  useEffect(() => {
    if (isSearchActive) {
      document.body.classList.add("search-active");
    } else {
      document.body.classList.remove("search-active");
    }
  }, [isSearchActive]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setIsSearchActive(false);
      if (e.key === "Escape" && showSuccessModal) setShowSuccessModal(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [showSuccessModal]);

  return (
    <>
      {/* Signup Form */}
      <div className="mediic-appoinment">
        <div className="container">
          <div className="row appoinment">
            <div className="col-lg-6 signup-left-col">
              <img src={signupImage} alt="Signup Illustration" className="signup-side-image" />
            </div>
            <div className="col-lg-6">
              <div className="mediic-section-title22">
                <h4>SIGNUP ACCOUNT</h4>
                <h3 className="Sign-text">Sign up to your account</h3>
              </div>
              <div className="contact-form-box">
                <form onSubmit={handleSignup}>
                  <div className="row">
                    <div className="col-lg-12">
                      <div className="form-box">
                        <input type="text" name="introRegNo" placeholder="Sponsor ID*" value={formData.referrer_Id} onChange={handleChange} required />
                      </div>
                    </div>
                    <div className="col-lg-12">
                      <div className="form-box">
                        <input type="text" value={formData.sponsorName} readOnly placeholder="Sponsor Name" className="readonly-input" style={{ color: "#008202", fontWeight: "600" }} />
                      </div>
                    </div>
                    <div className="col-lg-12">
                      <div className="form-box">
                        <input type="text" name="fName" placeholder="Full Name*" value={formData.fName} onChange={handleChange} required />
                      </div>
                    </div>
                    <div className="col-lg-12">
                      <div className="form-box">
                        <input type="email" name="email" placeholder="Email Address*" value={formData.email} onChange={handleChange} required />
                      </div>
                    </div>
                    <div className="col-lg-12">
                      <div className="form-box d-flex" style={{ gap: "10px" }}>
                        <div className="mt-3">
                          <span style={{ padding: "20px 20px", background: "#f0f0f0", borderRadius: "15px" }}>+91</span></div>
                        <input type="text" name="mobile" placeholder="Mobile Number*" maxLength="10" value={formData.mobile} onChange={handleChange} required style={{ flex: 1 }} />
                      </div>
                    </div>
                    <div className="col-lg-12">
                      <div className="form-box">
                        <input type="password" name="password" placeholder="Create Password*" value={formData.password} onChange={handleChange} required />
                      </div>
                    </div>
                    <div className="col-lg-12">
                      <p className="signup-footer-text">
                        Already have an account? <a href="/login" className="colorr" onClick={(e) => { e.preventDefault(); navigate("/login"); }}>Login Here</a>
                      </p>
                    </div>
                    <div className="col-lg-12">

                      <button
                        type="submit"
                        className="laboix-btn"
                        disabled={loading || !isSponsorValid || !isFormComplete}
                        style={{
                          opacity: (!isSponsorValid || !isFormComplete) ? 0.6 : 1,
                          cursor: (!isSponsorValid || !isFormComplete) ? "not-allowed" : "pointer"
                        }}
                      >
                        {loading ? "Creating Account..." : "Signup Now"} <svg xmlns="http://www.w3.org/2000/svg" width="20" height="17" fill="currentColor" class="bi bi-arrow-return-right" viewBox="0 0 16 16"> <path fill-rule="evenodd" d="M1.5 1.5A.5.5 0 0 0 1 2v4.8a2.5 2.5 0 0 0 2.5 2.5h9.793l-3.347 3.346a.5.5 0 0 0 .708.708l4.2-4.2a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 8.3H3.5A1.5 1.5 0 0 1 2 6.8V2a.5.5 0 0 0-.5-.5" /></svg>
                      </button>

                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal - YEH ANDAR AAYEGA RETURN KE */}
      {showSuccessModal && registeredUser && (
        <div className="modal-overlay" onClick={handleModalClose}>
          <div className="success-modal02" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header02">
              <div className="success-icon02">✓</div>
              <div className="Registration-text">Registration Successfully</div>
              <button className="modal-close02" onClick={handleModalClose}>×</button>
            </div>

            <div className="modal-body02">


              <div className="user-details-card02">
                <div className="Account-text"><FaIdCard /> Your Account Details</div>


                <div className="detail-row02">
                  <div className="detail-label02">
                    <FaUser /> Sponsor ID:
                  </div>
                  <div className="detail-value02">
                    {registeredUser.sponsorId}
                    <button className="copy-btn02" onClick={() => handleCopy(registeredUser.sponsorId, "Sponsor ID")}>
                      {copiedField === "Sponsor ID" ? <FaCheck /> : <FaCopy />}
                    </button>
                  </div>
                </div>

                <div className="detail-row02">
                  <div className="detail-label02">
                    <FaUser /> Sponsor Name:
                  </div>
                  <div className="detail-value02">
                    {registeredUser.sponsorName}
                  </div>
                </div>

                <div className="detail-row02">
                  <div className="detail-label02">
                    <FaUser /> Login ID:
                  </div>
                  <div className="detail-value02">
                    {registeredUser.loginId || registeredUser.mobile}
                    <button className="copy-btn02" onClick={() => handleCopy(registeredUser.loginId || registeredUser.mobile, "Login ID")}>
                      {copiedField === "Login ID" ? <FaCheck /> : <FaCopy />}
                    </button>
                  </div>
                </div>

                <div className="detail-row02">
                  <div className="detail-label02">
                    <FaEnvelope /> Email:
                  </div>
                  <div className="detail-value02">
                    {registeredUser.email}
                    <button className="copy-btn02" onClick={() => handleCopy(registeredUser.email, "Email")}>
                      {copiedField === "Email" ? <FaCheck /> : <FaCopy />}
                    </button>
                  </div>
                </div>


              </div>

              <div className="modal-actions02">
                <Link to="/login">
                  <button className="btn-dashboard02" onClick={handleModalClose}>
                    LOGIN
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Signup;