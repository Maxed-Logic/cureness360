// ✅ SAB IMPORTS TOP PAR
import { Route, Routes } from "react-router-dom";
import ProtecedRoute from "../components/route/ProtecedRoute";

// import Dashboard from "../Pages/Dahboard/UserDetails/Dashboard";
import Header from "../components/commondashboard/Header";
import Sidebar from "../components/commondashboard/Sidebar";
import DownlineTeam from "../Pages/Dahboard/sidebardetails/DownLineTeam";
import Rebards from "../Pages/Dahboard/sidebardetails/Rebards";
import BonusReport from "../Pages/Dahboard/sidebardetails/Royalty";
import TreeView from "../Pages/Dahboard/sidebardetails/TreeView";
import { Deposit2Deposit } from "../Pages/Dahboard/sidebardetails/Deposit2Deposit";
import DepositHistory from "../Pages/Dahboard/sidebardetails/DepositHistory";
import AccStatement from "../Pages/Dahboard/AccStatement";
import CapitalPayout from "../Pages/Dahboard/CapitalPayout/CapitalPayout";
import CapitalWithdrawalRequest from "../Pages/Dahboard/CapitalPayout/CapitalWithdrawalRequest";
import InvestmentHistory from "../Pages/Dahboard/InvestmentHistory";
import Profaile from "../Pages/Dahboard/Profile/profile/Profile";
import ChangePassword from "../Pages/Dahboard/Profile/ChangePassword/ChangePassword";
import { Epin } from "../Pages/Dahboard/Profile/Epin/Epin";
import SupportHelp from "../Pages/Dahboard/Profile/Support/SupportHelp";
import Support from "../Pages/Dahboard/Profile/Support/Support";
import DownlineUserHistory from "../Pages/Dahboard/sidebardetails/DownlineUserHistory";
import WithdrawalHistory from "../Pages/Dahboard/WithdrawalHistory";
import Dashboardlayout from "../layout/Dashboardlayout";
import CapitalPayoutHistory from "../Pages/Dahboard/CapitalPayout/CapitalPayoutHistory";
import UpdateKyc from "../Pages/Dahboard/kyc/UpdateKyc";
import Smartwallethistory from "../Pages/Dahboard/sidebardetails/Smartwallethistory";
import FlushIncomeReport from "../Pages/Dahboard/FlushIncomeReport";

// ✅ Dashboard Layout Component
const DashboardLayout = () => {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="layout">
        <Header />
        <Routes>
          <Route index element={<Dashboardlayout/>} />
          <Route path="UpdateKyc" element={<ProtecedRoute><UpdateKyc /></ProtecedRoute>} />
          <Route path="downline-team" element={<ProtecedRoute><DownlineTeam /></ProtecedRoute>} />
          <Route path="downlineUserHistory" element={<ProtecedRoute><DownlineUserHistory /></ProtecedRoute>} />
          <Route path="deposit2deposit" element={<Deposit2Deposit />} />
          <Route path="rewards" element={<ProtecedRoute><Rebards /></ProtecedRoute>} />
          <Route path="royalty" element={<ProtecedRoute><BonusReport /></ProtecedRoute>} />
          <Route path="Support" element={<ProtecedRoute><Support /></ProtecedRoute>} />
          <Route path="depositHistory" element={<ProtecedRoute><DepositHistory /></ProtecedRoute>} />
          <Route path="accstatement" element={<ProtecedRoute><AccStatement /></ProtecedRoute>} />
          <Route path="capitalpayout" element={<ProtecedRoute><CapitalPayout /></ProtecedRoute>} />
          <Route path="capitalwithdrawalrequest" element={<ProtecedRoute><CapitalWithdrawalRequest /></ProtecedRoute>} />
          <Route path="CapitalPayOutHistory" element={<ProtecedRoute><CapitalPayoutHistory/></ProtecedRoute>} />
          <Route path="investmenthistory" element={<ProtecedRoute><InvestmentHistory /></ProtecedRoute>} />
          <Route path="profile" element={<ProtecedRoute><Profaile /></ProtecedRoute>} />
          <Route path="changepassword" element={<ProtecedRoute><ChangePassword /></ProtecedRoute>} />
          <Route path="epin" element={<ProtecedRoute><Epin /></ProtecedRoute>} />
          <Route path="WithdrawalHistory" element={<ProtecedRoute><WithdrawalHistory /></ProtecedRoute>} />
           <Route path="Smartwallethistory" element={<ProtecedRoute><Smartwallethistory/></ProtecedRoute>} />
           <Route path="flush-income" element={<ProtecedRoute><FlushIncomeReport/></ProtecedRoute>} />
        </Routes>
      </div>
    </div>
  );
};

// ✅ Main Approutes Component
const Approutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/TreeView" element={<ProtecedRoute><TreeView /></ProtecedRoute>} />
      <Route path="/supporthelp/:id" element={<SupportHelp />} />
      
      {/* All Dashboard Routes */}
      <Route path="/*" element={<DashboardLayout />} />
    </Routes>
  );
};

export default Approutes;