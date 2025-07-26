import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Box,
  Stack,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  IconButton
} from '@mui/material';
import { 
  TrendingUp,
  Code,
  Security,
  Cloud,
  Analytics,
  Chat as ChatIcon,
  Close,
  AutoAwesome,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import Navigation from '../components/Navigation';
import PageNavigation from '../components/PageNavigation';
import { CHAT_ROUTE } from "../App";
import ReactMarkdown from 'react-markdown';

const Paths = () => {
  const [selectedStep, setSelectedStep] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [careerPlan, setCareerPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateCareerPlan = async () => {
    setLoading(true);
    setError(null);
    
    // try {
      const requestData = {
        user_profile: {
          interests_values: "Passionate about technology and innovation. Values continuous learning, work-life balance, and making meaningful impact through technology",
          work_experience: "Currently working in business/operations role. Strong foundation in analytical thinking and problem-solving",
          circumstances: "Can handle moderate income changes during transition. Prefer flexible learning schedule. Available for evening courses",
          skills: "Analytical thinking, Problem-solving, Communication, Project management, Business analysis",
          goals: "Transition to a technical role within 12-18 months. Focus on building practical skills. Target career growth and higher earning potential"
        },
        target_role: "Full-Stack Developer",
        target_industry: "Technology",
        location: "Remote",
        timeline_months: 12
      };
      console.log(requestData)

      const response = await fetch('http://localhost:8000/api/v1/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })
      .then(response => response.json()) // Parse the JSON response body
      .then(data => {
          console.log('Success:', data); // Access the data here
          setCareerPlan(data.markdown)
      })
      .catch(error => {
          console.error('Error:', error);
      });
      
    //   if (!response.ok) {
    //     throw new Error(`HTTP error! status: ${response.status}`);
    //   }
      
    //   const data = await response.json();
    //   setCareerPlan(data);
    //   console.log('Generated career plan:', data);
    // } catch (error) {
    //   console.error('Error generating career plan:', error);
    //   setError(error.message);
    // } finally {
    //   setLoading(false);
    // }
  };

  useEffect(() => {
    generateCareerPlan();
  }, []);

  // Transform API response to display format
  const transformMilestoneToPathway = (milestone, index) => {
    const iconMap = {
      'skill_development': Code,
      'certification': TrendingUp,
      'networking': Analytics,
      'portfolio': Cloud,
      'job_application': Security,
      'education': Code,
      'financial': Analytics,
      'experience': TrendingUp
    };
    
    const colorMap = {
      'high': 'error',
      'medium': 'warning',
      'low': 'success'
    };
    
    return {
      id: milestone.id,
      timeRange: `${milestone.estimated_duration_weeks} weeks`,
      title: milestone.title,
      icon: iconMap[milestone.type] || Code,
      color: colorMap[milestone.priority] || 'primary',
      status: milestone.status,
      shortDescription: milestone.description.substring(0, 100) + '...',
      detailedDescription: milestone.description,
      skills: milestone.success_criteria || [],
      deliverables: milestone.success_criteria || [],
      resources: milestone.resources?.map(r => r.name || r.url || 'Resource') || []
    };
  };
  
  const generatePersonalizedMarkdown = () => {
    if (!careerPlan) {
      return `## Generating Your Personalized Career Insights...

Please wait while we analyze your profile and create a customized career transition plan.

---

### What we're doing:
- Analyzing current market trends for your target role
- Identifying skill gaps and learning opportunities  
- Creating a step-by-step milestone plan
- Gathering industry insights and salary data

Your personalized insights will appear here once the plan is generated.`;
    }
    return careerPlan
  };

  const handleStepClick = (step) => {
    setSelectedStep(step);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedStep(null);
  };

  // Refresh handler to regenerate plan
  const handleRefresh = (e, step) => {
    e.stopPropagation();
    generateCareerPlan();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'primary';
      case 'pending': return 'grey';
      default: return 'grey';
    }
  };

  return (
    <>
      <Navigation />

      <Container maxWidth="lg" sx={{ pb: 10 }}>
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Your Career Pathway
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Follow this structured learning path to advance your career. Click on any step to learn more.
          </Typography>
        </Box>

        {/* Markdown Personalized Summary (Display Only) */}
        <Card sx={{ 
          mb: 6, 
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          border: '1px solid',
          borderColor: 'primary.light'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <AutoAwesome sx={{ color: 'primary.main', mr: 1, fontSize: 28 }} />
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                Your Personalized Career Insights
              </Typography>
            </Box>
            <Box
              sx={{
                background: '#fff',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'grey.200',
                p: 2,
                overflow: 'auto',
                maxHeight: { xs: 400, md: 350 }
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                Summary
              </Typography>
              <Box
                sx={{
                  fontSize: '1.05rem',
                  lineHeight: 1.7,
                  '& h1, & h2, & h3, & h4': { fontWeight: 600, mt: 2, mb: 1 },
                  '& ul': { pl: 3, mb: 1 },
                  '& ol': { pl: 3, mb: 1 },
                  '& li': { mb: 0.5 },
                  '& code': {
                    background: '#f1f5f9',
                    borderRadius: 1,
                    px: 0.5,
                    fontSize: '0.95em'
                  },
                  '& blockquote': {
                    borderLeft: '4px solid #cbd5e1',
                    background: '#f8fafc',
                    color: 'grey.700',
                    pl: 2,
                    my: 2,
                    py: 1
                  }
                }}
              >
                <ReactMarkdown>{generatePersonalizedMarkdown()}</ReactMarkdown>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button 
                variant="contained" 
                component={Link} 
                to={CHAT_ROUTE}
                startIcon={<ChatIcon />}
                sx={{ fontWeight: 600 }}
              >
                Update My Profile
              </Button>
            </Box>
          </CardContent>
        </Card>

        {loading && (
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h6">Generating your personalized career plan...</Typography>
          </Box>
        )}
        
        {error && (
          <Box sx={{ textAlign: 'center', mb: 4, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
            <Typography variant="h6" color="error">Error: {error}</Typography>
            <Button onClick={generateCareerPlan} variant="contained" sx={{ mt: 1 }}>
              Retry
            </Button>
          </Box>
        )}

        {true && (
          <Box sx={{ mb: 8 }}>
            <Stepper orientation="vertical" sx={{ pl: 2 }}>
              {[].map((step, index) => (
                <Step key={step.id} active={true} sx={{ mb: 2 }}>
                  <StepLabel
                    StepIconComponent={() => {
                      const IconComponent = step.icon;
                      return (
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            backgroundColor: `${step.color}.main`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            opacity: step.status === 'pending' ? 0.6 : 1
                          }}
                        >
                          <IconComponent sx={{ fontSize: 24 }} />
                        </Box>
                      );
                    }}
                  >
                    <Card 
                      sx={{ 
                        ml: 2, 
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        border: '1px solid',
                        borderColor: step.status === 'in_progress' ? 'primary.main' : 'grey.200',
                        backgroundColor: step.status === 'completed' ? 'success.50' : 'background.paper',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)'
                        }
                      }}
                      onClick={() => handleStepClick(step)}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              {step.timeRange}
                            </Typography>
                            <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                              {step.title}
                            </Typography>
                          </Box>
                          <IconButton
                            aria-label="Refresh"
                            size="small"
                            onClick={e => handleRefresh(e, step)}
                            sx={{
                              color: getStatusColor(step.status) + '.main',
                              backgroundColor: 'grey.100',
                              '&:hover': {
                                backgroundColor: 'grey.200'
                              }
                            }}
                          >
                            <RefreshIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {step.shortDescription}
                        </Typography>
                      </CardContent>
                    </Card>
                  </StepLabel>
                  {index < [].length - 1 && (
                    <StepContent sx={{ ml: 3, borderLeft: '2px solid', borderColor: 'grey.300' }}>
                      <Box sx={{ height: 20 }} />
                    </StepContent>
                  )}
                </Step>
              ))}
            </Stepper>
          </Box>
        )}

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
                  Need More Personalized Guidance?
                </Typography>
                <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, maxWidth: '500px', mx: 'auto' }}>
                  Chat with our AI assistant to share your specific career goals and current situation.
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
                  Personalize your Recommendations
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Step Detail Modal */}
      <Dialog 
        open={modalOpen} 
        onClose={handleCloseModal} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        {selectedStep && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  {/* Keep the tag in the modal for context */}
                  <Typography variant="overline" sx={{ mb: 1, fontWeight: 600, display: 'block', color: getStatusColor(selectedStep.status) + '.main' }}>
                    {selectedStep.timeRange}
                  </Typography>
                  <Typography variant="h4" component="h2" sx={{ fontWeight: 600 }}>
                    {selectedStep.title}
                  </Typography>
                </Box>
                <Button onClick={handleCloseModal} color="inherit">
                  <Close />
                </Button>
              </Box>
            </DialogTitle>
            
            <DialogContent sx={{ pt: 2 }}>
              <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                {selectedStep.detailedDescription}
              </Typography>
              
              <Divider sx={{ my: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Key Skills
                  </Typography>
                  <Stack spacing={1}>
                    {selectedStep.skills.map((skill, index) => (
                      <Typography key={index} variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                        • {skill}
                      </Typography>
                    ))}
                  </Stack>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Deliverables
                  </Typography>
                  <Stack spacing={1}>
                    {selectedStep.deliverables.map((item, index) => (
                      <Typography key={index} variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                        • {item}
                      </Typography>
                    ))}
                  </Stack>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Resources
                  </Typography>
                  <Stack spacing={1}>
                    {selectedStep.resources.map((resource, index) => (
                      <Typography key={index} variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                        • {resource}
                      </Typography>
                    ))}
                  </Stack>
                </Grid>
              </Grid>
            </DialogContent>
            
            <DialogActions sx={{ p: 3, pt: 1 }}>
              <Button onClick={handleCloseModal} variant="outlined">
                Close
              </Button>
              <Button 
                variant="contained" 
                component={Link} 
                to={CHAT_ROUTE}
                onClick={handleCloseModal}
                startIcon={<ChatIcon />}
              >
                Get Guidance
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <PageNavigation />
    </>
  );
};

export default Paths;