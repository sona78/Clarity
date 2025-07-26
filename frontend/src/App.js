import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import theme from './theme';
import Home from './pages/home';
import Chat from './pages/chat';
import Paths from './pages/paths';
import Auth from './pages/auth';
import ProtectedRoute from './components/ProtectedRoute';
import { SupabaseProvider } from './contexts/SupabaseContext';

export const HOME_ROUTE = '/'
export const CHAT_ROUTE = '/chat'
export const PATHS_ROUTE = '/paths'
export const AUTH_ROUTE = '/auth'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SupabaseProvider>
        <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
                      <Router>
              <Routes>
                <Route path={HOME_ROUTE} element={<Home />} />
                <Route path={AUTH_ROUTE} element={<Auth />} />
                <Route 
                  path={CHAT_ROUTE} 
                  element={
                    <ProtectedRoute>
                      <Chat />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path={PATHS_ROUTE} 
                  element={
                    <ProtectedRoute>
                      <Paths />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </Router>
        </Box>
      </SupabaseProvider>
    </ThemeProvider>
  );
}

export default App;
