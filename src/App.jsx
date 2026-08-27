import { Route, Routes } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ErrorPage from './components/error/ErrorPage';
import { Toaster } from "react-hot-toast";
import Approutes from './Routes/Approutes';
import Signup from './Pages/Auth/Signup';
import Login from './Pages/Auth/Login';
import ProtecedRoute from "./components/route/ProtecedRoute";
import { UserProvider } from './context/UserContext';
import Preloader from './Preloader';
import ForgotPassword from './Pages/Auth/ForgotPassword';
import Header from './components/common/Header/Header';
import Fotter from './components/common/fotter/Fotter';
import { Outlet } from 'react-router-dom';
import Landinglayout from './layout/Landinglayout';

// Layout Component with Header, Footer and Outlet (for normal pages)
const Layout = () => {
  return (
    <>
      <Header/>
      <div className="midd-container">
        <Outlet />
      </div>
      <Fotter/>
    </>
  );
};

// Dashboard Layout without Header & Footer
const DashboardLayout = () => {
  return (
    <>
      <Outlet /> {/* Only dashboard content, no header/footer */}
    </>
  );
};

function AppContent() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Preloader/>;
  }

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />

      <Routes>
        {/* Normal pages with Header & Footer */}
        <Route element={<Layout />}>
          <Route path="/" element={<Landinglayout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="*" element={<ErrorPage />} />
        </Route>

        {/* Dashboard routes WITHOUT Header & Footer */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard/*" element={
            <ProtecedRoute>
              <Approutes/>
            </ProtecedRoute>
          } />
        </Route>
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}