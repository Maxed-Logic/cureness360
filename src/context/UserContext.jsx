import React, { createContext, useState, useEffect, useContext } from "react";
import apiClient from "../api/apiClient";

const UserContext = createContext();

export const UserProvider = ({ children }) => {

  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [userData, setUserData] = useState(null);
  const [stakeData, setStakeData] = useState(null);
  const [payoutData, setPayoutData] = useState(null);
  const [loading, setLoading] = useState(false);

  // ================= LOAD FROM sessionStorage =================
  useEffect(() => {
    const savedUserData = sessionStorage.getItem("userData");
    if (savedUserData) {
      try {
        const parsed = JSON.parse(savedUserData);
        setUserData(parsed);
      } catch (e) {
        console.error("Error loading:", e);
      }
    }
  }, []);

  // ================= Dashboard Fetch =================
  const fetchData = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!user && !token) {
        const storedUser = sessionStorage.getItem("user");
        if (!storedUser) return;
      }
      
      const regno = user?.Regno || user?.regno || sessionStorage.getItem("regno");
      if (!regno) {
        console.warn("No regno found");
        return;
      }

      setLoading(true);
      const res = await apiClient.get(
        `/Dashboard/dashboard/${regno}`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`
          }
        }
      );
      console.log("Dashboard Data:", res.data);
      
      if (res.data.success) {
        const apiData = res.data.data;
        const newUserData = {
          regno: apiData.regNo,
          name: apiData.fname,
          me: apiData.loginid,
          MobileNo: apiData.mobile,
          referral: apiData.introid,
          kid: apiData.kid,
          Depositfund: apiData.topupwallet || 0,
          BotAmount: apiData.BotAmount || 0,
          totalWallet: apiData.totalWallet || 0,
          walletid: apiData.accountNo,
          LevelIncome: apiData.LevelIncome || 0,
          MatchingBonus: apiData.MatchingBonus || 0,
          IBIncome: apiData.IBIncome || 0,
          Reward: apiData.Reward || 0,
          RoyaltyIncome: apiData.RoyaltyIncome || 0,
          Remaining: apiData.Remaining || 0,
          withdrawal: apiData.withdrawal || 0,
          TradingPassiveIncome: apiData.TradingPassiveIncome || 0,
          email: apiData.emailID,
          directId: apiData.directId,
          strongLeg: apiData.OtherLeg,
          weakerLeg: apiData.PowerLeg,
          leftCarry: apiData.leftCarry,
          rightCarry: apiData.rightCarry,
          LeftPerMonth: apiData.LeftPerMonth,
          RightPerMonth: apiData.RightPerMonth,
          LeftBusiness: apiData.LeftBusiness,
          RightBusiness: apiData.RightBusiness,
          topupdate: apiData.topupdate,        
          MiningTeamBusiness: apiData.MiningTeamBusiness,
          topupwallet: apiData.topupwallet,
          kycstatus: apiData.kycstatus,
          userPayoutOnOff: apiData.userPayoutOnOff,
          teamIdPayoutOnOff: apiData.teamIdPayoutOnOff,
          payoutOnOffByAdmin: apiData.payoutOnOffByAdmin,
          Smart_Wallet: apiData.Smart_Wallet || 0,
          Working: apiData.Working || 0,
          Invest: apiData.Invest || 0,
          BotStatus: apiData.BotStatus || 0,
          Smart_Wallet_debit: apiData.Smart_Wallet_debit,
          accountNo: apiData.accountNo,
          ifsccode: apiData.ifsccode,
          bankName: apiData.bankName,
          upiNumber: apiData.upiNumber,
          NameOnAccount: apiData.NameOnAccount,
          teamcount: apiData.teamcount,
          activeteam: apiData.activeteam,
          inactiveteam: apiData.inactiveteam,

        };
         
        setUserData(newUserData);
        sessionStorage.setItem("userData", JSON.stringify(newUserData));
        return newUserData;
      } else {
        console.warn("API returned success: false");
        return null;
      }
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ================= FORCE REFRESH WITH CACHE CLEAR =================
  const forceRefresh = async () => {
    sessionStorage.removeItem("userData");
    const freshData = await fetchData();
    if (!freshData) {
      const savedData = sessionStorage.getItem("userData");
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setUserData(parsed);
        return parsed;
      }
    }
    return freshData;
  };

  // ✅ NEW: Sirf userData update karo - Page refresh nahi
  const updateUserData = (updatedData) => {
    setUserData(updatedData);
    sessionStorage.setItem("userData", JSON.stringify(updatedData));
  };

  // ================= INVEST NOW =================
  const investNow = async (reciveId, investAmount) => {
    if (!userData) {
      return { success: false, message: "User data not loaded" };
    }
    
    const amount = parseFloat(investAmount);
    const oldDeposit = parseFloat(userData.Depositfund || 0);
    const newDepositfund = oldDeposit - amount;
    
    const updatedData = {
      ...userData,
      Depositfund: newDepositfund
    };
    
    setUserData(updatedData);
    sessionStorage.setItem("userData", JSON.stringify(updatedData));
    
    return { 
      success: true,
      message: `$${amount} invested successfully!`,
      amount: amount
    };
  };

  // ================= REFRESH USER DATA =================
  const refreshUserData = async () => {
    const savedData = sessionStorage.getItem("userData");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setUserData(parsed);
      return parsed;
    }
    return userData;
  };

  // ================= LOGIN =================
  const loginUser = (userData, token) => {
    sessionStorage.setItem("user", JSON.stringify(userData));
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("regno", userData.regno);
    setUser(userData);
    setTimeout(() => fetchData(), 100);
  };

  // ================= LOGOUT =================
  const logoutUser = () => {
    setUser(null);
    setUserData(null);
    setStakeData(null);
    setPayoutData(null);
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("regno");
    sessionStorage.removeItem("userData");
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  return (
    <UserContext.Provider
      value={{
        user,
        userData,
        stakeData,
        payoutData,
        refreshData: fetchData,
        forceRefresh: forceRefresh,
        refreshUserData,
        updateUserData, // ✅ NEW: Sirf userData update ke liye
        investNow,
        loginUser,
        logoutUser,
        loading
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);