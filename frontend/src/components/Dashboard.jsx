import { useState } from 'react';
import MeetingsList from './MeetingsList';
import FollowUpsSection from './FollowUpsSection';
import MeetingSummaryModal from './MeetingSummaryModal';
import TranscriptForm from './TranscriptForm';
import { processTranscript } from '../services/api';

/**
 * Main Dashboard Component for Shadow.ai
 * Displays meetings, progress, and follow-ups
 */
export default function Dashboard() {
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAnalyzeForm, setShowAnalyzeForm] = useState(true); // Show form by default
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Start with empty meetings - only show meetings after processing transcripts
  const [meetings, setMeetings] = useState([]);

  const handleViewSummary = (meeting) => {
    setSelectedMeeting(meeting);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMeeting(null);
  };

  const handleProcessTranscript = async (transcript, meetingTitle, draftResult = null) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Use draft result if available, otherwise process fresh
      const result = draftResult || await processTranscript(transcript, meetingTitle);
      
      // Extract data from the MoM result
      const momJson = result.mom_json;
      
      // Create new meeting object from processed transcript
      const newMeeting = {
        id: Date.now(), // Simple ID generation
        title: momJson.title || meetingTitle || 'Untitled Meeting',
        date: momJson.date || new Date().toISOString().split('T')[0],
        status: 'completed',
        participants: momJson.participants || [],
        actionItemsCount: momJson.action_items?.length || 0,
        followUpsCount: momJson.action_items?.length || 0,
        momData: result, // Store full MoM data for the modal
      };

      // Add new meeting to the list
      setMeetings(prev => [newMeeting, ...prev]);
      
      // Close form on success
      setShowAnalyzeForm(false);
    } catch (err) {
      const errorMessage = err.message || 'Failed to process transcript. Please try again.';
      setError(errorMessage);
      console.error('Error processing transcript:', err);
      // Keep form open on error so user can retry
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDraftUpdate = (draftResult) => {
    // Optional: Could show draft in a preview area or update UI
    // For now, we just let the form handle it
    console.log('Draft updated:', draftResult);
  };

  // Get all follow-ups from completed meetings (extract from actual MoM data)
  const allFollowUps = meetings
    .filter(m => m.status === 'completed' && m.momData?.mom_json?.action_items)
    .flatMap(meeting => {
      const actionItems = meeting.momData.mom_json.action_items || [];
      return actionItems.map((item, index) => ({
        id: `${meeting.id}-${index}`,
        meetingId: meeting.id,
        meetingTitle: meeting.title,
        task: item.task,
        owner: item.owner,
        deadline: item.deadline,
        priority: item.priority || 'medium',
        status: 'pending', // Could be determined from deadline
      }));
    });

  return (
    <div className="min-h-screen bg-sage-50">
      {/* Header */}
      <header className="bg-white border-b border-sage-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-sage-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <div>
                <h1 className="text-2xl font-heading font-bold text-sage-700">
                  shadow.ai
                </h1>
                <p className="text-xs text-gray-500">Smart Meeting Intelligence</p>
              </div>
            </div>
            <button 
              onClick={() => setShowAnalyzeForm(!showAnalyzeForm)}
              className="px-4 py-2 bg-sage-500 text-white rounded-lg hover:bg-sage-600 transition-colors font-medium text-sm"
            >
              {showAnalyzeForm ? 'Cancel' : '+ Analyze Meeting'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analyze Meeting Form - Always visible, can be collapsed */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div 
            className="px-6 py-4 bg-sage-50 border-b border-gray-200 cursor-pointer hover:bg-sage-100 transition-colors"
            onClick={() => setShowAnalyzeForm(!showAnalyzeForm)}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-heading font-bold text-gray-900 mb-1">
                  Analyze Meeting Transcript
                </h2>
                <p className="text-sm text-gray-600">
                  Paste your meeting transcript below to generate Minutes of Meeting and extract action items
                </p>
              </div>
              <button
                type="button"
                className="ml-4 text-gray-500 hover:text-gray-700 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAnalyzeForm(!showAnalyzeForm);
                }}
              >
                {showAnalyzeForm ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {showAnalyzeForm && (
            <div className="p-6">
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-red-600 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              )}

            <TranscriptForm 
              onSubmit={handleProcessTranscript} 
              isLoading={isProcessing}
              onDraftUpdate={handleDraftUpdate}
            />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Meetings Section - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-heading font-bold text-gray-900">
                    Meetings
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {meetings.length === 0 
                      ? 'No meetings yet. Analyze a transcript to get started.'
                      : 'Track and manage your meetings'}
                  </p>
                </div>
                {meetings.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1.5 bg-sage-100 text-sage-700 rounded-lg text-sm font-medium">
                      {meetings.filter(m => m.status === 'completed').length} Completed
                    </span>
                    <span className="px-3 py-1.5 bg-accent-100 text-accent-700 rounded-lg text-sm font-medium">
                      {meetings.filter(m => m.status === 'scheduled').length} Scheduled
                    </span>
                  </div>
                )}
              </div>
              {meetings.length === 0 ? (
                <div className="text-center py-12">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-300 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Meetings Yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Get started by analyzing a meeting transcript
                  </p>
                  <button
                    onClick={() => setShowAnalyzeForm(true)}
                    className="px-6 py-3 bg-sage-500 text-white rounded-lg hover:bg-sage-600 transition-colors font-medium"
                  >
                    Analyze Meeting Transcript
                  </button>
                </div>
              ) : (
                <MeetingsList
                  meetings={meetings}
                  onViewSummary={handleViewSummary}
                />
              )}
            </div>
          </div>

          {/* Follow-ups Section - Takes 1 column on large screens */}
          <div className="lg:col-span-1">
            <FollowUpsSection followUps={allFollowUps} />
          </div>
        </div>
      </main>

      {/* Meeting Summary Modal */}
      {isModalOpen && selectedMeeting && (
        <MeetingSummaryModal
          meeting={selectedMeeting}
          onClose={handleCloseModal}
          momData={selectedMeeting.momData} // Pass the full MoM data if available
        />
      )}
    </div>
  );
}

