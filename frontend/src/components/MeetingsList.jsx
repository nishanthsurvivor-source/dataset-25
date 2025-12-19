/**
 * Meetings List Component
 * Displays meetings with progress indicators and view summary button
 */
export default function MeetingsList({ meetings, onViewSummary }) {
  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-sage-100 text-sage-700 border-sage-300',
      scheduled: 'bg-accent-100 text-accent-700 border-accent-300',
      in_progress: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    };

    const labels = {
      completed: 'Completed',
      scheduled: 'Scheduled',
      in_progress: 'In Progress',
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold border ${
          styles[status] || styles.scheduled
        }`}
      >
        {labels[status] || status}
      </span>
    );
  };

  const getProgressColor = (status) => {
    if (status === 'completed') return 'bg-sage-500';
    if (status === 'in_progress') return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  return (
    <div className="space-y-4">
      {meetings.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
          <p className="text-gray-500">No meetings found</p>
        </div>
      ) : (
        meetings.map((meeting, index) => (
          <div
            key={meeting.id}
            className="bg-white rounded-lg border border-gray-200 hover:border-sage-300 hover:shadow-md transition-all duration-200 overflow-hidden"
          >
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">
                    {meeting.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-1 text-sage-500"
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
                      <span>{new Date(meeting.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-1 text-sage-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <span>{meeting.participants.length} participants</span>
                    </div>
                  </div>
                </div>
                {getStatusBadge(meeting.status)}
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>
                    {meeting.status === 'completed' ? '100%' : '0%'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${getProgressColor(
                      meeting.status
                    )}`}
                    style={{
                      width: meeting.status === 'completed' ? '100%' : '0%',
                    }}
                  />
                </div>
              </div>

              {/* Stats */}
              {meeting.status === 'completed' && (
                <div className="flex items-center space-x-4 mb-4 text-sm">
                  <div className="flex items-center text-sage-600">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    <span className="font-medium">
                      {meeting.actionItemsCount} Action Items
                    </span>
                  </div>
                  <div className="flex items-center text-accent-600">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="font-medium">
                      {meeting.followUpsCount} Follow-ups
                    </span>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={() => onViewSummary(meeting)}
                className="w-full bg-sage-500 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-sage-600 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center space-x-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                <span>View Summary</span>
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

