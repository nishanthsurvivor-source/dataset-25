/**
 * Agenda Hierarchy Component
 * Shows the flow and dependencies between agenda items
 */
export default function AgendaHierarchy({ agendaItems }) {
  if (!agendaItems || agendaItems.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        No agenda hierarchy available
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-sage-500 border-sage-600';
      case 'in_progress':
        return 'bg-yellow-500 border-yellow-600';
      case 'off_track':
        return 'bg-red-500 border-red-600';
      default:
        return 'bg-gray-300 border-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'in_progress':
        return '⟳';
      case 'off_track':
        return '⚠';
      default:
        return '○';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="text-lg font-heading font-bold text-gray-900 mb-2">
          Agenda Flow Hierarchy
        </h4>
        <p className="text-sm text-gray-600">
          Visual representation of agenda items and their dependencies
        </p>
      </div>

      {/* Flow Diagram */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 relative overflow-hidden" style={{ minHeight: `${agendaItems.length * 140}px` }}>
        {/* Connection Lines */}
        <svg
          className="absolute top-0 left-0 pointer-events-none z-0"
          width="100%"
          height={`${agendaItems.length * 140}px`}
          viewBox={`0 0 100 ${agendaItems.length * 140}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ 
            maxHeight: `${agendaItems.length * 140}px`,
            maxWidth: '100%',
            overflow: 'hidden'
          }}
        >
          {agendaItems.map((item, index) => {
            if (index < agendaItems.length - 1) {
              const y1 = index * 140 + 80;
              const y2 = (index + 1) * 140 + 20;
              return (
                <line
                  key={`line-${index}`}
                  x1="50"
                  y1={y1}
                  x2="50"
                  y2={y2}
                  stroke="#9fb89f"
                  strokeWidth="0.5"
                  strokeDasharray={item.dependsOn ? '0' : '2,2'}
                  markerEnd="url(#arrowhead)"
                />
              );
            }
            return null;
          })}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="4"
              markerHeight="4"
              refX="2"
              refY="2"
              orient="auto"
            >
              <polygon
                points="0 0, 4 2, 0 4"
                fill="#9fb89f"
              />
            </marker>
          </defs>
        </svg>

        {/* Agenda Items */}
        <div className="relative space-y-4 z-10">
          {agendaItems.map((item, index) => {
            const hasDependency = item.dependsOn && item.dependsOn.length > 0;
            const isBlocked = item.blockedBy && item.blockedBy.length > 0;

            return (
              <div
                key={index}
                className="relative flex items-center justify-center z-10"
                style={{ minHeight: '120px' }}
              >
                {/* Agenda Item Card */}
                <div
                  className={`w-full max-w-md mx-auto p-4 rounded-lg border-2 shadow-md transition-all ${
                    isBlocked
                      ? 'border-red-300 bg-red-50'
                      : item.status === 'completed'
                      ? 'border-sage-300 bg-sage-50'
                      : item.status === 'in_progress'
                      ? 'border-yellow-300 bg-yellow-50'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span
                          className={`w-8 h-8 rounded-full ${getStatusColor(
                            item.status
                          )} text-white flex items-center justify-center font-bold text-sm border-2`}
                        >
                          {getStatusIcon(item.status)}
                        </span>
                        <div>
                          <h5 className="font-heading font-bold text-gray-900">
                            {item.title}
                          </h5>
                          {item.order && (
                            <span className="text-xs text-gray-500">
                              Step {item.order} of {agendaItems.length}
                            </span>
                          )}
                        </div>
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600 ml-10">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Dependencies */}
                  {hasDependency && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center text-xs text-gray-600">
                        <svg
                          className="w-4 h-4 mr-1 text-sage-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="font-medium">Depends on:</span>
                        <span className="ml-1">
                          {item.dependsOn
                            .map((dep) => {
                              const depItem = agendaItems.find(
                                (a) => a.id === dep
                              );
                              return depItem?.title || `Item ${dep}`;
                            })
                            .join(', ')}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Blocked Status */}
                  {isBlocked && (
                    <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-xs text-red-800">
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="font-medium">
                          Blocked by: {item.blockedBy.join(', ')}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Time Info */}
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <div className="flex items-center text-gray-600">
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
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>
                        {item.plannedTime} min planned
                        {item.actualTime && ` / ${item.actualTime} min actual`}
                      </span>
                    </div>
                    {item.owner && (
                      <div className="flex items-center text-gray-600">
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
                        <span>{item.owner}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h5 className="text-sm font-semibold text-gray-900 mb-3">Legend</h5>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-sage-500 border-2 border-sage-600 mr-2 flex items-center justify-center text-white text-xs">
              ✓
            </div>
            <span>Completed</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-yellow-500 border-2 border-yellow-600 mr-2 flex items-center justify-center text-white text-xs">
              ⟳
            </div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-red-600 mr-2 flex items-center justify-center text-white text-xs">
              ⚠
            </div>
            <span>Off Track</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-gray-300 border-2 border-gray-400 mr-2 flex items-center justify-center text-white text-xs">
              ○
            </div>
            <span>Not Started</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center text-xs text-gray-600">
            <div className="w-8 h-0.5 bg-sage-400 mr-2"></div>
            <span>Direct dependency (solid line)</span>
          </div>
          <div className="flex items-center text-xs text-gray-600 mt-1">
            <div className="w-8 h-0.5 bg-sage-400 mr-2 border-dashed border-t-2 border-sage-400"></div>
            <span>Optional/parallel flow (dashed line)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

