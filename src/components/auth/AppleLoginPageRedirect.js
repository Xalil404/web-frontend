import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AppleLoginPage = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Use navigate instead of useHistory

  // Load Apple Sign-In SDK and initialize
  useEffect(() => {
    const initializeAppleSignIn = () => {
      if (window.AppleID) {
        window.AppleID.auth.init({
          clientId: 'com.template.applicationwebproject', // Replace with your Apple client ID
          scope: 'name email',
          redirectURI: 'https://web-frontend-dun.vercel.app/auth/callback', // Replace with your redirect URI
          state: 'state', // Optional: Used for CSRF protection
          usePopup: false, // Use redirect method
        });
        console.log('AppleID SDK initialized');
      }
    };

    // Ensure SDK loads after component mounts
    initializeAppleSignIn();
  }, []);

  // Handle Apple login process for redirect
  const handleAppleLoginRedirect = () => {
    if (!window.AppleID) {
      console.error('AppleID SDK not loaded');
      return;
    }

    window.AppleID.auth.signIn();
  };

  // Process the code received in the callback URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');

    if (code) {
      authenticateWithBackend(code);
    }
  }, [location]);

  // Send code to backend for verification
  const authenticateWithBackend = (code) => {
    fetch('https://backend-django-9c363a145383.herokuapp.com/api/auth/apple/web/redirect/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.token) {
          console.log('Authentication successful:', data);

          // Store the token under 'authToken' for all login types
          localStorage.setItem('authToken', data.token); 
          console.log('Auth Token:', localStorage.getItem('authToken')); // Check if token is saved

          // Redirect to the specified location (e.g., dashboard)
          navigate(data.redirect); // Use navigate instead of history.push
        } else {
          console.error('Error during authentication:', data.error);
        }
      })
      .catch((error) => {
        console.error('Error during fetch:', error.message);
      });
  };

  return (
    <div className="apple-login-container">
      <h2>Login with Apple</h2>
      <button onClick={handleAppleLoginRedirect} className="apple-signin-button">
        Sign in with Apple (Redirect)
      </button>
    </div>
  );
};

export default AppleLoginPage;




