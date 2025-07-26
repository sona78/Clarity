import React, { useState } from 'react';
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

const DEFAULT_MARKDOWN = `## Example Personalized Career Insights

Welcome! You can use **Markdown** to write your personalized summary here.

---

### Example

- **Overview:**  
  Based on your interests in technology and problem-solving, along with your background in business, you're well-positioned for a career transition into tech.

- **Recommended Path:**  
  \`Full-Stack Development → Data Analytics → Cloud Architecture\`

- **Strengths:**  
  - Analytical thinking  
  - Business acumen  
  - Problem-solving  
  - Communication

- **Timeline:**  
  _24-30 months to senior level_

- **Key Insights:**  
  1. Your business background gives you an edge in understanding user requirements  
  2. Focus on projects that combine your business knowledge with technical skills  
  3. Consider specializing in fintech or business intelligence tools

- **Immediate Next Steps:**  
  1. Complete programming fundamentals in the next 4 weeks  
  2. Start building a portfolio with business-focused projects  
  3. Network with professionals in your target industry

---

You can update this summary at any time.
`;

const Paths = () => {
  const [selectedStep, setSelectedStep] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const careerPathway = [
    {
      id: 1,
      timeRange: "1 Month",
      title: "Programming Fundamentals",
      icon: Code,
      color: "primary",
      status: "completed",
      shortDescription: "Learn basic programming concepts and syntax",
      detailedDescription: "Master the fundamental concepts of programming including variables, data types, control structures, functions, and basic algorithms. This foundation is crucial for all future development work.",
      skills: ["Variables & Data Types", "Control Structures", "Functions", "Basic Algorithms", "Problem Solving"],
      deliverables: ["Complete 50+ coding exercises", "Build 3 small projects", "Pass fundamentals assessment"],
      resources: ["Interactive coding tutorials", "Practice platforms", "Mentor support"]
    },
    {
      id: 2,
      timeRange: "6 Months",
      title: "Web Development",
      icon: TrendingUp,
      color: "success",
      status: "in_progress",
      shortDescription: "Build modern web applications",
      detailedDescription: "Develop expertise in frontend and backend web technologies. Learn to create responsive, interactive web applications using modern frameworks and best practices.",
      skills: ["HTML/CSS", "JavaScript", "React", "Node.js", "Databases", "API Development"],
      deliverables: ["Portfolio website", "3 full-stack applications", "Deploy to cloud platforms"],
      resources: ["Project-based learning", "Code reviews", "Industry mentors", "Real-world projects"]
    },
    {
      id: 3,
      timeRange: "1 Year",
      title: "Data Analytics",
      icon: Analytics,
      color: "info",
      status: "pending",
      shortDescription: "Master data analysis and visualization",
      detailedDescription: "Learn to extract insights from data using statistical analysis, machine learning, and visualization tools. Develop skills in data cleaning, analysis, and presentation.",
      skills: ["Python/R", "SQL", "Statistics", "Data Visualization", "Machine Learning", "Business Intelligence"],
      deliverables: ["Data analysis portfolio", "Predictive models", "Dashboard creation", "Business insights reports"],
      resources: ["Real datasets", "Industry tools", "Statistics courses", "ML frameworks"]
    },
    {
      id: 4,
      timeRange: "2 Years",
      title: "Cloud Architecture",
      icon: Cloud,
      color: "warning",
      status: "pending",
      shortDescription: "Design scalable cloud solutions",
      detailedDescription: "Master cloud computing platforms and learn to design, implement, and manage scalable cloud infrastructure. Focus on security, performance, and cost optimization.",
      skills: ["AWS/Azure/GCP", "DevOps", "Containerization", "Microservices", "Security", "Cost Optimization"],
      deliverables: ["Cloud architecture designs", "Multi-tier applications", "CI/CD pipelines", "Security implementations"],
      resources: ["Cloud labs", "Certification paths", "Architecture workshops", "Industry case studies"]
    },
    {
      id: 5,
      timeRange: "2+ Years",
      title: "Cybersecurity Expert",
      icon: Security,
      color: "error",
      status: "pending",
      shortDescription: "Protect digital assets and systems",
      detailedDescription: "Become an expert in cybersecurity, learning to identify vulnerabilities, implement security measures, and respond to threats. Develop skills in ethical hacking, risk assessment, and security management.",
      skills: ["Ethical Hacking", "Risk Assessment", "Security Frameworks", "Incident Response", "Compliance", "Threat Analysis"],
      deliverables: ["Security audits", "Penetration testing reports", "Security policies", "Incident response plans"],
      resources: ["Security labs", "Certification programs", "Red team exercises", "Industry partnerships"]
    }
  ];

  const handleStepClick = (step) => {
    setSelectedStep(step);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedStep(null);
  };

  // Dummy refresh handler for demonstration
  const handleRefresh = (e, step) => {
    e.stopPropagation();
    // You can implement actual refresh logic here
    alert(`Refresh requested for "${step.title}"`);
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
                <ReactMarkdown>{DEFAULT_MARKDOWN}</ReactMarkdown>
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

        <Box sx={{ mb: 8 }}>
          <Stepper orientation="vertical" sx={{ pl: 2 }}>
            <Step key={careerPathway[0].id} active={true} sx={{ mb: 2 }}>
              <StepLabel
                StepIconComponent={() => {
                  const IconComponent = careerPathway[0].icon;
                  return (
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        backgroundColor: `${careerPathway[0].color}.main`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        opacity: careerPathway[0].status === 'pending' ? 0.6 : 1
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
                    borderColor: careerPathway[0].status === 'in_progress' ? 'primary.main' : 'grey.200',
                    backgroundColor: careerPathway[0].status === 'completed' ? 'success.50' : 'background.paper',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)'
                    }
                  }}
                  onClick={() => handleStepClick(careerPathway[0])}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box>
                        1 Month
                        <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                          {careerPathway[0].title}
                        </Typography>
                      </Box>
                      <IconButton
                        aria-label="Refresh"
                        size="small"
                        onClick={e => handleRefresh(e, careerPathway[0])}
                        sx={{
                          color: getStatusColor(careerPathway[0].status) + '.main',
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
                      {careerPathway[0].shortDescription}
                    </Typography>
                  </CardContent>
                </Card>
              </StepLabel>
              {careerPathway.length > 1 && (
                <StepContent sx={{ ml: 3, borderLeft: '2px solid', borderColor: 'grey.300' }}>
                  <Box sx={{ height: 20 }} />
                </StepContent>
              )}
            </Step>

            {careerPathway[1] && (
              <Step key={careerPathway[1].id} active={true} sx={{ mb: 2 }}>
                <StepLabel
                  StepIconComponent={() => {
                    const IconComponent = careerPathway[1].icon;
                    return (
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          backgroundColor: `${careerPathway[1].color}.main`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          opacity: careerPathway[1].status === 'pending' ? 0.6 : 1
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
                      borderColor: careerPathway[1].status === 'in_progress' ? 'primary.main' : 'grey.200',
                      backgroundColor: careerPathway[1].status === 'completed' ? 'success.50' : 'background.paper',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)'
                      }
                    }}
                    onClick={() => handleStepClick(careerPathway[1])}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box>
                          1 Month
                          <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                            {careerPathway[1].title}
                          </Typography>
                        </Box>
                        <IconButton
                          aria-label="Refresh"
                          size="small"
                          onClick={e => handleRefresh(e, careerPathway[1])}
                          sx={{
                            color: getStatusColor(careerPathway[1].status) + '.main',
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
                        {careerPathway[1].shortDescription}
                      </Typography>
                    </CardContent>
                  </Card>
                </StepLabel>
                {careerPathway.length > 2 && (
                  <StepContent sx={{ ml: 3, borderLeft: '2px solid', borderColor: 'grey.300' }}>
                    <Box sx={{ height: 20 }} />
                  </StepContent>
                )}
              </Step>
            )}

            {careerPathway[2] && (
              <Step key={careerPathway[2].id} active={true} sx={{ mb: 2 }}>
                <StepLabel
                  StepIconComponent={() => {
                    const IconComponent = careerPathway[2].icon;
                    return (
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          backgroundColor: `${careerPathway[2].color}.main`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          opacity: careerPathway[2].status === 'pending' ? 0.6 : 1
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
                      borderColor: careerPathway[2].status === 'in_progress' ? 'primary.main' : 'grey.200',
                      backgroundColor: careerPathway[2].status === 'completed' ? 'success.50' : 'background.paper',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)'
                      }
                    }}
                    onClick={() => handleStepClick(careerPathway[2])}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box>
                          1 Month
                          <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                            {careerPathway[2].title}
                          </Typography>
                        </Box>
                        <IconButton
                          aria-label="Refresh"
                          size="small"
                          onClick={e => handleRefresh(e, careerPathway[2])}
                          sx={{
                            color: getStatusColor(careerPathway[2].status) + '.main',
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
                        {careerPathway[2].shortDescription}
                      </Typography>
                    </CardContent>
                  </Card>
                </StepLabel>
                {careerPathway.length > 3 && (
                  <StepContent sx={{ ml: 3, borderLeft: '2px solid', borderColor: 'grey.300' }}>
                    <Box sx={{ height: 20 }} />
                  </StepContent>
                )}
              </Step>
            )}

            {careerPathway[3] && (
              <Step key={careerPathway[3].id} active={true} sx={{ mb: 2 }}>
                <StepLabel
                  StepIconComponent={() => {
                    const IconComponent = careerPathway[3].icon;
                    return (
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          backgroundColor: `${careerPathway[3].color}.main`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          opacity: careerPathway[3].status === 'pending' ? 0.6 : 1
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
                      borderColor: careerPathway[3].status === 'in_progress' ? 'primary.main' : 'grey.200',
                      backgroundColor: careerPathway[3].status === 'completed' ? 'success.50' : 'background.paper',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)'
                      }
                    }}
                    onClick={() => handleStepClick(careerPathway[3])}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box>
                          1 Month
                          <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                            {careerPathway[3].title}
                          </Typography>
                        </Box>
                        <IconButton
                          aria-label="Refresh"
                          size="small"
                          onClick={e => handleRefresh(e, careerPathway[3])}
                          sx={{
                            color: getStatusColor(careerPathway[3].status) + '.main',
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
                        {careerPathway[3].shortDescription}
                      </Typography>
                    </CardContent>
                  </Card>
                </StepLabel>
                {careerPathway.length > 4 && (
                  <StepContent sx={{ ml: 3, borderLeft: '2px solid', borderColor: 'grey.300' }}>
                    <Box sx={{ height: 20 }} />
                  </StepContent>
                )}
              </Step>
            )}

            {careerPathway[4] && (
              <Step key={careerPathway[4].id} active={true} sx={{ mb: 2 }}>
                <StepLabel
                  StepIconComponent={() => {
                    const IconComponent = careerPathway[4].icon;
                    return (
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          backgroundColor: `${careerPathway[4].color}.main`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          opacity: careerPathway[4].status === 'pending' ? 0.6 : 1
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
                      borderColor: careerPathway[4].status === 'in_progress' ? 'primary.main' : 'grey.200',
                      backgroundColor: careerPathway[4].status === 'completed' ? 'success.50' : 'background.paper',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)'
                      }
                    }}
                    onClick={() => handleStepClick(careerPathway[4])}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box>
                          1 Month
                          <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                            {careerPathway[4].title}
                          </Typography>
                        </Box>
                        <IconButton
                          aria-label="Refresh"
                          size="small"
                          onClick={e => handleRefresh(e, careerPathway[4])}
                          sx={{
                            color: getStatusColor(careerPathway[4].status) + '.main',
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
                        {careerPathway[4].shortDescription}
                      </Typography>
                    </CardContent>
                  </Card>
                </StepLabel>
                {/* No StepContent for last step */}
              </Step>
            )}
          </Stepper>
        </Box>

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
                  Need Personalized Guidance?
                </Typography>
                <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, maxWidth: '500px', mx: 'auto' }}>
                  Chat with our AI assistant to get customized advice for your specific career goals and current situation.
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
                  Get Personalized Advice
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