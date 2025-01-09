import React, { useState, ReactNode } from 'react';
import Header from '../components/Header/index';
import Sidebar from '../components/Sidebar/index';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import ProtectedRoute from '../components/protectedRoute';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import PageTitle from '../components/PageTitle';
import { useAuth } from '../hooks/authContext';
import SetPassword from '../pages/password/SetPassword';
import AddUser from '../pages/addUser';
import AttendancesHistory from '../pages/history';
import ForgotPassword from '../pages/password/ForgotPassword';
import ResetPassword from '../pages/password/ResetPassword';

//TODO Component will be refacto for better implementation
const Layout: React.FC<{ children?: ReactNode }> = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const urlParams = new URLSearchParams(window.location.search);
  const location = useLocation();
  const tokenFromUrl = urlParams.get('t');
  const token = localStorage.getItem('token');
  const { user } = useAuth();

  // Checking if we are on resetPassword page.
  const isResetPassword = (): boolean => {
    const splitted = location.pathname.trim().split('/');
    const path = splitted[1];
    const hasResetPasswordToken = splitted[2];
    return path === 'reset-password' && !!hasResetPasswordToken; // Return `true` if token exist, else `false`
  };

  return (
    <div className='dark:bg-boxdark-2 dark:text-bodydark'>
      <div className='flex h-screen overflow-hidden'>
        {!!user && !!token && !tokenFromUrl && !isResetPassword() && (
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        )}

        <div className='relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden'>
          {!!user && !!token && !tokenFromUrl && !isResetPassword() && (
            <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          )}
          <main>
            <div className='mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10'>
              <Routes>
                {/* Routes publiques */}
                <Route path='/login' element={<LoginRedirect />} />
                <Route path='/set-password' element={<SetPasswordRedirect />} />
                <Route path='/forgot-password' element={<ForgotPassword />} />
                <Route
                  path='/reset-password/:token'
                  element={<ResetPasswordRedirect />}
                />

                {/* Routes protégées */}
                <Route element={<ProtectedRoute />}>
                  <Route
                    path='/accueil'
                    element={
                      <>
                        <PageTitle title='Accueil' />
                        <Dashboard />
                      </>
                    }
                  />
                  <Route
                    path='/historique'
                    element={
                      <>
                        <PageTitle title='Historique' />
                        <AttendancesHistory />
                      </>
                    }
                  />
                  <Route
                    path='/add-user'
                    element={
                      <>
                        <PageTitle title='Ajouter un étudiant' />
                        <AddUser />
                      </>
                    }
                  />
                </Route>
                <Route path='*' element={<LoginRedirect />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

const LoginRedirect: React.FC = () => {
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  return user && !!token ? <Navigate to='/accueil' /> : <Login />;
};

const ResetPasswordRedirect: React.FC = () => {
  const location = useLocation();
  // Checking if the token in the url is valid
  const splitted = location.pathname.trim().split('/');
  const canGoOn = (): boolean => {
    const path = splitted[1];
    const hasResetPasswordToken = splitted[2];
    return path === 'reset-password' && !!hasResetPasswordToken; // Return `true` if token exist, else `false`
  };

  return canGoOn() ? <ResetPassword /> : <Navigate to='/login' replace />;
};

const SetPasswordRedirect: React.FC = () => {
  // Checking if the token in the url is valid
  const validateTokenInURL = (): boolean => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('t');
    return !!token; // Return `true` if token exist, else `false`
  };
  return validateTokenInURL() ? (
    <SetPassword />
  ) : (
    <Navigate to='/login' replace />
  );
};

export default Layout;
