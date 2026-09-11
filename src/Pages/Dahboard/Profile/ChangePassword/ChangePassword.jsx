import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiClient from '../../../../api/apiClient';
import './ChangePassword.css';

const ChangePassword = () => {
  // ✅ Get both loginid and regno from sessionStorage
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const regno = sessionStorage.getItem('regno');
  const loginid = user?.loginid;

  // State for Login Password Change
  const [loginOtp, setLoginOtp] = useState('');
  const [loginCurrentPassword, setLoginCurrentPassword] = useState('');
  const [loginNewPassword, setLoginNewPassword] = useState('');
  const [loginConfirmPassword, setLoginConfirmPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginOtpSent, setLoginOtpSent] = useState(false);
  const [loginOtpVerified, setLoginOtpVerified] = useState(false);
  const [loginSendingOtp, setLoginSendingOtp] = useState(false);
  const [loginVerifyingOtp, setLoginVerifyingOtp] = useState(false);

  // State for Master Password Change
  const [masterOtp, setMasterOtp] = useState('');
  const [masterNewPassword, setMasterNewPassword] = useState('');
  const [masterConfirmPassword, setMasterConfirmPassword] = useState('');
  const [masterLoginPassword, setMasterLoginPassword] = useState('');
  const [masterLoading, setMasterLoading] = useState(false);
  const [masterOtpSent, setMasterOtpSent] = useState(false);
  const [masterOtpVerified, setMasterOtpVerified] = useState(false);
  const [masterSendingOtp, setMasterSendingOtp] = useState(false);
  const [masterVerifyingOtp, setMasterVerifyingOtp] = useState(false);

  // Toast functions
  const showSuccess = (msg) => toast.success(msg, { position: "top-right", autoClose: 3000, theme: "colored" });
  const showError = (msg) => toast.error(msg, { position: "top-right", autoClose: 4000, theme: "colored" });
  const showInfo = (msg) => toast.info(msg, { position: "top-right", autoClose: 3000, theme: "colored" });

  // ========== SEND OTP (Login) ==========
  const handleLoginSendOtp = async () => {
    if (loginSendingOtp || loginOtpSent) return;

    setLoginSendingOtp(true);
    try {
      // ✅ Both parameters required
      const response = await apiClient.post(`/User/genrate-otp?loginid=${loginid}&regno=${regno}`, {});

      if (response.data.success || response.data.status === 'success') {
        showSuccess(response.data.message || 'OTP sent successfully!');
        setLoginOtpSent(true);
      } else {
        showError(response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      const msg = error.response?.data?.message;
      showError(msg);
    } finally {
      setLoginSendingOtp(false);
    }
  };

  // ========== VERIFY OTP (Login) ==========
  const handleLoginVerifyOtp = async () => {
    if (loginVerifyingOtp || loginOtpVerified) return;

    if (!loginOtp) {
      showError('Please enter OTP');
      return;
    }

    setLoginVerifyingOtp(true);
    try {
      // ✅ Both parameters required
      const response = await apiClient.post('/User/verify-otp', null, {
        params: { loginid, regno, otp: loginOtp }
      });

      if (response.data.success) {
        setLoginOtpVerified(true);
        showSuccess(response.data.message || 'OTP verified successfully!');
      } else {
        showError(response.data.message || 'Invalid OTP');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Network error';
      showError(msg);
    } finally {
      setLoginVerifyingOtp(false);
    }
  };

  // ========== UPDATE LOGIN PASSWORD ==========
  const handleLoginUpdatePassword = async () => {
    if (loginLoading) return;

    if (!loginOtpVerified) {
      showError('Please verify OTP first');
      return;
    }
    if (!loginCurrentPassword) {
      showError('Please enter current password');
      return;
    }
    if (loginNewPassword !== loginConfirmPassword) {
      showError('New password and confirm password do not match');
      return;
    }
    if (loginNewPassword.length < 8) {
      showError('Password must be at least 8 characters');
      return;
    }

    setLoginLoading(true);
    try {
      // ✅ Update password mein sirf regno aur passwords chahiye
      const response = await apiClient.post('/User/update-password', {
        regno: Number(regno),
        current_password: loginCurrentPassword,
        new_password: loginNewPassword,
        confirm_password: loginConfirmPassword
      });

      if (response.data.success) {
        showSuccess(response.data.message || 'Login password updated successfully!');

        setLoginOtp('');
        setLoginCurrentPassword('');
        setLoginNewPassword('');
        setLoginConfirmPassword('');
        setLoginOtpSent(false);
        setLoginOtpVerified(false);
      } else {
        showError(response.data.message || 'Password update failed');
      }
    } catch (error) {
      let errorMsg = 'Failed to update password';
      if (error.response?.data?.message) {
        if (Array.isArray(error.response.data.message)) {
          errorMsg = error.response.data.message.join(', ');
        } else {
          errorMsg = error.response.data.message;
        }
      }
      showError(errorMsg);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLoginCancel = () => {
    setLoginOtp('');
    setLoginCurrentPassword('');
    setLoginNewPassword('');
    setLoginConfirmPassword('');
    setLoginOtpSent(false);
    setLoginOtpVerified(false);
    showInfo('Login password change cancelled');
  };

  // ========== SEND OTP (Master) ==========
  const handleMasterSendOtp = async () => {
    if (masterSendingOtp || masterOtpSent) return;

    if (!regno) {
      showError('Registration number not found.');
      return;
    }

    setMasterSendingOtp(true);
    try {
      // ✅ Both parameters required
      const response = await apiClient.post(`/User/genrate-otp?loginid=${loginid}&regno=${regno}`, {});

      if (response.data.success || response.data.status === 'success') {
        showSuccess(response.data.message || 'OTP sent successfully!');
        setMasterOtpSent(true);
      } else {
        showError(response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Network error';
      showError(msg);
    } finally {
      setMasterSendingOtp(false);
    }
  };

  // ========== VERIFY OTP (Master) ==========
  const handleMasterVerifyOtp = async () => {
    if (masterVerifyingOtp || masterOtpVerified) return;

    if (!masterOtp) {
      showError('Please enter OTP');
      return;
    }

    setMasterVerifyingOtp(true);
    try {
      // ✅ Both parameters required
      const response = await apiClient.post('/User/verify-otp', null, {
        params: { loginid, regno, otp: masterOtp }
      });

      if (response.data.success) {
        setMasterOtpVerified(true);
        showSuccess(response.data.message || 'OTP verified successfully!');
      } else {
        showError(response.data.message || 'Invalid OTP');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Network error';
      showError(msg);
    } finally {
      setMasterVerifyingOtp(false);
    }
  };

  // ========== UPDATE MASTER PASSWORD ==========
  const handleMasterUpdatePassword = async () => {
    if (masterLoading) return;

    if (!masterOtpVerified) {
      showError('Please verify OTP first');
      return;
    }
    if (masterNewPassword !== masterConfirmPassword) {
      showError('New master password and confirm password do not match');
      return;
    }
    if (masterNewPassword.length < 8) {
      showError('Master password must be at least 8 characters');
      return;
    }
    if (!masterLoginPassword) {
      showError('Please enter login password for verification');
      return;
    }

    setMasterLoading(true);
    try {
      // ✅ Update master password mein sirf regno, passwords aur otp chahiye
      const response = await apiClient.post('/User/update-master-password', {
        regno: Number(regno),
        current_password: masterLoginPassword,
        new_password: masterNewPassword,
        confirm_password: masterConfirmPassword,
        otp: masterOtp
      });

      if (response.data.success) {
        showSuccess(response.data.message || 'Master password updated successfully!');

        setMasterOtp('');
        setMasterNewPassword('');
        setMasterConfirmPassword('');
        setMasterLoginPassword('');
        setMasterOtpSent(false);
        setMasterOtpVerified(false);
      } else {
        showError(response.data.message || 'Master password update failed');
      }
    } catch (error) {
      let errorMsg = 'Failed to update master password';
      if (error.response?.data?.message) {
        if (Array.isArray(error.response.data.message)) {
          errorMsg = error.response.data.message.join(', ');
        } else {
          errorMsg = error.response.data.message;
        }
      }
      showError(errorMsg);
    } finally {
      setMasterLoading(false);
    }
  };

  const handleMasterCancel = () => {
    setMasterOtp('');
    setMasterNewPassword('');
    setMasterConfirmPassword('');
    setMasterLoginPassword('');
    setMasterOtpSent(false);
    setMasterOtpVerified(false);
    showInfo('Master password change cancelled');
  };

  // Button disable conditions
  const isLoginSendOtpDisabled = loginSendingOtp || loginOtpSent;
  const isLoginVerifyOtpDisabled = loginVerifyingOtp || loginOtpVerified || !loginOtp;
  const isLoginUpdateDisabled = loginLoading || !loginOtpVerified || !loginCurrentPassword || !loginNewPassword || !loginConfirmPassword || loginNewPassword !== loginConfirmPassword || loginNewPassword.length < 8;

  const isMasterSendOtpDisabled = masterSendingOtp || masterOtpSent;
  const isMasterVerifyOtpDisabled = masterVerifyingOtp || masterOtpVerified || !masterOtp;
  const isMasterUpdateDisabled = masterLoading || !masterOtpVerified || !masterNewPassword || !masterConfirmPassword || !masterLoginPassword || masterNewPassword !== masterConfirmPassword || masterNewPassword.length < 8;

  return (
    <>
      <ToastContainer />
      <div className="password-container mb-5">
        {/* Change Login Password Section */}
        <div className="password-card">
          <h2 className="card-title text-white">Change Login Password</h2>
          <div className='f-contaoner'>
            <div className="form-group">
              <label className="form-label">Enter OTP</label>
              <div className="otp-wrapper">
                <input
                  type="text"
                  value={loginOtp}
                  onChange={(e) => setLoginOtp(e.target.value)}
                  placeholder="Enter OTP"
                  className="form-input"
                  disabled={loginOtpVerified}
                  autoComplete="off"
                />
                {!loginOtpSent ? (
                  <button
                    onClick={handleLoginSendOtp}
                    disabled={isLoginSendOtpDisabled}
                    className="send-otp-btn"
                    style={{ opacity: isLoginSendOtpDisabled ? 0.6 : 1, cursor: isLoginSendOtpDisabled ? 'not-allowed' : 'pointer' }}
                  >
                    {loginSendingOtp ? 'Sending...' : 'SEND OTP'}
                  </button>
                ) : (
                  <button
                    onClick={handleLoginVerifyOtp}
                    disabled={isLoginVerifyOtpDisabled}
                    className="send-otp-btn"
                    style={{ opacity: isLoginVerifyOtpDisabled ? 0.6 : 1, cursor: isLoginVerifyOtpDisabled ? 'not-allowed' : 'pointer' }}
                  >
                    {loginVerifyingOtp ? 'Verifying...' : 'VERIFY OTP'}
                  </button>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                value={loginCurrentPassword}
                onChange={(e) => setLoginCurrentPassword(e.target.value)}
                placeholder="Current Password"
                className="form-input"
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                value={loginNewPassword}
                onChange={(e) => setLoginNewPassword(e.target.value)}
                placeholder="New Password (min 8 characters)"
                className="form-input"
                autoComplete="new-password"
              />
              {loginNewPassword && loginNewPassword.length < 8 && (
                <small className="text-danger">Password must be at least 8 characters</small>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                value={loginConfirmPassword}
                onChange={(e) => setLoginConfirmPassword(e.target.value)}
                placeholder="Confirm New Password"
                className="form-input"
                autoComplete="off"
              />
              {loginConfirmPassword && loginNewPassword !== loginConfirmPassword && (
                <small className="text-danger">Passwords do not match</small>
              )}
            </div>

            <div className="button-group01">
              <button
                onClick={handleLoginUpdatePassword}
                disabled={isLoginUpdateDisabled}
                className="btn-update"
                style={{ opacity: isLoginUpdateDisabled ? 0.6 : 1, cursor: isLoginUpdateDisabled ? 'not-allowed' : 'pointer' }}
              >
                {loginLoading ? 'Updating...' : 'UPDATE PASSWORD'}
              </button>
              <button onClick={handleLoginCancel} className="btn-cancel">
                CANCEL
              </button>
            </div>
          </div>
        </div>

        {/* Change Master Password Section */}
        <div className="password-card">
          <h2 className="card-title text-white">Change Master Password</h2>
          <div className='f-contaoner'>
            <div className="form-group">
              <label className="form-label">Enter OTP</label>
              <div className="otp-wrapper">
                <input
                  type="text"
                  value={masterOtp}
                  onChange={(e) => setMasterOtp(e.target.value)}
                  placeholder="Enter OTP"
                  className="form-input"
                  disabled={masterOtpVerified}
                  autoComplete="off"
                />
                {!masterOtpSent ? (
                  <button
                    onClick={handleMasterSendOtp}
                    disabled={isMasterSendOtpDisabled}
                    className="send-otp-btn"
                    style={{ opacity: isMasterSendOtpDisabled ? 0.6 : 1, cursor: isMasterSendOtpDisabled ? 'not-allowed' : 'pointer' }}
                  >
                    {masterSendingOtp ? 'Sending...' : 'SEND OTP'}
                  </button>
                ) : (
                  <button
                    onClick={handleMasterVerifyOtp}
                    disabled={isMasterVerifyOtpDisabled}
                    className="send-otp-btn"
                    style={{ opacity: isMasterVerifyOtpDisabled ? 0.6 : 1, cursor: isMasterVerifyOtpDisabled ? 'not-allowed' : 'pointer' }}
                  >
                    {masterVerifyingOtp ? 'Verifying...' : 'VERIFY OTP'}
                  </button>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">New Master Password</label>
              <input
                type="password"
                value={masterNewPassword}
                onChange={(e) => setMasterNewPassword(e.target.value)}
                placeholder="New Master Password (min 8 characters)"
                className="form-input"
                autoComplete="new-password"
              />
              {masterNewPassword && masterNewPassword.length < 8 && (
                <small className="text-danger">Password must be at least 8 characters</small>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Master Password</label>
              <input
                type="password"
                value={masterConfirmPassword}
                onChange={(e) => setMasterConfirmPassword(e.target.value)}
                placeholder="Confirm New Master Password"
                className="form-input"
                autoComplete="off"
              />
              {masterConfirmPassword && masterNewPassword !== masterConfirmPassword && (
                <small className="text-danger">Passwords do not match</small>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Login Password (For Verification)</label>
              <input
                type="password"
                value={masterLoginPassword}
                onChange={(e) => setMasterLoginPassword(e.target.value)}
                placeholder="Enter your login password"
                className="form-input"
                autoComplete="new-password"
              />
            </div>

            <div className="button-group01">
              <button
                onClick={handleMasterUpdatePassword}
                disabled={isMasterUpdateDisabled}
                className="btn-update"
                style={{ opacity: isMasterUpdateDisabled ? 0.6 : 1, cursor: isMasterUpdateDisabled ? 'not-allowed' : 'pointer' }}
              >
                {masterLoading ? 'Updating...' : 'UPDATE PASSWORD'}
              </button>
              <button onClick={handleMasterCancel} className="btn-cancel">
                CANCEL
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChangePassword;