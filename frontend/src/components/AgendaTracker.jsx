/**
 * Agenda Tracker Component
 * Tracks how each agenda item is being met and detects if meeting goes off-track
 */
export default function AgendaTracker({ agendaItems, transcriptAnalysis }) {
  const getAgendaStatus = (item) => {
    if (item.status === 'completed') {
      return {
        label: 'Completed',
        color: 'bg-sage-100 text-sage-700 border-sage-300',
        icon: '✓',
      };
    }
    if (item.status === 'in_progress') {
      return {
        label: 'In Progress',
        color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
        icon: '⟳',
      };
    }
    if (item.status === 'off_track') {
      return {
        label: 'Off Track',
        color: 'bg-red-100 text-red-700 border-red-300',
        icon: '⚠',
      };
    }
    return {
      label: 'Not Started',
      color: 'bg-gray-100 text-gray-700 border-gray-300',
      icon: '○',
    };
  };

  const calculateAgendaAdherence = () => {
    if (!agendaItems || agendaItems.length === 0) return 0;
    const completed = agendaItems.filter((item) => item.status === 'completed').length;
    return Math.round((completed / agendaItems.length) * 100);
  };

  const adherence = calculateAgendaAdherence();
  const offTrackCount = agendaItems?.filter((item) => item.status === 'off_track').length || 0;

  return (
    <div className="space-y-6">
      {/* Adherence Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-sage-50 rounded-lg p-4 border border-sage-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Agenda Adherence</span>
            <span className="text-2xl font-heading font-bold text-sage-600">
              {adherence}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                adherence >= 80
                  ? 'bg-sage-500'
                  : adherence >= 50
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${adherence}%` }}
            />
          </div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Off-Track Items</span>
            <span className="text-2xl font-heading font-bold text-red-600">
              {offTrackCount}
            </span>
          </div>
          <p className="text-xs text-gray-600">
            {offTrackCount > 0
              ? 'Meeting lost focus on agenda'
              : 'Meeting stayed on track'}
          </p>
        </div>
      </div>

      {/* Agenda Items List */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="text-lg font-heading font-bold text-gray-900 mb-6">
          Agenda Items
        </h4>
        <div className="space-y-4">
          {agendaItems && agendaItems.length > 0 ? (
            agendaItems.map((item, index) => {
              const status = getAgendaStatus(item);
              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    item.status === 'off_track'
                      ? 'border-red-200 bg-red-50'
                      : item.status === 'completed'
                      ? 'border-sage-200 bg-sage-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900 mb-1">
                        {item.title}
                      </h5>
                      {item.description && (
                        <p className="text-sm text-gray-600">{item.description}</p>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${status.color} ml-3`}
                    >
                      {status.icon} {status.label}
                    </span>
                  </div>

                  {/* Time Allocation */}
                  {item.plannedTime && item.actualTime && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>
                          Planned: {item.plannedTime} min
                        </span>
                        <span
                          className={
                            item.actualTime > item.plannedTime * 1.5
                              ? 'text-red-600 font-semibold'
                              : item.actualTime > item.plannedTime
                              ? 'text-yellow-600'
                              : 'text-sage-600'
                          }
                        >
                          Actual: {item.actualTime} min
                        </span>
                      </div>
                      {item.actualTime > item.plannedTime * 1.5 && (
                        <p className="text-xs text-red-600 mt-1 flex items-center">
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Over time limit - may have gone off-track
                        </p>
                      )}
                    </div>
                  )}

                  {/* Discussion Points */}
                  {item.discussionPoints && item.discussionPoints.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-700 mb-2">
                        Key Points Discussed:
                      </p>
                      <ul className="space-y-1">
                        {item.discussionPoints.map((point, idx) => (
                          <li
                            key={idx}
                            className="text-xs text-gray-600 flex items-start"
                          >
                            <span className="text-sage-500 mr-2 mt-0.5">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">
              No agenda items tracked for this meeting
            </div>
          )}
        </div>
      </div>

      {/* Off-Track Analysis */}
      {transcriptAnalysis?.offTrackDetections &&
        transcriptAnalysis.offTrackDetections.length > 0 && (
          <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <h5 className="font-semibold text-red-900 mb-2 flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Off-Track Detections
            </h5>
            <ul className="space-y-2">
              {transcriptAnalysis.offTrackDetections.map((detection, idx) => (
                <li key={idx} className="text-sm text-red-800">
                  <span className="font-medium">
                    {new Date(detection.timestamp).toLocaleTimeString()}:
                  </span>{' '}
                  {detection.reason}
                </li>
              ))}
            </ul>
          </div>
        )}
    </div>
  );
}

