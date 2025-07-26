import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Box,
  Chip,
  LinearProgress,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Button
} from '@mui/material';
import { 
  CheckCircle, 
  RadioButtonUnchecked,
  Chat as ChatIcon 
} from '@mui/icons-material';
import Navigation from '../components/Navigation';
import PageNavigation from '../components/PageNavigation';
import { CHAT_ROUTE } from "../App";

const Paths = () => {
  const careerPaths = [
    {
      id: 1,
      title: "Data Science Specialist",
      description: "Transform data into actionable insights using machine learning and statistical analysis",
      duration: "6-12 months",
      difficulty: "Intermediate",
      skills: ["Python", "SQL", "Machine Learning", "Statistics", "Data Visualization"],
      steps: [
        { title: "Python Fundamentals", completed: true },
        { title: "Statistics & Mathematics", completed: true },
        { title: "Data Analysis with Pandas", completed: false },
        { title: "Machine Learning Basics", completed: false },
        { title: "Advanced ML & Deep Learning", completed: false }
      ],
      progress: 40
    },
    {
      id: 2,
      title: "Full-Stack Developer",
      description: "Build complete web applications from frontend to backend",
      duration: "8-15 months",
      difficulty: "Beginner",
      skills: ["JavaScript", "React", "Node.js", "Databases", "API Development"],
      steps: [
        { title: "HTML/CSS Fundamentals", completed: true },
        { title: "JavaScript Essentials", completed: false },
        { title: "React Framework", completed: false },
        { title: "Backend with Node.js", completed: false },
        { title: "Database Integration", completed: false }
      ],
      progress: 20
    },
    {
      id: 3,
      title: "Cloud Solutions Architect",
      description: "Design and implement scalable cloud infrastructure solutions",
      duration: "10-18 months",
      difficulty: "Advanced",
      skills: ["AWS/Azure", "DevOps", "Networking", "Security", "Infrastructure as Code"],
      steps: [
        { title: "Cloud Fundamentals", completed: false },
        { title: "AWS/Azure Certification", completed: false },
        { title: "DevOps Practices", completed: false },
        { title: "Infrastructure Automation", completed: false },
        { title: "Advanced Architecture", completed: false }
      ],
      progress: 0
    }
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'success';
      case 'Intermediate': return 'warning';
      case 'Advanced': return 'error';
      default: return 'default';
    }
  };

  return (
    <>
      <Navigation />

      <Container maxWidth="lg" sx={{ pb: 10 }}>
        <Box sx={{ mb: 6 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Career Learning Paths
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Discover structured learning paths tailored to your career goals. Each path includes specific 
            training recommendations, milestones, and skill development tracks.
          </Typography>
        </Box>

        <Grid container spacing={4} sx={{ mb: 10 }}>
          {careerPaths.map((path) => (
            <Grid item xs={12} lg={6} key={path.id}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                border: '1px solid',
                borderColor: 'grey.200',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)'
                }
              }}>
                <Box sx={{ 
                  p: 3, 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  borderBottom: '1px solid', 
                  borderColor: 'divider',
                  backgroundColor: 'grey.50'
                }}>
                  <Typography variant="h5" component="h3" sx={{ fontWeight: 600 }}>
                    {path.title}
                  </Typography>
                  <Chip 
                    label={path.difficulty} 
                    color={getDifficultyColor(path.difficulty)}
                    sx={{ fontWeight: 500 }}
                  />
                </Box>
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {path.description}
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                      Duration: {path.duration}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={path.progress} 
                        sx={{ flexGrow: 1, mr: 1 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {path.progress}%
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Key Skills:
                    </Typography>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                      {path.skills.map((skill, index) => (
                        <Chip 
                          key={index}
                          label={skill} 
                          size="small" 
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Learning Steps:
                    </Typography>
                    <List dense>
                      {path.steps.map((step, index) => (
                        <ListItem key={index} sx={{ px: 0, py: 0.25 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            {step.completed ? (
                              <CheckCircle color="success" fontSize="small" />
                            ) : (
                              <RadioButtonUnchecked color="disabled" fontSize="small" />
                            )}
                          </ListItemIcon>
                          <ListItemText 
                            primary={step.title}
                            primaryTypographyProps={{
                              variant: 'body2',
                              sx: {
                                textDecoration: step.completed ? 'line-through' : 'none',
                                color: step.completed ? 'text.secondary' : 'text.primary'
                              }
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </CardContent>
                
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                    <Button variant="contained" size="small" sx={{ flexGrow: 1 }}>
                      {path.progress > 0 ? 'Continue Path' : 'Start Path'}
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      component={Link} 
                      to={CHAT_ROUTE}
                      startIcon={<ChatIcon />}
                    >
                      Get Guidance
                    </Button>
                  </Stack>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container justifyContent="center">
          <Grid item xs={12} md={10}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #2E5BBA 0%, #5A7BC8 100%)', 
              textAlign: 'center',
              color: 'white',
              border: 'none'
            }}>
              <CardContent sx={{ py: 6, px: 4 }}>
                <Typography variant="h4" component="h3" gutterBottom sx={{ fontWeight: 600, color: 'white' }}>
                  Need a Custom Path?
                </Typography>
                <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, maxWidth: '500px', mx: 'auto' }}>
                  Can't find the perfect path for your goals? Chat with our AI assistant to create 
                  a personalized learning plan based on your specific career objectives.
                </Typography>
                <Button 
                  variant="contained" 
                  component={Link} 
                  to={CHAT_ROUTE}
                  startIcon={<ChatIcon />}
                  sx={{ 
                    backgroundColor: 'white', 
                    color: 'primary.main',
                    fontWeight: 600,
                    px: 3,
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: 'grey.100'
                    }
                  }}
                >
                  Create Custom Path
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <PageNavigation />
    </>
  );
};

export default Paths;