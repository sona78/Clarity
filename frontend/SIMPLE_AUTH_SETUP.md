# Simple Supabase Auth Setup

## Overview
This guide explains how to set up simple email/password authentication with Supabase - no external OAuth providers needed!

## Step 1: Enable Email Auth in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Providers**
3. Make sure **Email** provider is enabled (it should be by default)
4. Configure email settings:
   - **Enable email confirmations**: Yes (recommended)
   - **Enable secure email change**: Yes
   - **Enable double confirm changes**: No (optional)

## Step 2: Update Database Schema

Run the SQL from `supabase-auth-setup.sql` in your Supabase SQL Editor. This will:

1. **Recreate the User Information table** with proper Supabase Auth integration
2. **Set up Row Level Security** policies
3. **Create automatic user profile creation** on signup
4. **Add proper foreign key constraints** to auth.users

## Step 3: Environment Variables

Create/update your `.env` file:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_project_url_here
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Step 4: Test the Integration

1. **Start the development server**: `npm start`
2. **Navigate to the app**: Go to `http://localhost:3000`
3. **Click Login**: Use the "Login" button in the navigation
4. **Sign up**: Create a new account with email/password
5. **Verify email**: Check your email and click the verification link
6. **Sign in**: Use your email/password to sign in
7. **Test the chat**: Go to `/chat` and complete the questionnaire
8. **Check Supabase**: Verify data is saved in your `User Information` table

## How It Works

### Authentication Flow:
1. User clicks "Login" button
2. User is taken to `/auth` page
3. User can sign up with email/password or sign in if they have an account
4. Supabase sends verification email (for new accounts)
5. User verifies email and signs in
6. User is redirected to the chat page

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

### Email/Password Authentication
- Simple signup and login
- Email verification for security
- Password reset functionality (can be added later)

## Troubleshooting

### Common Issues:

1. **"Email provider not enabled"**
   - Check that Email provider is enabled in Supabase Auth settings
   - Verify email confirmations are enabled

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

5. **"Verification email not received"**
   - Check spam folder
   - Verify email address is correct
   - Check Supabase email settings

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
- **Email Verification**: Ensures valid email addresses

## Next Steps

1. **Add Password Reset**: Enable password reset functionality
2. **User Profile Management**: Allow users to update their profile information
3. **Data Export**: Add functionality to export user responses
4. **Analytics**: Build features to analyze user responses
5. **Career Recommendations**: Use collected data to suggest career paths

## That's It!

No external OAuth setup required! Just enable email auth in Supabase and you're ready to go. Users can sign up with their email and password, and the system will automatically create their profile and save their chat responses. 