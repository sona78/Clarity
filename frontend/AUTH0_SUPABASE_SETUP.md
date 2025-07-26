# Auth0 + Supabase Integration Setup

## Overview
This guide explains how to configure Auth0 to work with Supabase for user authentication and data access.

## Step 1: Update Your Supabase Table

Run the SQL from `update-user-information-table.sql` in your Supabase SQL Editor:

```sql
-- Add user_id column to link with Auth0 users
ALTER TABLE public."User Information" 
ADD COLUMN user_id TEXT;

-- Add unique constraint to ensure one row per user
ALTER TABLE public."User Information" 
ADD CONSTRAINT unique_user_id UNIQUE (user_id);

-- Update RLS policies to use user_id
DROP POLICY IF EXISTS "Users can view own information" ON public."User Information";
DROP POLICY IF EXISTS "Users can insert own information" ON public."User Information";
DROP POLICY IF EXISTS "Users can update own information" ON public."User Information";

-- Create new policies that use user_id
CREATE POLICY "Users can view own information" ON public."User Information"
  FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert own information" ON public."User Information"
  FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own information" ON public."User Information"
  FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_information_user_id ON public."User Information"(user_id);
```

## Step 2: Configure Auth0 JWT for Supabase

### Option A: Use Auth0 JWT as Supabase JWT (Recommended)

1. **Get your Supabase JWT Secret**:
   - Go to your Supabase project dashboard
   - Navigate to Settings > API
   - Copy the "JWT Secret"

2. **Configure Auth0 JWT**:
   - Go to your Auth0 dashboard
   - Navigate to Applications > Your App > Settings
   - Add this to "Allowed Callback URLs": `http://localhost:3000`
   - Add this to "Allowed Logout URLs": `http://localhost:3000`

3. **Create Auth0 Rule** (Optional but recommended):
   - Go to Auth0 Dashboard > Auth Pipeline > Rules
   - Create a new rule with this code:

```javascript
function (user, context, callback) {
  // Add Supabase-compatible claims
  const namespace = 'https://supabase.co';
  context.idToken[namespace + '/user_metadata'] = {
    user_id: user.user_id,
    email: user.email,
    email_verified: user.email_verified
  };
  
  context.accessToken[namespace + '/user_metadata'] = {
    user_id: user.user_id,
    email: user.email,
    email_verified: user.email_verified
  };
  
  callback(null, user, context);
}
```

## Step 3: Environment Variables

Update your `.env` file:

```env
# Auth0 Configuration
REACT_APP_AUTH0_DOMAIN=dev-07daqn7fgnix87ii.us.auth0.com
REACT_APP_AUTH0_CLIENT_ID=XIkHuY4SFeenTPzsxgi21uu6rs7Z5hAX

# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_project_url_here
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Step 4: Test the Integration

1. **Start the development server**: `npm start`
2. **Login with Auth0**: Navigate to the chat page and login
3. **Complete the questionnaire**: Answer all 20 questions
4. **Check Supabase**: Verify data is saved in your `User Information` table

## How It Works

### Data Flow:
1. User logs in with Auth0
2. Auth0 JWT token is obtained
3. Token is synced with Supabase
4. User answers questions in chat
5. Data is saved to Supabase with `user_id` from Auth0
6. RLS policies ensure users can only access their own data

### User ID Mapping:
- **Auth0 User ID**: `auth0|1234567890` (format: `provider|id`)
- **Supabase user_id**: Same as Auth0 User ID
- **Username**: Auth0 email address

## Troubleshooting

### Common Issues:

1. **"JWT token is invalid"**
   - Check that Auth0 domain and client ID are correct
   - Verify Auth0 application settings
   - Check browser console for token errors

2. **"RLS policy violation"**
   - Ensure RLS policies are correctly set
   - Check that `user_id` matches Auth0 user ID
   - Verify JWT token contains correct claims

3. **"Data not saving"**
   - Check browser console for errors
   - Verify Supabase URL and anon key
   - Ensure table structure matches expected format

### Debug Steps:

1. **Check Auth0 Token**:
```javascript
// Add to your component temporarily
const { getAccessTokenSilently } = useAuth0();
const token = await getAccessTokenSilently();
console.log('Auth0 token:', token);
```

2. **Check User Data**:
```javascript
// Add to your component temporarily
console.log('Auth0 user:', auth0User);
console.log('Auth0 user ID:', auth0User?.sub);
```

3. **Check Supabase Connection**:
```javascript
// Add to your component temporarily
console.log('Supabase URL:', process.env.REACT_APP_SUPABASE_URL);
console.log('Supabase Key:', process.env.REACT_APP_SUPABASE_ANON_KEY);
```

## Security Notes

- **RLS Policies**: Ensure users can only access their own data
- **JWT Validation**: Supabase validates Auth0 JWT tokens
- **User Isolation**: Each user gets their own row in the table
- **Token Refresh**: Auth0 handles token refresh automatically

## Next Steps

1. **Add User Profile Management**: Allow users to update their information
2. **Data Export**: Add functionality to export user responses
3. **Analytics**: Build features to analyze user responses
4. **Career Recommendations**: Use collected data to suggest career paths 