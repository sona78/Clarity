import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Box, CircularProgress, Typography } from '@mui/material';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  if (isLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '50vh',
          gap: 2
        }}
      >
        <CircularProgress />
        <Typography variant="body1" color="text.secondary">
          Loading...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    // Automatically redirect to login if not authenticated
    loginWithRedirect({
      appState: {
        returnTo: window.location.pathname
      }
    });
    
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '50vh',
          gap: 2
        }}
      >
        <CircularProgress />
        <Typography variant="body1" color="text.secondary">
          Redirecting to login...
        </Typography>
      </Box>
    );
  }

  return children;
};

export default ProtectedRoute;