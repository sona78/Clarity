# Chat Feature Setup Guide

## Overview
The chat feature has been built to work with your existing `User Information` table. It asks 4 questions for each of the 5 categories and saves the responses to your Supabase table.

## Your Table Structure
```sql
create table public."User Information" (
  user_id text primary key not null,
  created_at timestamp with time zone not null default now(),
  username text null,
  "Interests + Values" text null,
  "Work Experience" text null,
  "Circumstances" text null,
  "Skills" text null,
  "Goals" text null
)
```

## Setup Steps

### 1. Environment Variables
Create a `.env` file in the `frontend` directory:
```env
# Auth0 Configuration
REACT_APP_AUTH0_DOMAIN=dev-07daqn7fgnix87ii.us.auth0.com
REACT_APP_AUTH0_CLIENT_ID=XIkHuY4SFeenTPzsxgi21uu6rs7Z5hAX

# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_project_url_here
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 2. Update Table Structure
Run the SQL in `update-table-primary-key.sql` in your Supabase SQL Editor to:
- Remove the auto-incrementing `id` column
- Make `user_id` the primary key
- Update RLS policies accordingly

### 3. Test the Chat Feature
1. Start the development server: `npm start`
2. Navigate to `/chat`
3. Go through the questionnaire
4. Check your Supabase table to see the saved responses

## How It Works

### Question Categories
1. **Interests + Values** (4 questions)
2. **Work Experience** (4 questions)  
3. **Circumstances** (4 questions)
4. **Skills** (4 questions)
5. **Goals** (4 questions)

### Data Flow
1. User answers questions in the chat interface
2. Responses are compiled by category
3. Data is saved to your `User Information` table using `user_id` as the primary key
4. Each category's responses are joined with ` | ` separator

### Example Saved Data
```json
{
  "user_id": "auth0|1234567890",
  "username": "user@example.com",
  "Interests + Values": "I love technology and innovation | Work-life balance and growth | Collaborative team environment | Making a positive impact",
  "Work Experience": "Software developer for 3 years | Built web applications | Solving complex problems | Learned new technologies quickly",
  "Circumstances": "Living in San Francisco | Can study 10 hours per week | Budget for online courses | Family responsibilities on weekends",
  "Skills": "JavaScript, React, Node.js | Good communication and teamwork | Want to learn Python and ML | Strong problem-solving, need leadership skills",
  "Goals": "Become a senior developer in 2 years | Lead a development team | High salary with good work-life balance | 40-hour work week with remote options",
  "created_at": "2024-01-15T10:30:00Z"
}
```

## Features

### Progress Tracking
- Overall progress bar (dynamic total based on questions per category)
- Current category progress
- Visual category indicators

### User Experience
- Smooth transitions between categories
- Real-time save status indicators
- Responsive design
- Category-specific icons

### Data Validation
- Ensures all responses are captured
- Handles empty responses gracefully
- Error handling for save failures

## Customization Options

### Adding More Questions
Edit the `categories` array in `src/pages/chat.js`:
```javascript
const categories = [
  {
    name: 'Interests + Values',
    icon: <Psychology />,
    questions: [
      'Your question 1',
      'Your question 2',
      'Your question 3',
      'Your question 4'
    ]
  },
  // ... more categories
];
```

### Changing Question Text
Simply update the question strings in the categories array.

### Adding New Categories
1. Add a new category object to the array
2. Update your table schema to include the new column
3. Update the `saveUserInformation` function to include the new field

## Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Restart the development server after adding `.env`
   - Check that variable names start with `REACT_APP_`

2. **Supabase Connection Errors**
   - Verify your Supabase URL and anon key
   - Check that RLS policies are properly set
   - Ensure your table name matches exactly: `"User Information"`

3. **Data Not Saving**
   - Check browser console for errors
   - Verify table permissions in Supabase
   - Check that the table column names match exactly
   - Ensure `user_id` is properly set as the primary key

### Debug Commands
```javascript
// Add to your component to debug
console.log('User responses:', userResponses);
console.log('Compiled data:', userData);
console.log('Supabase connection:', supabase);
```

## Next Steps

1. **Add User-Specific Access**: The `user_id` primary key ensures each user has their own row
2. **Response Analysis**: Build features to analyze and provide insights based on responses
3. **Career Recommendations**: Use the collected data to suggest career paths
4. **Progress Tracking**: Allow users to update their responses over time
5. **Export Data**: Add functionality to export user responses 