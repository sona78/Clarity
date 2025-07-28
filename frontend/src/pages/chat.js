import React, { useState, useEffect, useRef, useMemo } from 'react';
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

const Chat = () => {
  const { user, db } = useSupabase();
  
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [currentCategory, setCurrentCategory] = useState(0);
  const [userResponses, setUserResponses] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [messageIdCounter, setMessageIdCounter] = useState(1);

  // Define the 5 categories and their questions
  const categories = useMemo(() => [
    {
      name: 'Interests + Values',
      icon: <Psychology />,
      questions: [
        'What are the things you value the most in life?',
        'What do you enjoy doing?',
      ]
    },
    {
      name: 'Work Experience',
      icon: <Work />,
      questions: [
        'Briefly list your current and previous jobs',
        'Tell me about a job / project at work you really enjoyed',
        'Tell me about a job / project at work you really didn\'t enjoy',
      ]
    },
    {
      name: 'Circumstances',
      icon: <Person />,
      questions: [
        'How old are you?',
        'Where do you live?',
        'Approximately how much money do you make?',
        'Who depends on your income?',
        'How much time do you want to spend learning new things?',
        'Do you have any other constraints (eg. health)?',
      ]
    },
    {
      name: 'Skills',
      icon: <School />,
      questions: [
        'What technical skills do you have?',
        'What else are you good at?',
        'What do you wish you were better at?',
      ]
    },
    {
      name: 'Goals',
      icon: <Flag />,
      questions: [
        'What are a few life goals you have?',
        'What makes you feel proud of yourself?',
      ]
    }
  ], []);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const chatBoxRef = useRef(null);


  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Initialize chat with welcome message
    if (messages.length === 0) {
      const welcomeMessage = {
        id: 1,
        text: `Hello! I'm here to help you explore your career path. I'll ask you a series of questions across 5 key areas to better understand your situation and goals. Say hello, and lets get started!`,
        sender: "assistant",
        timestamp: new Date(),
        category: categories[0].name
      };
      setMessages([welcomeMessage]);
      setMessageIdCounter(2); // Start next message at ID 2
    }
  }, [categories, messages.length]);

//   const askNextQuestion = () => {
//     // Use the current state values to get the correct question
//     const category = categories[currentCategory];
//     const question = category.questions[currentQuestionIndex];
    
//     const questionMessage = {
//       id: messageIdCounter,
//       text: question,
//       sender: "assistant",
//       timestamp: new Date(),
//       category: category.name,
//       questionIndex: currentQuestionIndex
//     };
    
