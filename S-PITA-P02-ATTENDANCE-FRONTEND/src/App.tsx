import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Loader from './components/Loader';
import Layout from './layout';

const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 2000);
  }, []);

  return <>{loading ? <Loader /> : <Layout />}</>;
};

export default App;
