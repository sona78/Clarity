import React, { useState } from 'react';
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
  Button
} from '@mui/material';
import { Send } from '@mui/icons-material';
import Navigation from '../components/Navigation';
import PageNavigation from '../components/PageNavigation';

const Chat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your career guidance assistant. Tell me about your current role and career goals, and I'll help you predict your career path and identify the training you need.",
      sender: "assistant",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: inputMessage,
        sender: "user",
        timestamp: new Date()
      };
      setMessages([...messages, newMessage]);
      setInputMessage('');
      
      setTimeout(() => {
        const response = {
          id: messages.length + 2,
          text: "Thanks for sharing that information! Based on your background, I can help you explore several career prediction scenarios. Would you like me to analyze potential growth paths in your current field or explore transitions to related industries?",
          sender: "assistant",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, response]);
      }, 1000);
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
                    Career Guidance Chat
                  </Typography>
                }
                subheader={
                  <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
                    Get personalized career predictions and training recommendations
                  </Typography>
                }
                sx={{ pb: 2 }}
              />
              <CardContent>
                <Box 
                  sx={{ 
                    height: 400, 
                    overflowY: 'auto', 
                    p: 2, 
                    border: '1px solid',
                    borderColor: 'grey.300',
                    borderRadius: 1,
                    mb: 2
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
                          maxWidth: '70%',
                          bgcolor: message.sender === 'user' ? 'primary.main' : 'grey.100',
                          color: message.sender === 'user' ? 'white' : 'text.primary'
                        }}
                      >
                        <Typography variant="body2">
                          {message.text}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            display: 'block', 
                            mt: 1,
                            opacity: 0.8
                          }}
                        >
                          {message.timestamp.toLocaleTimeString()}
                        </Typography>
                      </Paper>
                    </Box>
                  ))}
                </Box>
                
                <Box component="form" onSubmit={handleSendMessage}>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      fullWidth
                      placeholder="Ask about your career path, skills needed, or training recommendations..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      variant="outlined"
                      size="small"
                    />
                    <Button 
                      type="submit" 
                      variant="contained" 
                      endIcon={<Send />}
                      sx={{ minWidth: 'auto' }}
                    >
                      Send
                    </Button>
                  </Stack>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                  Quick Start Questions
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip 
                    label="Data Science Skills" 
                    variant="outlined" 
                    onClick={() => setInputMessage("What skills do I need for a data science career?")}
                    clickable
                    sx={{ fontWeight: 500 }}
                  />
                  <Chip 
                    label="Career Transition" 
                    variant="outlined" 
                    onClick={() => setInputMessage("How can I transition from marketing to tech?")}
                    clickable
                    sx={{ fontWeight: 500 }}
                  />
                  <Chip 
                    label="Cloud Certifications" 
                    variant="outlined" 
                    onClick={() => setInputMessage("What certifications should I get for cloud computing?")}
                    clickable
                    sx={{ fontWeight: 500 }}
                  />
                  <Chip 
                    label="Career Prediction" 
                    variant="outlined" 
                    onClick={() => setInputMessage("Predict my career growth in the next 5 years")}
                    clickable
                    sx={{ fontWeight: 500 }}
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <PageNavigation />
    </>
  );
};

export default Chat;