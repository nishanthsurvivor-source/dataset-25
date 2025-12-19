/**
 * Follow-ups Section Component
 * Displays AI-predicted follow-ups from meeting transcripts
 */
export default function FollowUpsSection({ followUps }) {
  const getPriorityBadge = (priority) => {
    const styles = {
      high: 'bg-red-100 text-red-700 border-red-300',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      low: 'bg-gray-100 text-gray-700 border-gray-300',
    };

    return (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
          styles[priority] || styles.medium
        }`}
      >
        {priority?.toUpperCase() || 'MEDIUM'}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    if (status === 'completed') {
      return (
        <span className="px-2 py-0.5 bg-sage-100 text-sage-700 rounded-full text-xs font-semibold">
          ✓ Done
        </span>
      );
    }
    if (status === 'overdue') {
      return (
        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
          Overdue
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 bg-accent-100 text-accent-700 rounded-full text-xs font-semibold">
        Pending
      </span>
    );
  };

  const isOverdue = (deadline) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-sage-200 p-6 sticky top-24">
      <div className="mb-6">
        <h2 className="text-2xl font-heading font-bold text-sage-800 mb-2">
          Follow-ups
        </h2>
        <p className="text-sm text-gray-600">
          AI-predicted action items from meetings
        </p>
      </div>

      {followUps.length === 0 ? (
        <div className="text-center py-8">
          <svg
            className="w-12 h-12 mx-auto text-gray-300 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
          <p className="text-gray-500 text-sm">No follow-ups yet</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {followUps.map((followUp, index) => (
            <div
              key={followUp.id}
              className={`p-4 rounded-lg border-2 transition-all duration-200 animate-slide-up ${
                isOverdue(followUp.deadline)
                  ? 'border-red-200 bg-red-50'
                  : 'border-sage-100 bg-sage-50/50 hover:border-sage-300'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Meeting Link */}
              <div className="mb-2">
                <a
                  href={`#meeting-${followUp.meetingId}`}
                  className="text-xs font-semibold text-sage-600 hover:text-sage-700 flex items-center"
                >
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {followUp.meetingTitle}
                </a>
              </div>

              {/* Task */}
              <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                {followUp.task}
              </h4>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <div className="flex items-center text-xs text-gray-600">
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span className="font-medium">{followUp.owner}</span>
                </div>
                {followUp.deadline && (
                  <div
                    className={`flex items-center text-xs ${
                      isOverdue(followUp.deadline)
                        ? 'text-red-600'
                        : 'text-gray-600'
                    }`}
                  >
                    <svg
                      className="w-3 h-3 mr-1"
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
                    <span>
                      {new Date(followUp.deadline).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Badges */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getPriorityBadge(followUp.priority)}
                  {getStatusBadge(
                    isOverdue(followUp.deadline) ? 'overdue' : followUp.status
                  )}
                </div>
                <button className="text-xs text-sage-600 hover:text-sage-700 font-medium">
                  View →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {followUps.length > 0 && (
        <div className="mt-6 pt-6 border-t border-sage-200">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-sage-600">
                {followUps.filter((f) => f.status === 'pending').length}
              </div>
              <div className="text-xs text-gray-600">Pending</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent-600">
                {followUps.filter((f) => f.status === 'completed').length}
              </div>
              <div className="text-xs text-gray-600">Completed</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

