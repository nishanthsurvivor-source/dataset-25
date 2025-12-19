import { useState } from 'react';
import AgendaTracker from './AgendaTracker';
import AgendaHierarchy from './AgendaHierarchy';
import RoleHierarchy from './RoleHierarchy';
import SentimentTracker from './SentimentTracker';

/**
 * Meeting Summary Modal Component
 * Displays detailed meeting summary, MoM, and agenda tracking when "View Summary" is clicked
 */
export default function MeetingSummaryModal({ meeting, onClose, momData }) {
  const [activeTab, setActiveTab] = useState('overview');

  // Extract agenda items from summary and decisions
  const extractAgendaFromMom = (momJson) => {
    if (!momJson) return [];
    
    const agendaItems = [];
    const summary = momJson.summary || [];
    const decisions = momJson.decisions || [];
    
    // Convert summary bullets to agenda items
    summary.forEach((bullet, idx) => {
      // Determine status based on content
      let status = 'completed'; // Assume completed if in summary
      if (bullet.toLowerCase().includes('will') || 
          bullet.toLowerCase().includes('should') || 
          bullet.toLowerCase().includes('need') || 
          bullet.toLowerCase().includes('plan')) {
        status = 'in_progress';
      }
      
      agendaItems.push({
        id: idx + 1,
        title: bullet.length > 80 ? bullet.substring(0, 80) + '...' : bullet,
        description: bullet,
        status: status,
        order: idx + 1,
        type: 'summary_point',
        discussionPoints: bullet.length < 150 ? [bullet] : [],
      });
    });
    
    // Add decisions as agenda items
    decisions.forEach((decision, idx) => {
      agendaItems.push({
        id: summary.length + idx + 1,
        title: decision.length > 60 ? `Decision: ${decision.substring(0, 60)}...` : `Decision: ${decision}`,
        description: decision,
        status: 'completed',
        order: summary.length + idx + 1,
        type: 'decision',
        discussionPoints: decision.length < 150 ? [decision] : [],
      });
    });
    
    return agendaItems;
  };

  // Use provided momData if available, otherwise use mock data
  const summaryData = momData ? {
    title: momData.mom_json?.title || meeting.title,
    date: momData.mom_json?.date || meeting.date,
    participants: momData.mom_json?.participants || meeting.participants || [],
    summary: momData.mom_json?.summary || [],
    decisions: momData.mom_json?.decisions || [],
    actionItems: momData.mom_json?.action_items?.map(item => ({
      task: item.task,
      owner: item.owner,
      deadline: item.deadline,
      priority: item.priority,
    })) || [],
    mom: {
      title: momData.mom_json?.title || meeting.title,
      date: momData.mom_json?.date || meeting.date,
      participants: momData.mom_json?.participants || meeting.participants || [],
      duration: '45 minutes', // Could be extracted from transcript
      location: 'Conference Room A / Virtual',
      agenda: extractAgendaFromMom(momData.mom_json), // Extract agenda from summary and decisions
    },
    transcriptAnalysis: {
      offTrackDetections: [],
      focusScore: 100,
      totalDuration: 45,
      agendaTime: 45,
      offTrackTime: 0,
    },
    roleStructure: (momData.mom_json?.participants || []).map((name, index) => ({
      id: index + 1,
      name: name,
      title: 'Team Member',
      level: index === 0 ? 'manager' : 'member',
      department: 'General',
      supervisorId: index === 0 ? null : 1,
      supervisor: index === 0 ? null : momData.mom_json?.participants[0],
      supervises: [],
    })),
    sentimentAnalysis: momData.mom_json?.sentiment_analysis || null,
  } : {
    title: meeting.title,
    date: meeting.date,
    participants: meeting.participants,
    summary: [
      'Discussed Q4 product launch timeline and key milestones',
      'Marketing materials to be prepared by November 1st',
      'Testing to be completed by November 10th',
      'Documentation updates assigned with deadline of November 12th',
      'Review meeting scheduled for next Friday',
    ],
    decisions: [
      'Target launch date set to November 15th',
      'Marketing materials assigned to Sarah',
      'Testing assigned to Mike',
    ],
    actionItems: [
      {
        task: 'Prepare marketing materials',
        owner: 'Sarah',
        deadline: '2024-12-22',
        priority: 'high',
      },
      {
        task: 'Complete testing',
        owner: 'Mike',
        deadline: '2024-12-25',
        priority: 'medium',
      },
      {
        task: 'Update documentation',
        owner: 'Sarah',
        deadline: '2024-12-27',
        priority: 'medium',
      },
    ],
    // Minutes of Meeting (Full MoM)
    mom: {
      title: meeting.title,
      date: meeting.date,
      participants: meeting.participants,
      duration: '45 minutes',
      location: 'Conference Room A / Virtual',
      agenda: [
        {
          id: 1,
          title: 'Review Q4 Launch Timeline',
          description: 'Discuss and finalize product launch schedule',
          status: 'completed',
          order: 1,
          plannedTime: 15,
          actualTime: 18,
          owner: 'John',
          dependsOn: [],
          blockedBy: [],
          discussionPoints: [
            'November 15th confirmed as launch date',
            'Marketing campaign to start 2 weeks before',
            'Beta testing window discussed',
          ],
        },
        {
          id: 2,
          title: 'Assign Action Items',
          description: 'Distribute tasks and set deadlines',
          status: 'completed',
          order: 2,
          plannedTime: 10,
          actualTime: 12,
          owner: 'John',
          dependsOn: [1],
          blockedBy: [],
          discussionPoints: [
            'Sarah assigned marketing materials',
            'Mike assigned testing responsibilities',
            'Deadlines set for all tasks',
          ],
        },
        {
          id: 3,
          title: 'Budget Discussion',
          description: 'Review marketing budget allocation',
          status: 'off_track',
          order: 3,
          plannedTime: 10,
          actualTime: 25,
          owner: 'Sarah',
          dependsOn: [2],
          blockedBy: [],
          discussionPoints: [
            'Extended discussion on budget constraints',
            'Multiple alternative approaches considered',
            'Decision deferred to next meeting',
          ],
        },
        {
          id: 4,
          title: 'Q&A Session',
          description: 'Address team questions and concerns',
          status: 'in_progress',
          order: 4,
          plannedTime: 10,
          actualTime: 0,
          owner: 'Mike',
          dependsOn: [2, 3],
          blockedBy: [],
          discussionPoints: [],
        },
      ],
    },
    transcriptAnalysis: {
      offTrackDetections: [
        {
          timestamp: '2024-12-15T10:25:00',
          reason: 'Extended discussion on budget (15 min over planned time)',
        },
        {
          timestamp: '2024-12-15T10:40:00',
          reason: 'Topic shifted to unrelated project discussion',
        },
      ],
      focusScore: 75,
      totalDuration: 45,
      agendaTime: 34,
      offTrackTime: 11,
    },
    roleStructure: [
      {
        id: 1,
        name: 'John',
        title: 'Product Manager',
        level: 'manager',
        department: 'Product',
        supervisorId: null,
        supervisor: null,
        supervises: ['Sarah', 'Mike'],
      },
      {
        id: 2,
        name: 'Sarah',
        title: 'Marketing Lead',
        level: 'member',
        department: 'Marketing',
        supervisorId: 1,
        supervisor: 'John',
        supervises: [],
      },
      {
        id: 3,
        name: 'Mike',
        title: 'Engineering Lead',
        level: 'member',
        department: 'Engineering',
        supervisorId: 1,
        supervisor: 'John',
        supervises: [],
      },
    ],
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'mom', label: 'Minutes', icon: '📄' },
    { id: 'sentiment', label: 'Sentiment', icon: '😊' },
    { id: 'agenda', label: 'Agenda', icon: '📊' },
    { id: 'flow', label: 'Flow', icon: '🔄' },
    { id: 'roles', label: 'Roles', icon: '👥' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Meeting Info Card */}
            <div className="bg-sage-50 rounded-xl p-6 border border-sage-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Date</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(summaryData.date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Duration</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {summaryData.mom.duration}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Participants</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {summaryData.participants.length}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Location</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {summaryData.mom.location}
                  </p>
                </div>
              </div>
            </div>

            {/* Sentiment Quick View */}
            {summaryData.sentimentAnalysis && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-heading font-bold text-gray-900 mb-4">
                  Meeting Sentiment
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`px-4 py-2 rounded-lg ${
                      summaryData.sentimentAnalysis.overall_sentiment === 'positive' 
                        ? 'bg-green-100 text-green-700' 
                        : summaryData.sentimentAnalysis.overall_sentiment === 'negative'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    } font-semibold capitalize`}>
                      {summaryData.sentimentAnalysis.overall_sentiment}
                    </div>
                    <div className="text-sm text-gray-600">
                      Score: <span className="font-semibold text-gray-900">
                        {((summaryData.sentimentAnalysis.sentiment_score + 1) / 2 * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Agreement: <span className="font-semibold text-green-600">
                        {(summaryData.sentimentAnalysis.agreement_rate * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('sentiment')}
                    className="text-sm text-sage-600 hover:text-sage-700 font-medium"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            )}

            {/* Summary Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-heading font-bold text-gray-900 mb-4">
                Summary
              </h3>
              <ul className="space-y-3">
                {summaryData.summary.map((point, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-sage-500 mr-3 mt-1 text-lg">•</span>
                    <span className="text-gray-700 flex-1">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Decisions Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-heading font-bold text-gray-900 mb-4">
                Decisions Made
              </h3>
              <ul className="space-y-3">
                {summaryData.decisions.map((decision, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-accent-500 mr-3 mt-1">✓</span>
                    <span className="text-gray-700 flex-1">{decision}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Items Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-heading font-bold text-gray-900 mb-4">
                Action Items
              </h3>
              <div className="space-y-3">
                {summaryData.actionItems.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 flex-1">
                        {item.task}
                      </h4>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ml-3 ${
                          item.priority === 'high'
                            ? 'bg-red-100 text-red-700'
                            : item.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {item.priority?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>{item.owner}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{item.deadline ? new Date(item.deadline).toLocaleDateString() : 'TBD'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'mom':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border-2 border-sage-200 p-6">
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="text-2xl font-heading font-bold text-gray-900 mb-2">
                  {summaryData.mom.title}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 mb-1">Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(summaryData.mom.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Duration</p>
                    <p className="font-semibold text-gray-900">
                      {summaryData.mom.duration}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Location</p>
                    <p className="font-semibold text-gray-900">
                      {summaryData.mom.location}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Attendees</p>
                    <p className="font-semibold text-gray-900">
                      {summaryData.mom.participants.join(', ')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Meeting Summary</h4>
                  <ul className="space-y-2">
                    {summaryData.summary.map((point, index) => (
                      <li key={index} className="flex items-start text-gray-700">
                        <span className="text-sage-500 mr-2 mt-1">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Decisions Made</h4>
                  <ul className="space-y-2">
                    {summaryData.decisions.map((decision, index) => (
                      <li key={index} className="flex items-start text-gray-700">
                        <span className="text-accent-500 mr-2 mt-1">✓</span>
                        <span>{decision}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'sentiment':
        return (
          <div>
            <SentimentTracker sentimentData={summaryData.sentimentAnalysis} />
          </div>
        );

      case 'agenda':
        return (
          <div>
            <AgendaTracker
              agendaItems={summaryData.mom.agenda}
              transcriptAnalysis={summaryData.transcriptAnalysis}
            />
          </div>
        );

      case 'flow':
        return (
          <div>
            <AgendaHierarchy agendaItems={summaryData.mom.agenda} />
          </div>
        );

      case 'roles':
        return (
          <div>
            <RoleHierarchy
              participants={summaryData.participants}
              roleStructure={summaryData.roleStructure}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-sage-500 px-6 py-5 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-heading font-bold text-white">
                  Meeting Summary
                </h2>
                <p className="text-sage-100 text-sm mt-1">{summaryData.title}</p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-sage-100 transition-colors p-2 hover:bg-white/20 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 bg-gray-50 shrink-0">
            <div className="flex space-x-1 px-6 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-sage-500 text-sage-700 bg-white'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderTabContent()}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end shrink-0">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-sage-500 text-white rounded-lg hover:bg-sage-600 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
