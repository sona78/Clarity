import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../contexts/SupabaseContext';
import { 
  Container, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Alert,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import { 
  Email, 
  Lock, 
  Login as LoginIcon,
  PersonAdd as SignUpIcon
} from '@mui/icons-material';
import Navigation from '../components/Navigation';
import { CHAT_ROUTE } from '../App';

const Auth = () => {
  const navigate = useNavigate();
  const { supabase } = useSupabase();
  
  const [tab, setTab] = useState(0); // 0 = login, 1 = signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    setError('');
    setSuccess('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => navigate(CHAT_ROUTE), 1000);
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + CHAT_ROUTE
        }
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess('Account created! Please check your email to verify your account.');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    if (tab === 0) {
      handleLogin(e);
    } else {
      handleSignUp(e);
    }
  };

  return (
    <>
      <Navigation />
      
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Card sx={{ boxShadow: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
                Welcome to Clarity
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Sign in to start your career journey
              </Typography>
            </Box>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={tab} onChange={handleTabChange} centered>
                <Tab 
                  icon={<LoginIcon />} 
                  label="Sign In" 
                  iconPosition="start"
                />
                <Tab 
                  icon={<SignUpIcon />} 
                  label="Sign Up" 
                  iconPosition="start"
                />
              </Tabs>
            </Box>

            {/* Error/Success Messages */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
              </Alert>
            )}

            {/* Auth Form */}
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                margin="normal"
                InputProps={{
                  startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
              
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                margin="normal"
                InputProps={{
                  startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 3, mb: 2, py: 1.5 }}
                startIcon={loading ? <CircularProgress size={20} /> : (tab === 0 ? <LoginIcon /> : <SignUpIcon />)}
              >
                {loading ? 'Processing...' : (tab === 0 ? 'Sign In' : 'Sign Up')}
              </Button>
            </Box>

            {/* Additional Info */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {tab === 0 ? (
                  "Don't have an account? "
                ) : (
                  "Already have an account? "
                )}
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setTab(tab === 0 ? 1 : 0)}
                  sx={{ textTransform: 'none' }}
                >
                  {tab === 0 ? 'Sign up here' : 'Sign in here'}
                </Button>
              </Typography>
            </Box>

            {tab === 1 && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Note:</strong> After signing up, you'll receive a verification email. 
                  Please check your inbox and click the verification link to activate your account.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </>
  );
};

export default Auth; 