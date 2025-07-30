import React from 'react';
import { Link } from 'react-router-dom';
import { useSupabase } from '../contexts/SupabaseContext';
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
import { CHAT_ROUTE, HOME_ROUTE, PATHS_ROUTE } from "../App";

const Navigation = () => {
  const { 
    supabase, 
    user, 
    loading 
  } = useSupabase();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogin = () => {
    window.location.href = '/auth';
  };

  const handleLogout = () => {
    supabase.auth.signOut();
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
          <Button color="primary" component={Link} to={CHAT_ROUTE} sx={{ fontWeight: 500 }}>
            Chat
          </Button>
          <Button color="primary" component={Link} to={PATHS_ROUTE} sx={{ fontWeight: 500 }}>
            Paths
          </Button>
          
          {!loading && (
            <>
              {user ? (
                <>
                  <Button
                    onClick={handleUserMenuOpen}
                    sx={{ ml: 1, textTransform: 'none' }}
                    startIcon={
                      user?.user_metadata?.avatar_url ? (
                        <Avatar src={user.user_metadata.avatar_url} sx={{ width: 24, height: 24 }} />
                      ) : (
                        <AccountCircle />
                      )
                    }
                  >
                    {user?.user_metadata?.full_name || user?.email}
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
                  onClick={handleLogin}
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