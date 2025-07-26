# Supabase Integration Setup Guide

## Prerequisites
- A Supabase project already set up
- Your Supabase project URL and anon key

## Step 1: Environment Variables

Create a `.env` file in the `frontend` directory with the following variables:

```env
# Auth0 Configuration
REACT_APP_AUTH0_DOMAIN=dev-07daqn7fgnix87ii.us.auth0.com
REACT_APP_AUTH0_CLIENT_ID=XIkHuY4SFeenTPzsxgi21uu6rs7Z5hAX

# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_project_url_here
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

Replace `your_supabase_project_url_here` and `your_supabase_anon_key_here` with your actual Supabase project credentials.

## Step 2: Database Schema Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase-schema.sql` into the editor
4. Run the SQL script to create all necessary tables and policies

## Step 3: Authentication Setup

### Option A: Use Supabase Auth (Recommended)
If you want to switch from Auth0 to Supabase Auth:

1. Update the `App.js` to use Supabase Auth instead of Auth0
2. Update the `ProtectedRoute` component to use Supabase session
3. Update the `Navigation` component to use Supabase user

### Option B: Keep Auth0 (Current Setup)
If you want to keep Auth0 for authentication:

1. You'll need to create a custom JWT token that Supabase can validate
2. Set up Auth0 rules to include Supabase-compatible claims
3. Configure Supabase to accept Auth0 tokens

## Step 4: Test the Integration

1. Start the development server: `npm start`
2. Navigate to the chat or paths page
3. Check the browser console for any errors
4. Verify that data is being saved to and retrieved from Supabase

## Database Tables Created

- **profiles**: User profile information
- **chat_messages**: Chat conversation history
- **career_paths**: Available career paths
- **path_steps**: Individual steps within career paths
- **user_progress**: User progress tracking
- **user_sessions**: Chat session management

## Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:
- Users can only access their own data
- Career paths are publicly readable
- Chat messages are user-specific
- Progress tracking is user-specific

## Next Steps

1. **Update Chat Component**: Modify `src/pages/chat.js` to use Supabase for message persistence
2. **Update Paths Component**: Modify `src/pages/paths.js` to fetch career paths from Supabase
3. **Add Real-time Features**: Implement real-time subscriptions for chat updates
4. **Add File Storage**: Use Supabase Storage for user avatars and documents

## Troubleshooting

### Common Issues:

1. **Environment Variables Not Loading**: Make sure to restart the development server after adding `.env`
2. **RLS Policy Errors**: Check that the user is authenticated and policies are correctly set
3. **CORS Issues**: Ensure your Supabase project allows requests from your localhost domain
4. **JWT Token Issues**: Verify that your Auth0 configuration is compatible with Supabase

### Debug Commands:

```bash
# Check if environment variables are loaded
echo $REACT_APP_SUPABASE_URL

# Test Supabase connection
# Add this to your component temporarily:
console.log('Supabase URL:', process.env.REACT_APP_SUPABASE_URL);
console.log('Supabase Key:', process.env.REACT_APP_SUPABASE_ANON_KEY);
``` 