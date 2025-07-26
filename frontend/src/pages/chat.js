import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useSupabase } from '../contexts/SupabaseContext';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader,
  Box,
  TextField,
  Paper,
  Stack,
  Chip,
  Typography,
  Button,
  LinearProgress,
  Alert,
  CircularProgress
} from '@mui/material';
import { Send, CheckCircle, Person, Work, Psychology, School, Flag } from '@mui/icons-material';
import Navigation from '../components/Navigation';
import PageNavigation from '../components/PageNavigation';

const Chat = () => {
  const { user, db } = useSupabase();
  
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [currentCategory, setCurrentCategory] = useState(0);
  const [userResponses, setUserResponses] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  // Define the 5 categories and their questions
  const categories = [
    {
      name: 'Interests + Values',
      icon: <Psychology />,
      questions: [
        'What are your main interests and hobbies?',
      ]
    },
    {
      name: 'Work Experience',
      icon: <Work />,
      questions: [
        'What jobs have you had in the past?',
      ]
    },
    {
      name: 'Circumstances',
      icon: <Person />,
      questions: [
        'What is your current living situation?',
      ]
    },
    {
      name: 'Skills',
      icon: <School />,
      questions: [
        'What technical skills do you currently have?',
      ]
    },
    {
      name: 'Goals',
      icon: <Flag />,
      questions: [
        'What are your short-term career goals (next 1-2 years)?',
      ]
    }
  ];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    // Optional: Log Supabase user for debugging
    if (user) {
      console.log('Supabase user:', user);
      console.log('Supabase user ID:', user.id);
    }
  }, [user]);

  useEffect(() => {
    // Initialize chat with welcome message
    if (messages.length === 0) {
      const welcomeMessage = {
        id: 1,
        text: `Hello! I'm here to help you explore your career path. I'll ask you a series of questions across 5 key areas to better understand your situation and goals. Let's start with your interests and values!`,
        sender: "assistant",
        timestamp: new Date(),
        category: categories[0].name
      };
      setMessages([welcomeMessage]);
      askNextQuestion();
    }
  }, []);

  const askNextQuestion = () => {
    const category = categories[currentCategory];
    const question = category.questions[currentQuestionIndex];
    
    const questionMessage = {
      id: messages.length + 1,
      text: question,
      sender: "assistant",
      timestamp: new Date(),
      category: category.name,
      questionIndex: currentQuestionIndex
    };
    
    setMessages(prev => [...prev, questionMessage]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
      category: categories[currentCategory].name,
      questionIndex: currentQuestionIndex
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Save user response
    const categoryName = categories[currentCategory].name;
    const questionKey = `${categoryName.toLowerCase().replace(/[^a-z]/g, '_')}_q${currentQuestionIndex + 1}`;
    
    setUserResponses(prev => ({
      ...prev,
      [questionKey]: inputMessage
    }));

    // Move to next question or category
    if (currentQuestionIndex < categories[currentCategory].questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeout(() => askNextQuestion(), 1000);
    } else {
      // Move to next category
      if (currentCategory < categories.length - 1) {
        const nextCategory = currentCategory + 1;
        setCurrentCategory(nextCategory);
        setCurrentQuestionIndex(0);
        
        const categoryTransitionMessage = {
          id: messages.length + 2,
          text: `Great! Now let's move on to ${categories[nextCategory].name}.`,
          sender: "assistant",
          timestamp: new Date(),
          category: categories[nextCategory].name
        };
        
        setMessages(prev => [...prev, categoryTransitionMessage]);
        setTimeout(() => askNextQuestion(), 1000);
      } else {
        // All questions completed
        const completionMessage = {
          id: messages.length + 2,
          text: "Excellent! I've gathered all the information I need. Let me save your responses and provide you with some personalized career insights.",
          sender: "assistant",
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, completionMessage]);
        await saveUserInformation();
      }
    }
  };

  const saveUserInformation = async () => {
    setIsSaving(true);
    setSaveStatus('saving');
    
    try {
      // Compile responses into the format expected by your table
      const userData = {
        user_id: user?.id, // Supabase user ID
        username: user?.email || 'Anonymous',
        "Interests + Values": compileCategoryResponses('Interests + Values'),
        "Work Experience": compileCategoryResponses('Work Experience'),
        "Circumstances": compileCategoryResponses('Circumstances'),
        "Skills": compileCategoryResponses('Skills'),
        "Goals": compileCategoryResponses('Goals')
      };

      console.log('Saving user data:', userData);
      await db.saveUserInformation(userData);
      
      setSaveStatus('success');
      
      const successMessage = {
        id: messages.length + 1,
        text: "Perfect! Your information has been saved. Based on your responses, I can help you explore career paths that align with your interests, experience, and goals. Would you like me to provide some personalized career recommendations?",
        sender: "assistant",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, successMessage]);
      
    } catch (error) {
      console.error('Error saving user information:', error);
      setSaveStatus('error');
      
      const errorMessage = {
        id: messages.length + 1,
        text: `I encountered an issue saving your information: ${error.message}. Please try again or contact support if the problem persists.`,
        sender: "assistant",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSaving(false);
    }
  };

  const compileCategoryResponses = (categoryName) => {
    const categoryKey = categoryName.toLowerCase().replace(/[^a-z]/g, '_');
    const responses = [];
    
    for (let i = 1; i <= 4; i++) {
      const questionKey = `${categoryKey}_q${i}`;
      if (userResponses[questionKey]) {
        responses.push(userResponses[questionKey]);
      }
    }
    
    return responses.join(' | ');
  };

  const getProgressPercentage = () => {
    const totalQuestions = categories.reduce((sum, cat) => sum + cat.questions.length, 0);
    const answeredQuestions = Object.keys(userResponses).length;
    return (answeredQuestions / totalQuestions) * 100;
  };

  const getCurrentCategoryProgress = () => {
    const category = categories[currentCategory];
    const answeredInCategory = Object.keys(userResponses).filter(key => 
      key.includes(category.name.toLowerCase().replace(/[^a-z]/g, '_'))
    ).length;
    return (answeredInCategory / category.questions.length) * 100;
  };

  return (
    <>
      <Navigation />

      <Container maxWidth="lg" sx={{ pb: 10 }}>
        <Grid container justifyContent="center">
          <Grid item xs={12} lg={8}>
            <Card sx={{ mb: 4, border: '1px solid', borderColor: 'grey.200' }}>
              <CardHeader
                title={
                  <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                    Career Assessment Chat
                  </Typography>
                }
                subheader={
                  <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
                    Let's understand your career situation and goals
                  </Typography>
                }
                sx={{ pb: 2 }}
              />
              <CardContent>
                {/* Progress Indicators */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Overall Progress: {Math.round(getProgressPercentage())}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={getProgressPercentage()} 
                    sx={{ mb: 2, height: 8, borderRadius: 4 }}
                  />
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Current Category: {categories[currentCategory]?.name} ({Math.round(getCurrentCategoryProgress())}%)
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={getCurrentCategoryProgress()} 
                    sx={{ height: 6, borderRadius: 3 }}
                    color="secondary"
                  />
                </Box>

                {/* Category Chips */}
                <Box sx={{ mb: 3 }}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {categories.map((category, index) => (
                      <Chip
                        key={category.name}
                        icon={category.icon}
                        label={category.name}
                        color={index === currentCategory ? 'primary' : 'default'}
                        variant={index === currentCategory ? 'filled' : 'outlined'}
                        size="small"
                      />
                    ))}
                  </Stack>
                </Box>

                {/* Save Status */}
                {saveStatus && (
                  <Box sx={{ mb: 2 }}>
                    {saveStatus === 'saving' && (
                      <Alert severity="info" icon={<CircularProgress size={20} />}>
                        Saving your information...
                      </Alert>
                    )}
                    {saveStatus === 'success' && (
                      <Alert severity="success" icon={<CheckCircle />}>
                        Information saved successfully!
                      </Alert>
                    )}
                    {saveStatus === 'error' && (
                      <Alert severity="error">
                        Error saving information. Please try again.
                      </Alert>
                    )}
                  </Box>
                )}

                {/* Chat Messages */}
                <Box 
                  sx={{ 
                    height: 400, 
                    overflowY: 'auto', 
                    p: 2, 
                    border: '1px solid',
                    borderColor: 'grey.300',
                    borderRadius: 1,
                    mb: 2,
                    backgroundColor: 'grey.50'
                  }}
                >
                  {messages.map((message) => (
                    <Box 
                      key={message.id} 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                        mb: 2
                      }}
                    >
                      <Paper 
                        elevation={1}
                        sx={{ 
                          p: 2, 
                          maxWidth: '80%',
                          backgroundColor: message.sender === 'user' ? 'primary.main' : 'white',
                          color: message.sender === 'user' ? 'white' : 'text.primary',
                          borderRadius: 2
                        }}
                      >
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          {message.text}
                        </Typography>
                        {message.category && (
                          <Chip
                            label={message.category}
                            size="small"
                            sx={{ 
                              fontSize: '0.7rem',
                              backgroundColor: message.sender === 'user' ? 'rgba(255,255,255,0.2)' : 'grey.100'
                            }}
                          />
                        )}
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            display: 'block', 
                            mt: 1,
                            opacity: 0.7
                          }}
                        >
                          {message.timestamp.toLocaleTimeString()}
                        </Typography>
                      </Paper>
                    </Box>
                  ))}
                </Box>

                {/* Input Form */}
                <Box component="form" onSubmit={handleSendMessage}>
                  <Grid container spacing={2} alignItems="flex-end">
                    <Grid item xs>
                      <TextField
                        fullWidth
                        multiline
                        maxRows={3}
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Type your response here..."
                        disabled={isSaving}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={!inputMessage.trim() || isSaving}
                        startIcon={<Send />}
                        sx={{ minWidth: 100 }}
                      >
                        Send
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default Chat;