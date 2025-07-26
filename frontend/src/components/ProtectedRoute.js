import React from 'react';
import { useSupabase } from '../contexts/SupabaseContext';
import { Box, CircularProgress, Typography, Button } from '@mui/material';

const ProtectedRoute = ({ children }) => {
  const { user, loading, supabase } = useSupabase();

  if (loading) {
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

  if (!user) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '50vh',
          gap: 3
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom>
          Please Sign In
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          You need to be signed in to access this page.
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => window.location.href = '/auth'}
        >
          Sign In
        </Button>
      </Box>
    );
  }

  return children;
};

export default ProtectedRoute;