import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { 
  Paper,
  Box,
  Button,
  Stack
} from '@mui/material';
import { 
  Chat,
  Map
} from '@mui/icons-material';
import { CHAT_ROUTE, PATHS_ROUTE } from "../App";

const PageNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth0();

  // Only show footer for authenticated users
  if (!isAuthenticated) {
    return null;
  }

  const currentPath = location.pathname;

  const navigationItems = [
    {
      path: CHAT_ROUTE,
      label: 'Chat',
      icon: Chat,
    },
    {
      path: PATHS_ROUTE,
      label: 'Paths',
      icon: Map,
    }
  ];

  return (
    <Paper 
      elevation={3}
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1000,
        borderRadius: 0,
        borderTop: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Box sx={{ p: 2 }}>
        <Stack direction="row" spacing={1} justifyContent="center">
          {navigationItems.map((item) => {
            const isActive = currentPath === item.path;
            const IconComponent = item.icon;
            
            return (
              <Button
                key={item.path}
                onClick={() => navigate(item.path)}
                variant={isActive ? 'contained' : 'outlined'}
                startIcon={<IconComponent />}
                sx={{
                  flex: 1,
                  maxWidth: 200,
                  fontWeight: isActive ? 600 : 500,
                  backgroundColor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'white' : 'primary.main',
                  borderColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: isActive ? 'primary.dark' : 'primary.light',
                    color: isActive ? 'white' : 'primary.dark',
                  }
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Stack>
      </Box>
    </Paper>
  );
};

export default PageNavigation;