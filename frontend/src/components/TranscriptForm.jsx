import { useState, useEffect, useRef } from 'react';
import { processTranscript } from '../services/api';

/**
 * Form component for entering meeting transcript and title
 * Features Live Preview mode with debounced auto-processing
 */
export default function TranscriptForm({ onSubmit, isLoading, onDraftUpdate }) {
  const [transcript, setTranscript] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [isDraftProcessing, setIsDraftProcessing] = useState(false);
  const [draftResult, setDraftResult] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const debounceTimerRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Debounced auto-processing for Live Preview
  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Only process if transcript has minimum length
    if (transcript.trim().length < 50) {
      setDraftResult(null);
      setIsDraftProcessing(false);
      return;
    }

    setIsTyping(true);
    setIsDraftProcessing(false);

    // Set up debounce timer (2.5 seconds)
    debounceTimerRef.current = setTimeout(async () => {
      setIsTyping(false);
      setIsDraftProcessing(true);

      // Cancel any previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();
      const currentAbortController = abortControllerRef.current;

      try {
        const result = await processTranscript(transcript, meetingTitle || null, currentAbortController.signal);
        
        // Only update if this request wasn't aborted
        if (!currentAbortController.signal.aborted) {
          setDraftResult(result);
          setIsDraftProcessing(false);
          
          // Notify parent component of draft update
          if (onDraftUpdate) {
            onDraftUpdate(result);
          }
        }
      } catch (error) {
        // Ignore abort errors, show others
        if (error.name !== 'AbortError' && !currentAbortController.signal.aborted) {
          console.error('Draft processing error:', error);
          setIsDraftProcessing(false);
        }
      }
    }, 2500); // 2.5 second debounce

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [transcript, meetingTitle, onDraftUpdate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (transcript.trim()) {
      // If we have a draft, use it; otherwise process fresh
      if (draftResult) {
        onSubmit(transcript, meetingTitle || null, draftResult);
      } else {
        onSubmit(transcript, meetingTitle || null);
      }
    }
  };

  const handleFinalize = () => {
    if (draftResult) {
      onSubmit(transcript, meetingTitle || null, draftResult);
    } else if (transcript.trim()) {
      onSubmit(transcript, meetingTitle || null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="meeting-title"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Meeting Title (Optional)
        </label>
        <input
          type="text"
          id="meeting-title"
          value={meetingTitle}
          onChange={(e) => setMeetingTitle(e.target.value)}
          placeholder="e.g., Q4 Product Launch Planning"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent outline-none transition"
        />
      </div>

      <div>
        <label
          htmlFor="transcript"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Meeting Transcript <span className="text-red-500">*</span>
        </label>
        <textarea
          id="transcript"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Paste your meeting transcript here...

Example:
John: Good morning everyone. Let's start today's meeting.
Sarah: Thanks John. I'll prepare the marketing materials by November 1st.
Mike: I'll complete the testing by November 10th."
          rows={12}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent outline-none transition font-mono text-sm"
        />
        <div className="mt-2 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {transcript.length} characters
          </p>
          {/* Live Preview Status */}
          {transcript.trim().length >= 50 && (
            <div className="flex items-center space-x-2 text-sm">
              {isTyping ? (
                <span className="text-gray-500 flex items-center">
                  <span className="animate-pulse mr-2">⏳</span>
                  Typing...
                </span>
              ) : isDraftProcessing ? (
                <span className="text-sage-600 flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-sage-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Draft summary updating...
                </span>
              ) : draftResult ? (
                <span className="text-green-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Draft ready
                </span>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Draft Preview Section */}
      {draftResult && (
        <div className="bg-sage-50 border-2 border-sage-400 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-sage-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              <h4 className="text-base font-bold text-sage-800">Draft Preview Ready</h4>
            </div>
            <span className="text-xs text-sage-700 bg-sage-200 px-2 py-1 rounded-full font-medium animate-pulse">Live</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
            <div className="bg-white/60 rounded-lg p-2">
              <p className="text-xs text-gray-600 mb-1">Title</p>
              <p className="font-semibold text-gray-900 truncate">
                {draftResult.mom_json?.title || 'Untitled Meeting'}
              </p>
            </div>
            <div className="bg-white/60 rounded-lg p-2">
              <p className="text-xs text-gray-600 mb-1">Participants</p>
              <p className="font-semibold text-gray-900">
                {draftResult.mom_json?.participants?.length || 0} attendee{draftResult.mom_json?.participants?.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="bg-white/60 rounded-lg p-2">
              <p className="text-xs text-gray-600 mb-1">Action Items</p>
              <p className="font-semibold text-gray-900">
                {draftResult.mom_json?.action_items?.length || 0} item{draftResult.mom_json?.action_items?.length !== 1 ? 's' : ''}
              </p>
            </div>
            {draftResult.mom_json?.sentiment_analysis && (
              <div className="bg-white/60 rounded-lg p-2">
                <p className="text-xs text-gray-600 mb-1">Sentiment</p>
                <p className={`font-semibold ${
                  draftResult.mom_json.sentiment_analysis.overall_sentiment === 'positive' 
                    ? 'text-green-600' 
                    : draftResult.mom_json.sentiment_analysis.overall_sentiment === 'negative'
                    ? 'text-red-600'
                    : 'text-gray-600'
                }`}>
                  {draftResult.mom_json.sentiment_analysis.overall_sentiment}
                </p>
              </div>
            )}
          </div>

          {/* Finalize Button in Preview */}
          <button
            type="button"
            onClick={handleFinalize}
            className="w-full bg-sage-500 hover:bg-sage-600 text-white py-3 px-6 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2 transition shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Finalize Meeting</span>
          </button>
        </div>
      )}

      {/* Action Buttons - Only show if no draft preview */}
      {!draftResult && (
        <button
          type="submit"
          disabled={!transcript.trim() || isLoading || isDraftProcessing}
          className="w-full bg-sage-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-sage-600 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm hover:shadow-md"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </span>
          ) : (
            'Generate Minutes of Meeting'
          )}
        </button>
      )}
    </form>
  );
}

