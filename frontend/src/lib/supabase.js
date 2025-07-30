import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Utility function for standardized timestamp creation (ISO 8601 with UTC)
export const getCurrentTimestamp = () => {
  return new Date().toISOString()
}

// Helper functions for common operations
export const auth = {
  // Get current user
  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Get session
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  }
}

// Database operations
export const db = {
  // Get user information
  getUserInformation: async (auth0UserId) => {
    const { data, error } = await supabase
      .from('User Information')
      .select('*')
      .eq('user_id', auth0UserId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error // PGRST116 is "not found"
    return data
  },

  // Create or update user information
  saveUserInformation: async (userData) => {
    console.log("Saving user data:", userData)
    
    // Validate required fields
    if (!userData.user_id) {
      throw new Error('user_id is required for saving user information')
    }

    try {
      // Add timestamp to userData
      const timestampedUserData = {
        ...userData,
        last_updated: getCurrentTimestamp()
      };
      
      // First, check if user already exists
      const { data: existingData } = await supabase
        .from('User Information')
        .select('*')
        .eq('user_id', userData.user_id)
        .single()
      
      let result;
      
      if (existingData) {
        // User exists, update the record
        const { data, error } = await supabase
          .from('User Information')
          .update(timestampedUserData)
          .eq('user_id', userData.user_id)
          .select()
        
        if (error) {
          console.error('Supabase update error:', error)
          throw error
        }
        
        result = data && data.length > 0 ? data[0] : data
      } else {
        // User doesn't exist, insert new record (also add created_at timestamp)
        const newUserData = {
          ...timestampedUserData,
          created_at: getCurrentTimestamp()
        };
        
        const { data, error } = await supabase
          .from('User Information')
          .insert([newUserData])
          .select()
        
        if (error) {
          console.error('Supabase insert error:', error)
          throw error
        }
        
        result = data && data.length > 0 ? data[0] : data
      }
      
      console.log("Successfully saved user data:", result)
      return result
    } catch (err) {
      console.error('Error in saveUserInformation:', err)
      throw err
    }
  },

  // Get chat messages
  getChatMessages: async (userId) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data
  },

  // Save chat message
  saveChatMessage: async (message) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([message])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get career paths
  getCareerPaths: async () => {
    const { data, error } = await supabase
      .from('career_paths')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get user progress
  getUserProgress: async (userId) => {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
    
    if (error) throw error
    return data
  },

  // Update user progress
  updateUserProgress: async (userId, pathId, progress) => {
    const { data, error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        path_id: pathId,
        progress: progress,
        updated_at: getCurrentTimestamp()
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  }
} 