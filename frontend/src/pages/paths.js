import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent,
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
  IconButton,
  TextField,
  CircularProgress,
  Alert
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
import { supabase } from '../lib/supabase'

const Paths = () => {
  const [selectedStep, setSelectedStep] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Cascade update modal state
  const [cascadeModalOpen, setCascadeModalOpen] = useState(false);
  const [selectedStepForCascade, setSelectedStepForCascade] = useState(null);
  const [userThoughts, setUserThoughts] = useState('');
  const [cascadeLoading, setCascadeLoading] = useState(false);
  const [cascadeError, setCascadeError] = useState(null);
  const [cascadeSuccess, setCascadeSuccess] = useState(false);

  const [planOverview, setPlanOverview] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Store user email from supabase
  const [userEmail, setUserEmail] = useState(null);

  // Fetch user email from supabase auth
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email) {
        setUserEmail(user.email);
      } else {
        setUserEmail(null);
      }
    };
    fetchUser();
  }, []);

  // Helper function to get timeframe from step
  const getTimeframeFromStep = (step) => {
    if (step.timeRange.includes('1 month') || step.id.includes('1_month')) return '1_month';
    if (step.timeRange.includes('3 months') || step.id.includes('3_months')) return '3_months';
    if (step.timeRange.includes('1 year') || step.id.includes('1_year')) return '1_year';
    if (step.timeRange.includes('5 years') || step.id.includes('5_years')) return '5_years';
    return '1_month'; // fallback
  };

  // Transform API response to display format
  const transformApiResponseToMilestones = (apiResponse) => {
    if (!apiResponse) {
      return [];
    }
    
    // Handle both old structure (apiResponse.milestones) and new structure (direct milestone fields)
    const milestonesData = apiResponse.milestones || {
      '1_month': apiResponse.milestone_1,
      '3_months': apiResponse.milestone_2,
      '1_year': apiResponse.milestone_3,
      '5_years': apiResponse.milestone_4
    };
    
    if (!milestonesData) {
      return [];
    }

    const iconMap = {
      'Foundation Phase': Code,
      'Development Phase': TrendingUp,
      'Implementation Phase': Cloud,
      'Mastery Phase': Analytics,
      'Portfolio': Cloud,
      'Networking': Analytics,
      'Job Search': Security,
      'Experience': Code
    };
    
    const colorMap = {
      'high': 'error',
      'medium': 'warning', 
      'low': 'success'
    };

    // Convert milestones object to array and sort by timeframe
    const milestoneArray = Object.entries(milestonesData)
      .filter(([timeKey, milestone]) => milestone !== null && milestone !== undefined)
      .map(([timeKey, milestone]) => {
      const details = milestone.details || milestone;
      
      return {
        id: milestone.milestone_id || timeKey,
        timeRange: milestone.timeframe ? milestone.timeframe.replace('_', ' ') : timeKey.replace('_', ' '),
        title: milestone.title || details.title,
        icon: iconMap[milestone.title] || Code,
        color: colorMap[details.priority_level] || 'primary',
        status: milestone.status || 'pending',
        shortDescription: milestone.overview || details.description?.substring(0, 100) + '...',
        detailedDescription: details.description || milestone.overview,
        keyObjectives: details.key_objectives || [],
        successMetrics: details.success_metrics || [],
        recommendedActions: details.recommended_actions || [],
        resources: details.resources || [],
        potentialChallenges: details.potential_challenges || [],
        budgetEstimate: details.budget_estimate || 0,
        timelineWeeks: details.timeline_weeks || 4,
        completionStatus: milestone.completion_status || 0
      };
    });

    // Sort by timeframe order
    const timeframeOrder = ['1_month', '3_months', '1_year', '5_years'];
    milestoneArray.sort((a, b) => {
      const aIndex = timeframeOrder.findIndex(t => a.id.includes(t) || a.timeRange.includes(t));
      const bIndex = timeframeOrder.findIndex(t => b.id.includes(t) || b.timeRange.includes(t));
      return aIndex - bIndex;
    });

    return milestoneArray;
  };

  // Generate milestone plan, using userEmail from supabase
  const generateMilestonePlan = useCallback(async () => {
    if (!userEmail) {
      // Don't try to fetch if userEmail is not loaded yet
      return;
    }
    setLoading(true);
    setError(null);

    try {
      await fetch(`http://localhost:8000/api/v3/generate-plan/${encodeURIComponent(userEmail)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        // Transform and set milestones from API response
        const transformedMilestones = transformApiResponseToMilestones(data);
        setMilestones(transformedMilestones);
        setPlanOverview(data.overview);
      })
      .catch(error => {
        setError(error.message);
      });

      // API response will be handled above in the .then() block

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  // Cascade update function, using userEmail from supabase
  const handleCascadeUpdate = async () => {
    if (!userThoughts.trim() || !selectedStepForCascade || !userEmail) return;
    
    setCascadeLoading(true);
    setCascadeError(null);
    setCascadeSuccess(false);

    try {
      const timeframe = getTimeframeFromStep(selectedStepForCascade);
      
      const response = await fetch(
        `http://localhost:8000/api/v3/milestone/${timeframe}/${encodeURIComponent(userEmail)}/update-cascade`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_thoughts: userThoughts,
            context: `User wants to update ${selectedStepForCascade.title} milestone`
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform and update milestones from the updated plan
      const transformedMilestones = transformApiResponseToMilestones(data.updated_plan);
      setMilestones(transformedMilestones);
      setPlanOverview(data.updated_plan.overview);
      
      setCascadeSuccess(true);
      
      // Auto-close modal after success
      setTimeout(() => {
        handleCloseCascadeModal();
      }, 2000);
      
    } catch (error) {
      setCascadeError(error.message);
    } finally {
      setCascadeLoading(false);
    }
  };

  useEffect(() => {
    if (userEmail) {
      generateMilestonePlan();
    }
  }, [userEmail, generateMilestonePlan]);

  const generatePersonalizedMarkdown = () => {
    if (error) {
      return `## Unable to Generate Career Insights

There was an error loading your career plan. Please try refreshing the page or contact support if the issue persists.`;
    }
    
    if (!planOverview) {
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
    
    return `## ${planOverview.summary}

### Key Focus Areas
${planOverview.key_focus_areas?.map(area => `- ${area}`).join('\n') || ''}

### Timeline
**Estimated Duration:** ${planOverview.estimated_timeline}

### Success Probability
${planOverview.success_probability}

### Market Outlook
${planOverview.market_outlook}

### Salary Projections
- **Entry Level:** ${planOverview.salary_projection?.entry || 'TBD'}
- **Mid Level:** ${planOverview.salary_projection?.mid || 'TBD'}
- **Senior Level:** ${planOverview.salary_projection?.senior || 'TBD'}

### Critical Skills to Develop
${planOverview.critical_skills_gap?.map(skill => `- ${skill}`).join('\n') || ''}`;
  };

  const handleStepClick = (step) => {
    setSelectedStep(step);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedStep(null);
  };

  // Cascade modal handlers
  const handleOpenCascadeModal = (e, step) => {
    e.stopPropagation();
    setSelectedStepForCascade(step);
    setCascadeModalOpen(true);
    setUserThoughts('');
    setCascadeError(null);
    setCascadeSuccess(false);
  };

  const handleCloseCascadeModal = () => {
    setCascadeModalOpen(false);
    setSelectedStepForCascade(null);
    setUserThoughts('');
    setCascadeError(null);
    setCascadeSuccess(false);
    setCascadeLoading(false);
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
          <Box sx={{ textAlign: 'center', mb: 4, p: 3, bgcolor: 'error.light', borderRadius: 2 }}>
            <Typography variant="h6" color="error" gutterBottom>
              Failed to Load Career Plan
            </Typography>
            <Typography variant="body2" color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
            <Button 
              onClick={() => {
                setError(null);
                generateMilestonePlan();
              }} 
              variant="contained" 
              color="error"
              sx={{ mt: 1 }}
            >
              Try Again
            </Button>
          </Box>
        )}

        {milestones.length > 0 && (
          <Box sx={{ mb: 8 }}>
            <Stepper orientation="vertical" sx={{ pl: 2 }}>
              {milestones.map((step, index) => (
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
                            aria-label="Update with thoughts"
                            size="small"
                            onClick={e => handleOpenCascadeModal(e, step)}
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
                  {index < milestones.length - 1 && (
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
                    Key Objectives
                  </Typography>
                  <Stack spacing={1}>
                    {selectedStep.keyObjectives.map((objective, index) => (
                      <Typography key={index} variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                        • {objective}
                      </Typography>
                    ))}
                  </Stack>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Success Metrics
                  </Typography>
                  <Stack spacing={1}>
                    {selectedStep.successMetrics.map((metric, index) => (
                      <Typography key={index} variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                        • {metric}
                      </Typography>
                    ))}
                  </Stack>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Recommended Actions
                  </Typography>
                  <Stack spacing={1}>
                    {selectedStep.recommendedActions.map((action, index) => (
                      <Typography key={index} variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                        • {action}
                      </Typography>
                    ))}
                  </Stack>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Resources
                  </Typography>
                  <Stack spacing={1}>
                    {selectedStep.resources.map((resource, index) => (
                      <Typography key={index} variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                        • {typeof resource === 'string' ? resource : resource.name}
                      </Typography>
                    ))}
                  </Stack>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Potential Challenges
                  </Typography>
                  <Stack spacing={1}>
                    {selectedStep.potentialChallenges.map((challenge, index) => (
                      <Typography key={index} variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                        • {challenge}
                      </Typography>
                    ))}
                  </Stack>
                </Grid>
              </Grid>
              
              {(selectedStep.budgetEstimate > 0 || selectedStep.timelineWeeks) && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Grid container spacing={3}>
                    {selectedStep.budgetEstimate > 0 && (
                      <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                          Budget Estimate
                        </Typography>
                        <Typography variant="body2">
                          ${selectedStep.budgetEstimate}
                        </Typography>
                      </Grid>
                    )}
                    {selectedStep.timelineWeeks && (
                      <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                          Timeline
                        </Typography>
                        <Typography variant="body2">
                          {selectedStep.timelineWeeks} weeks
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </>
              )}
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

      {/* Cascade Update Modal */}
      <Dialog 
        open={cascadeModalOpen} 
        onClose={handleCloseCascadeModal} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                Update Milestone with Your Thoughts
              </Typography>
              {selectedStepForCascade && (
                <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
                  {selectedStepForCascade.title} ({selectedStepForCascade.timeRange})
                </Typography>
              )}
            </Box>
            <Button onClick={handleCloseCascadeModal} color="inherit">
              <Close />
            </Button>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body1" paragraph sx={{ mb: 3 }}>
            Share your thoughts about this milestone. What would you like to change? 
            Any concerns about the timeline, objectives, or approach? Your input will automatically 
            update this milestone and all subsequent ones to maintain consistency.
          </Typography>
          
          {cascadeError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {cascadeError}
            </Alert>
          )}
          
          {cascadeSuccess && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Successfully updated milestone and cascaded changes to subsequent milestones!
            </Alert>
          )}
          
          <TextField
            fullWidth
            multiline
            rows={6}
            label="Your thoughts and feedback"
            placeholder="For example: 'I think the timeline is too aggressive, I need more time to learn the fundamentals' or 'I want to focus more on practical projects rather than theory'"
            value={userThoughts}
            onChange={(e) => setUserThoughts(e.target.value)}
            disabled={cascadeLoading || cascadeSuccess}
            sx={{ mb: 2 }}
          />
          
          {selectedStepForCascade && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                This will update:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • <strong>{selectedStepForCascade.title}</strong> milestone directly based on your thoughts
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • All subsequent milestones will be automatically adjusted to align with your changes
              </Typography>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={handleCloseCascadeModal} 
            variant="outlined"
            disabled={cascadeLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCascadeUpdate}
            variant="contained"
            disabled={!userThoughts.trim() || cascadeLoading || cascadeSuccess}
            startIcon={cascadeLoading ? <CircularProgress size={16} /> : <RefreshIcon />}
          >
            {cascadeLoading ? 'Updating...' : 'Update & Cascade'}
          </Button>
        </DialogActions>
      </Dialog>

      <PageNavigation />
    </>
  );
};

export default Paths;