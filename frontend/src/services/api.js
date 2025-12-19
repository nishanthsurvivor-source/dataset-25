/**
 * API service for connecting to FastAPI backend
 */

const API_BASE_URL = 'http://localhost:8000';

/**
 * Process meeting transcript and generate Minutes of Meeting
 * @param {string} transcript - Meeting transcript text
 * @param {string} meetingTitle - Optional meeting title
 * @returns {Promise<{mom_text: string, mom_json: object}>}
 */
export const processTranscript = async (transcript, meetingTitle = null, signal = null) => {
  try {
    const requestBody = {
      transcript: transcript,
    };
    
    // Only include meeting_title if it's provided and not empty
    if (meetingTitle && meetingTitle.trim()) {
      requestBody.meeting_title = meetingTitle.trim();
    }
    
    console.log('Sending request to:', `${API_BASE_URL}/process`);
    console.log('Request body:', requestBody);
    
    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    };
    
    // Add signal if provided (for aborting requests)
    if (signal) {
      fetchOptions.signal = signal;
    }
    
    const response = await fetch(`${API_BASE_URL}/process`, fetchOptions);

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      let errorMessage = 'Failed to process transcript';
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (e) {
        // If response is not JSON, get text
        const errorText = await response.text();
        errorMessage = errorText || `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('Success! Received:', result);
    return result;
  } catch (error) {
    console.error('API Error:', error);
    
    // Provide more helpful error messages
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Cannot connect to backend. Please ensure the backend server is running on http://localhost:8000');
    }
    
    throw error;
  }
};

/**
 * Health check endpoint
 * @returns {Promise<{status: string}>}
 */
export const checkHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return await response.json();
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

