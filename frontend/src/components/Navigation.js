import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  Avatar,
  Menu,
  MenuItem
} from '@mui/material';
import { 
  Login,
  Logout,
  AccountCircle
} from '@mui/icons-material';
import { HOME_ROUTE } from "../App";

const Navigation = () => {
  const { 
    loginWithRedirect, 
    logout, 
    user, 
    isAuthenticated, 
    isLoading 
  } = useAuth0();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout({ 
      logoutParams: { 
        returnTo: window.location.origin 
      } 
    });
    handleUserMenuClose();
  };

  return (
    <AppBar position="static" sx={{ mb: 6 }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Button color="primary" component={Link} to={HOME_ROUTE} sx={{ fontSize: '1.3rem', fontWeight: 700 }}>
            Clarity
          </Button>
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button color="primary" component={Link} to={HOME_ROUTE} sx={{ fontWeight: 500 }}>
            Home
          </Button>
          
          {!isLoading && (
            <>
              {isAuthenticated ? (
                <>
                  <Button
                    onClick={handleUserMenuOpen}
                    sx={{ ml: 1, textTransform: 'none' }}
                    startIcon={
                      user?.picture ? (
                        <Avatar src={user.picture} sx={{ width: 24, height: 24 }} />
                      ) : (
                        <AccountCircle />
                      )
                    }
                  >
                    {user?.name || user?.email}
                  </Button>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleUserMenuClose}
                    onClick={handleUserMenuClose}
                  >
                    <MenuItem onClick={handleLogout}>
                      <Logout sx={{ mr: 1 }} />
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Button 
                  variant="contained" 
                  onClick={() => loginWithRedirect()}
                  startIcon={<Login />}
                  sx={{ ml: 1 }}
                >
                  Login
                </Button>
              )}
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;