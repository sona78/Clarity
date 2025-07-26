# Supabase Auth Integration Setup

## Overview
This guide explains how to set up Supabase Auth for the Clarity application, replacing Auth0 with native Supabase authentication.

## Step 1: Configure Supabase Auth

### 1.1 Enable Google OAuth Provider
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Providers**
3. Enable **Google** provider
4. Add your Google OAuth credentials:
   - **Client ID**: Your Google OAuth client ID
   - **Client Secret**: Your Google OAuth client secret
5. Add redirect URLs:
   - `http://localhost:3000/auth/callback` (for development)
   - `https://yourdomain.com/auth/callback` (for production)

### 1.2 Configure Site URL
1. Go to **Authentication** > **Settings**
2. Set **Site URL** to `http://localhost:3000` (for development)
3. Add redirect URLs:
   - `http://localhost:3000`
   - `http://localhost:3000/chat`
   - `http://localhost:3000/paths`

## Step 2: Update Database Schema

Run the SQL from `supabase-auth-setup.sql` in your Supabase SQL Editor. This will:

1. **Recreate the User Information table** with proper Supabase Auth integration
2. **Set up Row Level Security** policies
3. **Create automatic user profile creation** on signup
4. **Add proper foreign key constraints** to auth.users

## Step 3: Environment Variables

Update your `.env` file to remove Auth0 and keep only Supabase:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_project_url_here
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Step 4: Test the Integration

1. **Start the development server**: `npm start`
2. **Navigate to the app**: Go to `http://localhost:3000`
3. **Click Login**: Use the "Login" button in the navigation
4. **Sign in with Google**: Complete the OAuth flow
5. **Test the chat**: Go to `/chat` and complete the questionnaire
6. **Check Supabase**: Verify data is saved in your `User Information` table

## How It Works

### Authentication Flow:
1. User clicks "Login" button
2. Supabase redirects to Google OAuth
3. User signs in with Google
4. Google redirects back to Supabase
5. Supabase creates/updates user in `auth.users`
6. Trigger automatically creates row in `User Information` table
7. User is redirected back to the app

### Data Flow:
1. User completes chat questionnaire
2. Data is saved to `User Information` table using `user_id`
3. RLS policies ensure users can only access their own data
4. Each user gets their own dedicated row

### Table Structure:
```sql
CREATE TABLE public."User Information" (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  username TEXT,
  "Interests + Values" TEXT,
  "Work Experience" TEXT,
  "Circumstances" TEXT,
  "Skills" TEXT,
  "Goals" TEXT
);
```

## Features

### Automatic User Profile Creation
- When a user signs up, a row is automatically created in `User Information`
- The `username` field is populated with their email
- All other fields start as NULL

### Row Level Security
- Users can only view their own data
- Users can only insert/update their own data
- Data is automatically isolated by user

### Google OAuth Integration
- Seamless sign-in with Google accounts
- Automatic profile creation
- Secure token handling

## Troubleshooting

### Common Issues:

1. **"OAuth provider not configured"**
   - Check that Google OAuth is enabled in Supabase
   - Verify client ID and secret are correct
   - Ensure redirect URLs are properly configured

2. **"RLS policy violation"**
   - Check that RLS policies are correctly set
   - Verify user is properly authenticated
   - Check that `user_id` matches the authenticated user

3. **"Table doesn't exist"**
   - Run the SQL script to create the table
   - Check that the table name matches exactly: `"User Information"`

4. **"User profile not created"**
   - Check that the trigger function is created
   - Verify the trigger is attached to `auth.users`
   - Check Supabase logs for errors

### Debug Steps:

1. **Check Authentication Status**:
```javascript
// Add to your component temporarily
console.log('User:', user);
console.log('Session:', session);
```

2. **Check Database Connection**:
```javascript
// Add to your component temporarily
console.log('Supabase URL:', process.env.REACT_APP_SUPABASE_URL);
```

3. **Check Table Data**:
```sql
-- Run in Supabase SQL Editor
SELECT * FROM public."User Information";
```

## Security Notes

- **RLS Policies**: Ensure users can only access their own data
- **Cascade Deletes**: When a user is deleted, their data is automatically removed
- **UUID Primary Keys**: More secure than sequential IDs
- **OAuth Security**: Google handles password security

## Next Steps

1. **Add Email/Password Auth**: Enable email/password signup as an alternative
2. **User Profile Management**: Allow users to update their profile information
3. **Data Export**: Add functionality to export user responses
4. **Analytics**: Build features to analyze user responses
5. **Career Recommendations**: Use collected data to suggest career paths 