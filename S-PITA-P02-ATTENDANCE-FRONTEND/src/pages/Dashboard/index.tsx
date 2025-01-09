import React from 'react';
import AdminPanel from './admin';
import StudentPanel from './student';
import { useAuth } from '../../hooks/authContext';

const Home: React.FC = () => {
  const { user } = useAuth();
  return <>{user?.role === 'admin' ? <AdminPanel /> : <StudentPanel />}</>;
};

export default Home;
