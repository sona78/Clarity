import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import theme from './theme';
import Home from './pages/home';
import Chat from './pages/chat';
import Paths from './pages/paths';
import ProtectedRoute from './components/ProtectedRoute';

export const HOME_ROUTE = '/'
export const CHAT_ROUTE = '/chat'
export const PATHS_ROUTE = '/paths'



function App() {
  const domain = "dev-07daqn7fgnix87ii.us.auth0.com";
  const clientId = "XIkHuY4SFeenTPzsxgi21uu6rs7Z5hAX";
  const redirectUri = window.location.origin;

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri
      }}
      onRedirectCallback={(appState) => {
        // Redirect to chat after login, or to the page they were trying to access
        window.location.href = appState?.returnTo || CHAT_ROUTE;
      }}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
          <Router>
            <Routes>
              <Route path={HOME_ROUTE} element={<Home />} />
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
      </ThemeProvider>
    </Auth0Provider>
  );
}

export default App;
