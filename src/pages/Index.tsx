import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Landing from "./Landing";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    if (isAuthenticated) {
      // If authenticated, redirect to dashboard
      navigate('/dashboard');
    }
    // If not authenticated, stay on landing page
  }, [navigate]);

  return <Landing />;
};

export default Index;
