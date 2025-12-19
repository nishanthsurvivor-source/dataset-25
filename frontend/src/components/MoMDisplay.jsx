/**
 * Component to display Minutes of Meeting results
 */
export default function MoMDisplay({ momData }) {
  if (!momData) return null;

  const { mom_text, mom_json } = momData;

  return (
    <div className="space-y-6">
      {/* Text Format Display */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Minutes of Meeting
          </h2>
          <button
            onClick={() => {
              const blob = new Blob([mom_text], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `mom-${mom_json.title || 'meeting'}.txt`;
              a.click();
            }}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            Download as Text
          </button>
        </div>
        <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700 bg-gray-50 p-4 rounded border overflow-auto max-h-96">
          {mom_text}
        </pre>
      </div>

      {/* Structured JSON Display */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Structured Data
        </h2>

        {/* Meeting Info */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-xl font-semibold text-blue-900 mb-2">
            {mom_json.title || 'Untitled Meeting'}
          </h3>
          {mom_json.date && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Date:</span> {mom_json.date}
            </p>
          )}
          {mom_json.participants && mom_json.participants.length > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Participants:</span>{' '}
              {mom_json.participants.join(', ')}
            </p>
          )}
        </div>

        {/* Summary */}
        {mom_json.summary && mom_json.summary.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Summary
            </h3>
            <ul className="space-y-2">
              {mom_json.summary.map((point, index) => (
                <li
                  key={index}
                  className="flex items-start text-gray-700"
                >
                  <span className="text-blue-600 mr-2">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Decisions */}
        {mom_json.decisions && mom_json.decisions.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Decisions Made
            </h3>
            <ul className="space-y-2">
              {mom_json.decisions.map((decision, index) => (
                <li
                  key={index}
                  className="flex items-start text-gray-700"
                >
                  <span className="text-green-600 mr-2">✓</span>
                  <span>{decision}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Items */}
        {mom_json.action_items && mom_json.action_items.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Action Items
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deadline
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mom_json.action_items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.task}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {item.owner}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {item.deadline || (
                          <span className="text-gray-400">TBD</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {item.priority ? (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.priority === 'high'
                                ? 'bg-red-100 text-red-800'
                                : item.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {item.priority}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Next Steps */}
        {mom_json.next_steps && mom_json.next_steps.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Next Steps / Follow-ups
            </h3>
            <ul className="space-y-2">
              {mom_json.next_steps.map((step, index) => (
                <li
                  key={index}
                  className="flex items-start text-gray-700"
                >
                  <span className="text-orange-600 mr-2">→</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* JSON Download */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => {
              const blob = new Blob([JSON.stringify(mom_json, null, 2)], {
                type: 'application/json',
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `mom-${mom_json.title || 'meeting'}.json`;
              a.click();
            }}
            className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition"
          >
            Download as JSON
          </button>
        </div>
      </div>
    </div>
  );
}

