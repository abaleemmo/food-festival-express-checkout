import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const RedirectOnReload = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // If the current path is not the home page, navigate to home.
    // This handles direct access to other URLs or page reloads.
    if (location.pathname !== '/') {
      navigate('/');
    }
  }, [location.pathname, navigate]);

  return <>{children}</>;
};

export default RedirectOnReload;