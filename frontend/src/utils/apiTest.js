// API Test Utility
// This file helps test API connectivity in both development and production

import { API_ENDPOINTS, API_BASE_URL } from '../config/api';

export const testApiConnection = async () => {
  console.log('Testing API connection...');
  console.log('Environment:', process.env.NODE_ENV);
  console.log('API Base URL:', API_BASE_URL);
  
  try {
    // Test the root endpoint which should return API info
    const response = await fetch(`${API_BASE_URL}/api/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('API Connection Test - Success:', data);
      return { success: true, data };
    } else {
      console.error('API Connection Test - Failed:', response.status, response.statusText);
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }
  } catch (error) {
    console.error('API Connection Test - Error:', error.message);
    return { success: false, error: error.message };
  }
};

export const testApiEndpoints = () => {
  console.log('Available API Endpoints:');
  console.log('- Generate Plan:', API_ENDPOINTS.generatePlan('test@example.com'));
  console.log('- Update Cascade:', API_ENDPOINTS.updateCascade('1_month', 'test@example.com'));
  console.log('- Direct Update:', API_ENDPOINTS.directUpdate('1_month', 'test@example.com'));
  console.log('- Regenerate Subsequent:', API_ENDPOINTS.regenerateSubsequent('test@example.com'));
  console.log('- Process Thoughts:', API_ENDPOINTS.processThoughts('1_month', 'test@example.com'));
};