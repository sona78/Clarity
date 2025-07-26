import React from 'react';
import { Link } from 'react-router-dom';
import { useSupabase } from '../contexts/SupabaseContext';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Box,
  Stack,
  Typography,
  Button
} from '@mui/material';
import { 
  TrendingUp, 
  Chat, 
  Map
} from '@mui/icons-material';
import Navigation from '../components/Navigation';
import { CHAT_ROUTE, PATHS_ROUTE } from "../App";

const Home = () => {
  const { user, supabase } = useSupabase();

  return (
    <>
      <Navigation />

      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h2" component="h1" gutterBottom>
            Welcome to <Typography variant="h2" component="span" color="primary">Clarity</Typography>
          </Typography>
          <Typography variant="h5" component="p" color="text.secondary" sx={{ mb: 4, maxWidth: '800px', mx: 'auto' }}>
            Predict the future of your career and get crystal-clear guidance on the training and steps 
            you need to take to achieve your professional goals.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            {user ? (
              <>
                <Button 
                  variant="contained" 
                  size="large" 
                  component={Link} 
                  to={CHAT_ROUTE}
                  startIcon={<Chat />}
                >
                  Start Career Chat
                </Button>
                <Button 
                  variant="outlined" 
                  size="large" 
                  component={Link} 
                  to={PATHS_ROUTE}
                  startIcon={<Map />}
                >
                  Explore Career Paths
                </Button>
              </>
            ) : (
              <Button 
                variant="contained" 
                size="large" 
                onClick={() => window.location.href = '/auth'}
                startIcon={<Chat />}
              >
                Login to Start Your Career Journey
              </Button>
            )}
          </Stack>
        </Box>

        {/* Features Section */}
        <Grid container spacing={4} sx={{ mb: 10 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 1 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ 
                  backgroundColor: 'primary.main', 
                  borderRadius: 3, 
                  width: 80, 
                  height: 80, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3
                }}>
                  <TrendingUp sx={{ fontSize: 36, color: 'white' }} />
                </Box>
                <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                  Career Prediction
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Use AI-powered insights to predict potential career trajectories based on your skills, 
                  interests, and market trends.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 1 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ 
                  backgroundColor: 'secondary.main', 
                  borderRadius: 3, 
                  width: 80, 
                  height: 80, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3
                }}>
                  <Chat sx={{ fontSize: 36, color: 'white' }} />
                </Box>
                <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                  Interactive Chat
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Get personalized career guidance through our intelligent chat system that understands 
                  your unique situation and goals.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 1 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ 
                  backgroundColor: 'primary.light', 
                  borderRadius: 3, 
                  width: 80, 
                  height: 80, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3
                }}>
                  <Map sx={{ fontSize: 36, color: 'white' }} />
                </Box>
                <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                  Learning Paths
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Discover structured learning paths with specific training recommendations, 
                  courses, and milestones to reach your career objectives.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* How It Works Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
            How Clarity Works
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={4} textAlign="center">
              <Box 
                sx={{ 
                  width: 60, 
                  height: 60, 
                  borderRadius: '50%', 
                  bgcolor: 'primary.main', 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  mx: 'auto',
                  mb: 2
                }}
              >
                1
              </Box>
              <Typography variant="h6" component="h4" gutterBottom>
                Assess Your Current State
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tell us about your current skills, experience, and career aspirations.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} textAlign="center">
              <Box 
                sx={{ 
                  width: 60, 
                  height: 60, 
                  borderRadius: '50%', 
                  bgcolor: 'success.main', 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  mx: 'auto',
                  mb: 2
                }}
              >
                2
              </Box>
              <Typography variant="h6" component="h4" gutterBottom>
                Get AI-Powered Predictions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Our AI analyzes market trends and your profile to predict career opportunities.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} textAlign="center">
              <Box 
                sx={{ 
                  width: 60, 
                  height: 60, 
                  borderRadius: '50%', 
                  bgcolor: 'warning.main', 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  mx: 'auto',
                  mb: 2
                }}
              >
                3
              </Box>
              <Typography variant="h6" component="h4" gutterBottom>
                Follow Your Personalized Path
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Receive a customized learning plan with specific steps to achieve your goals.
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* CTA Section */}
        <Grid container justifyContent="center" sx={{ mb: 8 }}>
          <Grid item xs={12} md={10}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #2E5BBA 0%, #5A7BC8 100%)', 
              textAlign: 'center',
              color: 'white'
            }}>
              <CardContent sx={{ py: 8, px: 6 }}>
                <Typography variant="h3" component="h3" gutterBottom sx={{ fontWeight: 700, color: 'white' }}>
                  Ready to Get Clarity on Your Career?
                </Typography>
                <Typography variant="h6" sx={{ mb: 5, opacity: 0.9, maxWidth: '600px', mx: 'auto' }}>
                  Join thousands of professionals who have already discovered their ideal career path.
                </Typography>
                {user ? (
                  <Button 
                    variant="contained" 
                    size="large" 
                    component={Link} 
                    to={CHAT_ROUTE}
                    sx={{ 
                      backgroundColor: 'white', 
                      color: 'primary.main',
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: 'grey.100'
                      }
                    }}
                  >
                    Get Started Now
                  </Button>
                ) : (
                  <Button 
                    variant="contained" 
                    size="large" 
                    onClick={() => window.location.href = '/auth'}
                    sx={{ 
                      backgroundColor: 'white', 
                      color: 'primary.main',
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: 'grey.100'
                      }
                    }}
                  >
                    Login to Get Started
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

    </>
  );
};

export default Home;