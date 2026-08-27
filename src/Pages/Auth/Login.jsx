import React, { useState, useEffect } from "react";
import { useNavigate, Link, NavLink } from "react-router-dom";
import toast from "react-hot-toast";
import { CgMenuGridR } from "react-icons/cg";
import "../../assets/Css/Auth.css";
import apiClient from "../../api/apiClient";
import { useUser } from "../../context/UserContext";

// Import images (same as Signup)
import signupImage from "../../assets/images/resource/appoinment.png";

const Login = () => {
  const navigate = useNavigate();
  const { loginUser } = useUser(); // from context
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    loginId: "",
    password: "",
    deviceId: "web-browser"
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      loginId: formData.loginId,
      password: formData.password,
      deviceId: formData.deviceId
    };
    try {
      const response = await apiClient.post("/Authentication/login", payload);
      if (response.data.success === true || response.data.statusCode === 200) {
        const user = response.data.data;
        const token = response.data.token;
        loginUser(user, token); // context updates
        toast.success("Login Successful!");
        setTimeout(() => navigate("/dashboard"), 500);
      } else {
        toast.error(response.data.message || "Invalid Login Details");
      }
    } catch (error) {
      console.error("Login Error:", error.response);
      const errorMsg = error.response?.data?.message || "Login Failed: Server Error";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.body.classList.add('loaded');
    return () => document.body.classList.remove('loaded');
  }, []);


  return (
    <>
      <div className="bd-bg">
        <div className="mediic-appoinment">
          <div className="container">
            <div className="row appoinment align-items-center">
              <div className="col-lg-6 signup-left-col">
                <img src={signupImage} alt="Signup Illustration" className="signup-side-image" />
              </div>
              <div className="col-lg-6" data-aos="zoom-in-left">
                <div className="mediic-section-title2">
                  <h4>LOGIN ACCOUNT</h4>
                  <h3 className="cursor-scale small">Login to your account</h3>
                </div>
                <div className="contact-form-box">
                  <form className="auth-form" onSubmit={handleLogin} id="login-form">
                    <div className="row">
                      <div className="col-lg-12 col-md-12">
                        <div className="form-box">
                          <input
                            type="text"
                            name="loginId"
                            placeholder="Login ID*"
                            value={formData.loginId}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-lg-12 col-md-12">
                        <div className="form-box">
                          <input
                            type="password"
                            name="password"
                            placeholder="Password*"
                            value={formData.password}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <p className="signup-footer-text">
                          Forgot password?{" "}
                          <a href="/forgot-password" className="colorr" onClick={(e) => { e.preventDefault(); navigate("/forgotpassword"); }}>
                            Reset Here
                          </a>
                        </p>
                      </div>
                      <div className="col-lg-12">
                        <p className="signup-footer-text">
                          Don't have an account?{" "}
                          <a href="/signup" className="colorr" onClick={(e) => { e.preventDefault(); navigate("/signup"); }}>
                            Create Account
                          </a>
                        </p>
                      </div>
                      <div className="col-lg-12 col-md-6">
                        <div className="submit-button">
                          <button type="submit" className="laboix-btn" disabled={loading}>
                            {loading ? "Logging in..." : "Login Now"} <svg xmlns="http://www.w3.org/2000/svg" width="20" height="17" fill="currentColor" class="bi bi-arrow-return-right" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1.5 1.5A.5.5 0 0 0 1 2v4.8a2.5 2.5 0 0 0 2.5 2.5h9.793l-3.347 3.346a.5.5 0 0 0 .708.708l4.2-4.2a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 8.3H3.5A1.5 1.5 0 0 1 2 6.8V2a.5.5 0 0 0-.5-.5"/></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </>
  );
};

export default Login;