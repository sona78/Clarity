import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)



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
    const { data, error } = await supabase
      .from('User Information')
      .upsert([userData], { 
        onConflict: 'user_id'
      })
      .select()
      .single()
    
    if (error) throw error
    return data
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
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  }
} 