import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const RedirectOnReload = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isInitialMount = useRef(true); // Use a ref to track initial mount

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false; // Mark as not initial mount after first render
      if (location.pathname !== '/') {
        navigate('/', { replace: true }); // Use replace to avoid adding to history
      }
    }
    // Empty dependency array ensures this effect runs only once on mount
  }, []); 

  return <>{children}</>;
};

export default RedirectOnReload;