//     setMessages(prev => [...prev, questionMessage]);
//     setMessageIdCounter(prev => prev + 1);
//   };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messageIdCounter,
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
      category: categories[currentCategory].name,
      questionIndex: currentQuestionIndex
    };

    setMessages(prev => [...prev, userMessage]);
    setMessageIdCounter(prev => prev + 1);
    setInputMessage('');

    // Check if this is the first user message (no questions asked yet)
    if (messages.length === 1) {
      // This is the first user message, ask the first question
      setTimeout(() => {
        const category = categories[currentCategory];
        const question = category.questions[currentQuestionIndex];
        
        const questionMessage = {
          id: messageIdCounter + 1,
          text: question,
          sender: "assistant",
          timestamp: new Date(),
          category: category.name,
          questionIndex: currentQuestionIndex
        };
        
        setMessages(prev => [...prev, questionMessage]);
        setMessageIdCounter(prev => prev + 1);
      }, 1000);
      return; // Exit early, don't process as a response
    }

    // Save user response
    const categoryName = categories[currentCategory].name;
    const questionKey = `${categoryName.toLowerCase().replace(/[^a-z]/g, '_')}_q${currentQuestionIndex + 1}`;
    
    setUserResponses(prev => ({
      ...prev,
      [questionKey]: inputMessage
    }));

    // Move to next question or category
    if (currentQuestionIndex < categories[currentCategory].questions.length - 1) {
      // Move to next question in same category
      const nextQuestionIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextQuestionIndex);
      
      setTimeout(() => {
        const category = categories[currentCategory];
        const question = category.questions[nextQuestionIndex];
        
        const questionMessage = {
          id: messageIdCounter + 1,
          text: question,
          sender: "assistant",
          timestamp: new Date(),
          category: category.name,
          questionIndex: nextQuestionIndex
        };
        
        setMessages(prev => [...prev, questionMessage]);
        setMessageIdCounter(prev => prev + 1);
      }, 1000);
      
    } else {
      // Move to next category
      if (currentCategory < categories.length - 1) {
        const nextCategory = currentCategory + 1;
        setCurrentCategory(nextCategory);
        setCurrentQuestionIndex(0);
        
        const categoryTransitionMessage = {
          id: messageIdCounter + 1,
          text: `Great! Now let's move on to ${categories[nextCategory].name}.`,
          sender: "assistant",
          timestamp: new Date(),
          category: categories[nextCategory].name
        };
        
        setMessages(prev => [...prev, categoryTransitionMessage]);
        setMessageIdCounter(prev => prev + 1);
        
        setTimeout(() => {
          const category = categories[nextCategory];
          const question = category.questions[0];
          
          const questionMessage = {
            id: messageIdCounter + 2,
            text: question,
            sender: "assistant",
            timestamp: new Date(),
            category: category.name,
            questionIndex: 0
          };
          
          setMessages(prev => [...prev, questionMessage]);
          setMessageIdCounter(prev => prev + 1);
        }, 1000);
        
      } else {
        // All questions completed
        const completionMessage = {
          id: messageIdCounter + 1,
          text: "Excellent! I've gathered all the information I need. Let me save your responses and provide you with some personalized career insights.",
          sender: "assistant",
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, completionMessage]);
        setMessageIdCounter(prev => prev + 1);
        await saveUserInformation();
      }
    }
  };

  // Handle skipping a question
  const handleSkipQuestion = () => {
    // Save empty response for current question
    const categoryName = categories[currentCategory].name;
    const questionKey = `${categoryName.toLowerCase().replace(/[^a-z]/g, '_')}_q${currentQuestionIndex + 1}`;
    
    setUserResponses(prev => ({
      ...prev,
      [questionKey]: '[SKIPPED]'
    }));

    // Move to next question or category (same logic as handleSendMessage)
    if (currentQuestionIndex < categories[currentCategory].questions.length - 1) {
      // Move to next question in same category
      const nextQuestionIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextQuestionIndex);
      
      setTimeout(() => {
        const category = categories[currentCategory];
        const question = category.questions[nextQuestionIndex];
        
        const questionMessage = {
          id: messageIdCounter + 1,
          text: question,
          sender: "assistant",
          timestamp: new Date(),
          category: category.name,
          questionIndex: nextQuestionIndex
        };
        
        setMessages(prev => [...prev, questionMessage]);
        setMessageIdCounter(prev => prev + 1);
      }, 1000);
      
    } else {
      // Move to next category
      if (currentCategory < categories.length - 1) {
        const nextCategory = currentCategory + 1;
        setCurrentCategory(nextCategory);
        setCurrentQuestionIndex(0);
        
        const categoryTransitionMessage = {
          id: messageIdCounter + 1,
          text: `Great! Now let's move on to ${categories[nextCategory].name}.`,
          sender: "assistant",
          timestamp: new Date(),
          category: categories[nextCategory].name
        };
        
        setMessages(prev => [...prev, categoryTransitionMessage]);
        setMessageIdCounter(prev => prev + 1);
        
        setTimeout(() => {
          const category = categories[nextCategory];
          const question = category.questions[0];
          
          const questionMessage = {
            id: messageIdCounter + 2,
            text: question,
            sender: "assistant",
            timestamp: new Date(),
            category: category.name,
            questionIndex: 0
          };
          
          setMessages(prev => [...prev, questionMessage]);
          setMessageIdCounter(prev => prev + 1);
        }, 1000);
        
      } else {
        // All questions completed
        const completionMessage = {
          id: messageIdCounter + 1,
          text: "Excellent! I've gathered all the information I need. Let me save your responses and provide you with some personalized career insights.",
          sender: "assistant",
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, completionMessage]);
        setMessageIdCounter(prev => prev + 1);
        saveUserInformation();
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

      await db.saveUserInformation(userData);
      
      setSaveStatus('success');
      
      const successMessage = {
        id: messageIdCounter,
        text: "Perfect! Your information has been saved. Based on your responses, I can help you explore career paths that align with your interests, experience, and goals. Would you like me to provide some personalized career recommendations?",
        sender: "assistant",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, successMessage]);
      setMessageIdCounter(prev => prev + 1);
      
    } catch (error) {
      setSaveStatus('error');
      
      const errorMessage = {
        id: messageIdCounter,
        text: `I encountered an issue saving your information: ${error.message}. Please try again or contact support if the problem persists.`,
        sender: "assistant",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setMessageIdCounter(prev => prev + 1);
    } finally {
      setIsSaving(false);
    }
  };

  const compileCategoryResponses = (categoryName) => {
    const categoryKey = categoryName.toLowerCase().replace(/[^a-z]/g, '_');
    const responses = [];
    
    // Find the category to get the actual number of questions
    const category = categories.find(cat => cat.name === categoryName);
    if (!category) return '';
    
    // Loop through the actual number of questions in this category
    for (let i = 1; i <= category.questions.length; i++) {
      const questionKey = `${categoryKey}_q${i}`;
      if (userResponses[questionKey]) {
        const question = category.questions[i - 1]; // Get the actual question text
        const answer = userResponses[questionKey];
        responses.push(`${question}: ${answer}`);
      }
    }
    
    return responses.join(' || ');
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

  // Handler for Enter key in TextField
  const handleInputKeyDown = (e) => {
    if (
      e.key === 'Enter' &&
      !e.shiftKey && // allow Shift+Enter for newline
      !isSaving &&
      inputMessage.trim()
    ) {
      e.preventDefault();
      handleSendMessage();
    }
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
                  ref={chatBoxRef}
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
                        onKeyDown={handleInputKeyDown}
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
                        sx={{ minWidth: 100, mb: 0.5 }}
                      >
                        Send
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button
                        variant="outlined"
                        disabled={isSaving || messages.length <= 1}
                        onClick={() => handleSkipQuestion()}
                        sx={{ minWidth: 100, mb: 0.5 }}
                      >
                        Skip
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